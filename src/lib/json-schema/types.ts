export type SchemaDraft = "2020-12" | "draft-07";

export type AdditionalPropertiesOption = "allow" | "disallow";

export type RequiredFieldOption = "infer" | "none";

export type FormatInferenceOption = "on" | "off";

export type EnumInferenceOption = "on" | "off";

export type NumericInferenceOption = "integer-aware" | "uniform";

export type DefinitionReuseOption = "automatic" | "inline";

export interface SchemaGeneratorOptions {
  draft: SchemaDraft;
  additionalProperties: AdditionalPropertiesOption;
  requiredFields: RequiredFieldOption;
  formatInference: FormatInferenceOption;
  enumInference: EnumInferenceOption;
  numericInference: NumericInferenceOption;
  definitionReuse: DefinitionReuseOption;
}

export const DEFAULT_OPTIONS: SchemaGeneratorOptions = {
  draft: "2020-12",
  additionalProperties: "allow",
  requiredFields: "infer",
  formatInference: "off",
  enumInference: "off",
  numericInference: "integer-aware",
  definitionReuse: "automatic",
};

export interface JsonSchema {
  $schema?: string;
  $defs?: Record<string, JsonSchema>;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  enum?: unknown[];
  const?: unknown;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  $ref?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  format?: string;
  description?: string;
  title?: string;
  nullable?: boolean;
}

export interface InferredType {
  type?: string | string[];
  format?: string;
  enum?: unknown[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  nullable?: boolean;
}

export interface SchemaGenerationResult {
  schema: JsonSchema;
  valid: boolean;
  validationErrors: string[];
  samplesValidated: number;
  samplesPassed: number;
  stats: {
    properties: number;
    nestedObjects: number;
    arrays: number;
    requiredFields: number;
    optionalFields: number;
  };
  warnings: string[];
}

export interface DuplicateKeyInfo {
  key: string;
  count: number;
}

export interface ParseResult {
  valid: boolean;
  data?: unknown;
  error?: string;
  duplicateKeys?: DuplicateKeyInfo[];
}
