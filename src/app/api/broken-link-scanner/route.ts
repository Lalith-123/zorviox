import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite } from "@/lib/crawler";
import { extractClientIp, checkRateLimit } from "@/lib/utils";

const scanResults = new Map<string, unknown>();
const activeScanControllers = new Map<string, AbortController>();

function isValidUrl(urlStr: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlStr);
    if (!["http:", "https:"].includes(url.protocol)) {
      return { valid: false, error: "Please use http:// or https:// protocol." };
    }
    const hostname = url.hostname;
    if (
      /^localhost$/i.test(hostname) ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname) ||
      /^::1$/.test(hostname)
    ) {
      return { valid: false, error: "Cannot scan private/internal addresses." };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Please enter a valid URL." };
  }
}

export async function POST(request: NextRequest) {
  const ip = extractClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: { code: "RATE_LIMIT", message: "Too many requests. Please try again later." } },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { url: rawUrl, maxPages = 100, maxDepth = 3, checkExternal = false } = body;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Please enter a website URL." } },
        { status: 400 }
      );
    }

    const validation = isValidUrl(rawUrl);
    if (!validation.valid) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: validation.error } },
        { status: 400 }
      );
    }

    const pages = Math.min(Math.max(parseInt(maxPages, 10) || 100, 1), 500);
    const depth = Math.min(Math.max(parseInt(maxDepth, 10) || 3, 1), 10);

    const controller = new AbortController();
    const scanId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    activeScanControllers.set(scanId, controller);

    const result = await crawlWebsite(
      {
        startUrl: rawUrl,
        maxPages: pages,
        maxDepth: depth,
        checkExternal: Boolean(checkExternal),
        concurrency: 5,
      },
      undefined,
      () => controller.signal.aborted
    );

    activeScanControllers.delete(scanId);
    scanResults.set(scanId, result);

    return NextResponse.json({ scanId, result });
  } catch {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }
}
