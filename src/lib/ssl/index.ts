import { checkSslCertificate, checkHttpRedirect } from "./connection";
import type { SslCheckResult } from "./types";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

export async function performSslCheck(
  hostname: string,
  port: number = 443,
  clientIp: string = "unknown"
): Promise<SslCheckResult> {
  if (!checkRateLimit(clientIp)) {
    return {
      hostname,
      port,
      reachable: false,
      certificate: null,
      tls: null,
      chain: [],
      diagnostics: [
        {
          type: "error",
          message: "Rate limit exceeded. Please try again later.",
        },
      ],
      hsts: null,
      httpRedirect: null,
      error: {
        code: "RATE_LIMIT",
        message: "Too many requests. Please try again later.",
      },
    };
  }

  const cleanedHostname = hostname
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
    .toLowerCase();

  const result = await checkSslCertificate(cleanedHostname);

  if (result.reachable) {
    try {
      const httpRedirect = await checkHttpRedirect(cleanedHostname);
      result.httpRedirect = httpRedirect;
    } catch {
      result.httpRedirect = null;
    }
  }

  return result;
}
