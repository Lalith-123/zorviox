import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { SitemapUrl } from "./types";

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
  isArray: () => false,
  textNodeName: "#text",
};

export function validateXml(xml: string): { valid: boolean; error?: string } {
  const result = XMLValidator.validate(xml, {
    allowBooleanAttributes: true,
  });
  if (result === true) return { valid: true };
  return { valid: false, error: result.err.msg };
}

export function parseSitemap(
  xml: string
):
  | { type: "urlset"; urls: SitemapUrl[] }
  | { type: "sitemapindex"; sitemaps: { loc: string; lastmod: string | null }[] }
  | { type: "error"; error: string } {
  const validation = validateXml(xml);
  if (!validation.valid) {
    return { type: "error", error: `Invalid XML: ${validation.error}` };
  }

  const parser = new XMLParser(parserOptions);
  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xml) as Record<string, unknown>;
  } catch (err) {
    return {
      type: "error",
      error: `Failed to parse XML: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return { type: "error", error: "Empty or invalid XML document" };
  }

  const root = Object.keys(parsed).find(
    (k) => k !== "?xml" && k !== "#document"
  );
  if (!root) {
    return { type: "error", error: "No root element found in XML" };
  }

  const rootElement = parsed[root] as Record<string, unknown> | undefined;
  if (!rootElement || typeof rootElement !== "object") {
    return { type: "error", error: "Root element is empty" };
  }

  const rootTag = root.replace(/^.*:/, "").toLowerCase();

  if (rootTag === "sitemapindex") {
    const rawSitemaps = rootElement.sitemap;
    const sitemapArray = Array.isArray(rawSitemaps)
      ? rawSitemaps
      : rawSitemaps
        ? [rawSitemaps]
        : [];

    const sitemaps = sitemapArray.map((s: Record<string, unknown>) => {
      const loc = typeof s.loc === "string" ? s.loc.trim() : "";
      const lastmod =
        typeof s.lastmod === "string" ? s.lastmod.trim() : null;
      return { loc, lastmod };
    });

    return { type: "sitemapindex", sitemaps };
  }

  if (rootTag === "urlset") {
    const rawUrls = rootElement.url;
    const urlArray = Array.isArray(rawUrls)
      ? rawUrls
      : rawUrls
        ? [rawUrls]
        : [];

    const urls: SitemapUrl[] = urlArray.map((u: Record<string, unknown>) => {
      const loc = typeof u.loc === "string" ? u.loc.trim() : "";
      const lastmod =
        typeof u.lastmod === "string" ? u.lastmod.trim() : null;
      const changefreq =
        typeof u.changefreq === "string" ? u.changefreq.trim() : null;
      const priority =
        typeof u.priority === "string" ? u.priority.trim() : null;
      return { loc, lastmod, changefreq, priority };
    });

    return { type: "urlset", urls };
  }

  return {
    type: "error",
    error: `Unrecognized root element: <${rootTag}>. Expected <urlset> or <sitemapindex>.`,
  };
}
