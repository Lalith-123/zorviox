"use client";

import { useState, useCallback } from "react";
import { useInputFocus } from "@/hooks/use-input-focus";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { InfoNotice } from "@/components/shared/info-notice";
import { ErrorDisplay } from "@/components/shared/error-display";

interface SecurityFinding {
  header: string;
  status: "present" | "missing" | "configured" | "needs-review" | "informational";
  value: string | null;
  explanation: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
}

interface SeoFinding {
  header: string;
  status: "present" | "missing" | "configured" | "needs-review" | "informational";
  value: string | null;
  explanation: string;
}

interface CacheFinding {
  header: string;
  status: "present" | "missing" | "configured" | "needs-review" | "informational";
  value: string | null;
  explanation: string;
}

interface CorsFinding {
  header: string;
  status: "present" | "missing" | "configured" | "needs-review" | "informational";
  value: string | null;
  explanation: string;
}

interface CookieInfo {
  name: string;
  value: string;
  domain: string | null;
  path: string | null;
  expires: string | null;
  maxAge: number | null;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  attributes: Record<string, string>;
}

interface CookieFinding {
  cookie: CookieInfo;
  observations: string[];
}

interface RedirectHop {
  url: string;
  statusCode: number;
  statusText: string;
  location: string | null;
  headers: Record<string, string>;
}

interface AnalysisResult {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  httpVersion: string | null;
  responseTimeMs: number;
  redirectCount: number;
  redirectChain: RedirectHop[];
  contentType: string | null;
  contentLength: number | null;
  server: string | null;
  date: string | null;
  headers: Record<string, string>;
  headerEntries: { name: string; value: string; category: string; description: string }[];
  securityFindings: SecurityFinding[];
  seoFindings: SeoFinding[];
  cacheFindings: CacheFinding[];
  corsFindings: CorsFinding[];
  cookieFindings: CookieFinding[];
  cspAnalysis: { directives: { name: string; values: string[] }[]; hasUnsafeInline: boolean; hasUnsafeEval: boolean; hasWildcard: boolean; isReportOnly: boolean; observations: string[] } | null;
  hstsAnalysis: { maxAge: number | null; includeSubDomains: boolean; preload: boolean; directives: string[]; observations: string[] } | null;
  error: { code: string; message: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  present: "text-success",
  configured: "text-success",
  "needs-review": "text-warning",
  missing: "text-muted-foreground",
  informational: "text-muted-foreground",
};

const STATUS_BG: Record<string, string> = {
  present: "bg-success/10",
  configured: "bg-success/10",
  "needs-review": "bg-warning/10",
  missing: "bg-muted/30",
  informational: "bg-muted/30",
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "text-destructive",
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
  informational: "text-muted-foreground",
};

export function HttpHeaderAnalyzerTool() {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [search, setSearch] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [rawView, setRawView] = useState(false);
  const inputRef = useInputFocus<HTMLInputElement>();
  const { copy } = useCopyToClipboard();

  const handleAnalyze = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/http-header-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong.");
        return;
      }

      setResult(data.result);
      if (data.result.error) {
        setError(data.result.error.message);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [url]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !analyzing) {
        handleAnalyze();
      }
    },
    [handleAnalyze, analyzing]
  );

  const filteredHeaders = result?.headerEntries.filter((h) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.value.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q)
    );
  }) || [];

  const handleExportJson = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "http-headers.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleExportCsv = useCallback(() => {
    if (!result) return;
    const header = "Header,Value,Category,Description";
    const rows = result.headerEntries.map(
      (h) => `"${h.name}","${h.value.replace(/"/g, '""')}","${h.category}","${h.description}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "http-headers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleExportRaw = useCallback(() => {
    if (!result) return;
    const lines = [`${result.httpVersion || "HTTP/1.1"} ${result.statusCode} ${result.statusText}`];
    for (const [name, value] of Object.entries(result.headers)) {
      lines.push(`${name}: ${value}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "http-headers.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const securityCount = result?.securityFindings.filter((f) => f.status === "missing" || f.status === "needs-review").length || 0;

  return (
    <div className="space-y-4">
      <InfoNotice>
        Headers are analyzed server-side. Enter a URL to inspect all HTTP response headers and receive security, SEO, and caching analysis.
      </InfoNotice>

      {/* Input */}
      <div>
        <label htmlFor="header-url" className="mb-2 block text-[13px] font-medium text-foreground">
          Website URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="header-url"
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            disabled={analyzing}
            className="h-11 flex-1 rounded-lg border border-border bg-card px-4 text-[14px] font-mono text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5 disabled:opacity-50"
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !url.trim()}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Analyzing...
              </span>
            ) : (
              "Analyze Headers"
            )}
          </button>
        </div>
      </div>

      {error && <ErrorDisplay error={error} />}

      {result && !result.error && (
        <div className="space-y-4 animate-fade-in">
          {/* Overview */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[12px] text-muted-foreground">Analyzed URL</p>
                <p className="break-all text-[14px] font-mono text-foreground">{result.requestedUrl}</p>
                {result.finalUrl !== result.requestedUrl && (
                  <p className="mt-0.5 break-all text-[12px] text-muted-foreground">
                    Final: <span className="font-mono">{result.finalUrl}</span>
                  </p>
                )}
              </div>
              <span className="inline-flex shrink-0 items-center rounded-md bg-success/10 px-2.5 py-1 text-[12px] font-medium text-success">
                {result.statusCode} {result.statusText}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
              <div>
                <p className="text-[12px] text-muted-foreground">Response Time</p>
                <p className="font-medium text-foreground">{result.responseTimeMs}ms</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">HTTP Version</p>
                <p className="font-medium text-foreground">{result.httpVersion || "Not available"}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Content Type</p>
                <p className="font-medium text-foreground">{result.contentType || "N/A"}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Server</p>
                <p className="font-medium text-foreground">{result.server || "N/A"}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Content Length</p>
                <p className="font-medium text-foreground">{result.contentLength ? `${result.contentLength} bytes` : "N/A"}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Redirects</p>
                <p className="font-medium text-foreground">{result.redirectCount}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">HTTPS</p>
                <p className="font-medium text-foreground">{result.finalUrl.startsWith("https://") ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Security Findings</p>
                <p className={`font-medium ${securityCount > 0 ? "text-warning" : "text-success"}`}>{securityCount} need attention</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <CollapsibleBlock
            title="Security Headers"
            count={securityCount}
            countLabel="need attention"
            expanded={expandedSection === "security"}
            onToggle={() => toggleSection("security")}
          >
            <FindingTable
              findings={result.securityFindings.map((f) => ({
                label: f.header,
                status: f.status,
                value: f.value,
                explanation: f.explanation,
                extra: f.severity,
              }))}
              showSeverity
            />
          </CollapsibleBlock>

          {/* SEO */}
          <CollapsibleBlock
            title="SEO Headers"
            count={result.seoFindings.filter((f) => f.status === "needs-review").length}
            countLabel="need attention"
            expanded={expandedSection === "seo"}
            onToggle={() => toggleSection("seo")}
          >
            <FindingTable
              findings={result.seoFindings.map((f) => ({
                label: f.header,
                status: f.status,
                value: f.value,
                explanation: f.explanation,
              }))}
            />
          </CollapsibleBlock>

          {/* Cache */}
          <CollapsibleBlock
            title="Caching Headers"
            count={result.cacheFindings.length}
            countLabel="headers"
            expanded={expandedSection === "cache"}
            onToggle={() => toggleSection("cache")}
          >
            <FindingTable
              findings={result.cacheFindings.map((f) => ({
                label: f.header,
                status: f.status,
                value: f.value,
                explanation: f.explanation,
              }))}
            />
          </CollapsibleBlock>

          {/* CORS */}
          {result.corsFindings.length > 0 && (
            <CollapsibleBlock
              title="CORS Headers"
              count={result.corsFindings.length}
              countLabel="headers"
              expanded={expandedSection === "cors"}
              onToggle={() => toggleSection("cors")}
            >
              <FindingTable
                findings={result.corsFindings.map((f) => ({
                  label: f.header,
                  status: f.status,
                  value: f.value,
                  explanation: f.explanation,
                }))}
              />
            </CollapsibleBlock>
          )}

          {/* Cookies */}
          {result.cookieFindings.length > 0 && (
            <CollapsibleBlock
              title="Cookies"
              count={result.cookieFindings.length}
              countLabel="cookies"
              expanded={expandedSection === "cookies"}
              onToggle={() => toggleSection("cookies")}
            >
              <div className="space-y-3">
                {result.cookieFindings.map((cf, i) => (
                  <div key={i} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">{cf.cookie.name}</span>
                      {cf.cookie.secure && <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] text-success">Secure</span>}
                      {cf.cookie.httpOnly && <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] text-success">HttpOnly</span>}
                      {cf.cookie.sameSite && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">SameSite={cf.cookie.sameSite}</span>}
                    </div>
                    <div className="space-y-1 text-[12px] text-muted-foreground">
                      {cf.observations.map((obs, j) => (
                        <p key={j}>{obs}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleBlock>
          )}

          {/* Redirect Chain */}
          {result.redirectChain.length > 0 && (
            <CollapsibleBlock
              title="Redirect Chain"
              count={result.redirectChain.length}
              countLabel="hops"
              expanded={expandedSection === "redirects"}
              onToggle={() => toggleSection("redirects")}
            >
              <div className="space-y-1">
                {result.redirectChain.map((hop, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="shrink-0 text-muted-foreground/50">{i + 1}.</span>
                    <span className="min-w-0 truncate font-mono text-foreground">{hop.url}</span>
                    <span className="shrink-0 text-warning">{hop.statusCode}</span>
                    {hop.location && <span className="shrink-0 text-muted-foreground/50">{"\u2192"}</span>}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="shrink-0 text-muted-foreground/50">{result.redirectChain.length + 1}.</span>
                  <span className="min-w-0 truncate font-mono text-foreground">{result.finalUrl}</span>
                  <span className="shrink-0 text-success">{result.statusCode}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground/70">{result.statusText}</span>
                </div>
              </div>
            </CollapsibleBlock>
          )}

          {/* CSP Analysis */}
          {result.cspAnalysis && (
            <CollapsibleBlock
              title="CSP Directive Analysis"
              count={result.cspAnalysis.directives.length}
              countLabel="directives"
              expanded={expandedSection === "csp"}
              onToggle={() => toggleSection("csp")}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-[12px]">
                  {result.cspAnalysis.directives.map((d) => (
                    <span key={d.name} className="rounded-md bg-muted/50 px-2 py-1 text-foreground">
                      <span className="font-medium">{d.name}</span>
                      {d.values.length > 0 && (
                        <span className="ml-1 text-muted-foreground">= {d.values.join(" ")}</span>
                      )}
                    </span>
                  ))}
                </div>
                {result.cspAnalysis.observations.length > 0 && (
                  <div className="space-y-1 text-[12px] text-muted-foreground">
                    {result.cspAnalysis.observations.map((obs, i) => (
                      <p key={i}>{obs}</p>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleBlock>
          )}

          {/* All Headers */}
          <CollapsibleBlock
            title="All Response Headers"
            count={Object.keys(result.headers).length}
            countLabel="headers"
            expanded={expandedSection === "all"}
            onToggle={() => toggleSection("all")}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search headers..."
                  className="h-8 flex-1 min-w-[200px] rounded-md border border-border bg-card px-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => setRawView(false)}
                    className={`h-8 rounded-md px-2.5 text-[12px] font-medium transition-colors ${!rawView ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >
                    Parsed
                  </button>
                  <button
                    onClick={() => setRawView(true)}
                    className={`h-8 rounded-md px-2.5 text-[12px] font-medium transition-colors ${rawView ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >
                    Raw
                  </button>
                </div>
              </div>

              {rawView ? (
                <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-[12px] font-mono text-foreground">
                  {`${result.httpVersion || "HTTP/1.1"} ${result.statusCode} ${result.statusText}\n` +
                    Object.entries(result.headers)
                      .map(([n, v]) => `${n}: ${v}`)
                      .join("\n")}
                </pre>
              ) : (
                <div className="space-y-1">
                  {filteredHeaders.map((h) => (
                    <div key={h.name} className="flex items-start gap-3 rounded-md px-2 py-1.5 hover:bg-muted/30">
                      <span className="shrink-0 text-[12px] font-medium text-foreground">{h.name}</span>
                      <span className="min-w-0 break-all font-mono text-[12px] text-muted-foreground">{h.value}</span>
                      <button
                        onClick={() => copy(h.value)}
                        className="shrink-0 text-[11px] text-muted-foreground/50 hover:text-foreground"
                      >
                        copy
                      </button>
                    </div>
                  ))}
                  {filteredHeaders.length === 0 && (
                    <p className="py-4 text-center text-[13px] text-muted-foreground">No headers match your search.</p>
                  )}
                </div>
              )}
            </div>
          </CollapsibleBlock>

          {/* Export */}
          <div className="flex flex-wrap justify-end gap-2">
            <button onClick={handleExportJson} className="inline-flex h-8 items-center justify-center rounded-md bg-muted/50 px-2.5 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              Export JSON
            </button>
            <button onClick={handleExportCsv} className="inline-flex h-8 items-center justify-center rounded-md bg-muted/50 px-2.5 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              Export CSV
            </button>
            <button onClick={handleExportRaw} className="inline-flex h-8 items-center justify-center rounded-md bg-muted/50 px-2.5 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              Export Raw
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleBlock({
  title,
  count,
  countLabel,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  countLabel: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">{count} {countLabel}</span>
          <span className="text-[12px] text-muted-foreground">{expanded ? "\u2212" : "+"}</span>
        </div>
      </button>
      {expanded && <div className="border-t border-border/60 px-4 py-3">{children}</div>}
    </div>
  );
}

function FindingTable({
  findings,
  showSeverity = false,
}: {
  findings: { label: string; status: string; value: string | null; explanation: string; extra?: string }[];
  showSeverity?: boolean;
}) {
  return (
    <div className="space-y-2">
      {findings.map((f, i) => (
        <div key={i} className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[f.status] || "text-muted-foreground"} ${STATUS_BG[f.status] || "bg-muted/30"}`}>
              {f.status === "present" || f.status === "configured" ? "Present" : f.status === "missing" ? "Missing" : f.status === "needs-review" ? "Needs Review" : "Informational"}
            </span>
            <span className="text-[13px] font-medium text-foreground">{f.label}</span>
            {showSeverity && f.extra && (
              <span className={`text-[11px] ${SEVERITY_STYLES[f.extra] || ""}`}>{f.extra}</span>
            )}
          </div>
          {f.value && (
            <p className="mb-1 break-all font-mono text-[12px] text-muted-foreground">{f.value}</p>
          )}
          <p className="text-[12px] text-muted-foreground">{f.explanation}</p>
        </div>
      ))}
    </div>
  );
}
