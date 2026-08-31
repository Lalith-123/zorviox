import type {
  SchemaGeneratorOptions,
  SchemaGenerationResult,
  ParseResult,
  DuplicateKeyInfo,
  JsonSchema,
} from "./types";
import { DEFAULT_OPTIONS } from "./types";
import { inferSchema, inferObjectSchema, countSchemaStats } from "./inference";

const MAX_INPUT_SIZE = 5 * 1024 * 1024;
const MAX_NESTING_DEPTH = 50;

function checkDuplicateKeys(
  obj: Record<string, unknown>,
  path: string,
  duplicates: DuplicateKeyInfo[]
): void {
  if (typeof obj !== "object" || obj === null) return;

  const keys = Object.keys(obj);
  const seen = new Map<string, number>();

  for (const key of keys) {
    const count = (seen.get(key) || 0) + 1;
    seen.set(key, count);
  }

  for (const [key, count] of seen) {
    if (count > 1) {
      duplicates.push({ key: path ? `${path}.${key}` : key, count });
    }
  }

  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      checkDuplicateKeys(value as Record<string, unknown>, path ? `${path}.${key}` : key, duplicates);
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === "object" && value[i] !== null) {
          checkDuplicateKeys(
            value[i] as Record<string, unknown>,
            `${path ? `${path}.` : ""}${key}[${i}]`,
            duplicates
          );
        }
      }
    }
  }
}

function checkNestingDepth(value: unknown, depth: number): boolean {
  if (depth > MAX_NESTING_DEPTH) return false;
  if (typeof value !== "object" || value === null) return true;

  if (Array.isArray(value)) {
    return value.every((item) => checkNestingDepth(item, depth + 1));
  }

  return Object.values(value).every((v) => checkNestingDepth(v, depth + 1));
}

function validateSchemaStructure(schema: JsonSchema): string[] {
  const errors: string[] = [];

  if (schema.$schema && !schema.$schema.startsWith("https://json-schema.org/")) {
    errors.push("Invalid $schema URI");
  }

  if (schema.type && typeof schema.type !== "string" && !Array.isArray(schema.type)) {
    errors.push("type must be a string or array");
  }

  if (schema.properties && typeof schema.properties !== "object") {
    errors.push("properties must be an object");
  }

  if (schema.required && !Array.isArray(schema.required)) {
    errors.push("required must be an array");
  }

  if (schema.enum && !Array.isArray(schema.enum)) {
    errors.push("enum must be an array");
  }

  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items.forEach((item, i) => {
        const itemErrors = validateSchemaStructure(item);
        itemErrors.forEach((e) => errors.push(`items[${i}]: ${e}`));
      });
    } else {
      const itemErrors = validateSchemaStructure(schema.items);
      itemErrors.forEach((e) => errors.push(`items: ${e}`));
    }
  }

  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      const propErrors = validateSchemaStructure(prop);
      propErrors.forEach((e) => errors.push(`properties.${key}: ${e}`));
    }
  }

  if (schema.oneOf) {
    schema.oneOf.forEach((s, i) => {
      const sErrors = validateSchemaStructure(s);
      sErrors.forEach((e) => errors.push(`oneOf[${i}]: ${e}`));
    });
  }

  if (schema.anyOf) {
    schema.anyOf.forEach((s, i) => {
      const sErrors = validateSchemaStructure(s);
      sErrors.forEach((e) => errors.push(`anyOf[${i}]: ${e}`));
    });
  }

  return errors;
}

function validateSampleAgainstSchema(sample: unknown, schema: JsonSchema): boolean {
  if (!schema.type) return true;

  const types = Array.isArray(schema.type) ? schema.type : [schema.type];

  if (schema.nullable && sample === null) return true;

  for (const type of types) {
    switch (type) {
      case "null":
        if (sample === null) return true;
        break;
      case "boolean":
        if (typeof sample === "boolean") return true;
        break;
      case "integer":
        if (typeof sample === "number" && Number.isInteger(sample)) return true;
        break;
      case "number":
        if (typeof sample === "number") return true;
        break;
      case "string":
        if (typeof sample === "string") return true;
        break;
      case "array":
        if (Array.isArray(sample)) {
          if (schema.items) {
            const items = schema.items;
            if (Array.isArray(items)) {
              return sample.every((item, i) => i < items.length && validateSampleAgainstSchema(item, items[i]));
            }
            return sample.every((item) => validateSampleAgainstSchema(item, items));
          }
          return true;
        }
        break;
      case "object":
        if (typeof sample === "object" && sample !== null && !Array.isArray(sample)) {
          const obj = sample as Record<string, unknown>;
          if (schema.properties) {
            for (const [key, propSchema] of Object.entries(schema.properties)) {
              if (key in obj && !validateSampleAgainstSchema(obj[key], propSchema)) {
                return false;
              }
            }
          }
          return true;
        }
        break;
    }
  }

  if (schema.anyOf) {
    return schema.anyOf.some((s) => validateSampleAgainstSchema(sample, s));
  }

  if (schema.oneOf) {
    return schema.oneOf.filter((s) => validateSampleAgainstSchema(sample, s)).length === 1;
  }

  return false;
}

export function parseJsonInput(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Input is empty." };
  }

  if (trimmed.length > MAX_INPUT_SIZE) {
    return {
      valid: false,
      error: "Input is too large to process safely in the browser. Maximum size is 5MB.",
    };
  }

  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON";
    const match = msg.match(/position\s+(\d+)/i);
    let error = "Invalid JSON.";
    if (match) {
      const pos = parseInt(match[1], 10);
      const lines = trimmed.substring(0, pos).split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      error = `Invalid JSON at line ${line}, column ${column}.`;
    }
    return { valid: false, error };
  }

  if (!checkNestingDepth(data, 0)) {
    return {
      valid: false,
      error: `JSON nesting exceeds maximum depth of ${MAX_NESTING_DEPTH}.`,
    };
  }

  const duplicates: DuplicateKeyInfo[] = [];
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    checkDuplicateKeys(data as Record<string, unknown>, "", duplicates);
  }

  return { valid: true, data, duplicateKeys: duplicates.length > 0 ? duplicates : undefined };
}

export function generateSchema(
  samples: unknown[],
  options: SchemaGeneratorOptions = DEFAULT_OPTIONS
): SchemaGenerationResult {
  const warnings: string[] = [];
  const duplicates: DuplicateKeyInfo[] = [];

  for (const sample of samples) {
    if (typeof sample === "object" && sample !== null && !Array.isArray(sample)) {
      const result = parseJsonInput(JSON.stringify(sample));
      if (result.duplicateKeys) {
        duplicates.push(...result.duplicateKeys);
      }
    }
  }

  if (duplicates.length > 0) {
    const uniqueKeys = [...new Set(duplicates.map((d) => d.key))];
    warnings.push(
      `Duplicate property names detected: ${uniqueKeys.slice(0, 5).join(", ")}${
        uniqueKeys.length > 5 ? "..." : ""
      }`
    );
  }

  const objectSamples = samples.filter(
    (s) => typeof s === "object" && s !== null && !Array.isArray(s)
  );

  let schema;
  if (
    objectSamples.length > 1 &&
    objectSamples.every((s) => typeof s === "object" && s !== null && !Array.isArray(s))
  ) {
    schema = inferObjectSchema(
      objectSamples as Record<string, unknown>[],
      options
    );
  } else {
    schema = inferSchema(samples, options);
  }

  if (
    options.additionalProperties === "disallow" &&
    schema.type === "object" &&
    !schema.additionalProperties
  ) {
    schema.additionalProperties = false;
  }

  const schemaErrors = validateSchemaStructure(schema);
  if (schemaErrors.length > 0) {
    warnings.push(`Schema validation warnings: ${schemaErrors.join("; ")}`);
  }

  let samplesValidated = 0;
  let samplesPassed = 0;

  for (const sample of samples) {
    samplesValidated++;
    if (validateSampleAgainstSchema(sample, schema)) {
      samplesPassed++;
    } else {
      warnings.push(`Sample ${samplesValidated} did not match the generated schema`);
    }
  }

  const stats = countSchemaStats(schema);

  return {
    schema,
    valid: true,
    validationErrors: [],
    samplesValidated,
    samplesPassed,
    stats,
    warnings,
  };
}

export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

export function minifyJson(obj: unknown): string {
  return JSON.stringify(obj);
}

export function generateSchemaExplanation(schema: JsonSchema): string {
  const lines: string[] = [];

  function walk(s: JsonSchema, indent: string, isLast: boolean) {
    const prefix = isLast ? "└── " : "├── ";
    const childIndent = indent + (isLast ? "    " : "│   ");

    if (s.type === "object" && s.properties) {
      const entries = Object.entries(s.properties);
      const requiredSet = new Set(s.required || []);

      for (let i = 0; i < entries.length; i++) {
        const [key, prop] = entries[i];
        const isPropLast = i === entries.length - 1;
        const required = requiredSet.has(key) ? " — required" : " — optional";
        const typeStr = formatType(prop);

        lines.push(`${indent}${prefix}${key}: ${typeStr}${required}`);

        if (prop.type === "object" && prop.properties) {
          walk(prop, childIndent, isPropLast);
        }
        if (
          prop.type === "array" &&
          prop.items &&
          !Array.isArray(prop.items) &&
          prop.items.type === "object" &&
          prop.items.properties
        ) {
          lines.push(`${childIndent}${isPropLast ? "    " : "│   "}items:`);
          walk(
            prop.items,
            `${childIndent}${isPropLast ? "    " : "│   "}      `,
            true
          );
        }
      }
    }
  }

  function formatType(s: JsonSchema): string {
    if (s.type) {
      if (Array.isArray(s.type)) return s.type.join(" | ");
      if (s.nullable) return `${s.type} | null`;
      return s.type;
    }
    if (s.anyOf) return s.anyOf.map(formatType).join(" | ");
    if (s.oneOf) return s.oneOf.map(formatType).join(" | ");
    return "unknown";
  }

  if (schema.type === "object") {
    lines.push("Object");
    walk(schema, "", true);
  } else if (schema.type === "array") {
    const items = schema.items;
    if (items && !Array.isArray(items)) {
      lines.push(`Array of ${formatType(items)}`);
    } else {
      lines.push("Array");
    }
  } else {
    lines.push(formatType(schema));
  }

  return lines.join("\n");
}

export { DEFAULT_OPTIONS };
export type { SchemaGeneratorOptions, SchemaGenerationResult, ParseResult };
