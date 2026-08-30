"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { analyzeJson, formatJson, minifyJson, getExampleJson } from "@/lib/json-repair/analyzer";
import type { JsonRepairResult } from "@/lib/json-repair/types";

function StatusBadge({ valid }: { valid: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-semibold ${
        valid
          ? "border-success/20 bg-success/10 text-success"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      }`}
    >
      {valid ? "\u2713" : "\u2717"}
      {valid ? "Valid JSON" : "Invalid JSON"}
    </span>
  );
}

function RepairBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/20 bg-accent/10 px-2.5 py-1 text-[12px] font-semibold text-accent">
      {count} repair{count !== 1 ? "s" : ""} made
    </span>
  );
}

function IssueList({
  issues,
  onGoToLine,
}: {
  issues: { line: number; column: number; message: string; severity: string }[];
  onGoToLine: (line: number, column: number) => void;
}) {
  if (issues.length === 0) return null;

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <button
          key={i}
          onClick={() => onGoToLine(issue.line, issue.column)}
          className="flex w-full items-start gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-left text-[13px] transition-colors hover:bg-muted/50"
        >
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground/60">
            L{issue.line}:{issue.column}
          </span>
          <span className="text-foreground">{issue.message}</span>
        </button>
      ))}
    </div>
  );
}

function RepairList({ repairs }: { repairs: { description: string; confidence: string }[] }) {
  if (repairs.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {repairs.map((repair, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-[12px]"
        >
          <span className="text-success">{"\u2713"}</span>
          <span className="text-foreground">{repair.description}</span>
        </div>
      ))}
    </div>
  );
}

export function JsonRepairTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<JsonRepairResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setInput(text);
        setResult(null);
        setFormatError(null);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRepair = useCallback(() => {
    if (!input.trim()) return;
    const analysis = analyzeJson(input);
    setResult(analysis);
    setFormatError(null);
    if (analysis.isValid) {
      setShowDiff(false);
    }
  }, [input]);

  const handleFormat = useCallback(() => {
    setFormatError(null);
    if (!input.trim()) return;

    if (result && !result.isValid) {
      setFormatError("Cannot format: the JSON has syntax errors. Repair it first to enable formatting.");
      return;
    }

    if (result && result.stats.totalRepairs > 0 && !result.isValid) {
      setFormatError("Cannot format: the JSON needs repairs. Fix the issues first to enable formatting.");
      return;
    }

    const formatted = formatJson(input);
    if (formatted !== null) {
      setInput(formatted);
      setResult(null);
    } else {
      setFormatError("Cannot format: the JSON has syntax errors. Repair it first to enable formatting.");
    }
  }, [input, result]);

  const handleMinify = useCallback(() => {
    setFormatError(null);
    if (!input.trim()) return;

    if (result && !result.isValid) {
      setFormatError("Cannot minify: the JSON has syntax errors. Repair it first to enable minification.");
      return;
    }

    if (result && result.stats.totalRepairs > 0 && !result.isValid) {
      setFormatError("Cannot minify: the JSON needs repairs. Fix the issues first to enable minification.");
      return;
    }

    const minified = minifyJson(input);
    if (minified !== null) {
      setInput(minified);
      setResult(null);
    } else {
      setFormatError("Cannot minify: the JSON has syntax errors. Repair it first to enable minification.");
    }
  }, [input, result]);

  const handleCopy = useCallback(async () => {
    const text = result?.isValid ? result.output : input;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, input]);

  const handleDownload = useCallback(() => {
    const text = result?.isValid ? result.output : input;
    if (!text) return;
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repaired.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [result, input]);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(null);
    setShowDiff(false);
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput(getExampleJson());
    setResult(null);
  }, []);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setInput(text);
        setResult(null);
        setFormatError(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
    }
  }, []);

  const handleGoToLine = useCallback((line: number, column: number) => {
    const textarea = document.getElementById("json-input") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const lines = input.split("\n");
    let pos = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      pos += lines[i].length + 1;
    }
    pos += column - 1;

    textarea.focus();
    textarea.setSelectionRange(pos, pos);
  }, [input]);

  return (
    <div className="space-y-4">
      {/* Privacy notice */}
      <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-[12px] text-muted-foreground">
        Your JSON is processed locally in your browser. No data is sent to any server.
      </div>

      {/* Editor */}
      <div>
        <label htmlFor="json-input" className="mb-2 block text-[13px] font-medium text-foreground">
          JSON Input
        </label>
        <textarea
          id="json-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          placeholder="Paste, write, or drag & drop a JSON file here..."
          spellCheck={false}
          className={`h-56 w-full resize-y rounded-xl border bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5 ${
            isDragging
              ? "border-accent bg-accent/5 ring-2 ring-accent/20"
              : "border-border"
          }`}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRepair}
            disabled={!input.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-5 text-[13px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Repair JSON
          </button>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50">
            Import File
            <input
              type="file"
              accept=".json,.txt,.jsonc,.json5"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleFormat}
            disabled={!input.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Format
          </button>
          <button
            onClick={handleMinify}
            disabled={!input.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Minify
          </button>
          <button
            onClick={handleCopy}
            disabled={!input.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!input.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadExample}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-muted/50 px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try Example
          </button>
          <button
            onClick={handleClear}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-muted/50 px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Format error message */}
      {formatError && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-[13px] text-muted-foreground animate-fade-in">
          {formatError}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Status */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge valid={result.isValid} />
            <RepairBadge count={result.stats.totalRepairs} />
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Issues Found ({result.issues.length})
              </h3>
              <IssueList issues={result.issues} onGoToLine={handleGoToLine} />
            </section>
          )}

          {/* Repairs */}
          {result.repairs.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Repairs Applied
                </h3>
                <button
                  onClick={() => setShowDiff((v) => !v)}
                  className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showDiff ? "Hide diff" : "Show diff"}
                </button>
              </div>
              <RepairList repairs={result.repairs} />

              {showDiff && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-[11px] font-medium text-muted-foreground/60">Original</div>
                    <pre className="max-h-64 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-[12px] text-foreground">
                      {result.input}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-medium text-muted-foreground/60">Repaired</div>
                    <pre className="max-h-64 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-[12px] text-foreground">
                      {result.output}
                    </pre>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Cannot repair */}
          {!result.isValid && result.repairs.length === 0 && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-[13px]">
              <span className="font-medium text-foreground">JSON could not be safely repaired automatically.</span>
              <span className="ml-2 text-muted-foreground">
                The issues found require manual correction. Check the error locations above.
              </span>
            </div>
          )}

          {/* Output */}
          {result.isValid && (
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Output
              </h3>
              <pre className="max-h-96 overflow-auto rounded-xl border border-border/80 bg-card p-4 font-mono text-[13px] leading-relaxed text-foreground">
                {result.output}
              </pre>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
