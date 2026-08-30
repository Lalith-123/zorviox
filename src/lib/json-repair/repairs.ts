import type { JsonToken } from "./types";

export interface RepairCandidate {
  input: string;
  position: number;
  length: number;
  replacement: string;
  description: string;
}

function findTrailingCommas(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];
  const contentTokens = tokens.filter(
    (t) => t.type !== "whitespace" && t.type !== "comment"
  );

  for (let i = 0; i < contentTokens.length; i++) {
    const token = contentTokens[i];
    if (token.type !== "comma") continue;

    const nextContentIdx = i + 1;
    if (nextContentIdx >= contentTokens.length) continue;
    const next = contentTokens[nextContentIdx];

    if (next.type === "rbrace" || next.type === "rbracket") {
      const inString = isInsideString(input, token.start, tokens);
      if (!inString) {
        candidates.push({
          input,
          position: token.start,
          length: token.end - token.start,
          replacement: "",
          description: `Trailing comma before ${next.type === "rbrace" ? "closing object" : "closing array"}`,
        });
      }
    }
  }

  return candidates;
}

function findMissingCommas(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];
  const contentTokens = tokens.filter(
    (t) => t.type !== "whitespace" && t.type !== "comment"
  );

  for (let i = 0; i < contentTokens.length - 1; i++) {
    const curr = contentTokens[i];
    const next = contentTokens[i + 1];

    if (curr.type === "rbrace" && next.type === "lbrace") {
      candidates.push({
        input,
        position: curr.end,
        length: 0,
        replacement: ",",
        description: "Missing comma between objects",
      });
    }

    if (curr.type === "rbracket" && next.type === "lbracket") {
      candidates.push({
        input,
        position: curr.end,
        length: 0,
        replacement: ",",
        description: "Missing comma between arrays",
      });
    }

    if (curr.type === "rbracket" && next.type === "lbrace") {
      candidates.push({
        input,
        position: curr.end,
        length: 0,
        replacement: ",",
        description: "Missing comma between array and object",
      });
    }

    if (curr.type === "rbrace" && next.type === "lbracket") {
      candidates.push({
        input,
        position: curr.end,
        length: 0,
        replacement: ",",
        description: "Missing comma between object and array",
      });
    }
  }

  return candidates;
}

function findMissingColons(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];
  const contentTokens = tokens.filter(
    (t) => t.type !== "whitespace" && t.type !== "comment"
  );

  for (let i = 0; i < contentTokens.length - 1; i++) {
    const curr = contentTokens[i];
    const next = contentTokens[i + 1];

    if (
      (curr.type === "string" || curr.type === "unquoted_property") &&
      (next.type === "string" || next.type === "number" || next.type === "boolean" || next.type === "null" || next.type === "lbrace" || next.type === "lbracket")
    ) {
      const inString = isInsideString(input, curr.start, tokens);
      if (!inString) {
        candidates.push({
          input,
          position: curr.end,
          length: 0,
          replacement: ":",
          description: "Missing colon between property and value",
        });
      }
    }
  }

  return candidates;
}

function findSingleQuotes(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];

  for (const token of tokens) {
    if (token.type === "single_quote_string") {
      const original = token.value;
      const converted = '"' + original.slice(1, -1).replace(/"/g, '\\"').replace(/\\'/g, "'") + '"';
      candidates.push({
        input,
        position: token.start,
        length: token.end - token.start,
        replacement: converted,
        description: "Convert single-quoted string to double-quoted",
      });
    }
  }

  return candidates;
}

function findUnquotedProperties(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];
  const contentTokens = tokens.filter(
    (t) => t.type !== "whitespace" && t.type !== "comment"
  );

  for (let i = 0; i < contentTokens.length; i++) {
    const token = contentTokens[i];
    if (token.type !== "unquoted_value") continue;

    if (i > 0 && contentTokens[i - 1].type === "lbrace") {
      const value = token.value;
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
        const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        candidates.push({
          input,
          position: token.start,
          length: token.end - token.start,
          replacement: `"${escaped}"`,
          description: `Add quotes around property name "${value}"`,
        });
      }
    }
  }

  return candidates;
}

function findComments(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];

  for (const token of tokens) {
    if (token.type === "comment") {
      candidates.push({
        input,
        position: token.start,
        length: token.end - token.start,
        replacement: "",
        description: "Remove comment",
      });
    }
  }

  return candidates;
}

function findUnquotedValues(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];
  const contentTokens = tokens.filter(
    (t) => t.type !== "whitespace" && t.type !== "comment"
  );

  for (let i = 0; i < contentTokens.length; i++) {
    const token = contentTokens[i];
    if (token.type !== "unquoted_value") continue;

    if (i > 0 && contentTokens[i - 1].type === "colon") {
      const value = token.value;
      if (/^[a-zA-Z_$][a-zA-Z0-9_./-]*$/.test(value)) {
        const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        candidates.push({
          input,
          position: token.start,
          length: token.end - token.start,
          replacement: `"${escaped}"`,
          description: `Add quotes around value "${value}"`,
        });
      }
    }
  }

  return candidates;
}

function isInsideString(input: string, position: number, tokens: JsonToken[]): boolean {
  for (const token of tokens) {
    if (token.type === "string" && position > token.start && position < token.end) {
      return true;
    }
  }
  return false;
}

export function findAllRepairCandidates(input: string, tokens: JsonToken[]): RepairCandidate[] {
  const candidates: RepairCandidate[] = [];

  candidates.push(...findTrailingCommas(input, tokens));
  candidates.push(...findMissingCommas(input, tokens));
  candidates.push(...findMissingColons(input, tokens));
  candidates.push(...findSingleQuotes(input, tokens));
  candidates.push(...findUnquotedProperties(input, tokens));
  candidates.push(...findComments(input, tokens));
  candidates.push(...findUnquotedValues(input, tokens));

  candidates.sort((a, b) => a.position - b.position);

  return candidates;
}

export function applyRepair(input: string, candidate: RepairCandidate): string {
  const before = input.slice(0, candidate.position);
  const after = input.slice(candidate.position + candidate.length);
  return before + candidate.replacement + after;
}
