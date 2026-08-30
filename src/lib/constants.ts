export const SITE = {
  name: "Zorviox",
  domain: "zorviox.com",
  url: "https://zorviox.com",
  title: "Zorviox — Simple Tools for the Modern Web",
  description:
    "Fast, practical online tools for developers, website owners, and businesses. Start with our free Meta Tag Checker, Sitemap Analyzer, Redirect Checker, and JSON Repair Tool.",
} as const;

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: string;
}

export const TOOLS: Tool[] = [
  {
    slug: "meta-tag-checker",
    name: "Meta Tag Checker",
    description:
      "Analyze any website's meta tags, Open Graph data, and SEO metadata instantly.",
    category: "SEO & Website",
  },
  {
    slug: "sitemap-analyzer",
    name: "Sitemap Analyzer",
    description:
      "Analyze XML sitemaps for SEO issues, structural problems, and broken URLs.",
    category: "SEO & Website",
  },
  {
    slug: "redirect-checker",
    name: "Redirect Checker",
    description:
      "Trace HTTP redirect paths, detect chains, loops, and cross-domain changes.",
    category: "SEO & Website",
  },
  {
    slug: "json-repair",
    name: "JSON Repair Tool",
    description:
      "Fix malformed JSON, validate syntax, and repair trailing commas and missing quotes.",
    category: "Developer Tools",
  },
];
