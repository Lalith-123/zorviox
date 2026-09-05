import { NextRequest, NextResponse } from "next/server";
import { analyzeRedirect } from "@/lib/redirect/analyzer";
import { ensureHttps } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid URL." },
        { status: 400 }
      );
    }

    url = url.trim();
    url = ensureHttps(url);

    const result = await analyzeRedirect(url);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while analyzing the URL. Please try again." },
      { status: 500 }
    );
  }
}
