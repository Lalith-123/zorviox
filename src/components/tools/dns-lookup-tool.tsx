"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { DnsRecordType, DnsLookupResult } from "@/lib/dns/types";
import { SUPPORTED_RECORD_TYPES } from "@/lib/dns/types";

const RECORD_TYPE_OPTIONS: { value: DnsRecordType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All common records" },
  ...SUPPORTED_RECORD_TYPES.map((t) => ({ value: t, label: t })),
];

export function DnsLookupTool() {
  const [hostname, setHostname] = useState("");
  const [recordType, setRecordType] = useState<DnsRecordType | "ALL">("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DnsLookupResult | null>(null);
  const [results, setResults] = useState<DnsLookupResult[] | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleLookup = useCallback(async () => {
    const trimmed = hostname.trim();
    if (!trimmed) {
      setError("Please enter a hostname.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResults(null);

    try {
      const res = await fetch("/api/dns-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: trimmed, recordType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong.");
        return;
      }

      if (recordType === "ALL" && data.results) {
        setResults(data.results);
      } else if (data.result) {
        setResult(data.result);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [hostname, recordType]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleLookup();
      }
    },
    [handleLookup]
  );

  const handleCopy = useCallback(() => {
    const text = result
      ? formatResultText(result)
      : results
        ? results.map(formatResultText).join("\n\n")
        : "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, results]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-[12px] text-muted-foreground">
        DNS queries are performed server-side. Results reflect the resolver used by Zorviox.
      </div>

      {/* Input */}
      <div>
        <label htmlFor="dns-hostname" className="mb-2 block text-[13px] font-medium text-foreground">
          Hostname or IP
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="dns-hostname"
            ref={inputRef}
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="example.com"
            className="h-11 flex-1 rounded-lg border border-border bg-card px-4 text-[14px] font-mono text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5"
          />
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as DnsRecordType | "ALL")}
            className="h-11 rounded-lg border border-border bg-card px-3 text-[14px] text-foreground transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5"
          >
            {RECORD_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleLookup}
            disabled={loading || !hostname.trim()}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Looking up...
              </span>
            ) : (
              "Lookup"
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Single result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          <ResultHeader result={result} />
          <ResultSection result={result} />
        </div>
      )}

      {/* All records */}
      {results && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">
                {hostname.trim()}
              </h2>
              <p className="text-[12px] text-muted-foreground">
                {results.filter((r) => r.records.length > 0).length} of{" "}
                {results.length} record types found
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {copied ? "\u2713 Copied" : "Copy"}
            </button>
          </div>

          {results.map((r) => (
            <ResultSection key={r.recordType} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultHeader({ result }: { result: DnsLookupResult }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">
          {result.hostname}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
          <span>
            Status:{" "}
            <span
              className={
                result.status === "NOERROR"
                  ? "text-success"
                  : result.error
                    ? "text-destructive"
                    : "text-warning"
              }
            >
              {result.status}
            </span>
          </span>
          <span>Response: {result.responseTimeMs}ms</span>
        </div>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(formatResultText(result));
        }}
        className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        Copy
      </button>
    </div>
  );
}

function ResultSection({ result }: { result: DnsLookupResult }) {
  const hasRecords = result.records.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-foreground">
            {result.recordType}
          </span>
          {hasRecords && (
            <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">
              {result.records.length} record{result.records.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {result.responseTimeMs > 0 && (
          <span className="text-[11px] text-muted-foreground/60">
            {result.responseTimeMs}ms
          </span>
        )}
      </div>

      {result.error && (
        <div className="px-4 py-3 text-[13px] text-muted-foreground">
          {result.error.message}
        </div>
      )}

      {!hasRecords && !result.error && (
        <div className="px-4 py-3 text-[13px] text-muted-foreground">
          No {result.recordType} records were returned.
        </div>
      )}

      {hasRecords && <RecordTable result={result} />}

      {result.diagnostics.length > 0 && (
        <div className="border-t border-border/60 px-4 py-2.5">
          {result.diagnostics.map((d, i) => (
            <p key={i} className="text-[11px] text-muted-foreground/60">
              {d}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordTable({ result }: { result: DnsLookupResult }) {
  if (result.recordType === "SOA" && result.records.length > 0) {
    const soa = result.records[0];
    if ("serial" in soa) {
      return (
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Primary NS: </span>
              <span className="font-mono text-foreground">{soa.nsname}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hostmaster: </span>
              <span className="font-mono text-foreground">{soa.hostmaster}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Serial: </span>
              <span className="font-mono text-foreground">{soa.serial}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Refresh: </span>
              <span className="font-mono text-foreground">{soa.refresh}s</span>
            </div>
            <div>
              <span className="text-muted-foreground">Retry: </span>
              <span className="font-mono text-foreground">{soa.retry}s</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expire: </span>
              <span className="font-mono text-foreground">{soa.expire}s</span>
            </div>
            <div>
              <span className="text-muted-foreground">Minimum: </span>
              <span className="font-mono text-foreground">{soa.minimum}s</span>
            </div>
          </div>
        </div>
      );
    }
  }

  if (result.recordType === "MX") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/60 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Priority</th>
              <th className="px-4 py-2 font-medium">Mail Server</th>
            </tr>
          </thead>
          <tbody>
            {result.records.map((record, i) => (
              <tr
                key={i}
                className="border-b border-border/30 last:border-0"
              >
                <td className="px-4 py-2 font-mono text-foreground">
                  {"priority" in record ? record.priority : ""}
                </td>
                <td className="px-4 py-2 font-mono text-foreground">
                  {"exchange" in record ? record.exchange : record.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (result.recordType === "SRV") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/60 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Priority</th>
              <th className="px-4 py-2 font-medium">Weight</th>
              <th className="px-4 py-2 font-medium">Port</th>
              <th className="px-4 py-2 font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {result.records.map((record, i) => (
              <tr
                key={i}
                className="border-b border-border/30 last:border-0"
              >
                <td className="px-4 py-2 font-mono text-foreground">
                  {"priority" in record ? record.priority : ""}
                </td>
                <td className="px-4 py-2 font-mono text-foreground">
                  {"weight" in record ? record.weight : ""}
                </td>
                <td className="px-4 py-2 font-mono text-foreground">
                  {"port" in record ? record.port : ""}
                </td>
                <td className="px-4 py-2 font-mono text-foreground">
                  {"target" in record ? record.target : record.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (result.recordType === "CAA") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/60 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Flags</th>
              <th className="px-4 py-2 font-medium">Tag</th>
              <th className="px-4 py-2 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {result.records.map((record, i) => (
              <tr
                key={i}
                className="border-b border-border/30 last:border-0"
              >
                <td className="px-4 py-2 font-mono text-foreground">
                  {"flags" in record ? record.flags : ""}
                </td>
                <td className="px-4 py-2 font-mono text-foreground">
                  {"tag" in record ? record.tag : ""}
                </td>
                <td className="px-4 py-2 font-mono text-foreground">
                  {record.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border/60 text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {result.records.map((record, i) => (
            <tr key={i} className="border-b border-border/30 last:border-0">
              <td className="px-4 py-2 font-mono text-foreground">
                {record.type}
              </td>
              <td className="px-4 py-2 font-mono text-foreground">
                {record.name}
              </td>
              <td className="px-4 py-2 font-mono text-foreground break-all">
                {record.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatResultText(result: DnsLookupResult): string {
  const lines: string[] = [];
  lines.push(`${result.recordType} records for ${result.hostname}`);
  lines.push(`Status: ${result.status}`);
  lines.push(`Response time: ${result.responseTimeMs}ms`);
  lines.push("");

  if (result.error) {
    lines.push(`Error: ${result.error.message}`);
  } else if (result.records.length === 0) {
    lines.push(`No ${result.recordType} records found.`);
  } else {
    for (const record of result.records) {
      lines.push(`${record.type}\t${record.name}\t${record.value}`);
    }
  }

  return lines.join("\n");
}
