import { NextRequest, NextResponse } from "next/server";
import { analyzeSitemap } from "@/lib/sitemap/analyzer";
import { ensureHttps } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid sitemap URL." },
        { status: 400 }
      );
    }

    url = url.trim();
    url = ensureHttps(url);

    const result = await analyzeSitemap(url);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while analyzing the sitemap. Please try again." },
      { status: 500 }
    );
  }
}
