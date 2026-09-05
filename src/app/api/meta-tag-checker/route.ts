import { NextRequest, NextResponse } from "next/server";
import { ensureHttps } from "@/lib/utils";

const TIMEOUT_MS = 10000;
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "0.0.0.0" ||
    h === "[::1]"
  )
    return true;
  if (/^10\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^fc00:/i.test(h)) return true;
  if (/^fe80:/i.test(h)) return true;
  if (/^fd|^f[0-9a-f]{2}:/i.test(h)) return true;
  if (h === "metadata.google.internal") return true;
  if (h.endsWith(".metadata.google.internal")) return true;
  return false;
}

function getAttr(tag: string, attr: string): string | null {
  const re = new RegExp(`${attr}=["']([^"']*)["']`, "i");
  const m = tag.match(re);
  return m?.[1]?.trim() || null;
}

function extractMeta(html: string) {
  const metaTags = (html.match(/<meta[^>]+>/gi) || []) as string[];
  const getMeta = (name: string, attr = "name"): string | null => {
    for (const tag of metaTags) {
      const isProp = attr === "property";
      const a = getAttr(tag, isProp ? "property" : "name");
      if (a?.toLowerCase() === name.toLowerCase()) {
        return getAttr(tag, "content");
      }
    }
    return null;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || null;

  const canonicalLinks = (html.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi) || []) as string[];
  const canonical = canonicalLinks.length > 0 ? getAttr(canonicalLinks[0], "href") : null;
  const multipleCanonicals = canonicalLinks.length > 1;

  const faviconLinks = (html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*>/gi) || []) as string[];
  const favicon = faviconLinks.length > 0 ? getAttr(faviconLinks[0], "href") : null;

  const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
  const language = langMatch?.[1]?.trim() || null;

  const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]*)["']?/i);
  const charset = charsetMatch?.[1]?.trim() || null;

  const viewport = getMeta("viewport");
  const description = getMeta("description");
  const robots = getMeta("robots");
  const author = getMeta("author");
  const generator = getMeta("generator");
  const keywords = getMeta("keywords");
  const themeColor = getMeta("theme-color");

  const ogTitle = getMeta("og:title", "property");
  const ogDescription = getMeta("og:description", "property");
  const ogImage = getMeta("og:image", "property");
  const ogUrl = getMeta("og:url", "property");
  const ogType = getMeta("og:type", "property");
  const ogSiteName = getMeta("og:site_name", "property");

  const twitterCard = getMeta("twitter:card");
  const twitterTitle = getMeta("twitter:title");
  const twitterDescription = getMeta("twitter:description");
  const twitterImage = getMeta("twitter:image");

  const alternateLinks = (html.match(/<link[^>]*rel=["']alternate["'][^>]*>/gi) || []) as string[];
  const alternates: { lang: string; href: string }[] = [];
  for (const link of alternateLinks) {
    const hreflang = getAttr(link, "hreflang");
    const href = getAttr(link, "href");
    if (hreflang && href) alternates.push({ lang: hreflang, href });
  }

  return {
    title,
    description,
    robots,
    language,
    charset,
    viewport,
    canonical,
    multipleCanonicals,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    ogSiteName,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    favicon,
    themeColor,
    author,
    generator,
    keywords,
    alternates,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid website URL." },
        { status: 400 }
      );
    }

    url = url.trim();
    url = ensureHttps(url);

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please enter a valid website address." },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are supported." },
        { status: 400 }
      );
    }

    if (isPrivateHost(parsed.hostname)) {
      return NextResponse.json(
        { error: "This URL points to a private or local address and cannot be analyzed." },
        { status: 400 }
      );
    }

    let finalUrl = parsed.href;
    let redirectCount = 0;
    let response: Response | null = null;

    try {
      let currentUrl = parsed.href;

      for (let i = 0; i <= MAX_REDIRECTS; i++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch(currentUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "ZorvioxMetaTagChecker/1.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          redirect: "manual",
        });

        clearTimeout(timeout);

        if ([301, 302, 303, 307, 308].includes(res.status)) {
          const location = res.headers.get("location");
          if (!location) {
            response = res;
            finalUrl = currentUrl;
            break;
          }
          let nextUrl: string;
          try {
            nextUrl = new URL(location, currentUrl).href;
          } catch {
            response = res;
            finalUrl = currentUrl;
            break;
          }
          redirectCount++;
          currentUrl = nextUrl;
          finalUrl = nextUrl;
          continue;
        }

        response = res;
        finalUrl = currentUrl;
        break;
      }

      if (!response) {
        return NextResponse.json(
          { error: "Too many redirects. The website could not be reached." },
          { status: 502 }
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "The website took too long to respond. Please try again." },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: "We couldn't reach this website. Check the URL and try again." },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `The website returned an error (HTTP ${response.status}). Please check the URL.` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return NextResponse.json(
        { error: "This URL does not return an HTML page. Meta tags can only be checked on HTML pages." },
        { status: 400 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "The page is too large to analyze." },
        { status: 400 }
      );
    }

    const html = new TextDecoder().decode(arrayBuffer);
    const metaTags = extractMeta(html);

    const checks = [
      { label: "Title exists", passed: !!metaTags.title },
      { label: "Description exists", passed: !!metaTags.description },
      { label: "Canonical URL exists", passed: !!metaTags.canonical },
      { label: "Viewport exists", passed: !!metaTags.viewport },
      { label: "Open Graph title exists", passed: !!metaTags.ogTitle },
      { label: "Open Graph description exists", passed: !!metaTags.ogDescription },
      { label: "Open Graph image exists", passed: !!metaTags.ogImage },
      { label: "Twitter card exists", passed: !!metaTags.twitterCard },
    ];
    const passed = checks.filter((c) => c.passed).length;

    return NextResponse.json({
      url: parsed.href,
      finalUrl,
      redirectCount,
      fetchedAt: new Date().toISOString(),
      metaTags,
      score: { total: checks.length, passed, checks },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while analyzing the website. Please try again." },
      { status: 500 }
    );
  }
}
