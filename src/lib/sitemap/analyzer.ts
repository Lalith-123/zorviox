import { LIMITS, CHANGEFREQ_VALID } from "./limits";
import { isPrivateHost, validateUrl } from "./security";
import { parseSitemap } from "./parser";
import type {
  SitemapAnalysis,
  SitemapUrl,
  SitemapChild,
  SitemapIssue,
  RobotsTxtInfo,
} from "./types";

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return `${u.origin}${path}${u.search}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function isValidSitemapDate(d: string): boolean {
  if (!d) return false;
  const date = new Date(d);
  return !isNaN(date.getTime());
}

function isFutureDate(d: string): boolean {
  const date = new Date(d);
  return date.getTime() > Date.now();
}

async function fetchWithTimeout(
  url: string,
  timeout: number
): Promise<{ response: Response; time: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ZorvioxSitemapAnalyzer/1.0",
        Accept: "application/xml, text/xml, */*",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    return { response, time: Date.now() - start };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function followRedirects(
  urlStr: string,
  maxRedirects: number,
  timeout: number
): Promise<{
  response: Response;
  finalUrl: string;
  redirectCount: number;
  time: number;
}> {
  let currentUrl = urlStr;
  let redirectCount = 0;

  for (let i = 0; i <= maxRedirects; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const start = Date.now();

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "ZorvioxSitemapAnalyzer/1.0",
          Accept: "application/xml, text/xml, */*",
        },
        redirect: "manual",
      });
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) {
        return { response: res, finalUrl: currentUrl, redirectCount, time: Date.now() - start };
      }
      let nextUrl: string;
      try {
        nextUrl = new URL(location, currentUrl).href;
      } catch {
        return { response: res, finalUrl: currentUrl, redirectCount, time: Date.now() - start };
      }
      const parsed = validateUrl(nextUrl);
      if (!parsed || isPrivateHost(parsed.hostname)) {
        return { response: res, finalUrl: currentUrl, redirectCount, time: Date.now() - start };
      }
      redirectCount++;
      currentUrl = nextUrl;
      continue;
    }

    return { response: res, finalUrl: currentUrl, redirectCount, time: Date.now() - start };
  }

  throw new Error("Too many redirects");
}

async function fetchRobotsTxt(
  siteUrl: URL,
  timeout: number
): Promise<RobotsTxtInfo> {
  const robotsUrl = `${siteUrl.origin}/robots.txt`;
  try {
    const { response } = await fetchWithTimeout(robotsUrl, timeout);
    if (!response.ok) {
      return {
        sitemaps: [],
        raw: "",
        fetched: false,
        error: `HTTP ${response.status}`,
      };
    }
    const text = await response.text();
    const sitemaps: string[] = [];
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith("sitemap:")) {
        const sitemapUrl = trimmed.slice(8).trim();
        if (sitemapUrl) sitemaps.push(sitemapUrl);
      }
    }
    return { sitemaps, raw: text.slice(0, 2000), fetched: true, error: null };
  } catch {
    return {
      sitemaps: [],
      raw: "",
      fetched: false,
      error: "Could not fetch robots.txt",
    };
  }
}

async function analyzeUrlSitemap(
  xml: string,
  inputUrl: URL,
  stats: SitemapAnalysis["stats"],
  issues: SitemapIssue[]
): Promise<{ urls: SitemapUrl[]; childSitemaps: SitemapChild[] }> {
  const parsed = parseSitemap(xml);

  if (parsed.type === "error") {
    issues.push({ severity: "critical", message: parsed.error });
    return { urls: [], childSitemaps: [] };
  }

  if (parsed.type !== "urlset") {
    issues.push({
      severity: "critical",
      message: `Unexpected type: ${parsed.type}`,
    });
    return { urls: [], childSitemaps: [] };
  }

  const urls = parsed.urls;
  const duplicateMap = new Map<string, number>();
  const normalizedSeen = new Set<string>();
  const domain = inputUrl.hostname;
  const scheme = inputUrl.protocol.replace(":", "");

  for (const u of urls) {
    if (!u.loc || u.loc.trim() === "") {
      stats.emptyLocCount++;
      issues.push({
        severity: "error",
        message: "URL entry missing <loc> or with empty location",
      });
      continue;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(u.loc);
    } catch {
      stats.invalidUrls++;
      issues.push({
        severity: "error",
        message: `Invalid URL: ${u.loc}`,
        url: u.loc,
      });
      continue;
    }

    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      stats.invalidUrls++;
      issues.push({
        severity: "error",
        message: `Unsupported protocol: ${urlObj.protocol} in ${u.loc}`,
        url: u.loc,
      });
      continue;
    }

    if (urlObj.hash) stats.urlsWithFragments++;
    if (urlObj.search) stats.urlsWithQueryParams++;

    if (urlObj.protocol === "http:" && scheme === "https") {
      stats.httpUrls++;
    }

    const urlHost = urlObj.hostname.replace(/^www\./, "");
    const baseHost = domain.replace(/^www\./, "");
    if (urlHost !== baseHost && !urlHost.endsWith(`.${baseHost}`) && !baseHost.endsWith(`.${urlHost}`)) {
      stats.domainMismatch++;
    }

    const normalized = normalizeUrl(u.loc);
    if (normalizedSeen.has(normalized)) {
      stats.duplicateUrls++;
    } else {
      normalizedSeen.add(normalized);
    }

    duplicateMap.set(u.loc, (duplicateMap.get(u.loc) || 0) + 1);

    if (u.lastmod) {
      stats.urlsWithLastmod++;
      if (!isValidSitemapDate(u.lastmod)) {
        stats.invalidLastmod++;
        issues.push({
          severity: "warning",
          message: `Invalid lastmod value: ${u.lastmod}`,
          url: u.loc,
        });
      } else if (isFutureDate(u.lastmod)) {
        stats.futureLastmod++;
        issues.push({
          severity: "info",
          message: `Future lastmod: ${u.lastmod}`,
          url: u.loc,
        });
      }
    } else {
      stats.urlsWithoutLastmod++;
    }

    if (u.priority) {
      stats.urlsWithPriority++;
      const p = parseFloat(u.priority);
      if (isNaN(p) || p < 0 || p > 1) {
        stats.invalidPriority++;
        issues.push({
          severity: "warning",
          message: `Invalid priority: ${u.priority}`,
          url: u.loc,
        });
      }
    } else {
      stats.urlsWithoutPriority++;
    }

    if (u.changefreq) {
      stats.urlsWithChangefreq++;
      if (!CHANGEFREQ_VALID.includes(u.changefreq as (typeof CHANGEFREQ_VALID)[number])) {
        stats.invalidChangefreq++;
        issues.push({
          severity: "warning",
          message: `Invalid changefreq: ${u.changefreq}`,
          url: u.loc,
        });
      }
    } else {
      stats.urlsWithoutChangefreq++;
    }
  }

  const identicalTimestamps = new Map<string, number>();
  for (const u of urls) {
    if (u.lastmod) {
      identicalTimestamps.set(
        u.lastmod,
        (identicalTimestamps.get(u.lastmod) || 0) + 1
      );
    }
  }
  for (const [ts, count] of identicalTimestamps) {
    if (count > 10 && count === urls.length) {
      stats.identicalLastmod = count;
      issues.push({
        severity: "warning",
        message: `All ${count} URLs share the same lastmod timestamp: ${ts}`,
      });
    }
  }

  if (urls.length > LIMITS.maxUrls) {
    issues.push({
      severity: "error",
      message: `Sitemap contains ${urls.length} URLs (limit: ${LIMITS.maxUrls})`,
    });
  }

  return { urls, childSitemaps: [] };
}

async function analyzeSitemapIndex(
  xml: string,
  inputUrl: URL,
  stats: SitemapAnalysis["stats"],
  issues: SitemapIssue[],
  depth: number,
  visited: Set<string>
): Promise<{ urls: SitemapUrl[]; childSitemaps: SitemapChild[] }> {
  const parsed = parseSitemap(xml);

  if (parsed.type === "error") {
    issues.push({ severity: "critical", message: parsed.error });
    return { urls: [], childSitemaps: [] };
  }

  if (parsed.type !== "sitemapindex") {
    issues.push({
      severity: "critical",
      message: `Unexpected type: ${parsed.type}`,
    });
    return { urls: [], childSitemaps: [] };
  }

  if (parsed.sitemaps.length === 0) {
    issues.push({
      severity: "warning",
      message: "Sitemap index contains no child sitemaps",
    });
    return { urls: [], childSitemaps: [] };
  }

  if (parsed.sitemaps.length > LIMITS.maxChildSitemaps) {
    issues.push({
      severity: "error",
      message: `Sitemap index contains ${parsed.sitemaps.length} child sitemaps (limit: ${LIMITS.maxChildSitemaps})`,
    });
    return { urls: [], childSitemaps: [] };
  }

  if (depth >= LIMITS.maxRecursionDepth) {
    issues.push({
      severity: "error",
      message: `Maximum recursion depth (${LIMITS.maxRecursionDepth}) reached`,
    });
    return { urls: [], childSitemaps: [] };
  }

  const allUrls: SitemapUrl[] = [];
  const childSitemaps: SitemapChild[] = [];

  const batches: { loc: string; lastmod: string | null }[][] = [];
  for (let i = 0; i < parsed.sitemaps.length; i += LIMITS.maxConcurrentFetches) {
    batches.push(parsed.sitemaps.slice(i, i + LIMITS.maxConcurrentFetches));
  }

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map(async (child) => {
        const childUrl = child.loc;
        if (!childUrl) {
          return {
            loc: "(empty)",
            lastmod: null,
            urlCount: null,
            status: null,
            error: "Empty <loc> in sitemap index",
            urls: [],
            children: [],
            type: "error" as const,
          };
        }

        let parsedChild: URL;
        try {
          parsedChild = new URL(childUrl);
        } catch {
          return {
            loc: childUrl,
            lastmod: child.lastmod,
            urlCount: null,
            status: null,
            error: `Invalid URL: ${childUrl}`,
            urls: [],
            children: [],
            type: "error" as const,
          };
        }

        if (isPrivateHost(parsedChild.hostname)) {
          return {
            loc: childUrl,
            lastmod: child.lastmod,
            urlCount: null,
            status: null,
            error: "Private/local URL blocked",
            urls: [],
            children: [],
            type: "error" as const,
          };
        }

        if (visited.has(normalizeUrl(childUrl))) {
          return {
            loc: childUrl,
            lastmod: child.lastmod,
            urlCount: null,
            status: null,
            error: "Circular reference detected",
            urls: [],
            children: [],
            type: "error" as const,
          };
        }
        visited.add(normalizeUrl(childUrl));

        try {
          const { response, finalUrl } = await followRedirects(
            childUrl,
            LIMITS.maxRedirects,
            LIMITS.timeout
          );

          if (!response.ok) {
            return {
              loc: childUrl,
              lastmod: child.lastmod,
              urlCount: null,
              status: response.status,
              error: `HTTP ${response.status}`,
              urls: [],
              children: [],
              type: "error" as const,
            };
          }

          const contentType = response.headers.get("content-type") || "";
          const arrayBuf = await response.arrayBuffer();
          if (arrayBuf.byteLength > LIMITS.maxResponseBytes) {
            return {
              loc: childUrl,
              lastmod: child.lastmod,
              urlCount: null,
              status: response.status,
              error: "Response too large",
              urls: [],
              children: [],
              type: "error" as const,
            };
          }

          let xmlContent: string;
          if (contentType.includes("gzip") || childUrl.endsWith(".gz")) {
            try {
              const ds = new DecompressionStream("gzip");
              const writer = ds.writable.getWriter();
              writer.write(new Uint8Array(arrayBuf));
              writer.close();
              const reader = ds.readable.getReader();
              const chunks: Uint8Array[] = [];
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
              }
              const totalLen = chunks.reduce((a, c) => a + c.length, 0);
              if (totalLen > LIMITS.maxDecompressedBytes) {
                return {
                  loc: childUrl,
                  lastmod: child.lastmod,
                  urlCount: null,
                  status: response.status,
                  error: "Decompressed content too large",
                  urls: [],
                  children: [],
                  type: "error" as const,
                };
              }
              const combined = new Uint8Array(totalLen);
              let offset = 0;
              for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }
              xmlContent = new TextDecoder().decode(combined);
            } catch {
              return {
                loc: childUrl,
                lastmod: child.lastmod,
                urlCount: null,
                status: response.status,
                error: "Failed to decompress gzipped sitemap",
                urls: [],
                children: [],
                type: "error" as const,
              };
            }
          } else {
            xmlContent = new TextDecoder().decode(arrayBuf);
          }

          const childResult = parseSitemap(xmlContent);

          if (childResult.type === "error") {
            return {
              loc: finalUrl,
              lastmod: child.lastmod,
              urlCount: null,
              status: response.status,
              error: childResult.error,
              urls: [],
              children: [],
              type: "error" as const,
            };
          }

          if (childResult.type === "urlset") {
            const childUrls: SitemapUrl[] = [];
            for (const u of childResult.urls) {
              if (!u.loc || u.loc.trim() === "") {
                stats.emptyLocCount++;
                continue;
              }
              let urlObj: URL;
              try {
                urlObj = new URL(u.loc);
              } catch {
                stats.invalidUrls++;
                continue;
              }
              if (urlObj.hash) stats.urlsWithFragments++;
              if (urlObj.search) stats.urlsWithQueryParams++;
              if (urlObj.protocol === "http:" && inputUrl.protocol === "https:") {
                stats.httpUrls++;
              }
              const normalized = normalizeUrl(u.loc);
              const normalizedSeen = new Set<string>();
              if (normalizedSeen.has(normalized)) {
                stats.duplicateUrls++;
              } else {
                normalizedSeen.add(normalized);
              }
              if (u.lastmod) {
                stats.urlsWithLastmod++;
                if (!isValidSitemapDate(u.lastmod)) stats.invalidLastmod++;
                else if (isFutureDate(u.lastmod)) stats.futureLastmod++;
              } else {
                stats.urlsWithoutLastmod++;
              }
              if (u.priority) {
                stats.urlsWithPriority++;
                const p = parseFloat(u.priority);
                if (isNaN(p) || p < 0 || p > 1) stats.invalidPriority++;
              } else {
                stats.urlsWithoutPriority++;
              }
              if (u.changefreq) {
                stats.urlsWithChangefreq++;
                if (!CHANGEFREQ_VALID.includes(u.changefreq as (typeof CHANGEFREQ_VALID)[number])) {
                  stats.invalidChangefreq++;
                }
              } else {
                stats.urlsWithoutChangefreq++;
              }
              childUrls.push(u);
            }
            return {
              loc: finalUrl,
              lastmod: child.lastmod,
              urlCount: childUrls.length,
              status: response.status,
              error: null,
              urls: childUrls,
              children: [],
              type: "urlset" as const,
            };
          }

          // childResult.type === "sitemapindex"
          const grandchildResult = await analyzeSitemapIndex(
            xmlContent,
            new URL(finalUrl),
            stats,
            issues,
            depth + 1,
            visited
          );
          return {
            loc: finalUrl,
            lastmod: child.lastmod,
            urlCount: grandchildResult.urls.length,
            status: response.status,
            error: null,
            urls: grandchildResult.urls,
            children: grandchildResult.childSitemaps,
            type: "sitemapindex" as const,
          };
        } catch (err) {
          return {
            loc: childUrl,
            lastmod: child.lastmod,
            urlCount: null,
            status: null,
            error: err instanceof Error ? err.message : "Unknown error",
            urls: [],
            children: [],
            type: "error" as const,
          };
        }
      })
    );

    childSitemaps.push(...results);
    for (const r of results) {
      allUrls.push(...r.urls);
    }
  }

  return { urls: allUrls, childSitemaps };
}

function computeScore(
  stats: SitemapAnalysis["stats"],
  issues: SitemapIssue[]
): SitemapAnalysis["score"] {
  const checks = [
    {
      label: "Valid XML structure",
      passed: !issues.some((i) => i.severity === "critical"),
    },
    {
      label: "URLs present",
      passed: stats.urlsWithLastmod + stats.urlsWithoutLastmod > 0,
    },
    {
      label: "No duplicate URLs",
      passed: stats.duplicateUrls === 0,
    },
    {
      label: "No invalid URLs",
      passed: stats.invalidUrls === 0,
    },
    {
      label: "No empty loc entries",
      passed: stats.emptyLocCount === 0,
    },
    {
      label: "No invalid lastmod values",
      passed: stats.invalidLastmod === 0,
    },
    {
      label: "No invalid priority values",
      passed: stats.invalidPriority === 0,
    },
    {
      label: "No invalid changefreq values",
      passed: stats.invalidChangefreq === 0,
    },
    {
      label: "HTTP URLs in HTTPS sitemap",
      passed: stats.httpUrls === 0,
    },
    {
      label: "Domain consistency",
      passed: stats.domainMismatch === 0,
    },
  ];
  const passed = checks.filter((c) => c.passed).length;
  return { total: checks.length, passed, checks };
}

export async function analyzeSitemap(urlStr: string): Promise<SitemapAnalysis> {
  const issues: SitemapIssue[] = [];

  const stats: SitemapAnalysis["stats"] = {
    urlsWithLastmod: 0,
    urlsWithoutLastmod: 0,
    urlsWithPriority: 0,
    urlsWithoutPriority: 0,
    urlsWithChangefreq: 0,
    urlsWithoutChangefreq: 0,
    duplicateUrls: 0,
    invalidUrls: 0,
    urlsWithFragments: 0,
    urlsWithQueryParams: 0,
    httpUrls: 0,
    domainMismatch: 0,
    invalidLastmod: 0,
    futureLastmod: 0,
    identicalLastmod: 0,
    invalidPriority: 0,
    invalidChangefreq: 0,
    maxChangefreqCount: 0,
    emptyLocCount: 0,
  };

  let inputUrl: URL;
  try {
    inputUrl = new URL(urlStr);
  } catch {
    return buildErrorResult(urlStr, "Invalid URL format", stats, issues);
  }

  if (!["http:", "https:"].includes(inputUrl.protocol)) {
    return buildErrorResult(urlStr, "Only HTTP and HTTPS URLs are supported", stats, issues);
  }

  if (isPrivateHost(inputUrl.hostname)) {
    return buildErrorResult(urlStr, "This URL points to a private or local address", stats, issues);
  }

  const robotsTxt = await fetchRobotsTxt(inputUrl, LIMITS.timeout);

  let finalUrl = inputUrl.href;
  let httpStatus = 0;
  let contentType: string | null = null;
  let responseTime = 0;
  let redirectCount = 0;
  let xmlContent = "";

  try {
    const result = await followRedirects(
      inputUrl.href,
      LIMITS.maxRedirects,
      LIMITS.timeout
    );
    finalUrl = result.finalUrl;
    redirectCount = result.redirectCount;
    responseTime = result.time;
    httpStatus = result.response.status;
    contentType = result.response.headers.get("content-type");

    if (!result.response.ok) {
      issues.push({
        severity: "critical",
        message: `HTTP ${httpStatus}: ${httpStatus === 404 ? "Sitemap not found" : httpStatus === 403 ? "Access denied" : `Server returned error`}`,
      });
      return buildResult(
        urlStr,
        finalUrl,
        redirectCount,
        httpStatus,
        contentType,
        responseTime,
        "error",
        [],
        [],
        stats,
        issues,
        inputUrl,
        robotsTxt
      );
    }

    const arrayBuf = await result.response.arrayBuffer();
    if (arrayBuf.byteLength > LIMITS.maxResponseBytes) {
      issues.push({
        severity: "critical",
        message: "Response exceeds size limit",
      });
      return buildResult(
        urlStr,
        finalUrl,
        redirectCount,
        httpStatus,
        contentType,
        responseTime,
        "error",
        [],
        [],
        stats,
        issues,
        inputUrl,
        robotsTxt
      );
    }

    if (contentType?.includes("gzip") || urlStr.endsWith(".gz")) {
      try {
        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(new Uint8Array(arrayBuf));
        writer.close();
        const reader = ds.readable.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const totalLen = chunks.reduce((a, c) => a + c.length, 0);
        if (totalLen > LIMITS.maxDecompressedBytes) {
          issues.push({
            severity: "critical",
            message: "Decompressed content exceeds size limit",
          });
          return buildResult(
            urlStr,
            finalUrl,
            redirectCount,
            httpStatus,
            contentType,
            responseTime,
            "error",
            [],
            [],
            stats,
            issues,
            inputUrl,
            robotsTxt
          );
        }
        const combined = new Uint8Array(totalLen);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        xmlContent = new TextDecoder().decode(combined);
      } catch {
        issues.push({
          severity: "critical",
          message: "Failed to decompress gzipped sitemap",
        });
        return buildResult(
          urlStr,
          finalUrl,
          redirectCount,
          httpStatus,
          contentType,
          responseTime,
          "error",
          [],
          [],
          stats,
          issues,
          inputUrl,
          robotsTxt
        );
      }
    } else {
      xmlContent = new TextDecoder().decode(arrayBuf);
    }
  } catch (err) {
    const msg =
      err instanceof Error && err.name === "AbortError"
        ? "Request timed out"
        : err instanceof Error
          ? err.message
          : "Could not fetch sitemap";
    issues.push({ severity: "critical", message: msg });
    return buildResult(
      urlStr,
      inputUrl.href,
      0,
      0,
      null,
      0,
      "error",
      [],
      [],
      stats,
      issues,
      inputUrl,
      robotsTxt
    );
  }

  const parsed = parseSitemap(xmlContent);

  if (parsed.type === "error") {
    issues.push({ severity: "critical", message: parsed.error });
    return buildResult(
      urlStr,
      finalUrl,
      redirectCount,
      httpStatus,
      contentType,
      responseTime,
      "error",
      [],
      [],
      stats,
      issues,
      inputUrl,
      robotsTxt
    );
  }

  const visited = new Set<string>();
  visited.add(normalizeUrl(inputUrl.href));

  if (parsed.type === "sitemapindex") {
    const result = await analyzeSitemapIndex(
      xmlContent,
      new URL(finalUrl),
      stats,
      issues,
      0,
      visited
    );

    if (robotsTxt.sitemaps.length > 0) {
      const sitemapInRobots = robotsTxt.sitemaps.some(
        (s) => normalizeUrl(s) === normalizeUrl(inputUrl.href)
      );
      if (!sitemapInRobots) {
        issues.push({
          severity: "info",
          message:
            "This sitemap is not listed in the site's robots.txt (this is fine — not required)",
        });
      }
    }

    const score = computeScore(stats, issues);

    return {
      inputUrl: urlStr,
      finalUrl,
      redirectCount,
      httpStatus,
      contentType,
      responseTime,
      sitemapType: "sitemapindex",
      totalUrls: result.urls.length,
      totalChildSitemaps: result.childSitemaps.length,
      urls: result.urls,
      childSitemaps: result.childSitemaps,
      issues,
      stats,
      domain: inputUrl.hostname,
      scheme: inputUrl.protocol.replace(":", ""),
      robotsTxt,
      score,
      sitemapLimits: {
        maxUrls: LIMITS.maxUrls,
        maxSitemapIndexEntries: LIMITS.maxSitemapIndexEntries,
        maxFileSizeMB: LIMITS.maxResponseBytes / (1024 * 1024),
      },
    };
  }

  // urlset
  const result = await analyzeUrlSitemap(
    xmlContent,
    new URL(finalUrl),
    stats,
    issues
  );

  if (robotsTxt.sitemaps.length > 0) {
    const sitemapInRobots = robotsTxt.sitemaps.some(
      (s) => normalizeUrl(s) === normalizeUrl(inputUrl.href)
    );
    if (!sitemapInRobots) {
      issues.push({
        severity: "info",
        message:
          "This sitemap is not listed in the site's robots.txt (this is fine — not required)",
      });
    }
  }

  const score = computeScore(stats, issues);

  return {
    inputUrl: urlStr,
    finalUrl,
    redirectCount,
    httpStatus,
    contentType,
    responseTime,
    sitemapType: "urlset",
    totalUrls: result.urls.length,
    totalChildSitemaps: 0,
    urls: result.urls,
    childSitemaps: [],
    issues,
    stats,
    domain: inputUrl.hostname,
    scheme: inputUrl.protocol.replace(":", ""),
    robotsTxt,
    score,
    sitemapLimits: {
      maxUrls: LIMITS.maxUrls,
      maxSitemapIndexEntries: LIMITS.maxSitemapIndexEntries,
      maxFileSizeMB: LIMITS.maxResponseBytes / (1024 * 1024),
    },
  };
}

function buildErrorResult(
  inputUrl: string,
  message: string,
  stats: SitemapAnalysis["stats"],
  issues: SitemapIssue[]
): SitemapAnalysis {
  issues.push({ severity: "critical", message });
  return {
    inputUrl,
    finalUrl: inputUrl,
    redirectCount: 0,
    httpStatus: 0,
    contentType: null,
    responseTime: 0,
    sitemapType: "error",
    totalUrls: 0,
    totalChildSitemaps: 0,
    urls: [],
    childSitemaps: [],
    issues,
    stats,
    domain: "",
    scheme: "",
    robotsTxt: { sitemaps: [], raw: "", fetched: false, error: null },
    score: { total: 1, passed: 0, checks: [{ label: "Valid URL", passed: false }] },
    sitemapLimits: {
      maxUrls: LIMITS.maxUrls,
      maxSitemapIndexEntries: LIMITS.maxSitemapIndexEntries,
      maxFileSizeMB: LIMITS.maxResponseBytes / (1024 * 1024),
    },
  };
}

function buildResult(
  inputUrl: string,
  finalUrl: string,
  redirectCount: number,
  httpStatus: number,
  contentType: string | null,
  responseTime: number,
  sitemapType: "urlset" | "sitemapindex" | "error",
  urls: SitemapUrl[],
  childSitemaps: SitemapChild[],
  stats: SitemapAnalysis["stats"],
  issues: SitemapIssue[],
  domain: URL,
  robotsTxt: RobotsTxtInfo
): SitemapAnalysis {
  return {
    inputUrl,
    finalUrl,
    redirectCount,
    httpStatus,
    contentType,
    responseTime,
    sitemapType,
    totalUrls: urls.length,
    totalChildSitemaps: childSitemaps.length,
    urls,
    childSitemaps,
    issues,
    stats,
    domain: domain.hostname,
    scheme: domain.protocol.replace(":", ""),
    robotsTxt,
    score: computeScore(stats, issues),
    sitemapLimits: {
      maxUrls: LIMITS.maxUrls,
      maxSitemapIndexEntries: LIMITS.maxSitemapIndexEntries,
      maxFileSizeMB: LIMITS.maxResponseBytes / (1024 * 1024),
    },
  };
}
