export const SITE = {
  name: "Zorviox",
  domain: "zorviox.com",
  url: "https://zorviox.com",
  title: "Zorviox — Simple Tools for the Modern Web",
  description:
    "Fast, practical online tools for developers, website owners, and businesses. Start with our free Meta Tag Checker.",
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
];
