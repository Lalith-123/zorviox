import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { BrokenLinkScannerTool } from "@/components/tools/broken-link-scanner-tool";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { FaqItem } from "@/components/shared/faq-item";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Broken Link Checker \u2014 Find 404s, Dead Links & Redirects | Zorviox",
  description:
    "Free online broken link checker. Crawl your website to find broken links, 404 errors, redirect chains, server errors, and soft 404s. Check internal and external links.",
  alternates: {
    canonical: `${SITE.url}/tools/broken-link-scanner`,
  },
  openGraph: {
    title: "Broken Link Checker \u2014 Find 404s, Dead Links & Redirects | Zorviox",
    description:
      "Free online broken link checker. Crawl your website to find broken links, 404 errors, redirect chains, server errors, and soft 404s.",
    url: `${SITE.url}/tools/broken-link-scanner`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Broken Link Checker \u2014 Find 404s, Dead Links & Redirects | Zorviox",
    description:
      "Free online broken link checker. Crawl your website to find broken links, 404 errors, redirect chains, server errors, and soft 404s.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Broken Link Checker",
  url: `${SITE.url}/tools/broken-link-scanner`,
  description:
    "Free online broken link checker. Crawl your website to find broken links, 404 errors, redirect chains, server errors, and soft 404s.",
  applicationCategory: "DeveloperApplication",
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
    { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE.url}/tools` },
    { "@type": "ListItem", position: 3, name: "Broken Link Checker", item: `${SITE.url}/tools/broken-link-scanner` },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How many pages can the broken link checker scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can scan between 25 and 500 pages per scan. The crawl depth controls how many link-hops the scanner follows from the starting page. Depth 1 checks only links on the starting page, depth 2 follows links one level deeper, and so on.",
      },
    },
    {
      "@type": "Question",
      name: "Does the scanner crawl external websites?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "By default, the scanner only crawls pages on the same domain. External links are detected but not recursively crawled. You can enable the 'Check external links' option to validate external URLs without crawling those sites.",
      },
    },
    {
      "@type": "Question",
      name: "What is a soft 404?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A soft 404 is a page that returns a 200 OK status but whose content indicates the page was not found. The scanner uses multiple signals including title tags, heading content, and body text patterns to detect possible soft 404s with minimal false positives.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the scanner show 403 as 'Blocked' instead of 'Broken'?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A 403 Forbidden response means the server explicitly refused access. This is different from a 404 Not Found, which means the resource does not exist. A 403 could mean the page exists but requires authentication, IP restriction, or other access controls.",
      },
    },
    {
      "@type": "Question",
      name: "Does the scanner respect robots.txt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The scanner checks robots.txt before crawling and respects crawl rules. If robots.txt cannot be retrieved (404), the scanner proceeds normally. If robots.txt returns a server error, the scanner notes this and proceeds cautiously.",
      },
    },
    {
      "@type": "Question",
      name: "Does the broken link checker affect my Google ranking?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broken links can create poor user experiences and may hinder search engine crawling in some situations. However, their SEO impact depends on context, quantity, and the pages involved. Fixing broken internal links is generally good practice for site maintenance.",
      },
    },
  ],
};

export default function BrokenLinkScannerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Container>
        <article className="py-6 sm:py-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="transition-colors hover:text-foreground">Home</Link></li>
              <li className="flex items-center gap-1.5">
                <span className="select-none text-muted-foreground/40">/</span>
                <Link href="/tools" className="transition-colors hover:text-foreground">Tools</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="select-none text-muted-foreground/40">/</span>
                <span className="text-foreground">Broken Link Checker</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Broken Link Checker
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Crawl your website to find broken links, 404 errors, redirect chains, server errors,
              and potential soft 404s. Distinguishes real issues from false positives.
            </p>
          </div>

          {/* Tool */}
          <BrokenLinkScannerTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              How the Broken Link Scanner Works
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is a broken link?">
                <p>
                  A broken link is a hyperlink that points to a resource that no longer exists, has
                  been moved without a redirect, or is otherwise unreachable. Common causes include
                  deleted pages, renamed URLs, typos in links, and websites that have gone offline.
                </p>
                <p>
                  Broken links return HTTP error status codes like 404 Not Found or 410 Gone.
                  However, not every non-200 response indicates a broken link. A 403 Forbidden
                  means access is restricted, not that the resource is missing. A 429 Too Many
                  Requests means the server is rate-limiting the crawler.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a broken link scanner?">
                <p>
                  A broken link scanner crawls a website following hyperlinks and checks each
                  destination URL to determine whether it is reachable. It reports the HTTP status
                  code, follows redirects, detects redirect chains and loops, and identifies other
                  issues like soft 404s and server errors.
                </p>
                <p>
                  This scanner goes beyond simple status-code checking. It classifies responses
                  accurately (distinguishing broken links from blocked access, rate limiting, and
                  temporary server errors), detects soft 404 pages, and tracks which source pages
                  reference each broken URL.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Why broken links matter for websites">
                <p>
                  Broken links create poor user experiences. Visitors who click a link expecting
                  useful content and land on a 404 page are likely to leave. For e-commerce sites,
                  broken links can directly lose sales.
                </p>
                <p>
                  From a crawling perspective, search engines follow links to discover pages. While
                  a few broken links will not devastate a site&apos;s performance, widespread broken
                  links can indicate poor maintenance and waste crawl budget. They also prevent
                  PageRank from flowing to the intended destination.
                </p>
                <p>
                  Broken internal links are generally more actionable than broken external links,
                  since you control your own site&apos;s URLs.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="HTTP status codes explained">
                <div className="space-y-3">
                  <StatusCode code="200" label="OK" desc="The resource exists and was successfully retrieved. However, a 200 response with content indicating 'Page Not Found' may be a soft 404." />
                  <StatusCode code="301" label="Moved Permanently" desc="The resource has been permanently moved to a new URL. Search engines transfer link equity to the new location." />
                  <StatusCode code="302" label="Found" desc="A temporary redirect. The original URL should remain the canonical version. Multiple redirects in sequence form a redirect chain." />
                  <StatusCode code="307" label="Temporary Redirect" desc="Similar to 302 but guarantees the request method will not change during the redirect." />
                  <StatusCode code="308" label="Permanent Redirect" desc="Similar to 301 but guarantees the request method will not change. The resource has permanently moved." />
                  <StatusCode code="400" label="Bad Request" desc="The server could not understand the request. This usually indicates a malformed URL or invalid request syntax." />
                  <StatusCode code="401" label="Unauthorized" desc="Authentication is required to access the resource. The link itself is not broken; it requires credentials." />
                  <StatusCode code="403" label="Forbidden" desc="The server understood the request but refuses to authorize it. The resource exists but access is denied. This is different from 404." />
                  <StatusCode code="404" label="Not Found" desc="The resource could not be found. This is the standard response for broken links that point to non-existent URLs." />
                  <StatusCode code="410" label="Gone" desc="The resource has been permanently removed and will not return. Unlike 404, this is an intentional signal that the resource is gone." />
                  <StatusCode code="429" label="Too Many Requests" desc="The server is rate-limiting requests. The resource may exist but the crawler sent too many requests. This should not be treated as a broken link." />
                  <StatusCode code="500" label="Internal Server Error" desc="The server encountered an unexpected condition. This is a server-side problem, not a broken link. The resource may exist when the server recovers." />
                  <StatusCode code="502" label="Bad Gateway" desc="The server received an invalid response from an upstream server. This is typically a transient infrastructure issue." />
                  <StatusCode code="503" label="Service Unavailable" desc="The server is temporarily unable to handle the request, often due to maintenance or overload. This is usually temporary." />
                  <StatusCode code="504" label="Gateway Timeout" desc="The server did not receive a timely response from an upstream server. This is typically a transient network issue." />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="What is a redirect chain?">
                <p>
                  A redirect chain occurs when a URL redirects to another URL, which itself
                  redirects to another, and so on. For example:
                </p>
                <p className="font-mono text-[12px] text-foreground">
                  /old-page &rarr; 301 &rarr; /new-page &rarr; 302 &rarr; /final-page &rarr; 200
                </p>
                <p>
                  Redirect chains slow down page loads because browsers must follow each hop.
                  Search engines may also lose crawl budget following long chains. This scanner
                  reports the number of hops and the final destination so you can simplify
                  unnecessary chains.
                </p>
                <p>
                  A redirect loop is a special case where the chain eventually points back to
                  a URL already in the chain. The scanner detects loops and stops immediately.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a soft 404?">
                <p>
                  A soft 404 is a page that returns HTTP 200 OK but whose content indicates the
                  page was not found. For example, a custom 404 page might return 200 with
                  &quot;Page Not Found&quot; in the title and body.
                </p>
                <p>
                  Search engines can detect soft 404s and may treat them similarly to real 404s.
                  However, soft 404s waste crawl budget because search engines will continue
                  requesting the URL.
                </p>
                <p>
                  This scanner uses conservative detection: it looks for multiple signals including
                  title tags, heading content, and common 404 page patterns. A single occurrence
                  of &quot;not found&quot; in page content does not trigger a soft-404 warning.
                  Only pages with strong evidence are flagged as <strong>possible soft 404</strong>.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Broken internal links vs external links">
                <p>
                  <strong>Internal links</strong> point to pages on the same domain. Broken
                  internal links are directly within your control and should be fixed by updating
                  the URL, adding a redirect, or removing the link.
                </p>
                <p>
                  <strong>External links</strong> point to other websites. External links may break
                  because the other site changed their URL structure, removed the page, or is
                  temporarily down. You can update external links if you control the source, but
                  you cannot control the destination.
                </p>
                <p>
                  This scanner distinguishes internal from external links and lets you focus on
                  what you can fix.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to fix broken links">
                <div className="space-y-3">
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Update the URL</h4>
                    <p>If the destination page moved, update the link to point to the new location.</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Add a redirect</h4>
                    <p>Set up a 301 redirect from the old URL to the new URL to preserve link equity and user experience.</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Remove the link</h4>
                    <p>If the destination no longer exists and there is no replacement, remove the link or replace it with relevant content.</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Fix the server error</h4>
                    <p>If the link returns a 5xx error, investigate and fix the server-side issue causing the error.</p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="How often should you check broken links?">
                <p>
                  For most websites, checking monthly is sufficient. Larger sites with frequent
                  content changes may benefit from weekly scans. After a site migration, redesign,
                  or CMS change, run a scan immediately to catch any new broken links.
                </p>
                <p>
                  Regular monitoring prevents small issues from accumulating into widespread problems.
                  Automated scheduling is ideal for maintaining link health over time.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Broken links during website migration">
                <p>
                  Website migrations are the most common cause of widespread broken links. When
                  URLs change during a platform switch, redesign, or domain change, every old URL
                  that does not have a redirect becomes a broken link.
                </p>
                <p>
                  Before migrating, map old URLs to new URLs and set up 301 redirects. After
                  migrating, run a full broken-link scan to catch any URLs that were missed.
                  The Zorviox <Link href="/tools/redirect-checker" className="text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground">Redirect Checker</Link> can
                  help verify individual redirect paths.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="How many pages can the broken link checker scan?"
                    answer="You can scan between 25 and 500 pages per scan. The crawl depth controls how many link-hops the scanner follows from the starting page."
                  />
                  <FaqItem
                    question="Does the scanner crawl external websites?"
                    answer="By default, the scanner only crawls pages on the same domain. External links are detected but not recursively crawled. Enable 'Check external links' to validate external URLs."
                  />
                  <FaqItem
                    question="What is a soft 404?"
                    answer="A soft 404 is a page that returns 200 OK but whose content indicates the page was not found. The scanner uses multiple signals to detect possible soft 404s with minimal false positives."
                  />
                  <FaqItem
                    question="Why does the scanner show 403 as 'Blocked' instead of 'Broken'?"
                    answer="A 403 Forbidden means the server refused access. The resource exists but is restricted. This is different from 404, which means the resource does not exist."
                  />
                  <FaqItem
                    question="Does the scanner respect robots.txt?"
                    answer="The scanner checks robots.txt before crawling and respects applicable crawl rules."
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

function StatusCode({
  code,
  label,
  desc,
}: {
  code: string;
  label: string;
  desc: string;
}) {
  return (
    <div>
      <h4 className="mb-0.5 text-[13px] font-medium text-foreground">
        <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">{code}</code> {label}
      </h4>
      <p className="text-[13px] text-muted-foreground">{desc}</p>
    </div>
  );
}
