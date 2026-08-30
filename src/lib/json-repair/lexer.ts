import type { JsonToken, TokenType } from "./types";

export function tokenize(input: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let pos = 0;
  let line = 1;
  let column = 1;

  function advance(): string {
    const ch = input[pos];
    if (ch === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    pos++;
    return ch;
  }

  function peek(offset = 0): string {
    return input[pos + offset] || "";
  }

  function addToken(type: TokenType, start: number, end: number, startLine: number, startCol: number, value: string): void {
    tokens.push({ type, value, start, end, line: startLine, column: startCol });
  }

  while (pos < input.length) {
    const start = pos;
    const startLine = line;
    const startCol = column;
    const ch = peek();

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      let value = "";
      while (pos < input.length && (peek() === " " || peek() === "\t" || peek() === "\n" || peek() === "\r")) {
        value += advance();
      }
      addToken("whitespace", start, pos, startLine, startCol, value);
      continue;
    }

    if (ch === "/" && peek(1) === "/") {
      let value = "";
      while (pos < input.length && peek() !== "\n") {
        value += advance();
      }
      addToken("comment", start, pos, startLine, startCol, value);
      continue;
    }

    if (ch === "/" && peek(1) === "*") {
      let value = advance() + advance();
      while (pos < input.length) {
        if (peek() === "*" && peek(1) === "/") {
          value += advance() + advance();
          break;
        }
        value += advance();
      }
      addToken("comment", start, pos, startLine, startCol, value);
      continue;
    }

    if (ch === '"') {
      let value = advance();
      let escaped = false;
      while (pos < input.length) {
        const c = peek();
        if (escaped) {
          value += advance();
          escaped = false;
        } else if (c === "\\") {
          value += advance();
          escaped = true;
        } else if (c === '"') {
          value += advance();
          break;
        } else {
          value += advance();
        }
      }
      addToken("string", start, pos, startLine, startCol, value);
      continue;
    }

    if (ch === "'") {
      let value = advance();
      let escaped = false;
      while (pos < input.length) {
        const c = peek();
        if (escaped) {
          value += advance();
          escaped = false;
        } else if (c === "\\") {
          value += advance();
          escaped = true;
        } else if (c === "'") {
          value += advance();
          break;
        } else if (c === "\n") {
          break;
        } else {
          value += advance();
        }
      }
      addToken("single_quote_string", start, pos, startLine, startCol, value);
      continue;
    }

    if (ch === "{") { advance(); addToken("lbrace", start, pos, startLine, startCol, "{"); continue; }
    if (ch === "}") { advance(); addToken("rbrace", start, pos, startLine, startCol, "}"); continue; }
    if (ch === "[") { advance(); addToken("lbracket", start, pos, startLine, startCol, "["); continue; }
    if (ch === "]") { advance(); addToken("rbracket", start, pos, startLine, startCol, "]"); continue; }
    if (ch === ":") { advance(); addToken("colon", start, pos, startLine, startCol, ":"); continue; }
    if (ch === ",") { advance(); addToken("comma", start, pos, startLine, startCol, ","); continue; }

    if (ch === "t" || ch === "f" || ch === "n") {
      let value = "";
      const wordStart = pos;
      while (pos < input.length && /[a-zA-Z]/.test(peek())) {
        value += advance();
      }
      if (value === "true" || value === "false") {
        addToken("boolean", wordStart, pos, startLine, startCol, value);
      } else if (value === "null") {
        addToken("null", wordStart, pos, startLine, startCol, value);
      } else {
        let val = value;
        while (pos < input.length && peek() !== " " && peek() !== "\t" && peek() !== "\n" && peek() !== "\r" && peek() !== "," && peek() !== "}" && peek() !== "]" && peek() !== ":") {
          val += advance();
        }
        addToken("unquoted_value", start, pos, startLine, startCol, val);
      }
      continue;
    }

    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      let value = advance();
      if (ch === "0" && peek() >= "0" && peek() <= "9") {
        while (pos < input.length && peek() >= "0" && peek() <= "9") {
          value += advance();
        }
        addToken("invalid", start, pos, startLine, startCol, value);
        continue;
      }
      while (pos < input.length && ((peek() >= "0" && peek() <= "9") || peek() === "." || peek() === "e" || peek() === "E" || peek() === "+" || peek() === "-")) {
        value += advance();
      }
      addToken("number", start, pos, startLine, startCol, value);
      continue;
    }

    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_" || ch === "$") {
      let value = advance();
      while (pos < input.length && ((peek() >= "a" && peek() <= "z") || (peek() >= "A" && peek() <= "Z") || (peek() >= "0" && peek() <= "9") || peek() === "_" || peek() === "$")) {
        value += advance();
      }
      addToken("unquoted_value", start, pos, startLine, startCol, value);
      continue;
    }

    advance();
    addToken("invalid", start, pos, startLine, startCol, ch);
  }

  return tokens;
}

export function stripTokens(input: string, tokens: JsonToken[]): string {
  return tokens
    .filter((t) => t.type !== "whitespace" && t.type !== "comment")
    .map((t) => t.value)
    .join("");
}
