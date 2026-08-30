"use client";

import { useState, useTransition, useRef, useEffect } from "react";

interface SitemapUrl {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
}

interface SitemapChild {
  loc: string;
  lastmod: string | null;
  urlCount: number | null;
  status: number | null;
  error: string | null;
  urls: SitemapUrl[];
  children: SitemapChild[];
  type: "urlset" | "sitemapindex" | "error";
}

interface Issue {
  severity: "critical" | "error" | "warning" | "info";
  message: string;
  url?: string;
}

interface AnalysisResult {
  inputUrl: string;
  finalUrl: string;
  redirectCount: number;
  httpStatus: number;
  contentType: string | null;
  responseTime: number;
  sitemapType: "urlset" | "sitemapindex" | "error";
  totalUrls: number;
  totalChildSitemaps: number;
  urls: SitemapUrl[];
  childSitemaps: SitemapChild[];
  issues: Issue[];
  stats: {
    urlsWithLastmod: number;
    urlsWithoutLastmod: number;
    urlsWithPriority: number;
    urlsWithoutPriority: number;
    urlsWithChangefreq: number;
    urlsWithoutChangefreq: number;
    duplicateUrls: number;
    invalidUrls: number;
    urlsWithFragments: number;
    urlsWithQueryParams: number;
    httpUrls: number;
    domainMismatch: number;
    invalidLastmod: number;
    futureLastmod: number;
    identicalLastmod: number;
    invalidPriority: number;
    invalidChangefreq: number;
    maxChangefreqCount: number;
    emptyLocCount: number;
  };
  domain: string;
  scheme: string;
  robotsTxt: {
    sitemaps: string[];
    raw: string;
    fetched: boolean;
    error: string | null;
  };
  score: {
    total: number;
    passed: number;
    checks: { label: string; passed: boolean }[];
  };
  sitemapLimits: {
    maxUrls: number;
    maxSitemapIndexEntries: number;
    maxFileSizeMB: number;
  };
}

function ScoreDisplay({ score }: { score: AnalysisResult["score"] }) {
  const pct = Math.round((score.passed / score.total) * 100);
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-foreground">
          Sitemap Health
        </span>
        <span className="text-[13px] font-medium text-muted-foreground">
          {score.passed}/{score.total}
        </span>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground/70">
        Based on XML structure validity, URL quality, and SEO best practices.
      </p>
      <ul className="space-y-1.5">
        {score.checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-[12px]">
            <span className={c.passed ? "text-success" : "text-muted-foreground/40"}>
              {c.passed ? "\u2713" : "\u2717"}
            </span>
            <span className={c.passed ? "text-foreground" : "text-muted-foreground"}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IssueList({ issues }: { issues: Issue[] }) {
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
    <section>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        Issues Found ({issues.length})
      </h3>
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
                {issue.url && (
                  <div className="mt-1 break-all text-[11px] text-muted-foreground">
                    {issue.url}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  hint,
  mono = false,
}: {
  label: string;
  value: string | number | null;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className={`mt-px shrink-0 text-[13px] ${value != null ? "text-success" : "text-muted-foreground/30"}`}>
        {value != null ? "\u2713" : "\u2014"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-foreground">{label}</div>
        {value != null ? (
          <div
            className={`mt-0.5 break-all text-[12px] leading-relaxed text-muted-foreground ${
              mono ? "font-mono" : ""
            }`}
          >
            {String(value)}
          </div>
        ) : (
          <div className="mt-0.5 text-[12px] text-muted-foreground/50">{hint || "Not found"}</div>
        )}
      </div>
    </div>
  );
}

function ChildSitemapCard({ child }: { child: SitemapChild }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-foreground break-all">{child.loc}</div>
          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {child.lastmod && <span>Updated: {child.lastmod}</span>}
            {child.urlCount != null && <span>{child.urlCount} URLs</span>}
            {child.status != null && (
              <span className={child.status === 200 ? "text-success" : "text-destructive"}>
                HTTP {child.status}
              </span>
            )}
            {child.error && <span className="text-destructive">{child.error}</span>}
            <span className="text-muted-foreground/60">{child.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-4 py-3 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground/60">{sub}</div>}
    </div>
  );
}

export function SitemapAnalyzerTool() {
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
        const res = await fetch("/api/sitemap-analyzer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }
        if (data.issues?.some((i: Issue) => i.severity === "critical") && data.totalUrls === 0) {
          const critical = data.issues.find((i: Issue) => i.severity === "critical");
          setError(critical?.message || "Could not analyze the sitemap.");
          return;
        }
        setResult(data);
      } catch {
        setError("Could not connect to the server. Please try again.");
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="sitemap-url-input" className="mb-2 block text-[13px] font-medium text-foreground">
          Sitemap URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="sitemap-url-input"
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
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
                Analyzing...
              </span>
            ) : (
              "Analyze Sitemap"
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
          {/* Redirect info */}
          {result.redirectCount > 0 && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">
                {result.redirectCount} redirect{result.redirectCount > 1 ? "s" : ""}
              </span>{" "}
              followed. Final URL:{" "}
              <span className="break-all font-medium text-foreground">{result.finalUrl}</span>
            </div>
          )}

          {/* Score */}
          <ScoreDisplay score={result.score} />

          {/* Overview Stats */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Overview
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBlock label="Sitemap Type" value={result.sitemapType} />
              <StatBlock label="Total URLs" value={result.totalUrls} />
              <StatBlock label="Child Sitemaps" value={result.totalChildSitemaps} />
              <StatBlock label="Response Time" value={`${result.responseTime}ms`} />
            </div>
          </section>

          {/* Issues */}
          <IssueList issues={result.issues} />

          {/* URL Statistics */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              URL Statistics
            </h3>
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card px-5">
              <Row label="URLs with lastmod" value={result.stats.urlsWithLastmod} hint="No URLs have lastmod" />
              <Row
                label="URLs without lastmod"
                value={result.stats.urlsWithoutLastmod}
                hint="All URLs have lastmod"
              />
              <Row label="URLs with priority" value={result.stats.urlsWithPriority} hint="No URLs have priority" />
              <Row
                label="URLs without priority"
                value={result.stats.urlsWithoutPriority}
                hint="All URLs have priority"
              />
              <Row
                label="URLs with changefreq"
                value={result.stats.urlsWithChangefreq}
                hint="No URLs have changefreq"
              />
              <Row
                label="URLs without changefreq"
                value={result.stats.urlsWithoutChangefreq}
                hint="All URLs have changefreq"
              />
              <Row
                label="Duplicate URLs"
                value={result.stats.duplicateUrls}
                hint="No duplicates"
              />
              <Row
                label="Invalid URLs"
                value={result.stats.invalidUrls}
                hint="All URLs are valid"
              />
              <Row
                label="URLs with fragments (#)"
                value={result.stats.urlsWithFragments}
                hint="None"
              />
              <Row
                label="URLs with query params"
                value={result.stats.urlsWithQueryParams}
                hint="None"
              />
              <Row
                label="HTTP URLs (not HTTPS)"
                value={result.stats.httpUrls}
                hint="None"
              />
              <Row
                label="Domain mismatches"
                value={result.stats.domainMismatch}
                hint="All match"
              />
              <Row
                label="Invalid lastmod values"
                value={result.stats.invalidLastmod}
                hint="None"
              />
              <Row
                label="Future lastmod dates"
                value={result.stats.futureLastmod}
                hint="None"
              />
              <Row
                label="Invalid priority values"
                value={result.stats.invalidPriority}
                hint="None"
              />
              <Row
                label="Invalid changefreq values"
                value={result.stats.invalidChangefreq}
                hint="None"
              />
              <Row
                label="Empty loc entries"
                value={result.stats.emptyLocCount}
                hint="None"
              />
            </div>
          </section>

          {/* robots.txt */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              robots.txt
            </h3>
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card px-5">
              <Row
                label="Sitemaps in robots.txt"
                value={
                  result.robotsTxt.sitemaps.length > 0
                    ? result.robotsTxt.sitemaps.join(", ")
                    : null
                }
                hint={result.robotsTxt.fetched ? "No sitemaps declared" : result.robotsTxt.error || "Not fetched"}
              />
              <Row label="Fetched" value={result.robotsTxt.fetched ? "Yes" : "No"} />
            </div>
          </section>

          {/* Limits */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Sitemap Limits (per spec)
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatBlock
                label="Max URLs per sitemap"
                value={result.sitemapLimits.maxUrls.toLocaleString()}
              />
              <StatBlock
                label="Max index entries"
                value={result.sitemapLimits.maxSitemapIndexEntries.toLocaleString()}
              />
              <StatBlock
                label="Max file size"
                value={`${result.sitemapLimits.maxFileSizeMB}MB`}
              />
            </div>
          </section>

          {/* Child Sitemaps (if index) */}
          {result.childSitemaps.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Child Sitemaps ({result.childSitemaps.length})
              </h3>
              <div className="space-y-2">
                {result.childSitemaps.map((child, i) => (
                  <ChildSitemapCard key={i} child={child} />
                ))}
              </div>
            </section>
          )}

          {/* First 50 URLs */}
          {result.urls.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                URLs Found ({result.totalUrls.toLocaleString()}
                {result.totalUrls > 50 ? " — showing first 50" : ""})
              </h3>
              <div className="rounded-xl border border-border/80 bg-card">
                <div className="max-h-96 overflow-y-auto px-5 py-3">
                  <ul className="space-y-1">
                    {result.urls.slice(0, 50).map((u, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 py-1.5 text-[12px] text-muted-foreground"
                      >
                        <span className="w-8 shrink-0 text-right text-[11px] text-muted-foreground/40">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 break-all text-foreground/80">{u.loc}</span>
                        {u.lastmod && (
                          <span className="shrink-0 text-[11px] text-muted-foreground/60">{u.lastmod}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
