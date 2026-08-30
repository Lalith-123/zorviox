export type RepairConfidence = "safe" | "likely" | "ambiguous";

export interface JsonIssue {
  line: number;
  column: number;
  position: number;
  message: string;
  severity: "error" | "warning";
  suggestion?: string;
}

export interface JsonRepair {
  description: string;
  original: string;
  repaired: string;
  confidence: RepairConfidence;
}

export interface JsonRepairResult {
  input: string;
  output: string;
  isValid: boolean;
  repairs: JsonRepair[];
  issues: JsonIssue[];
  stats: {
    totalRepairs: number;
    safeRepairs: number;
    likelyRepairs: number;
    ambiguousRepairs: number;
  };
}

export interface JsonValidationResult {
  valid: boolean;
  error: JsonIssue | null;
}

export type TokenType =
  | "lbrace"
  | "rbrace"
  | "lbracket"
  | "rbracket"
  | "colon"
  | "comma"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "whitespace"
  | "comment"
  | "single_quote_string"
  | "unquoted_property"
  | "unquoted_value"
  | "invalid";

export interface JsonToken {
  type: TokenType;
  value: string;
  start: number;
  end: number;
  line: number;
  column: number;
}
