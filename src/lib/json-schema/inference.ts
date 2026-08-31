import type { JsonSchema, SchemaGeneratorOptions, InferredType } from "./types";

const MAX_DEPTH = 20;
const MAX_PROPERTIES = 500;

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function detectFormat(value: string): string | undefined {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return "date-time";
  if (/^\d{2}:\d{2}:\d{2}/.test(value)) return "time";
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "email";
  if (/^https?:\/\//.test(value)) return "uri";
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) return "uuid";
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) return "ipv4";
  return undefined;
}

function inferSingleValue(value: unknown, options: SchemaGeneratorOptions): InferredType {
  if (value === null) {
    return { type: "null" };
  }

  if (typeof value === "boolean") {
    return { type: "boolean" };
  }

  if (typeof value === "string") {
    const result: InferredType = { type: "string" };
    if (options.formatInference === "on") {
      const format = detectFormat(value);
      if (format) result.format = format;
    }
    return result;
  }

  if (typeof value === "number") {
    if (options.numericInference === "integer-aware" && isInteger(value)) {
      return { type: "integer" };
    }
    return { type: "number" };
  }

  if (Array.isArray(value)) {
    return inferArray(value, options, 0);
  }

  if (typeof value === "object") {
    return inferObject(value as Record<string, unknown>, options, 0);
  }

  return { type: "string" };
}

function inferArray(arr: unknown[], options: SchemaGeneratorOptions, depth: number): InferredType {
  if (depth > MAX_DEPTH) {
    return { type: "array" };
  }

  if (arr.length === 0) {
    return { type: "array" };
  }

  const itemTypes = arr.map((item) => inferSingleValue(item, options));
  const merged = mergeTypes(itemTypes);

  return {
    type: "array",
    items: typeToSchema(merged),
  };
}

function inferObject(
  obj: Record<string, unknown>,
  options: SchemaGeneratorOptions,
  depth: number
): InferredType {
  if (depth > MAX_DEPTH) {
    return { type: "object" };
  }

  const keys = Object.keys(obj);
  if (keys.length > MAX_PROPERTIES) {
    return { type: "object" };
  }

  const properties: Record<string, JsonSchema> = {};

  for (const key of keys) {
    const value = obj[key];
    const inferred = inferSingleValue(value, options);
    properties[key] = typeToSchema(inferred);
  }

  return {
    type: "object",
    properties,
  };
}

function typeToSchema(inferred: InferredType): JsonSchema {
  const schema: JsonSchema = {};

  if (inferred.type) schema.type = inferred.type;
  if (inferred.format) schema.format = inferred.format;
  if (inferred.enum) schema.enum = inferred.enum;
  if (inferred.items) schema.items = inferred.items;
  if (inferred.properties) schema.properties = inferred.properties;
  if (inferred.required) schema.required = inferred.required;
  if (inferred.additionalProperties !== undefined) schema.additionalProperties = inferred.additionalProperties;
  if (inferred.oneOf) schema.oneOf = inferred.oneOf;
  if (inferred.anyOf) schema.anyOf = inferred.anyOf;
  if (inferred.nullable) schema.nullable = inferred.nullable;

  return schema;
}

function mergeTypes(types: InferredType[]): InferredType {
  if (types.length === 0) {
    return { type: "string" };
  }

  if (types.length === 1) {
    return types[0];
  }

  const uniqueTypeSets = new Set<string>();
  for (const t of types) {
    if (Array.isArray(t.type)) {
      for (const tp of t.type) uniqueTypeSets.add(tp);
    } else if (t.type) {
      uniqueTypeSets.add(t.type);
    }
  }

  const allTypes = Array.from(uniqueTypeSets);

  if (allTypes.length === 1) {
    const firstType = allTypes[0];
    if (firstType === "object") {
      return mergeObjectTypes(types.filter((t) => t.type === "object" || (Array.isArray(t.type) && t.type.includes("object"))));
    }
    if (firstType === "array") {
      return mergeArrayTypes(types.filter((t) => t.type === "array" || (Array.isArray(t.type) && t.type.includes("array"))));
    }
    return types[0];
  }

  const hasNull = allTypes.includes("null");
  const nonNullTypes = allTypes.filter((t) => t !== "null");

  if (hasNull && nonNullTypes.length === 1) {
    const nonNullType = nonNullTypes[0];
    const nonNullInferred = types.find((t) => {
      if (Array.isArray(t.type)) return t.type.includes(nonNullType);
      return t.type === nonNullType;
    });

    if (nonNullType === "object" && nonNullInferred?.properties) {
      return {
        type: "object",
        properties: nonNullInferred.properties,
        nullable: true,
      };
    }
    if (nonNullType === "array" && nonNullInferred?.items) {
      return {
        type: "array",
        items: nonNullInferred.items,
        nullable: true,
      };
    }
    return {
      type: [nonNullType, "null"],
    };
  }

  const objectTypes = types.filter((t) => t.type === "object" || (Array.isArray(t.type) && t.type.includes("object")));
  const nonObjectTypes = types.filter((t) => t.type !== "object" && !(Array.isArray(t.type) && t.type.includes("object")));

  if (objectTypes.length > 0 && nonObjectTypes.length > 0) {
    const mergedObject = objectTypes.length > 1 ? mergeObjectTypes(objectTypes) : objectTypes[0];
    const otherSchemas = nonObjectTypes.map((t) => typeToSchema(t));
    return {
      anyOf: [typeToSchema(mergedObject), ...otherSchemas],
    };
  }

  if (objectTypes.length > 1) {
    return mergeObjectTypes(objectTypes);
  }

  return {
    type: allTypes.length === 1 ? allTypes[0] : allTypes,
  };
}

function mergeObjectTypes(types: InferredType[]): InferredType {
  const allProperties: Record<string, JsonSchema[]> = {};

  for (const t of types) {
    if (t.properties) {
      for (const [key, schema] of Object.entries(t.properties)) {
        if (!allProperties[key]) allProperties[key] = [];
        allProperties[key].push(schema);
      }
    }
  }

  const mergedProperties: Record<string, JsonSchema> = {};
  for (const [key, schemas] of Object.entries(allProperties)) {
    if (schemas.length === 1) {
      mergedProperties[key] = schemas[0];
    } else {
      mergedProperties[key] = typeToSchema(mergeTypes(schemas.map((s) => schemaToInferred(s))));
    }
  }

  return {
    type: "object",
    properties: mergedProperties,
  };
}

function mergeArrayTypes(types: InferredType[]): InferredType {
  const itemTypes = types
    .filter((t) => t.items)
    .map((t) => schemaToInferred(t.items!));

  if (itemTypes.length === 0) {
    return { type: "array" };
  }

  const mergedItems = mergeTypes(itemTypes);
  return {
    type: "array",
    items: typeToSchema(mergedItems),
  };
}

function schemaToInferred(schema: JsonSchema): InferredType {
  const result: InferredType = {};

  if (schema.type) result.type = schema.type;
  if (schema.format) result.format = schema.format;
  if (schema.enum) result.enum = schema.enum;
  if (schema.items && !Array.isArray(schema.items)) result.items = schema.items;
  if (schema.properties) result.properties = schema.properties;
  if (schema.required) result.required = schema.required;
  if (schema.additionalProperties !== undefined) result.additionalProperties = schema.additionalProperties;
  if (schema.oneOf) result.oneOf = schema.oneOf;
  if (schema.anyOf) result.anyOf = schema.anyOf;
  if (schema.nullable) result.nullable = schema.nullable;

  return result;
}

export function inferSchema(
  samples: unknown[],
  options: SchemaGeneratorOptions
): JsonSchema {
  if (samples.length === 0) {
    return { type: "string" };
  }

  if (samples.length === 1) {
    const inferred = inferSingleValue(samples[0], options);
    const schema = typeToSchema(inferred);

    if (options.draft === "2020-12") {
      schema.$schema = "https://json-schema.org/draft/2020-12/schema";
    } else {
      schema.$schema = "https://json-schema.org/draft-07/schema#";
    }

    return schema;
  }

  const inferredTypes = samples.map((s) => inferSingleValue(s, options));
  const merged = mergeTypes(inferredTypes);
  const schema = typeToSchema(merged);

  if (options.draft === "2020-12") {
    schema.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else {
    schema.$schema = "https://json-schema.org/draft-07/schema#";
  }

  return schema;
}

export function inferObjectSchema(
  samples: Record<string, unknown>[],
  options: SchemaGeneratorOptions
): JsonSchema {
  const allKeys = new Set<string>();
  const keyCounts: Record<string, number> = {};

  for (const sample of samples) {
    for (const key of Object.keys(sample)) {
      allKeys.add(key);
      keyCounts[key] = (keyCounts[key] || 0) + 1;
    }
  }

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const key of allKeys) {
    const valuesForKeys = samples
      .map((s) => s[key])
      .filter((v) => v !== undefined);

    const inferredTypes = valuesForKeys.map((v) => inferSingleValue(v, options));
    const merged = mergeTypes(inferredTypes);
    properties[key] = typeToSchema(merged);

    if (options.requiredFields === "infer" && keyCounts[key] === samples.length) {
      required.push(key);
    }
  }

  const schema: JsonSchema = {
    type: "object",
    properties,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  if (options.additionalProperties === "disallow") {
    schema.additionalProperties = false;
  }

  if (options.draft === "2020-12") {
    schema.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else {
    schema.$schema = "https://json-schema.org/draft-07/schema#";
  }

  return schema;
}

export function countSchemaStats(schema: JsonSchema): {
  properties: number;
  nestedObjects: number;
  arrays: number;
  requiredFields: number;
  optionalFields: number;
} {
  let properties = 0;
  let nestedObjects = 0;
  let arrays = 0;
  let requiredFields = 0;
  let optionalFields = 0;

  function walk(s: JsonSchema) {
    if (s.properties) {
      const propCount = Object.keys(s.properties).length;
      properties += propCount;
      const requiredSet = new Set(s.required || []);
      requiredFields += requiredSet.size;
      optionalFields += propCount - requiredSet.size;

      for (const child of Object.values(s.properties)) {
        walk(child);
      }
    }

    if (s.items && !Array.isArray(s.items)) {
      arrays++;
      walk(s.items);
    }

    if (s.type === "object" || (Array.isArray(s.type) && s.type.includes("object"))) {
      nestedObjects++;
    }

    if (s.oneOf) s.oneOf.forEach(walk);
    if (s.anyOf) s.anyOf.forEach(walk);
    if (s.allOf) s.allOf.forEach(walk);
  }

  walk(schema);
  return { properties, nestedObjects, arrays, requiredFields, optionalFields };
}
