"use client";

import { useState, useTransition } from "react";

interface Score {
  total: number;
  passed: number;
  checks: { label: string; passed: boolean }[];
}

interface MetaTags {
  title: string | null;
  description: string | null;
  robots: string | null;
  language: string | null;
  charset: string | null;
  viewport: string | null;
  canonical: string | null;
  multipleCanonicals: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: string | null;
  ogSiteName: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  favicon: string | null;
  themeColor: string | null;
  author: string | null;
  generator: string | null;
  keywords: string | null;
  alternates: { lang: string; href: string }[];
}

interface AnalysisResult {
  url: string;
  finalUrl: string;
  redirectCount: number;
  fetchedAt: string;
  metaTags: MetaTags;
  score: Score;
}

function StatusIcon({ present }: { present: boolean }) {
  return (
    <span
      className={`mt-px shrink-0 text-[13px] ${present ? "text-success" : "text-muted-foreground/30"}`}
      aria-label={present ? "Present" : "Not found"}
    >
      {present ? "\u2713" : "\u2014"}
    </span>
  );
}

function Row({
  label,
  value,
  hint,
  warning,
}: {
  label: string;
  value: string | null;
  hint?: string;
  warning?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <StatusIcon present={!!value} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-foreground">{label}</div>
        {value ? (
          <div className="mt-0.5 break-all text-[12px] leading-relaxed text-muted-foreground">
            {value}
          </div>
        ) : (
          <div className="mt-0.5 text-[12px] text-muted-foreground/50">
            {hint || "Not found"}
          </div>
        )}
        {warning && (
          <div className="mt-1 text-[11px] text-warning">{warning}</div>
        )}
      </div>
    </div>
  );
}

function ScoreDisplay({ score }: { score: Score }) {
  const pct = Math.round((score.passed / score.total) * 100);
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-foreground">
          Metadata Health
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
        Based on the presence of essential metadata tags. This is not a Google ranking score.
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

export function MetaTagCheckerTool() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        const res = await fetch("/api/meta-tag-checker", {
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

  const mt = result?.metaTags;

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="url-input" className="mb-2 block text-[13px] font-medium text-foreground">
          Website URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
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
              "Check Meta Tags"
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
              <span className="break-all font-medium text-foreground">
                {result.finalUrl}
              </span>
            </div>
          )}

          <ScoreDisplay score={result.score} />

          {/* SEO Metadata */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              SEO Metadata
            </h3>
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card px-5">
              <Row
                label="Title"
                value={mt?.title ?? null}
                hint="No title tag found"
                warning={
                  mt?.title && mt.title.length > 60
                    ? `${mt.title.length} chars — titles over ~60 may be truncated in search results`
                    : undefined
                }
              />
              <Row
                label="Meta Description"
                value={mt?.description ?? null}
                hint="No meta description found"
                warning={
                  mt?.description && mt.description.length > 160
                    ? `${mt.description.length} chars — descriptions over ~160 may be truncated`
                    : undefined
                }
              />
              <Row
                label="Canonical URL"
                value={mt?.canonical ?? null}
                hint="No canonical tag found"
                warning={mt?.multipleCanonicals ? "Multiple canonical tags detected" : undefined}
              />
              <Row label="Robots" value={mt?.robots ?? null} hint="No robots directive" />
              <Row label="Viewport" value={mt?.viewport ?? null} hint="No viewport meta tag" />
            </div>
          </section>

          {/* Open Graph */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Open Graph
            </h3>
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card px-5">
              <Row label="og:title" value={mt?.ogTitle ?? null} hint="No Open Graph title" />
              <Row label="og:description" value={mt?.ogDescription ?? null} hint="No Open Graph description" />
              <Row
                label="og:image"
                value={mt?.ogImage ?? null}
                hint="No Open Graph image"
              />
              <Row label="og:url" value={mt?.ogUrl ?? null} hint="No Open Graph URL" />
              <Row label="og:type" value={mt?.ogType ?? null} hint="No Open Graph type" />
              <Row label="og:site_name" value={mt?.ogSiteName ?? null} hint="No Open Graph site name" />
            </div>
          </section>

          {/* Twitter / X */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Twitter / X
            </h3>
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card px-5">
              <Row label="twitter:card" value={mt?.twitterCard ?? null} hint="No Twitter card type" />
              <Row label="twitter:title" value={mt?.twitterTitle ?? null} hint="No Twitter title" />
              <Row label="twitter:description" value={mt?.twitterDescription ?? null} hint="No Twitter description" />
              <Row label="twitter:image" value={mt?.twitterImage ?? null} hint="No Twitter image" />
            </div>
          </section>

          {/* Technical */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Technical
            </h3>
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card px-5">
              <Row label="Favicon" value={mt?.favicon ?? null} hint="No favicon link" />
              <Row label="Theme Color" value={mt?.themeColor ?? null} hint="No theme-color meta" />
              <Row label="Author" value={mt?.author ?? null} hint="No author meta" />
              <Row label="Generator" value={mt?.generator ?? null} hint="No generator meta" />
              <Row label="Keywords" value={mt?.keywords ?? null} hint="No keywords meta" />
              <Row
                label="Language"
                value={mt?.language ?? null}
                hint="No lang attribute on html element"
              />
              <Row label="Charset" value={mt?.charset ?? null} hint="No charset declared" />
              {mt?.alternates && mt.alternates.length > 0 && (
                <Row
                  label="Alternate languages"
                  value={mt.alternates.map((a) => `${a.lang}: ${a.href}`).join(", ")}
                />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
