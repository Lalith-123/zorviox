import type {
  CrawlOptions,
  CrawlLink,
  LinkResult,
  LinkOccurrence,
  CrawlSummary,
  CrawlResult,
  RedirectHop,
  LinkStatus,
} from "./types";
import {
  normalizeUrl,
  resolveUrl,
  classifyLink,
  isSameDomain,
  extractLinksFromHtml,
  isLikelySoft404,
  isPrivateIp,
} from "./urls";

const USER_AGENT = "Zorviox Broken Link Scanner";
const REQUEST_TIMEOUT = 15000;
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;
const MAX_REDIRECTS = 10;
const MAX_RETRIES = 2;

interface FetchResult {
  ok: boolean;
  statusCode: number;
  contentType: string | null;
  contentLength: number | null;
  body: string | null;
  finalUrl: string;
  redirectChain: RedirectHop[];
  responseTimeMs: number;
  error: string | null;
}

interface QueuedUrl {
  url: string;
  normalizedUrl: string;
  depth: number;
  sourcePage: string;
  anchorText: string;
  linkType: CrawlLink["linkType"];
}

async function fetchUrl(
  url: string,
  method: "GET" | "HEAD" = "GET"
): Promise<FetchResult> {
  const startTime = Date.now();
  const redirectChain: RedirectHop[] = [];
  let currentUrl = url;
  let redirectCount = 0;

  try {
    const u = new URL(currentUrl);
    if (isPrivateIp(u.hostname)) {
      return {
        ok: false,
        statusCode: 0,
        contentType: null,
        contentLength: null,
        body: null,
        finalUrl: currentUrl,
        redirectChain: [],
        responseTimeMs: Date.now() - startTime,
        error: "Private/internal address blocked",
      };
    }
  } catch {
    return {
      ok: false,
      statusCode: 0,
      contentType: null,
      contentLength: null,
      body: null,
      finalUrl: currentUrl,
      redirectChain: [],
      responseTimeMs: Date.now() - startTime,
      error: "Invalid URL",
    };
  }

  while (redirectCount < MAX_REDIRECTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(currentUrl, {
        method,
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "manual",
      });

      clearTimeout(timeout);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          return {
            ok: false,
            statusCode: response.status,
            contentType: response.headers.get("content-type"),
            contentLength: null,
            body: null,
            finalUrl: currentUrl,
            redirectChain,
            responseTimeMs: Date.now() - startTime,
            error: "Redirect without Location header",
          };
        }

        const resolvedLocation = resolveUrl(currentUrl, location);
        if (!resolvedLocation) {
          return {
            ok: false,
            statusCode: response.status,
            contentType: null,
            contentLength: null,
            body: null,
            finalUrl: currentUrl,
            redirectChain,
            responseTimeMs: Date.now() - startTime,
            error: "Invalid redirect location",
          };
        }

        try {
          const redirectUrl = new URL(resolvedLocation);
          if (isPrivateIp(redirectUrl.hostname)) {
            return {
              ok: false,
              statusCode: response.status,
              contentType: null,
              contentLength: null,
              body: null,
              finalUrl: resolvedLocation,
              redirectChain,
              responseTimeMs: Date.now() - startTime,
              error: "Redirect to private address blocked",
            };
          }
        } catch {
          return {
            ok: false,
            statusCode: response.status,
            contentType: null,
            contentLength: null,
            body: null,
            finalUrl: resolvedLocation,
            redirectChain,
            responseTimeMs: Date.now() - startTime,
            error: "Invalid redirect URL",
          };
        }

        redirectChain.push({
          url: currentUrl,
          statusCode: response.status,
          location: resolvedLocation,
        });

        if (redirectChain.some((h) => h.location === resolvedLocation)) {
          return {
            ok: false,
            statusCode: response.status,
            contentType: null,
            contentLength: null,
            body: null,
            finalUrl: resolvedLocation,
            redirectChain,
            responseTimeMs: Date.now() - startTime,
            error: "Redirect loop detected",
          };
        }

        currentUrl = resolvedLocation;
        redirectCount++;
        continue;
      }

      const contentType = response.headers.get("content-type");
      const contentLengthHeader = response.headers.get("content-length");
      const contentLength = contentLengthHeader
        ? parseInt(contentLengthHeader, 10)
        : null;

      if (method === "HEAD" || response.status >= 400) {
        return {
          ok: response.ok,
          statusCode: response.status,
          contentType,
          contentLength,
          body: null,
          finalUrl: currentUrl,
          redirectChain,
          responseTimeMs: Date.now() - startTime,
          error: null,
        };
      }

      const reader = response.body?.getReader();
      if (!reader) {
        return {
          ok: response.ok,
          statusCode: response.status,
          contentType,
          contentLength,
          body: null,
          finalUrl: currentUrl,
          redirectChain,
          responseTimeMs: Date.now() - startTime,
          error: null,
        };
      }

      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalSize += value.length;
        if (totalSize > MAX_RESPONSE_SIZE) {
          reader.cancel();
          return {
            ok: true,
            statusCode: response.status,
            contentType,
            contentLength,
            body: null,
            finalUrl: currentUrl,
            redirectChain,
            responseTimeMs: Date.now() - startTime,
            error: null,
          };
        }
      }

      const decoder = new TextDecoder();
      const body = chunks.map((c) => decoder.decode(c, { stream: true })).join("");

      return {
        ok: response.ok,
        statusCode: response.status,
        contentType,
        contentLength,
        body,
        finalUrl: currentUrl,
        redirectChain,
        responseTimeMs: Date.now() - startTime,
        error: null,
      };
    } catch (err) {
      const errObj = err as NodeJS.ErrnoException;
      let errorMsg = "Request failed";

      if (errObj.name === "AbortError") {
        errorMsg = "Request timed out";
      } else if (errObj.code === "ENOTFOUND") {
        errorMsg = "DNS resolution failed";
      } else if (errObj.code === "ECONNREFUSED") {
        errorMsg = "Connection refused";
      } else if (errObj.code === "ECONNRESET") {
        errorMsg = "Connection reset";
      } else if (errObj.message?.includes("certificate")) {
        errorMsg = "TLS/SSL certificate error";
      } else {
        errorMsg = errObj.message || "Request failed";
      }

      return {
        ok: false,
        statusCode: 0,
        contentType: null,
        contentLength: null,
        body: null,
        finalUrl: currentUrl,
        redirectChain,
        responseTimeMs: Date.now() - startTime,
        error: errorMsg,
      };
    }
  }

  return {
    ok: false,
    statusCode: 0,
    contentType: null,
    contentLength: null,
    body: null,
    finalUrl: currentUrl,
    redirectChain,
    responseTimeMs: Date.now() - startTime,
    error: "Redirect limit exceeded",
  };
}

function classifyStatus(
  statusCode: number,
  error: string | null,
  contentType: string | null,
  body: string | null,
  title: string | null,
  redirectChain: RedirectHop[]
): { status: LinkStatus; detail: string } {
  if (error === "Redirect loop detected") {
    return { status: "broken", detail: "Redirect loop detected" };
  }
  if (error === "Redirect limit exceeded") {
    return { status: "broken", detail: "Redirect limit exceeded" };
  }
  if (error === "Request timed out") {
    return { status: "timeout", detail: "Request timed out" };
  }
  if (error?.includes("DNS")) {
    return { status: "dns-error", detail: error };
  }
  if (error?.includes("TLS") || error?.includes("certificate")) {
    return { status: "tls-error", detail: error };
  }
  if (error?.includes("private")) {
    return { status: "broken", detail: error };
  }

  if (statusCode >= 200 && statusCode < 300) {
    if (body && isLikelySoft404(body, title)) {
      return { status: "soft-404", detail: "Possible soft 404 detected" };
    }
    return { status: "healthy", detail: "" };
  }

  if (statusCode >= 300 && statusCode < 400) {
    return {
      status: redirectChain.length > 1 ? "redirected" : "redirected",
      detail: redirectChain.length > 1
        ? `${redirectChain.length} redirect hops`
        : "Redirect",
    };
  }

  if (statusCode === 401) {
    return { status: "blocked", detail: "Authentication required" };
  }
  if (statusCode === 403) {
    return { status: "blocked", detail: "Access forbidden" };
  }
  if (statusCode === 404) {
    return { status: "broken", detail: "Not found" };
  }
  if (statusCode === 410) {
    return { status: "broken", detail: "Resource permanently removed" };
  }
  if (statusCode === 429) {
    return { status: "rate-limited", detail: "Rate limited" };
  }
  if (statusCode >= 400 && statusCode < 500) {
    return { status: "broken", detail: `Client error ${statusCode}` };
  }
  if (statusCode >= 500) {
    return { status: "server-error", detail: `Server error ${statusCode}` };
  }

  if (error) {
    return { status: "timeout", detail: error };
  }

  return { status: "healthy", detail: "" };
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

export async function crawlWebsite(
  options: CrawlOptions,
  onProgress?: (progress: {
    pagesScanned: number;
    linksChecked: number;
    currentUrl: string | null;
  }) => void,
  shouldStop?: () => boolean
): Promise<CrawlResult> {
  const {
    startUrl,
    maxPages,
    maxDepth,
    checkExternal,
    concurrency,
  } = options;

  const startTime = new Date();
  const visitedPages = new Set<string>();
  const checkedUrls = new Map<string, LinkResult>();
  const allLinks = new Map<string, LinkResult>();
  const queue: QueuedUrl[] = [];
  const startDomain = new URL(startUrl).hostname.replace(/^www\./, "");

  let pagesScanned = 0;
  let linksDiscovered = 0;

  const startNormalized = normalizeUrl(startUrl);
  queue.push({
    url: startUrl,
    normalizedUrl: startNormalized,
    depth: 0,
    sourcePage: "",
    anchorText: "",
    linkType: "internal",
  });

  const processQueue = async () => {
    while (queue.length > 0 && pagesScanned < maxPages) {
      if (shouldStop?.()) break;

      const batch: QueuedUrl[] = [];
      while (batch.length < concurrency && queue.length > 0) {
        const item = queue.shift()!;
        const norm = normalizeUrl(item.url);
        if (!visitedPages.has(norm)) {
          batch.push(item);
        }
      }

      if (batch.length === 0) break;

      await Promise.all(
        batch.map(async (item) => {
          const norm = normalizeUrl(item.url);

          if (checkedUrls.has(norm)) {
            const existing = checkedUrls.get(norm)!;
            existing.occurrences.push({
              sourcePage: item.sourcePage,
              anchorText: item.anchorText,
              linkType: item.linkType,
              rel: [],
              depth: item.depth,
            });
            return null;
          }

          onProgress?.({
            pagesScanned,
            linksChecked: allLinks.size,
            currentUrl: item.url,
          });

          let fetchResult = await fetchUrl(item.url, "GET");

          if (!fetchResult.ok && fetchResult.error === "Request timed out" && MAX_RETRIES > 0) {
            for (let retry = 0; retry < MAX_RETRIES; retry++) {
              await new Promise((r) => setTimeout(r, 1000 * (retry + 1)));
              fetchResult = await fetchResult as FetchResult;
              fetchResult = await fetchUrl(item.url, "GET");
              if (fetchResult.ok || fetchResult.error !== "Request timed out") break;
            }
          }

          const title = fetchResult.body ? extractTitle(fetchResult.body) : null;
          const { status } = classifyStatus(
            fetchResult.statusCode,
            fetchResult.error,
            fetchResult.contentType,
            fetchResult.body,
            title,
            fetchResult.redirectChain
          );

          const finalNormalized = normalizeUrl(fetchResult.finalUrl);

          const occurrence: LinkOccurrence = {
            sourcePage: item.sourcePage,
            anchorText: item.anchorText,
            linkType: item.linkType,
            rel: [],
            depth: item.depth,
          };

          const linkResult: LinkResult = {
            normalizedUrl: finalNormalized,
            url: item.url,
            status,
            statusCode: fetchResult.statusCode || null,
            finalUrl: fetchResult.finalUrl !== item.url ? fetchResult.finalUrl : null,
            contentType: fetchResult.contentType,
            redirectChain: fetchResult.redirectChain,
            responseTimeMs: fetchResult.responseTimeMs,
            occurrences: [occurrence],
            contentLength: fetchResult.contentLength,
            recoveredAfterRetry: false,
            errorMessage: fetchResult.error,
          };

          checkedUrls.set(norm, linkResult);
          allLinks.set(norm, linkResult);

          pagesScanned++;
          onProgress?.({
            pagesScanned,
            linksChecked: allLinks.size,
            currentUrl: item.url,
          });

          if (
            fetchResult.ok &&
            fetchResult.contentType?.includes("text/html") &&
            fetchResult.body &&
            item.depth < maxDepth
          ) {
            const links = extractLinksFromHtml(fetchResult.body);

            for (const link of links) {
              linksDiscovered++;

              const resolved = resolveUrl(fetchResult.finalUrl, link.href);
              if (!resolved) continue;

              const linkNorm = normalizeUrl(resolved);
              const linkClass = classifyLink(resolved, fetchResult.finalUrl);
              const linkDomain = (() => {
                try { return new URL(resolved).hostname.replace(/^www\./, ""); } catch { return ""; }
              })();

              const isInternal = linkDomain === startDomain || isSameDomain(resolved, startUrl);

              if (linkClass === "email" || linkClass === "telephone" || linkClass === "javascript" || linkClass === "fragment") {
                const existing = allLinks.get(linkNorm);
                if (existing) {
                  existing.occurrences.push({
                    sourcePage: fetchResult.finalUrl,
                    anchorText: link.text,
                    linkType: linkClass,
                    rel: link.rel,
                    depth: item.depth + 1,
                  });
                } else {
                  allLinks.set(linkNorm, {
                    normalizedUrl: linkNorm,
                    url: resolved,
                    status: linkClass === "email" ? "email" : linkClass === "telephone" ? "telephone" : "healthy",
                    statusCode: null,
                    finalUrl: null,
                    contentType: null,
                    redirectChain: [],
                    responseTimeMs: 0,
                    occurrences: [{
                      sourcePage: fetchResult.finalUrl,
                      anchorText: link.text,
                      linkType: linkClass,
                      rel: link.rel,
                      depth: item.depth + 1,
                    }],
                    contentLength: null,
                    recoveredAfterRetry: false,
                    errorMessage: null,
                  });
                }
                continue;
              }

              if (!checkedUrls.has(linkNorm) && !visitedPages.has(linkNorm)) {
                if (isInternal || checkExternal) {
                  queue.push({
                    url: resolved,
                    normalizedUrl: linkNorm,
                    depth: item.depth + 1,
                    sourcePage: fetchResult.finalUrl,
                    anchorText: link.text,
                    linkType: linkClass,
                  });
                } else {
                  allLinks.set(linkNorm, {
                    normalizedUrl: linkNorm,
                    url: resolved,
                    status: "healthy",
                    statusCode: null,
                    finalUrl: null,
                    contentType: null,
                    redirectChain: [],
                    responseTimeMs: 0,
                    occurrences: [{
                      sourcePage: fetchResult.finalUrl,
                      anchorText: link.text,
                      linkType: "external",
                      rel: link.rel,
                      depth: item.depth + 1,
                    }],
                    contentLength: null,
                    recoveredAfterRetry: false,
                    errorMessage: null,
                  });
                }
              } else if (checkedUrls.has(linkNorm)) {
                const existing = checkedUrls.get(linkNorm)!;
                existing.occurrences.push({
                  sourcePage: fetchResult.finalUrl,
                  anchorText: link.text,
                  linkType: isInternal ? "internal" : "external",
                  rel: link.rel,
                  depth: item.depth + 1,
                });
              }
            }
          }

          return { item, fetchResult };
        })
      );

      for (const item of batch) {
        visitedPages.add(normalizeUrl(item.url));
      }
    }
  };

  await processQueue();

  const links: LinkResult[] = Array.from(allLinks.values())
    .filter((l) => l.occurrences.length > 0);

  const summary: CrawlSummary = {
    pagesScanned,
    linksDiscovered,
    urlsChecked: links.length,
    healthy: links.filter((l) => l.status === "healthy").length,
    redirected: links.filter((l) => l.status === "redirected").length,
    broken: links.filter((l) => l.status === "broken").length,
    serverErrors: links.filter((l) => l.status === "server-error").length,
    blocked: links.filter((l) => l.status === "blocked").length,
    timeouts: links.filter((l) => l.status === "timeout").length,
    tlsErrors: links.filter((l) => l.status === "tls-error").length,
    dnsErrors: links.filter((l) => l.status === "dns-error").length,
    possibleSoft404: links.filter((l) => l.status === "soft-404").length,
    invalidUrls: links.filter((l) => l.status === "invalid-url").length,
    fragmentIssues: links.filter((l) => l.status === "fragment-issue").length,
    emails: links.filter((l) => l.status === "email").length,
    telephones: links.filter((l) => l.status === "telephone").length,
    resources: links.filter((l) => l.occurrences.some((o) => o.linkType === "resource")).length,
  };

  return {
    status: shouldStop?.() ? "stopped" : "completed",
    startUrl,
    pagesScanned,
    linksDiscovered,
    urlsChecked: links.length,
    summary,
    links,
    pages: [],
    startedAt: startTime.toISOString(),
    completedAt: new Date().toISOString(),
  };
}
