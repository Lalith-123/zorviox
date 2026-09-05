import type { CrawlLink } from "./types";

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    if (u.pathname !== "/" && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    u.pathname = decodeURIComponent(u.pathname);
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return url;
  }
}

export function resolveUrl(base: string, href: string): string | null {
  try {
    const resolved = new URL(href, base);
    return resolved.toString();
  } catch {
    return null;
  }
}

export function classifyLink(
  url: string,
  baseUrl: string
): CrawlLink["linkType"] {
  const lower = url.toLowerCase();
  if (lower.startsWith("mailto:")) return "email";
  if (lower.startsWith("tel:")) return "telephone";
  if (lower.startsWith("javascript:")) return "javascript";
  if (lower.startsWith("data:")) return "resource";
  if (lower.startsWith("#") || url === "") return "fragment";

  try {
    const linkUrl = new URL(url);
    const baseObj = new URL(baseUrl);
    if (linkUrl.hostname === baseObj.hostname) return "internal";
    return "external";
  } catch {
    return "resource";
  }
}

export function isSameDomain(url1: string, url2: string): boolean {
  try {
    const u1 = new URL(url1);
    const u2 = new URL(url2);
    const h1 = u1.hostname.replace(/^www\./, "");
    const h2 = u2.hostname.replace(/^www\./, "");
    return h1 === h2;
  } catch {
    return false;
  }
}

export function getBaseDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function extractFragment(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hash ? u.hash.slice(1) : null;
  } catch {
    return null;
  }
}

export function removeFragment(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

export function isPrivateIp(hostname: string): boolean {
  const patterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^localhost$/i,
  ];
  if (/^::1$/.test(hostname)) return true;
  if (/^fc00:/i.test(hostname)) return true;
  if (/^fd/i.test(hostname)) return true;
  if (/^fe80/i.test(hostname)) return true;
  return patterns.some((p) => p.test(hostname));
}

export function extractLinksFromHtml(
  html: string
): { href: string; text: string; rel: string[] }[] {
  const links: { href: string; text: string; rel: string[] }[] = [];

  const linkRegex = /<a\s[^>]*href=["']([^"']*)["'][^>]*>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const fullTag = match[0];

    const relMatch = fullTag.match(/rel=["']([^"']+)["']/i);
    const rel = relMatch
      ? relMatch[1].toLowerCase().split(/\s+/)
      : [];

    const tagEnd = html.indexOf(">", match.index);
    let text = "";
    if (tagEnd > match.index) {
      const afterTag = html.slice(tagEnd + 1);
      const closingA = afterTag.indexOf("</a>");
      if (closingA > -1 && closingA < 2000) {
        text = afterTag
          .slice(0, closingA)
          .replace(/<[^>]+>/g, "")
          .trim()
          .slice(0, 200);
      }
    }

    links.push({ href, text, rel });
  }

  const imgRegex = /<img\s[^>]*src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    links.push({ href: match[1], text: "", rel: [] });
  }

  return links;
}

export function isLikelySoft404(html: string, title: string | null): boolean {
  const titleLower = (title || "").toLowerCase();
  const bodyLower = html.toLowerCase();

  const strongSignals = [
    /<title>[^<]*(404|not found|page not found)[^<]*<\/title>/i,
    /<h1[^>]*>[^<]*(404|page not found|not found)[^<]*<\/h1>/i,
  ];

  let score = 0;

  for (const pattern of strongSignals) {
    if (pattern.test(html)) score += 3;
  }

  if (titleLower.includes("404") && titleLower.includes("not found")) score += 2;
  if (titleLower === "404" || titleLower === "page not found") score += 2;

  const bodyPatterns = [
    /the page you.{0,30}was not found/i,
    /this page.{0,30}does not exist/i,
    /the requested url.{0,30}was not found/i,
    /error 404/i,
    /page not found/i,
  ];

  for (const pattern of bodyPatterns) {
    if (pattern.test(bodyLower)) score += 1;
  }

  return score >= 3;
}

export function generateCsv(results: {
  normalizedUrl: string;
  url: string;
  status: string;
  statusCode: number | null;
  finalUrl: string | null;
  redirectChain: { statusCode: number; location: string | null }[];
  responseTimeMs: number;
  contentType: string | null;
  occurrences: { sourcePage: string; anchorText: string }[];
}[]): string {
  const header = "Status,Status Code,URL,Final URL,Source URL,Anchor Text,Redirect Count,Content Type,Response Time (ms)";
  const rows = results.map((r) => {
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
      r.contentType ?? "",
      r.responseTimeMs,
    ].join(",");
  });
  return [header, ...rows].join("\n");
}
