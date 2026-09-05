import { checkSslCertificate, checkHttpRedirect } from "./connection";
import { checkRateLimit } from "@/lib/utils";
import type { SslCheckResult } from "./types";

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
