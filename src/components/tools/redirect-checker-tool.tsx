"use client";

import { useState, useTransition, useRef, useEffect } from "react";

interface RedirectHop {
  step: number;
  url: string;
  statusCode: number;
  statusText: string;
  location: string | null;
  resolvedLocation: string | null;
  responseTime: number;
  headers: Record<string, string>;
  contentType: string | null;
  contentLength: number | null;
}

interface AnalysisResult {
  inputUrl: string;
  chain: {
    hops: RedirectHop[];
    totalRedirects: number;
    finalUrl: string;
    finalStatusCode: number;
    finalStatusText: string;
    totalTime: number;
    hasLoop: boolean;
    loopDetectedAt: number | null;
    limitExceeded: boolean;
  };
  isRedirect: boolean;
  redirectType: "none" | "direct" | "chain" | "loop" | "exceeded";
  issues: { severity: string; message: string; detail?: string }[];
  seoObservations: { label: string; value: string; type: string }[];
  metaRefresh: { detected: boolean; url: string | null; delay: number | null } | null;
  jsRedirect: { detected: boolean; patterns: string[] } | null;
  timing: {
    totalMs: number;
    hops: { url: string; ms: number }[];
  };
  domainInfo: {
    scheme: string;
    hostname: string;
    www: boolean;
    crossDomain: boolean;
    hops: { scheme: string; hostname: string; www: boolean }[];
  };
  headers: {
    server: string | null;
    cacheControl: string | null;
    hsts: string | null;
    lastModified: string | null;
    etag: string | null;
    age: string | null;
  };
}

function StatusBadge({ code }: { code: number }) {
  const colors: Record<number, string> = {
    200: "bg-success/10 text-success border-success/20",
    301: "bg-accent/10 text-accent border-accent/20",
    302: "bg-accent/10 text-accent border-accent/20",
    303: "bg-accent/10 text-accent border-accent/20",
    307: "bg-accent/10 text-accent border-accent/20",
    308: "bg-accent/10 text-accent border-accent/20",
    404: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const color = code >= 400
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : colors[code] || "bg-muted text-muted-foreground border-border";

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[12px] font-mono font-semibold ${color}`}>
      {code || "ERR"}
    </span>
  );
}

function HopCard({ hop, isLast, timingMs }: { hop: RedirectHop; isLast: boolean; timingMs?: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[19px] top-10 h-full w-px bg-border/60" />
      )}
      <div className="flex items-start gap-3">
        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card text-[13px] font-bold text-foreground">
          {hop.step}
        </div>
        <div className="min-w-0 flex-1 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge code={hop.statusCode} />
            <span className="text-[12px] text-muted-foreground">{hop.statusText}</span>
            {timingMs != null && (
              <span className="text-[11px] text-muted-foreground/60">{timingMs}ms</span>
            )}
          </div>
          <div className="mt-1.5 break-all text-[13px] font-medium text-foreground">{hop.url}</div>
          {hop.resolvedLocation && (
            <div className="mt-1 text-[12px] text-muted-foreground">
              → <span className="break-all">{hop.resolvedLocation}</span>
            </div>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            {expanded ? "Hide headers" : "Show headers"}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1 rounded-lg bg-muted/50 px-3 py-2 text-[11px]">
              {hop.headers["location"] && (
                <div><span className="text-muted-foreground">Location:</span> <span className="break-all text-foreground">{hop.headers["location"]}</span></div>
              )}
              {hop.headers["server"] && (
                <div><span className="text-muted-foreground">Server:</span> <span className="text-foreground">{hop.headers["server"]}</span></div>
              )}
              {hop.headers["content-type"] && (
                <div><span className="text-muted-foreground">Content-Type:</span> <span className="text-foreground">{hop.headers["content-type"]}</span></div>
              )}
              {hop.headers["cache-control"] && (
                <div><span className="text-muted-foreground">Cache-Control:</span> <span className="text-foreground">{hop.headers["cache-control"]}</span></div>
              )}
              {hop.headers["strict-transport-security"] && (
                <div><span className="text-muted-foreground">HSTS:</span> <span className="text-foreground">{hop.headers["strict-transport-security"]}</span></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border/60 bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="space-y-3 border-t border-border/40 px-5 pb-5 pt-4 text-[14px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}

function IssueList({ issues }: { issues: { severity: string; message: string; detail?: string }[] }) {
  if (issues.length === 0) return null;

  const severityColors: Record<string, string> = {
    critical: "text-destructive",
    error: "text-destructive",
    warning: "text-warning",
    info: "text-muted-foreground",
  };

  const severityBg: Record<string, string> = {
    critical: "border-destructive/20 bg-destructive/5",
    error: "border-destructive/20 bg-destructive/5",
    warning: "border-warning/20 bg-warning/5",
    info: "border-border/60 bg-muted/30",
  };

  const severityLabel: Record<string, string> = {
    critical: "Critical",
    error: "Error",
    warning: "Warning",
    info: "Info",
  };

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <div
          key={i}
          className={`rounded-lg border px-4 py-3 text-[13px] ${severityBg[issue.severity]}`}
        >
          <div className="flex items-start gap-2">
            <span className={`mt-px shrink-0 text-[12px] font-semibold ${severityColors[issue.severity]}`}>
              {severityLabel[issue.severity]}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-foreground">{issue.message}</span>
              {issue.detail && (
                <div className="mt-1 text-[11px] text-muted-foreground">{issue.detail}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RedirectCheckerTool() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/redirect-checker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }
        setResult(data);
      } catch {
        setError("Could not connect to the server. Please try again.");
      }
    });
  }

  function buildCopyText(): string {
    if (!result) return "";
    const lines = [`Redirect analysis for: ${result.inputUrl}`, ""];
    for (const hop of result.chain.hops) {
      lines.push(`${hop.statusCode} ${hop.url}`);
      if (hop.resolvedLocation) lines.push(`  → ${hop.resolvedLocation}`);
    }
    lines.push("");
    lines.push(`Final: ${result.chain.finalStatusCode} ${result.chain.finalUrl}`);
    lines.push(`Redirects: ${result.chain.totalRedirects}`);
    lines.push(`Time: ${result.chain.totalTime}ms`);
    return lines.join("\n");
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="redirect-url-input" className="mb-2 block text-[13px] font-medium text-foreground">
          URL to check
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="redirect-url-input"
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/old-page"
            className="h-11 flex-1 rounded-lg border border-border bg-card px-4 text-[14px] text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Checking...
              </span>
            ) : (
              "Check Redirect"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary */}
          <div className="rounded-xl border border-border/80 bg-card p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-foreground">Redirect Status</span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-muted-foreground">
                  {result.chain.totalRedirects} redirect{result.chain.totalRedirects !== 1 ? "s" : ""}
                </span>
                <CopyButton text={buildCopyText()} label="Copy" />
              </div>
            </div>

            {/* Status chain */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {result.chain.hops.map((hop, i) => (
                <span key={i} className="flex items-center gap-2">
                  <StatusBadge code={hop.statusCode} />
                  {i < result.chain.hops.length - 1 && (
                    <svg className="h-3 w-3 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
              ))}
            </div>

            {/* Final destination */}
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <div className="text-[11px] font-medium text-muted-foreground/60">Final destination</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge code={result.chain.finalStatusCode} />
                <span className="break-all text-[13px] font-medium text-foreground">{result.chain.finalUrl}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground/60">
                {result.chain.totalTime}ms total
              </div>
            </div>

            {result.redirectType === "none" && (
              <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-[13px] text-muted-foreground">
                No HTTP redirect detected — the URL returns a direct response.
              </div>
            )}
          </div>

          {/* Issues */}
          <IssueList issues={result.issues} />

          {/* SEO Observations */}
          {result.seoObservations.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Analysis
              </h3>
              <div className="space-y-2">
                {result.seoObservations.map((obs, i) => {
                  const typeStyles: Record<string, string> = {
                    good: "border-success/20 bg-success/5",
                    review: "border-accent/20 bg-accent/5",
                    problem: "border-destructive/20 bg-destructive/5",
                    info: "border-border/60 bg-muted/30",
                  };
                  const typeIcons: Record<string, string> = {
                    good: "\u2713",
                    review: "\u2139",
                    problem: "\u2717",
                    info: "\u2139",
                  };
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border px-4 py-3 text-[13px] ${typeStyles[obs.type]}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-px shrink-0 text-[12px]">{typeIcons[obs.type]}</span>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-foreground">{obs.label}</span>
                          <span className="ml-2 text-muted-foreground">{obs.value}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Redirect Chain */}
          {result.chain.hops.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Redirect Chain
              </h3>
              <div className="rounded-xl border border-border/80 bg-card px-5 py-4">
                {result.chain.hops.map((hop, i) => (
                  <HopCard
                    key={i}
                    hop={hop}
                    isLast={i === result.chain.hops.length - 1}
                    timingMs={result.timing.hops[i]?.ms}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Meta Refresh / JS Redirect */}
          {(result.metaRefresh?.detected || result.jsRedirect?.detected) && (
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Additional Redirects Detected
              </h3>
              <div className="space-y-2">
                {result.metaRefresh?.detected && (
                  <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-[13px]">
                    <span className="font-medium text-foreground">HTML meta refresh</span>
                    <div className="mt-1 text-muted-foreground">
                      URL: {result.metaRefresh.url} {result.metaRefresh.delay != null && `(${result.metaRefresh.delay}s delay)`}
                    </div>
                  </div>
                )}
                {result.jsRedirect?.detected && (
                  <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-[13px]">
                    <span className="font-medium text-foreground">Potential JavaScript redirect</span>
                    <div className="mt-1 text-muted-foreground">
                      Patterns found: {result.jsRedirect.patterns.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Timing */}
          <CollapsibleSection title="Timing">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Total time</span>
                <span className="font-medium text-foreground">{result.chain.totalTime}ms</span>
              </div>
              {result.timing.hops.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[12px]">
                  <span className="truncate text-muted-foreground">Step {i + 1}</span>
                  <span className="font-medium text-foreground">{h.ms}ms</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Headers */}
          <CollapsibleSection title="Final Response Headers">
            <div className="space-y-2 text-[12px]">
              {result.headers.server && (
                <div><span className="text-muted-foreground">Server:</span> <span className="text-foreground">{result.headers.server}</span></div>
              )}
              {result.headers.cacheControl && (
                <div><span className="text-muted-foreground">Cache-Control:</span> <span className="break-all text-foreground">{result.headers.cacheControl}</span></div>
              )}
              {result.headers.hsts && (
                <div><span className="text-muted-foreground">Strict-Transport-Security:</span> <span className="text-foreground">{result.headers.hsts}</span></div>
              )}
              {result.headers.lastModified && (
                <div><span className="text-muted-foreground">Last-Modified:</span> <span className="text-foreground">{result.headers.lastModified}</span></div>
              )}
              {result.headers.etag && (
                <div><span className="text-muted-foreground">ETag:</span> <span className="text-foreground">{result.headers.etag}</span></div>
              )}
              {result.headers.age && (
                <div><span className="text-muted-foreground">Age:</span> <span className="text-foreground">{result.headers.age}</span></div>
              )}
              {!result.headers.server && !result.headers.cacheControl && !result.headers.hsts && !result.headers.lastModified && !result.headers.etag && !result.headers.age && (
                <div className="text-muted-foreground/60">No notable headers available</div>
              )}
            </div>
          </CollapsibleSection>

          {/* Technical Info */}
          <CollapsibleSection title="Technical Information">
            <div className="space-y-2 text-[12px]">
              <div><span className="text-muted-foreground">Input scheme:</span> <span className="text-foreground">{result.domainInfo.scheme}</span></div>
              <div><span className="text-muted-foreground">Input hostname:</span> <span className="text-foreground">{result.domainInfo.hostname}</span></div>
              <div><span className="text-muted-foreground">Cross-domain:</span> <span className="text-foreground">{result.domainInfo.crossDomain ? "Yes" : "No"}</span></div>
              {result.metaRefresh?.detected && (
                <div><span className="text-muted-foreground">Meta refresh:</span> <span className="text-foreground">Yes</span></div>
              )}
              {result.jsRedirect?.detected && (
                <div><span className="text-muted-foreground">JS redirect:</span> <span className="text-foreground">Potential</span></div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
