import type { JsonRepairResult, JsonRepair, JsonIssue, JsonValidationResult } from "./types";
import { tokenize } from "./lexer";
import { findAllRepairCandidates, applyRepair } from "./repairs";

const MAX_PASSES = 10;

function validateJson(input: string): JsonValidationResult {
  try {
    JSON.parse(input);
    return { valid: true, error: null };
  } catch (err) {
    const error = err as Error;
    const match = error.message.match(/position\s+(\d+)/i);
    const position = match ? parseInt(match[1], 10) : 0;

    let line = 1;
    let column = 1;
    for (let i = 0; i < position && i < input.length; i++) {
      if (input[i] === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return {
      valid: false,
      error: {
        line,
        column,
        position,
        message: error.message,
        severity: "error",
      },
    };
  }
}

function generateErrorLocation(input: string, position: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

export function analyzeJson(input: string): JsonRepairResult {
  const initialValidation = validateJson(input);

  if (initialValidation.valid) {
    return {
      input,
      output: input,
      isValid: true,
      repairs: [],
      issues: [],
      stats: {
        totalRepairs: 0,
        safeRepairs: 0,
        likelyRepairs: 0,
        ambiguousRepairs: 0,
      },
    };
  }

  let current = input;
  const allRepairs: JsonRepair[] = [];
  const issues: JsonIssue[] = [];

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const tokens = tokenize(current);
    const candidates = findAllRepairCandidates(current, tokens);

    if (candidates.length === 0) break;

    let applied = false;
    for (const candidate of candidates) {
      const repaired = applyRepair(current, candidate);
      const validation = validateJson(repaired);

      const repair: JsonRepair = {
        description: candidate.description,
        original: current,
        repaired,
        confidence: "safe",
      };

      if (validation.valid) {
        allRepairs.push(repair);
        current = repaired;
        applied = true;

        const loc = generateErrorLocation(current, candidate.position);
        issues.push({
          line: loc.line,
          column: loc.column,
          position: candidate.position,
          message: candidate.description,
          severity: "warning",
        });
        break;
      }

      const newTokens = tokenize(repaired);
      const newCandidates = findAllRepairCandidates(repaired, newTokens);
      const prevValidation = validateJson(current);
      const errorChanged =
        !prevValidation.valid &&
        validation.error &&
        prevValidation.error &&
        (validation.error.line !== prevValidation.error.line ||
          validation.error.column !== prevValidation.error.column ||
          validation.error.message !== prevValidation.error.message);

      if (errorChanged || (newCandidates.length < candidates.length)) {
        allRepairs.push(repair);
        current = repaired;
        applied = true;

        const loc = generateErrorLocation(current, candidate.position);
        issues.push({
          line: loc.line,
          column: loc.column,
          position: candidate.position,
          message: candidate.description,
          severity: "warning",
        });
        break;
      }
    }

    if (!applied) break;
  }

  const finalValidation = validateJson(current);

  return {
    input,
    output: current,
    isValid: finalValidation.valid,
    repairs: allRepairs,
    issues,
    stats: {
      totalRepairs: allRepairs.length,
      safeRepairs: allRepairs.filter((r) => r.confidence === "safe").length,
      likelyRepairs: allRepairs.filter((r) => r.confidence === "likely").length,
      ambiguousRepairs: allRepairs.filter((r) => r.confidence === "ambiguous").length,
    },
  };
}

export function formatJson(input: string, indent = 2): string | null {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, indent);
  } catch {
    return null;
  }
}

export function minifyJson(input: string): string | null {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

export function getExampleJson(): string {
  return `{
  "name": "John",
  "age": 25,
  "city": "London",
  "active": true,
  "tags": ["developer", "designer"],
  "address": {
    "street": "123 Main St",
    "zip": "10001"
  }
}`;
}
