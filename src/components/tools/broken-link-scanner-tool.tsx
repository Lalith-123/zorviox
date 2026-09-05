"use client";

import { useState, useCallback } from "react";
import { useInputFocus } from "@/hooks/use-input-focus";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { InfoNotice } from "@/components/shared/info-notice";
import { ErrorDisplay } from "@/components/shared/error-display";

interface LinkOccurrence {
  sourcePage: string;
  anchorText: string;
  linkType: string;
  rel: string[];
  depth: number;
}

interface RedirectHop {
  url: string;
  statusCode: number;
  location: string | null;
}

interface LinkResult {
  normalizedUrl: string;
  url: string;
  status: string;
  statusCode: number | null;
  finalUrl: string | null;
  contentType: string | null;
  redirectChain: RedirectHop[];
  responseTimeMs: number;
  occurrences: LinkOccurrence[];
  contentLength: number | null;
  recoveredAfterRetry: boolean;
  errorMessage: string | null;
}

interface CrawlSummary {
  pagesScanned: number;
  linksDiscovered: number;
  urlsChecked: number;
  healthy: number;
  redirected: number;
  broken: number;
  serverErrors: number;
  blocked: number;
  timeouts: number;
  tlsErrors: number;
  dnsErrors: number;
  possibleSoft404: number;
  invalidUrls: number;
  fragmentIssues: number;
  emails: number;
  telephones: number;
  resources: number;
}

interface CrawlResult {
  status: string;
  startUrl: string;
  pagesScanned: number;
  linksDiscovered: number;
  urlsChecked: number;
  summary: CrawlSummary;
  links: LinkResult[];
}

type FilterType = "all" | "broken" | "redirected" | "server-error" | "blocked" | "timeout" | "soft-404" | "external" | "dns-error" | "tls-error";

const STATUS_STYLES: Record<string, string> = {
  healthy: "text-success",
  redirected: "text-warning",
  broken: "text-destructive",
  "server-error": "text-destructive",
  blocked: "text-warning",
  timeout: "text-warning",
  "tls-error": "text-destructive",
  "dns-error": "text-destructive",
  "soft-404": "text-warning",
  "invalid-url": "text-destructive",
  "fragment-issue": "text-muted-foreground",
  email: "text-muted-foreground",
  telephone: "text-muted-foreground",
  javascript: "text-muted-foreground",
  resource: "text-muted-foreground",
};

const STATUS_BG: Record<string, string> = {
  healthy: "bg-success/10",
  redirected: "bg-warning/10",
  broken: "bg-destructive/10",
  "server-error": "bg-destructive/10",
  blocked: "bg-warning/10",
  timeout: "bg-warning/10",
  "tls-error": "bg-destructive/10",
  "dns-error": "bg-destructive/10",
  "soft-404": "bg-warning/10",
  "invalid-url": "bg-destructive/10",
};

const STATUS_DESCRIPTIONS: Record<number, string> = {
  200: "OK \u2014 Resource successfully retrieved",
  301: "Moved Permanently \u2014 URL has permanently changed",
  302: "Found \u2014 Temporary redirect",
  303: "See Other \u2014 Response is at a different URL",
  307: "Temporary Redirect \u2014 Temporary redirect, method preserved",
  308: "Permanent Redirect \u2014 Permanent redirect, method preserved",
  400: "Bad Request \u2014 Server could not understand the request",
  401: "Unauthorized \u2014 Authentication required",
  403: "Forbidden \u2014 Server refused access",
  404: "Not Found \u2014 Resource does not exist",
  405: "Method Not Allowed \u2014 HTTP method not supported",
  408: "Request Timeout \u2014 Server timed out waiting",
  410: "Gone \u2014 Resource permanently removed",
  429: "Too Many Requests \u2014 Rate limited",
  500: "Internal Server Error \u2014 Server encountered an error",
  501: "Not Implemented \u2014 Server does not support the request",
  502: "Bad Gateway \u2014 Invalid response from upstream server",
  503: "Service Unavailable \u2014 Server temporarily unavailable",
  504: "Gateway Timeout \u2014 Upstream server did not respond",
};

function getStatusDescription(statusCode: number | null): string {
  if (!statusCode) return "";
  return STATUS_DESCRIPTIONS[statusCode] || `Status code ${statusCode}`;
}

const STATUS_LABELS: Record<string, string> = {
  healthy: "Healthy",
  redirected: "Redirected",
  broken: "Broken",
  "server-error": "Server Error",
  blocked: "Blocked",
  timeout: "Timeout",
  "tls-error": "TLS Error",
  "dns-error": "DNS Error",
  "soft-404": "Soft 404",
  "invalid-url": "Invalid URL",
  "fragment-issue": "Fragment Issue",
  email: "Email",
  telephone: "Telephone",
  javascript: "JavaScript",
  resource: "Resource",
};

export function BrokenLinkScannerTool() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(100);
  const [maxDepth, setMaxDepth] = useState(3);
  const [checkExternal, setCheckExternal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<{ pagesScanned: number; linksChecked: number; currentUrl: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  const inputRef = useInputFocus<HTMLInputElement>();
  const { copy } = useCopyToClipboard();

  const handleScan = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL.");
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress({ pagesScanned: 0, linksChecked: 0, currentUrl: trimmed });

    try {
      const res = await fetch("/api/broken-link-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          maxPages,
          maxDepth,
          checkExternal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong.");
        return;
      }

      setResult(data.result);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setScanning(false);
      setProgress(null);
    }
  }, [url, maxPages, maxDepth, checkExternal]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !scanning) {
        handleScan();
      }
    },
    [handleScan, scanning]
  );

  const filteredLinks = result?.links.filter((link) => {
    if (filter === "broken") return link.status === "broken";
    if (filter === "redirected") return link.status === "redirected";
    if (filter === "server-error") return link.status === "server-error";
    if (filter === "blocked") return link.status === "blocked";
    if (filter === "timeout") return link.status === "timeout";
    if (filter === "soft-404") return link.status === "soft-404";
    if (filter === "dns-error") return link.status === "dns-error";
    if (filter === "tls-error") return link.status === "tls-error";
    if (filter === "external") return link.occurrences.some((o) => o.linkType === "external");
    return true;
  }).filter((link) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      link.url.toLowerCase().includes(q) ||
      link.occurrences.some((o) => o.sourcePage.toLowerCase().includes(q) || o.anchorText.toLowerCase().includes(q))
    );
  }) || [];

  const handleExportCsv = useCallback(() => {
    if (!result) return;
    const header = "Status,Status Code,URL,Final URL,Source URL,Anchor Text,Redirect Count,Response Time (ms)";
    const rows = result.links.map((r) => {
      const sources = r.occurrences.map((o) => o.sourcePage).join("; ");
      const anchors = r.occurrences.map((o) => `"${(o.anchorText || "").replace(/"/g, '""')}"`).join("; ");
      return [
        r.status,
        r.statusCode ?? "",
        `"${r.url}"`,
        r.finalUrl ? `"${r.finalUrl}"` : "",
        `"${sources}"`,
        anchors,
        r.redirectChain.length,
        r.responseTimeMs,
      ].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "broken-links.csv";
    a.click();
    URL.revokeObjectURL(blobUrl);
  }, [result]);

  const summary = result?.summary;

  const filterCounts = result ? {
    all: result.urlsChecked,
    broken: result.summary.broken,
    redirected: result.summary.redirected,
    "server-error": result.summary.serverErrors,
    blocked: result.summary.blocked,
    timeout: result.summary.timeouts,
    "soft-404": result.summary.possibleSoft404,
    "dns-error": result.summary.dnsErrors,
    "tls-error": result.summary.tlsErrors,
    external: result.links.filter((l) => l.occurrences.some((o) => o.linkType === "external")).length,
  } : {};

  return (
    <div className="space-y-4">
      <InfoNotice>
        Links are checked server-side. The scanner crawls same-domain pages and identifies broken links, redirects, and other issues.
      </InfoNotice>

      {/* Input */}
      <div>
        <label htmlFor="scanner-url" className="mb-2 block text-[13px] font-medium text-foreground">
          Website URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="scanner-url"
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            disabled={scanning}
            className="h-11 flex-1 rounded-lg border border-border bg-card px-4 text-[14px] font-mono text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5 disabled:opacity-50"
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Scanning...
              </span>
            ) : (
              "Start Scan"
            )}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 text-[13px]">
        <div className="flex items-center gap-2">
          <label htmlFor="max-pages" className="text-muted-foreground">Pages:</label>
          <select
            id="max-pages"
            value={maxPages}
            onChange={(e) => setMaxPages(parseInt(e.target.value))}
            disabled={scanning}
            className="h-8 rounded-md border border-border bg-card px-2 text-[13px] text-foreground disabled:opacity-50"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="max-depth" className="text-muted-foreground">Depth:</label>
          <select
            id="max-depth"
            value={maxDepth}
            onChange={(e) => setMaxDepth(parseInt(e.target.value))}
            disabled={scanning}
            className="h-8 rounded-md border border-border bg-card px-2 text-[13px] text-foreground disabled:opacity-50"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-muted-foreground">
          <input
            type="checkbox"
            checked={checkExternal}
            onChange={(e) => setCheckExternal(e.target.checked)}
            disabled={scanning}
            className="h-4 w-4 rounded border-border"
          />
          Check external links
        </label>
      </div>

      {/* Progress */}
      {scanning && progress && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-[13px]">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            <span className="text-muted-foreground">
              Scanning {progress.currentUrl || "..."}
            </span>
          </div>
          <div className="mt-2 flex gap-4 text-[12px] text-muted-foreground">
            <span>Pages: {progress.pagesScanned}</span>
            <span>Links: {progress.linksChecked}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <ErrorDisplay error={error} />}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-[15px] font-semibold text-foreground">Scan Complete</h2>
            <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
              <StatItem label="Pages scanned" value={summary?.pagesScanned ?? 0} />
              <StatItem label="Links discovered" value={summary?.linksDiscovered ?? 0} />
              <StatItem label="Unique URLs" value={summary?.urlsChecked ?? 0} />
              <StatItem label="Healthy" value={summary?.healthy ?? 0} className="text-success" />
              <StatItem label="Redirected" value={summary?.redirected ?? 0} className="text-warning" />
              <StatItem label="Broken" value={summary?.broken ?? 0} className="text-destructive" />
              <StatItem label="Server errors" value={summary?.serverErrors ?? 0} className="text-destructive" />
              <StatItem label="Blocked" value={summary?.blocked ?? 0} className="text-warning" />
              <StatItem label="Timeouts" value={summary?.timeouts ?? 0} className="text-warning" />
              <StatItem label="DNS errors" value={summary?.dnsErrors ?? 0} className="text-destructive" />
              <StatItem label="TLS errors" value={summary?.tlsErrors ?? 0} className="text-destructive" />
              <StatItem label="Soft 404" value={summary?.possibleSoft404 ?? 0} className="text-warning" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(filterCounts) as FilterType[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  filter === key
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {STATUS_LABELS[key] || key}
                <span className="text-[11px] opacity-60">{filterCounts[key]}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL, source, or anchor text..."
            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5"
          />

          {/* Actions */}
          <div className="flex justify-between">
            <span className="text-[12px] text-muted-foreground">
              {filteredLinks.length} results
            </span>
            <button
              onClick={handleExportCsv}
              className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Export CSV
            </button>
          </div>

          {/* Link list */}
          <div className="space-y-2">
            {filteredLinks.map((link, i) => (
              <LinkCard
                key={`${link.normalizedUrl}-${i}`}
                link={link}
                expanded={expandedLink === link.normalizedUrl}
                onToggle={() => setExpandedLink(expandedLink === link.normalizedUrl ? null : link.normalizedUrl)}
                onCopy={copy}
              />
            ))}
            {filteredLinks.length === 0 && (
              <p className="py-8 text-center text-[13px] text-muted-foreground">
                No results match your filter.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div>
      <p className={`text-[18px] font-semibold ${className || "text-foreground"}`}>{value}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}

function LinkCard({
  link,
  expanded,
  onToggle,
  onCopy,
}: {
  link: LinkResult;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (text: string) => void;
}) {
  const statusStyle = STATUS_STYLES[link.status] || "text-muted-foreground";
  const statusBg = STATUS_BG[link.status] || "bg-muted/30";
  const statusLabel = STATUS_LABELS[link.status] || link.status;

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle} ${statusBg}`}>
          {link.statusCode ? `${link.statusCode}` : statusLabel}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-mono text-foreground">{link.url}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {link.statusCode ? (
              <span>{getStatusDescription(link.statusCode)}</span>
            ) : (
              <span>{statusLabel}</span>
            )}
            {link.responseTimeMs > 0 && <span>{link.responseTimeMs}ms</span>}
            {link.redirectChain.length > 0 && <span>{link.redirectChain.length} hop{link.redirectChain.length !== 1 ? "s" : ""}</span>}
          </div>
        </div>
        <span className="shrink-0 text-[12px] text-muted-foreground">
          {expanded ? "\u2212" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 py-3 space-y-3">
          {/* Basic info */}
          <div className="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Status: </span>
              <span className={statusStyle}>{statusLabel}</span>
              {link.statusCode && <span className="text-muted-foreground"> ({link.statusCode})</span>}
              {link.statusCode && (
                <span className="ml-2 text-[12px] text-muted-foreground">
                  {getStatusDescription(link.statusCode)}
                </span>
              )}
            </div>
            {link.finalUrl && (
              <div>
                <span className="text-muted-foreground">Final URL: </span>
                <span className="font-mono text-foreground break-all">{link.finalUrl}</span>
              </div>
            )}
            {link.contentType && (
              <div>
                <span className="text-muted-foreground">Content-Type: </span>
                <span className="text-foreground">{link.contentType}</span>
              </div>
            )}
            {link.errorMessage && (
              <div>
                <span className="text-muted-foreground">Error: </span>
                <span className="text-destructive">{link.errorMessage}</span>
              </div>
            )}
          </div>

          {/* Redirect chain */}
          {link.redirectChain.length > 0 && (
            <div>
              <p className="mb-1 text-[12px] font-medium text-foreground">Redirect Chain</p>
              <div className="space-y-1">
                {link.redirectChain.map((hop, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="text-muted-foreground">{hop.url}</span>
                    <span className="text-warning">{hop.statusCode}</span>
                    <span className="text-[11px] text-muted-foreground/70">{getStatusDescription(hop.statusCode)}</span>
                    <span className="text-muted-foreground/50">{"\u2192"}</span>
                  </div>
                ))}
                {link.finalUrl && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="font-mono text-foreground">{link.finalUrl}</span>
                    <span className="text-success">{link.statusCode}</span>
                    <span className="text-[11px] text-muted-foreground/70">{getStatusDescription(link.statusCode)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source pages */}
          <div>
            <p className="mb-1 text-[12px] font-medium text-foreground">
              Source Pages ({link.occurrences.length})
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {link.occurrences.map((occ, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px]">
                  <span className="shrink-0 text-muted-foreground/50">{"\u2022"}</span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-foreground">{occ.sourcePage}</p>
                    {occ.anchorText && (
                      <p className="truncate text-muted-foreground">Anchor: &quot;{occ.anchorText}&quot;</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy */}
          <div className="flex justify-end">
            <button
              onClick={() => onCopy(link.url)}
              className="inline-flex h-7 items-center justify-center rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
