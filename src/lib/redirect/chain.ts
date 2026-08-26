import { LIMITS, REDIRECT_STATUSES, STATUS_TEXTS } from "./limits";
import { validateRedirectDestination } from "./security";
import { normalizeUrl } from "./normalize";
import { extractHeaders } from "./headers";
import type { RedirectHop, RedirectChain } from "./types";

async function fetchHop(
  url: string
): Promise<{ response: Response; time: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIMITS.timeoutPerRequest);
  const start = Date.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: "GET",
      headers: {
        "User-Agent": LIMITS.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "manual",
    });
    clearTimeout(timer);
    return { response, time: Date.now() - start };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function readPartialBody(
  response: Response,
  maxBytes: number
): Promise<string | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    return null;
  }

  try {
    const reader = response.body?.getReader();
    if (!reader) return null;

    const decoder = new TextDecoder();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (totalBytes < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalBytes += value.length;
    }

    reader.cancel();

    if (chunks.length === 0) return null;
    return decoder.decode(new Uint8Array(chunks.flatMap((c) => [...c])));
  } catch {
    return null;
  }
}

function detectMetaRefresh(html: string): { url: string | null; delay: number | null } | null {
  const metaRefreshRegex = /<meta\s+[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi;
  const match = html.match(metaRefreshRegex);
  if (!match) return null;

  for (const tag of match) {
    const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
    if (!contentMatch) continue;

    const content = contentMatch[1];
    const parts = content.split(";");
    const delayPart = parts.find((p) => /^\s*\d+/.test(p.trim()));
    const urlPart = parts.find((p) => /url\s*=/i.test(p.trim()));

    let delay: number | null = null;
    if (delayPart) {
      const d = parseInt(delayPart.trim(), 10);
      if (!isNaN(d)) delay = d;
    }

    let url: string | null = null;
    if (urlPart) {
      const urlMatch = urlPart.match(/url\s*=\s*["']?([^"'\s;>]+)["']?/i);
      if (urlMatch) url = urlMatch[1];
    }

    if (url) return { url, delay };
  }

  return null;
}

function detectJsRedirect(html: string): string[] {
  const patterns: string[] = [];
  const jsPatterns = [
    /window\.location\s*=\s*["']([^"']+)["']/i,
    /window\.location\.href\s*=\s*["']([^"']+)["']/i,
    /window\.location\.replace\s*\(\s*["']([^"']+)["']\s*\)/i,
    /window\.location\.assign\s*\(\s*["']([^"']+)["']\s*\)/i,
    /location\.href\s*=\s*["']([^"']+)["']/i,
    /location\.replace\s*\(\s*["']([^"']+)["']\s*\)/i,
  ];

  for (const pattern of jsPatterns) {
    const matches = html.matchAll(pattern);
    for (const m of matches) {
      if (m[1]) patterns.push(m[1]);
    }
  }

  return patterns;
}

function getStatusText(code: number): string {
  return STATUS_TEXTS[code] || "Unknown";
}

export async function followRedirects(
  inputUrl: string
): Promise<RedirectChain> {
  const hops: RedirectHop[] = [];
  const visited = new Set<string>();
  let currentUrl = inputUrl;
  let totalRedirects = 0;
  let hasLoop = false;
  let loopDetectedAt: number | null = null;
  let limitExceeded = false;
  const totalTimeStart = Date.now();

  for (let i = 0; i <= LIMITS.maxRedirects; i++) {
    const normalized = normalizeUrl(currentUrl);
    if (visited.has(normalized)) {
      hasLoop = true;
      loopDetectedAt = i;
      break;
    }
    visited.add(normalized);

    let response: Response;
    let time = 0;

    try {
      const result = await fetchHop(currentUrl);
      response = result.response;
      time = result.time;
    } catch (err) {
      const errorMsg =
        err instanceof Error && err.name === "AbortError"
          ? "Request timed out"
          : err instanceof Error
            ? err.message
            : "Connection failed";

      hops.push({
        step: i + 1,
        url: currentUrl,
        statusCode: 0,
        statusText: errorMsg,
        location: null,
        resolvedLocation: null,
        responseTime: time || 0,
        headers: {},
        contentType: null,
        contentLength: null,
      });
      break;
    }

    const statusCode = response.status;
    const location = response.headers.get("location");
    const headers = extractHeaders(response);
    const contentType = response.headers.get("content-type");
    const contentLengthHeader = response.headers.get("content-length");
    const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null;

    let resolvedLocation: string | null = null;
    if (location) {
      const resolved = validateRedirectDestination(location, currentUrl);
      if (resolved) {
        resolvedLocation = resolved.href;
      }
    }

    hops.push({
      step: i + 1,
      url: currentUrl,
      statusCode,
      statusText: getStatusText(statusCode),
      location,
      resolvedLocation,
      responseTime: time,
      headers,
      contentType: contentType || null,
      contentLength: isNaN(contentLength as number) ? null : contentLength,
    });

    if (REDIRECT_STATUSES.has(statusCode) && location && resolvedLocation) {
      totalRedirects++;
      currentUrl = resolvedLocation;
      continue;
    }

    break;
  }

  if (totalRedirects >= LIMITS.maxRedirects && !hasLoop) {
    limitExceeded = true;
  }

  const totalTime = Date.now() - totalTimeStart;
  const lastHop = hops[hops.length - 1];

  return {
    hops,
    totalRedirects,
    finalUrl: lastHop?.url || inputUrl,
    finalStatusCode: lastHop?.statusCode || 0,
    finalStatusText: lastHop?.statusText || "",
    totalTime,
    hasLoop,
    loopDetectedAt,
    limitExceeded,
  };
}

export async function analyzeWithMetaRefresh(
  inputUrl: string
): Promise<{
  chain: RedirectChain;
  metaRefresh: { detected: boolean; url: string | null; delay: number | null } | null;
  jsRedirect: { detected: boolean; patterns: string[] } | null;
}> {
  const chain = await followRedirects(inputUrl);
  let metaRefresh = null;
  let jsRedirect = null;

  if (
    chain.finalStatusCode === 200 &&
    chain.hops.length > 0
  ) {
    const lastHop = chain.hops[chain.hops.length - 1];
    const contentType = lastHop.contentType || "";

    if (contentType.includes("text/html")) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(
          () => controller.abort(),
          LIMITS.timeoutPerRequest
        );

        const response = await fetch(lastHop.url, {
          signal: controller.signal,
          headers: {
            "User-Agent": LIMITS.userAgent,
            Accept: "text/html,application/xhtml+xml,*/*",
          },
        });
        clearTimeout(timer);

        if (response.ok) {
          const html = await readPartialBody(response, LIMITS.maxHtmlScanBytes);
          if (html) {
            const mr = detectMetaRefresh(html);
            if (mr) {
              metaRefresh = { detected: true, url: mr.url, delay: mr.delay };
            }

            const js = detectJsRedirect(html);
            if (js.length > 0) {
              jsRedirect = { detected: true, patterns: js };
            }
          }
        }
      } catch {
        // Skip meta refresh detection on error
      }
    }
  }

  return { chain, metaRefresh, jsRedirect };
}
