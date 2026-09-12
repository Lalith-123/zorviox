import { NextRequest, NextResponse } from "next/server";
import { analyzeHttpHeaders } from "@/lib/http-header-analyzer";
import { extractClientIp, checkRateLimit } from "@/lib/utils";

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
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Please enter a URL." } },
        { status: 400 }
      );
    }

    const result = await analyzeHttpHeaders(url.trim());
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }
}
