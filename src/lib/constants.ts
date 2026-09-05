export const SITE = {
  name: "Zorviox",
  domain: "zorviox.com",
  url: "https://zorviox.com",
  title: "Zorviox — Simple Tools for the Modern Web",
    description:
      "Fast, practical online tools for developers, website owners, and businesses. Start with our free Meta Tag Checker, Sitemap Analyzer, Redirect Checker, JSON Repair Tool, JSON Schema Generator, DNS Lookup Tool, SSL Certificate Checker, and Broken Link Checker.",
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
  {
    slug: "json-schema-generator",
    name: "JSON Schema Generator",
    description:
      "Generate valid JSON Schema from JSON data. Supports Draft 2020-12, Draft-07, multiple samples, and type inference.",
    category: "Developer Tools",
  },
  {
    slug: "dns-lookup",
    name: "DNS Lookup Tool",
    description:
      "Check A, AAAA, MX, CNAME, NS, TXT, SOA, CAA, SRV, and PTR records. Reverse DNS lookup and DNS diagnostics.",
    category: "Networking",
  },
  {
    slug: "ssl-certificate-checker",
    name: "SSL Certificate Checker",
    description:
      "Inspect TLS certificates, expiration, issuer, hostname coverage, certificate chain, cipher suite, and security configuration.",
    category: "Networking",
  },
  {
    slug: "broken-link-scanner",
    name: "Broken Link Checker",
    description:
      "Crawl your website to find broken links, 404 errors, redirect chains, server errors, and soft 404s.",
    category: "SEO & Website",
  },
];
