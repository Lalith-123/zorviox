import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { FaqItem } from "@/components/shared/faq-item";
import { SitemapAnalyzerTool } from "@/components/tools/sitemap-analyzer-tool";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sitemap Analyzer — Check XML Sitemaps for SEO Issues | Zorviox",
  description:
    "Free online tool to analyze XML sitemaps. Check for SEO issues, validate structure, detect broken URLs, and audit child sitemaps.",
  alternates: {
    canonical: `${SITE.url}/tools/sitemap-analyzer`,
  },
  openGraph: {
    title: "Sitemap Analyzer — Check XML Sitemaps for SEO Issues | Zorviox",
    description:
      "Free online tool to analyze XML sitemaps. Check for SEO issues, validate structure, detect broken URLs, and audit child sitemaps.",
    url: `${SITE.url}/tools/sitemap-analyzer`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitemap Analyzer — Check XML Sitemaps for SEO Issues | Zorviox",
    description:
      "Free online tool to analyze XML sitemaps. Check for SEO issues, validate structure, detect broken URLs, and audit child sitemaps.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sitemap Analyzer",
  url: `${SITE.url}/tools/sitemap-analyzer`,
  description:
    "Free online tool to analyze XML sitemaps. Check for SEO issues, validate structure, detect broken URLs, and audit child sitemaps.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Tools",
      item: `${SITE.url}/tools`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Sitemap Analyzer",
      item: `${SITE.url}/tools/sitemap-analyzer`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this sitemap analyzer free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zorviox Sitemap Analyzer is completely free with no usage limits.",
      },
    },
    {
      "@type": "Question",
      name: "Does this tool affect my website's SEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This tool only reads publicly available XML. It does not modify anything on your website.",
      },
    },
    {
      "@type": "Question",
      name: "What types of sitemaps does this tool support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It supports both regular XML sitemaps (<urlset>) and sitemap index files (<sitemapindex>), including gzipped files. It recursively analyzes all child sitemaps.",
      },
    },
    {
      "@type": "Question",
      name: "What is a sitemap index?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A sitemap index is a special sitemap that lists other sitemaps. It is used when a website has too many URLs to fit in a single sitemap file (over 50,000 URLs or 50MB).",
      },
    },
    {
      "@type": "Question",
      name: "How do I create a sitemap?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most CMS platforms (WordPress, Shopify, etc.) generate sitemaps automatically. For static sites, you can use tools like xml-sitemaps.com or write a script to generate one from your page URLs.",
      },
    },
  ],
};

export default function SitemapAnalyzerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Container>
        <article className="py-6 sm:py-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="select-none text-muted-foreground/40">/</span>
                <Link href="/tools" className="transition-colors hover:text-foreground">
                  Tools
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="select-none text-muted-foreground/40">/</span>
                <span className="text-foreground">Sitemap Analyzer</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sitemap Analyzer
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Analyze any XML sitemap for SEO issues, structural problems, and broken URLs. Supports
              sitemap indexes and recursive child sitemap analysis.
            </p>
          </div>

          {/* Tool */}
          <SitemapAnalyzerTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Learn about XML sitemaps
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is an XML sitemap?">
                <p>
                  An XML sitemap is a file that lists all the important pages on your website in a
                  structured XML format. It helps search engines like Google, Bing, and Yandex
                  discover and crawl your pages more efficiently.
                </p>
                <p>
                  Sitemaps are placed at a standard location (usually{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                    /sitemap.xml
                  </code>
                  ) and referenced in your{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">robots.txt</code>{" "}
                  file so search engines can find them automatically.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a sitemap index?">
                <p>
                  A sitemap index is a special type of sitemap that lists other sitemaps instead of
                  individual URLs. It is used when a website has too many URLs to fit in a single
                  file.
                </p>
                <p>
                  The sitemap protocol limits each file to 50,000 URLs or 50MB (uncompressed). If
                  your site exceeds these limits, you split your URLs across multiple sitemaps and
                  create a sitemap index that points to each one.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Why are sitemaps important for SEO?">
                <p>
                  Sitemaps help search engines discover your pages, especially for:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">New websites:</strong> With few or no
                    external links, a sitemap ensures search engines can still find your pages
                  </li>
                  <li>
                    <strong className="text-foreground">Large websites:</strong> Complex site
                    architectures with many nested pages benefit from a sitemap that shows the full
                    structure
                  </li>
                  <li>
                    <strong className="text-foreground">New or updated content:</strong> The{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">lastmod</code>{" "}
                    date tells search engines when pages were last updated, helping prioritize
                    crawling
                  </li>
                  <li>
                    <strong className="text-foreground">Orphan pages:</strong> Pages not linked
                    from anywhere else on your site can still be discovered via the sitemap
                  </li>
                </ul>
                <p>
                  A sitemap does not guarantee that all pages will be indexed, but it significantly
                  improves the chances.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to create a sitemap">
                <p>Most websites can generate a sitemap automatically:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">WordPress:</strong> Plugins like Yoast SEO
                    or Rank Math generate sitemaps automatically
                  </li>
                  <li>
                    <strong className="text-foreground">Shopify:</strong> Generates a sitemap at{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      /sitemap.xml
                    </code>{" "}
                    automatically
                  </li>
                  <li>
                    <strong className="text-foreground">Next.js:</strong> Use the{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">sitemap.ts</code>{" "}
                    file in your app directory
                  </li>
                  <li>
                    <strong className="text-foreground">Static sites:</strong> Use a generator
                    tool like xml-sitemaps.com, or write a build script that crawls your pages
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Common sitemap issues">
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Missing lastmod dates:</strong> Without
                    these, search engines cannot prioritize recently updated content
                  </li>
                  <li>
                    <strong className="text-foreground">Duplicate URLs:</strong> Same URL appearing
                    multiple times wastes crawl budget and can confuse search engines
                  </li>
                  <li>
                    <strong className="text-foreground">Broken or invalid URLs:</strong> URLs with
                    errors (404s, invalid formats) waste crawl budget
                  </li>
                  <li>
                    <strong className="text-foreground">HTTP URLs in HTTPS sitemaps:</strong> Mixed
                    protocol URLs can cause confusion and security warnings
                  </li>
                  <li>
                    <strong className="text-foreground">Sitemap not in robots.txt:</strong> While
                    not required, listing your sitemap in robots.txt helps search engines find it
                  </li>
                  <li>
                    <strong className="text-foreground">Too many URLs:</strong> Sitemaps exceeding
                    50,000 URLs or 50MB should be split into multiple files with a sitemap index
                  </li>
                  <li>
                    <strong className="text-foreground">URLs with fragments (#):</strong> Fragment
                    identifiers are ignored by search engines and should not be included
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Sitemap XML format reference">
                <p>An XML sitemap has this basic structure:</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`}
                </pre>
                <p className="mt-3">
                  <strong className="text-foreground">loc</strong> (required): The full URL of the
                  page. Must use the same protocol as your sitemap.
                </p>
                <p>
                  <strong className="text-foreground">lastmod</strong> (optional): The date the
                  page was last modified in W3C Datetime format (e.g.,{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">2025-01-15</code>).
                </p>
                <p>
                  <strong className="text-foreground">changefreq</strong> (optional): How often the
                  page changes. Valid values: always, hourly, daily, weekly, monthly, yearly, never.
                  This is a hint to search engines, not a directive.
                </p>
                <p>
                  <strong className="text-foreground">priority</strong> (optional): A number
                  between 0.0 and 1.0 indicating the relative importance of this URL compared to
                  others on your site. Default is 0.5.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="Is this sitemap analyzer free?"
                    answer="Yes. Zorviox Sitemap Analyzer is completely free with no usage limits."
                  />
                  <FaqItem
                    question="Does this tool affect my website's SEO?"
                    answer="No. This tool only reads publicly available XML. It does not modify anything on your website."
                  />
                  <FaqItem
                    question="What types of sitemaps does this tool support?"
                    answer="It supports both regular XML sitemaps (<urlset>) and sitemap index files (<sitemapindex>), including gzipped files. It recursively analyzes all child sitemaps."
                  />
                  <FaqItem
                    question="What is a sitemap index?"
                    answer="A sitemap index is a special sitemap that lists other sitemaps. It is used when a website has too many URLs to fit in a single sitemap file (over 50,000 URLs or 50MB)."
                  />
                  <FaqItem
                    question="How do I create a sitemap?"
                    answer="Most CMS platforms (WordPress, Shopify, etc.) generate sitemaps automatically. For static sites, you can use tools like xml-sitemaps.com or write a script to generate one from your page URLs."
                  />
                </div>
              </CollapsibleSection>
            </div>
          </div>
        </article>
      </Container>
    </>
  );
}


