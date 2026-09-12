import https from "https";
import http from "http";
import { URL } from "url";
import dns from "dns";
import { promisify } from "util";
import { isRedirectSafe } from "./ssrf";

const dnsLookupAsync = promisify(dns.lookup);

const USER_AGENT = "Zorviox-HTTP-Header-Analyzer/1.0";
const CONNECTION_TIMEOUT = 10000;
const MAX_BODY_SIZE = 64 * 1024;
const MAX_REDIRECTS = 20;

function isPrivateIp(ip: string): boolean {
  const normalized = ip.trim().toLowerCase();
  if (normalized === "0.0.0.0" || normalized === "::" || normalized === "::0") return true;
  const patterns: RegExp[] = [
    /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./, /^169\.254\./, /^0\./,
    /^::1$/, /^fc00:/i, /^fd[0-9a-f]{2}:/i, /^fe80:/i,
  ];
  return patterns.some((p) => p.test(normalized));
}

function getStatusText(code: number): string {
  const map: Record<number, string> = {
    200: "OK", 201: "Created", 204: "No Content",
    301: "Moved Permanently", 302: "Found", 303: "See Other",
    304: "Not Modified", 307: "Temporary Redirect", 308: "Permanent Redirect",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
    404: "Not Found", 405: "Method Not Allowed", 408: "Request Timeout",
    410: "Gone", 429: "Too Many Requests",
    500: "Internal Server Error", 501: "Not Implemented", 502: "Bad Gateway",
    503: "Service Unavailable", 504: "Gateway Timeout",
  };
  return map[code] || "Unknown";
}

export interface FetchResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  httpVersion: string | null;
  headers: Record<string, string>;
  redirectChain: { url: string; statusCode: number; statusText: string; location: string | null; headers: Record<string, string> }[];
  responseTimeMs: number;
  contentType: string | null;
  contentLength: number | null;
  server: string | null;
  date: string | null;
  error: { code: string; message: string } | null;
}

function normalizeHeaders(raw: Record<string, string | string[] | undefined>): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    const lowerKey = key.toLowerCase();
    if (lowerKey === "set-cookie") {
      // Node.js returns Set-Cookie as an array - preserve all values
      // Use a unique delimiter that won't appear in cookie values
      if (Array.isArray(value)) {
        headers[lowerKey] = value.join("\x00");
      } else {
        headers[lowerKey] = value;
      }
    } else if (Array.isArray(value)) {
      headers[lowerKey] = value.join(", ");
    } else {
      headers[lowerKey] = value;
    }
  }
  return headers;
}

function makeRequest(
  targetUrl: string,
  method: string
): Promise<{
  statusCode: number;
  statusText: string;
  httpVersion: string | null;
  headers: Record<string, string>;
  body: Buffer;
}> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const req = client.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers: { "User-Agent": USER_AGENT, Host: parsedUrl.hostname },
        timeout: CONNECTION_TIMEOUT,
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let totalSize = 0;

        res.on("data", (chunk: Buffer) => {
          totalSize += chunk.length;
          if (totalSize <= MAX_BODY_SIZE) {
            chunks.push(chunk);
          }
        });

        res.on("end", () => {
          const httpVersion = res.httpVersion ? `HTTP/${res.httpVersion}` : null;
          resolve({
            statusCode: res.statusCode || 0,
            statusText: getStatusText(res.statusCode || 0),
            httpVersion,
            headers: normalizeHeaders(res.headers),
            body: Buffer.concat(chunks),
          });
        });

        res.on("error", reject);
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.on("error", reject);
    req.end();
  });
}

async function fetchUrl(
  targetUrl: string,
  method: string
): Promise<FetchResult> {
  const startTime = Date.now();
  const parsedUrl = new URL(targetUrl);

  try {
    const { address } = await dnsLookupAsync(parsedUrl.hostname);
    if (isPrivateIp(address)) {
      return {
        url: targetUrl,
        finalUrl: targetUrl,
        statusCode: 0,
        statusText: "",
        httpVersion: null,
        headers: {},
        redirectChain: [],
        responseTimeMs: Date.now() - startTime,
        contentType: null,
        contentLength: null,
        server: null,
        date: null,
        error: { code: "SSRF_BLOCKED", message: `Requests to private/internal addresses (${address}) are not allowed.` },
      };
    }
  } catch {
    return {
      url: targetUrl,
      finalUrl: targetUrl,
      statusCode: 0,
      statusText: "",
      httpVersion: null,
      headers: {},
      redirectChain: [],
      responseTimeMs: Date.now() - startTime,
      contentType: null,
      contentLength: null,
      server: null,
      date: null,
      error: { code: "DNS_FAILURE", message: `Could not resolve hostname: ${parsedUrl.hostname}` },
    };
  }

  let currentUrl = targetUrl;
  const redirectChain: FetchResult["redirectChain"] = [];
  let lastResult: Awaited<ReturnType<typeof makeRequest>> | null = null;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    try {
      lastResult = await makeRequest(currentUrl, method);

      // Only follow actual redirects: 301, 302, 303, 307, 308
      // Do NOT follow 304 (Not Modified) - it's a cache validation response
      const isRedirect = [301, 302, 303, 307, 308].includes(lastResult.statusCode);
      if (isRedirect) {
        const location = lastResult.headers["location"];
        if (!location) break;

        const safety = isRedirectSafe(location);
        if (!safety.safe) {
          return {
            url: targetUrl,
            finalUrl: currentUrl,
            statusCode: lastResult.statusCode,
            statusText: lastResult.statusText,
            httpVersion: lastResult.httpVersion,
            headers: lastResult.headers,
            redirectChain,
            responseTimeMs: Date.now() - startTime,
            contentType: lastResult.headers["content-type"] || null,
            contentLength: lastResult.headers["content-length"] ? parseInt(lastResult.headers["content-length"], 10) : null,
            server: lastResult.headers["server"] || null,
            date: lastResult.headers["date"] || null,
            error: { code: "SSRF_REDIRECT", message: safety.error || "Redirect to unsafe destination." },
          };
        }

        let nextUrl: string;
        try {
          nextUrl = new URL(location, currentUrl).href;
        } catch {
          break;
        }

        redirectChain.push({
          url: currentUrl,
          statusCode: lastResult.statusCode,
          statusText: lastResult.statusText,
          location: nextUrl,
          headers: lastResult.headers,
        });

        currentUrl = nextUrl;

        const nextParsed = new URL(nextUrl);
        try {
          const { address } = await dnsLookupAsync(nextParsed.hostname);
          if (isPrivateIp(address)) {
            return {
              url: targetUrl,
              finalUrl: currentUrl,
              statusCode: lastResult.statusCode,
              statusText: lastResult.statusText,
              httpVersion: lastResult.httpVersion,
              headers: lastResult.headers,
              redirectChain,
              responseTimeMs: Date.now() - startTime,
              contentType: null,
              contentLength: null,
              server: null,
              date: null,
              error: { code: "SSRF_REDIRECT", message: `Redirect resolved to private IP (${address}).` },
            };
          }
        } catch {
          return {
            url: targetUrl,
            finalUrl: currentUrl,
            statusCode: lastResult.statusCode,
            statusText: lastResult.statusText,
            httpVersion: lastResult.httpVersion,
            headers: lastResult.headers,
            redirectChain,
            responseTimeMs: Date.now() - startTime,
            contentType: null,
            contentLength: null,
            server: null,
            date: null,
            error: { code: "DNS_FAILURE", message: `Could not resolve redirect target: ${nextParsed.hostname}` },
          };
        }

        method = "GET";
        continue;
      }

      break;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      let errorCode = "NETWORK_ERROR";
      if (errMsg.includes("timed out")) errorCode = "TIMEOUT";
      else if (errMsg.includes("ECONNREFUSED")) errorCode = "CONNECTION_REFUSED";
      else if (errMsg.includes("ENOTFOUND")) errorCode = "DNS_FAILURE";
      else if (errMsg.includes("UNABLE_TO_VERIFY_LEAF_SIGNATURE") || errMsg.includes("CERT_HAS_EXPIRED") || errMsg.includes("ERR_TLS")) errorCode = "TLS_ERROR";

      return {
        url: targetUrl,
        finalUrl: currentUrl,
        statusCode: 0,
        statusText: "",
        httpVersion: null,
        headers: {},
        redirectChain,
        responseTimeMs: Date.now() - startTime,
        contentType: null,
        contentLength: null,
        server: null,
        date: null,
        error: { code: errorCode, message: errMsg },
      };
    }
  }

  if (!lastResult) {
    return {
      url: targetUrl,
      finalUrl: currentUrl,
      statusCode: 0,
      statusText: "",
      httpVersion: null,
      headers: {},
      redirectChain,
      responseTimeMs: Date.now() - startTime,
      contentType: null,
      contentLength: null,
      server: null,
      date: null,
      error: { code: "TOO_MANY_REDIRECTS", message: "Too many redirects." },
    };
  }

  return {
    url: targetUrl,
    finalUrl: currentUrl,
    statusCode: lastResult.statusCode,
    statusText: lastResult.statusText,
    httpVersion: lastResult.httpVersion,
    headers: lastResult.headers,
    redirectChain,
    responseTimeMs: Date.now() - startTime,
    contentType: lastResult.headers["content-type"] || null,
    contentLength: lastResult.headers["content-length"] ? parseInt(lastResult.headers["content-length"], 10) : null,
    server: lastResult.headers["server"] || null,
    date: lastResult.headers["date"] || null,
    error: null,
  };
}

export { fetchUrl };
