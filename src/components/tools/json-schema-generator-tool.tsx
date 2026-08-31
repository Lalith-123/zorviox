"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  parseJsonInput,
  generateSchema,
  formatJson,
  minifyJson,
  generateSchemaExplanation,
} from "@/lib/json-schema/analyzer";
import type { SchemaGeneratorOptions, SchemaGenerationResult } from "@/lib/json-schema/types";
import { DEFAULT_OPTIONS } from "@/lib/json-schema/types";

const SINGLE_EXAMPLE = JSON.stringify(
  {
    name: "John",
    age: 30,
    active: true,
    address: {
      city: "London",
      country: "UK",
    },
  },
  null,
  2
);

const MULTI_EXAMPLES = [
  JSON.stringify({ id: 1, name: "John" }, null, 2),
  JSON.stringify({ id: 2, name: "Jane", email: "jane@example.com" }, null, 2),
];

export function JsonSchemaGeneratorTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SchemaGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [multiSample, setMultiSample] = useState(false);
  const [samples, setSamples] = useState<string[]>(["", ""]);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<SchemaGeneratorOptions>(DEFAULT_OPTIONS);
  const [isDragging, setIsDragging] = useState(false);
  const [displayMode, setDisplayMode] = useState<"formatted" | "minified">("formatted");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleGenerate = useCallback(() => {
    setError(null);
    setResult(null);
    setDisplayMode("formatted");

    if (multiSample) {
      const validSamples: unknown[] = [];
      for (let i = 0; i < samples.length; i++) {
        const trimmed = samples[i].trim();
        if (!trimmed) continue;

        const parsed = parseJsonInput(trimmed);
        if (!parsed.valid) {
          setError(`Sample ${i + 1}: ${parsed.error}`);
          return;
        }
        validSamples.push(parsed.data);
      }

      if (validSamples.length === 0) {
        setError("Please enter at least one valid JSON sample.");
        return;
      }

      const genResult = generateSchema(validSamples, options);
      setResult(genResult);
    } else {
      const trimmed = input.trim();
      if (!trimmed) {
        setError("Please enter some JSON.");
        return;
      }

      const parsed = parseJsonInput(trimmed);
      if (!parsed.valid) {
        setError(parsed.error || "Invalid JSON.");
        return;
      }

      const genResult = generateSchema([parsed.data], options);
      setResult(genResult);
    }
  }, [input, multiSample, samples, options]);

  const getSchemaString = useCallback(() => {
    if (!result) return "";
    return displayMode === "formatted"
      ? formatJson(result.schema)
      : minifyJson(result.schema);
  }, [result, displayMode]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(getSchemaString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, getSchemaString]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([getSchemaString()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [result, getSchemaString]);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(null);
    setError(null);
    setSamples(["", ""]);
    setDisplayMode("formatted");
  }, []);

  const handleTryExample = useCallback(() => {
    setInput(SINGLE_EXAMPLE);
    setResult(null);
    setError(null);
  }, []);

  const handleTryMultiExample = useCallback(() => {
    setSamples(MULTI_EXAMPLES);
    setResult(null);
    setError(null);
  }, []);

  const handleAddSample = useCallback(() => {
    setSamples((prev) => [...prev, ""]);
  }, []);

  const handleRemoveSample = useCallback((index: number) => {
    setSamples((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSampleChange = useCallback((index: number, value: string) => {
    setSamples((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
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
        setError(null);
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

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setInput(text);
        setResult(null);
        setError(null);
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

  return (
    <div className="space-y-4">
      {/* Privacy notice */}
      <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-[12px] text-muted-foreground">
        Your JSON is processed locally in your browser. No data is sent to any server.
      </div>

      {/* Input mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setMultiSample(false); setResult(null); setError(null); }}
          className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
            !multiSample
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          Single JSON
        </button>
        <button
          onClick={() => { setMultiSample(true); setResult(null); setError(null); }}
          className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
            multiSample
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          Multiple Samples
        </button>
      </div>

      {/* Input area */}
      {!multiSample ? (
        <div>
          <label htmlFor="json-input" className="mb-2 block text-[13px] font-medium text-foreground">
            JSON Input
          </label>
          <textarea
            id="json-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            placeholder='{"name": "John", "age": 30}'
            spellCheck={false}
            className={`h-56 w-full resize-y rounded-xl border bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5 ${
              isDragging
                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                : "border-border"
            }`}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {samples.map((sample, i) => (
            <div key={i}>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[13px] font-medium text-foreground">
                  Sample {i + 1}
                </label>
                {samples.length > 1 && (
                  <button
                    onClick={() => handleRemoveSample(i)}
                    className="text-[12px] text-muted-foreground/60 hover:text-destructive"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={sample}
                onChange={(e) => handleSampleChange(i, e.target.value)}
                placeholder={`Sample ${i + 1} JSON...`}
                spellCheck={false}
                className="h-32 w-full resize-y rounded-xl border border-border bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5"
              />
            </div>
          ))}
          <button
            onClick={handleAddSample}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            + Add Sample
          </button>
        </div>
      )}

      {/* Options */}
      <div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${showOptions ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Options
        </button>

        {showOptions && (
          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Schema draft */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                  Schema Draft
                </label>
                <select
                  value={options.draft}
                  onChange={(e) => setOptions({ ...options, draft: e.target.value as "2020-12" | "draft-07" })}
                  className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground"
                >
                  <option value="2020-12">Draft 2020-12</option>
                  <option value="draft-07">Draft-07</option>
                </select>
              </div>

              {/* Additional properties */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                  Additional Properties
                </label>
                <select
                  value={options.additionalProperties}
                  onChange={(e) => setOptions({ ...options, additionalProperties: e.target.value as "allow" | "disallow" })}
                  className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground"
                >
                  <option value="allow">Allow</option>
                  <option value="disallow">Disallow</option>
                </select>
              </div>

              {/* Required fields */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                  Required Fields
                </label>
                <select
                  value={options.requiredFields}
                  onChange={(e) => setOptions({ ...options, requiredFields: e.target.value as "infer" | "none" })}
                  className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground"
                >
                  <option value="infer">Infer from sample</option>
                  <option value="none">None</option>
                </select>
              </div>

              {/* Format inference */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                  Format Inference
                </label>
                <select
                  value={options.formatInference}
                  onChange={(e) => setOptions({ ...options, formatInference: e.target.value as "on" | "off" })}
                  className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground"
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
              </div>

              {/* Enum inference */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                  Enum Inference
                </label>
                <select
                  value={options.enumInference}
                  onChange={(e) => setOptions({ ...options, enumInference: e.target.value as "on" | "off" })}
                  className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground"
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
              </div>

              {/* Numeric inference */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                  Numeric Inference
                </label>
                <select
                  value={options.numericInference}
                  onChange={(e) => setOptions({ ...options, numericInference: e.target.value as "integer-aware" | "uniform" })}
                  className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground"
                >
                  <option value="integer-aware">Integer-aware</option>
                  <option value="uniform">Treat numbers uniformly</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={multiSample ? samples.every((s) => !s.trim()) : !input.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-5 text-[13px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate Schema
          </button>
          {!multiSample && (
            <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50">
              Import File
              <input
                type="file"
                accept=".json,.txt"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={multiSample ? handleTryMultiExample : handleTryExample}
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

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
          {error.includes("Invalid JSON") && (
            <a
              href="/tools/json-repair"
              className="ml-2 underline underline-offset-2 hover:text-foreground"
            >
              Open in JSON Repair
            </a>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Status */}
          <div className="flex flex-wrap items-center gap-2">
            {result.samplesValidated > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-semibold ${
                  result.samplesPassed === result.samplesValidated
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-warning/20 bg-warning/10 text-warning"
                }`}
              >
                {result.samplesPassed === result.samplesValidated ? "\u2713" : "\u26A0"}
                {result.samplesPassed}/{result.samplesValidated} samples match
              </span>
            )}
            {result.warnings.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/20 bg-warning/10 px-2.5 py-1 text-[12px] font-semibold text-warning">
                {result.warnings.length} warning{result.warnings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
            {result.stats.properties > 0 && (
              <span>{result.stats.properties} properties</span>
            )}
            {result.stats.nestedObjects > 0 && (
              <span>{result.stats.nestedObjects} nested objects</span>
            )}
            {result.stats.arrays > 0 && (
              <span>{result.stats.arrays} arrays</span>
            )}
            {result.stats.requiredFields > 0 && (
              <span>{result.stats.requiredFields} required</span>
            )}
            {result.stats.optionalFields > 0 && (
              <span>{result.stats.optionalFields} optional</span>
            )}
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-1">
              {result.warnings.map((w, i) => (
                <div key={i} className="text-[12px] text-warning/80">
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* Schema output */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[13px] font-medium text-foreground">
                Generated JSON Schema
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  {copied ? "\u2713 Copied" : "Copy"}
                </button>
                <button
                  onClick={() => setDisplayMode("formatted")}
                  className={`inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium transition-colors ${
                    displayMode === "formatted"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  Format
                </button>
                <button
                  onClick={() => setDisplayMode("minified")}
                  className={`inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium transition-colors ${
                    displayMode === "minified"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  Minify
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre rounded-xl border border-border bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground">
              {getSchemaString()}
            </pre>
          </div>

          {/* Schema explanation */}
          <div>
            <label className="mb-2 block text-[13px] font-medium text-foreground">
              Schema Explanation
            </label>
            <pre className="whitespace-pre rounded-xl border border-border bg-card px-4 py-3 font-mono text-[12px] leading-relaxed text-muted-foreground">
              {generateSchemaExplanation(result.schema)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
