import { NextRequest, NextResponse } from "next/server";
import { analyzeSitemap } from "@/lib/sitemap/analyzer";

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
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    const result = await analyzeSitemap(url);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while analyzing the sitemap. Please try again." },
      { status: 500 }
    );
  }
}
