import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RedirectCheckerTool } from "@/components/tools/redirect-checker-tool";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Redirect Checker \u2014 Check 301, 302 & Redirect Chains | Zorviox",
  description:
    "Free online tool to check HTTP redirects. Detect 301, 302, 307, 308 redirects, chains, loops, and cross-domain redirects with full chain analysis.",
  alternates: {
    canonical: `${SITE.url}/tools/redirect-checker`,
  },
  openGraph: {
    title: "Redirect Checker \u2014 Check 301, 302 & Redirect Chains | Zorviox",
    description:
      "Free online tool to check HTTP redirects. Detect 301, 302, 307, 308 redirects, chains, loops, and cross-domain redirects.",
    url: `${SITE.url}/tools/redirect-checker`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redirect Checker \u2014 Check 301, 302 & Redirect Chains | Zorviox",
    description:
      "Free online tool to check HTTP redirects. Detect 301, 302, 307, 308 redirects, chains, loops, and cross-domain redirects.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Redirect Checker",
  url: `${SITE.url}/tools/redirect-checker`,
  description:
    "Free online tool to check HTTP redirects. Detect 301, 302, 307, 308 redirects, chains, loops, and cross-domain redirects with full chain analysis.",
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
      name: "Redirect Checker",
      item: `${SITE.url}/tools/redirect-checker`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this redirect checker free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zorviox Redirect Checker is completely free with no usage limits.",
      },
    },
    {
      "@type": "Question",
      name: "Does this tool affect my website's SEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This tool only reads publicly available HTTP responses. It does not modify anything on your website.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between 301 and 302 redirects?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A 301 redirect is permanent \u2014 search engines transfer ranking to the new URL. A 302 redirect is temporary \u2014 search engines keep the original URL indexed.",
      },
    },
    {
      "@type": "Question",
      name: "How many redirects are too many?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each redirect adds latency. Google recommends no more than 3 hops. Chains of 5+ redirects should be reviewed and simplified where possible.",
      },
    },
    {
      "@type": "Question",
      name: "What is a redirect loop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A redirect loop occurs when URL A redirects to B, which redirects back to A (or through several URLs and eventually back to the start). This will never resolve and browsers will show an error.",
      },
    },
  ],
};

export default function RedirectCheckerPage() {
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
                <span className="text-foreground">Redirect Checker</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Redirect Checker
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Trace the complete HTTP redirect path for any URL. Detect 301, 302, 307, 308
              redirects, chains, loops, and cross-domain changes.
            </p>
          </div>

          {/* Tool */}
          <RedirectCheckerTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Learn about HTTP redirects
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is a URL redirect?">
                <p>
                  A URL redirect is an HTTP response that tells the browser (or search engine)
                  that the requested resource has moved to a different address. Instead of serving
                  content from the original URL, the server responds with a status code and a new
                  location, instructing the client to fetch from the destination.
                </p>
                <p>
                  Redirects are essential during website migrations, domain changes, URL
                  restructuring, and when consolidating pages. They ensure that old links
                  continue to work while directing users and search engines to the correct
                  content.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a 301 redirect?">
                <p>
                  A <strong className="text-foreground">301 Moved Permanently</strong> redirect
                  indicates that the resource has permanently moved to a new URL. Search engines
                  transfer the ranking authority from the old URL to the new one and update their
                  index accordingly.
                </p>
                <p>Use 301 redirects when:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>You&apos;ve permanently moved a page to a new URL</li>
                  <li>You&apos;re migrating to a new domain</li>
                  <li>You&apos;re consolidating multiple pages into one</li>
                  <li>You&apos;ve changed the URL structure permanently</li>
                </ul>
                <p>
                  Note: Historically, some clients may convert 301 redirects to GET requests
                  when changing methods. In practice, this is rarely an issue for standard
                  public URL redirects.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a 302 redirect?">
                <p>
                  A <strong className="text-foreground">302 Found</strong> redirect is a temporary
                  redirect. It tells search engines that the original URL is still valid and
                  should remain indexed, while the user is temporarily served content from a
                  different location.
                </p>
                <p>Use 302 redirects when:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>The move is temporary</li>
                  <li>You&apos;re A/B testing and don&apos;t want to transfer ranking</li>
                  <li>You&apos;re temporarily serving content from a different location</li>
                  <li>During maintenance or deployment</li>
                </ul>
                <p>
                  Be careful: using 302 when you mean 301 can cause search engines to keep
                  indexing the old URL instead of the new one.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="301 vs 302 vs 307 vs 308">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border/60 text-left">
                        <th className="pb-2 pr-4 font-medium text-foreground">Code</th>
                        <th className="pb-2 pr-4 font-medium text-foreground">Type</th>
                        <th className="pb-2 pr-4 font-medium text-foreground">Preserves Method</th>
                        <th className="pb-2 font-medium text-foreground">Use Case</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/30">
                        <td className="py-2 pr-4 font-mono font-semibold text-foreground">301</td>
                        <td className="py-2 pr-4">Permanent</td>
                        <td className="py-2 pr-4">Not guaranteed</td>
                        <td className="py-2">Permanent URL change</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="py-2 pr-4 font-mono font-semibold text-foreground">302</td>
                        <td className="py-2 pr-4">Temporary</td>
                        <td className="py-2 pr-4">Not guaranteed</td>
                        <td className="py-2">Temporary location change</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="py-2 pr-4 font-mono font-semibold text-foreground">303</td>
                        <td className="py-2 pr-4">See Other</td>
                        <td className="py-2 pr-4">Changes to GET</td>
                        <td className="py-2">After POST, redirect to result page</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="py-2 pr-4 font-mono font-semibold text-foreground">307</td>
                        <td className="py-2 pr-4">Temporary</td>
                        <td className="py-2 pr-4">Yes</td>
                        <td className="py-2">Temporary, method must be preserved</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono font-semibold text-foreground">308</td>
                        <td className="py-2 pr-4">Permanent</td>
                        <td className="py-2 pr-4">Yes</td>
                        <td className="py-2">Permanent, method must be preserved</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="What is a redirect chain?">
                <p>
                  A redirect chain occurs when URL A redirects to URL B, which in turn redirects
                  to URL C, and so on. Each intermediate redirect is an additional hop that adds
                  latency for users and crawl budget consumption for search engines.
                </p>
                <p>Example of a redirect chain:</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`http://example.com
    ↓ 301
https://example.com
    ↓ 301
https://www.example.com
    ↓ 301
https://www.example.com/new-page`}
                </pre>
                <p className="mt-3">
                  While 1\u20132 redirects are generally acceptable, longer chains should be
                  reduced. Each hop adds a network round-trip and can affect page load speed.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a redirect loop?">
                <p>
                  A redirect loop occurs when URL A redirects to URL B, which redirects back
                  to URL A (or through several intermediate URLs and eventually returns to the
                  start). This creates an infinite cycle that never resolves.
                </p>
                <p>Browsers will display an error like:</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`This page isn't working
example.com redirected you too many times.`}
                </pre>
                <p className="mt-3">
                  Redirect loops are typically caused by misconfiguration. Common causes
                  include conflicting redirect rules, incorrect .htaccess configurations,
                  or CMS plugin conflicts.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Why redirect chains matter">
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Latency:</strong> Each redirect adds a
                    network round-trip. A chain of 3 redirects can add 200\u2013500ms of additional
                    load time depending on server response and network conditions.
                  </li>
                  <li>
                    <strong className="text-foreground">Crawl budget:</strong> Search engines have
                    a limited crawl budget. Redirect chains consume more of this budget, potentially
                    leaving less important pages uncrawled.
                  </li>
                  <li>
                    <strong className="text-foreground">Link equity dilution:</strong> While Google
                    says they pass PageRank through redirects, each hop may theoretically dilute
                    a small amount of authority.
                  </li>
                  <li>
                    <strong className="text-foreground">User experience:</strong> Users experience
                    slower page loads with each redirect hop, which can increase bounce rates.
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Redirects during website migration">
                <p>
                  When migrating a website or restructuring URLs, redirects ensure continuity.
                  A clean migration pattern looks like:
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`Old URL → 301 → New URL → 200`}
                </pre>
                <p className="mt-3">
                  This is the ideal scenario: a single permanent redirect directly to the new
                  page, which returns a successful response.
                </p>
                <p className="mt-2">
                  If you see intermediate redirects (like HTTP → HTTPS → www → new page),
                  that&apos;s extra hops that could potentially be reduced by configuring
                  the server to redirect directly to the final destination.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="HTTP vs HTTPS redirects">
                <p>
                  Redirecting from HTTP to HTTPS is a standard security practice. It ensures
                  that all traffic is encrypted. Search engines prefer HTTPS and use it as a
                  ranking signal.
                </p>
                <p>
                  The typical pattern is:
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`http://example.com/page
    ↓ 301
https://example.com/page`}
                </pre>
                <p className="mt-3">
                  HTTPS → HTTP redirects are generally undesirable. They downgrade security
                  and should be reviewed. While not an automatic SEO penalty, they can create
                  security concerns for users.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to fix redirect chains">
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Map all redirects:</strong> Use this tool
                    to identify existing chains before making changes.
                  </li>
                  <li>
                    <strong className="text-foreground">Update internal links:</strong> Fix links
                    that point to URLs that redirect, pointing them directly to the final
                    destination.
                  </li>
                  <li>
                    <strong className="text-foreground">Update server rules:</strong> Configure
                    redirects to go directly to the final URL instead of chaining through
                    intermediate URLs.
                  </li>
                  <li>
                    <strong className="text-foreground">Update external links:</strong> Where
                    possible, request updates to external backlinks pointing to old URLs.
                  </li>
                  <li>
                    <strong className="text-foreground">Remove unnecessary redirects:</strong> If
                    a redirect is no longer needed, remove it.
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Common redirect problems">
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Redirect loops:</strong> The most critical
                    issue \u2014 the URL never resolves and browsers show an error.
                  </li>
                  <li>
                    <strong className="text-foreground">Unnecessary chains:</strong> Multiple hops
                    that could be reduced to one.
                  </li>
                  <li>
                    <strong className="text-foreground">Wrong redirect type:</strong> Using 302
                    when 301 is intended, or vice versa.
                  </li>
                  <li>
                    <strong className="text-foreground">Missing redirects:</strong> Old URLs
                    returning 404 instead of redirecting to the new location.
                  </li>
                  <li>
                    <strong className="text-foreground">Mixed protocols:</strong> HTTPS → HTTP
                    redirects that downgrade security.
                  </li>
                  <li>
                    <strong className="text-foreground">Query parameter loss:</strong> Redirects
                    that strip query parameters that should be preserved.
                  </li>
                  <li>
                    <strong className="text-foreground">Relative Location errors:</strong> Servers
                    returning incorrect relative Location headers.
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="Is this redirect checker free?"
                    answer="Yes. Zorviox Redirect Checker is completely free with no usage limits."
                  />
                  <FaqItem
                    question="Does this tool affect my website's SEO?"
                    answer="No. This tool only reads publicly available HTTP responses. It does not modify anything on your website."
                  />
                  <FaqItem
                    question="What is the difference between 301 and 302 redirects?"
                    answer="A 301 redirect is permanent \u2014 search engines transfer ranking to the new URL. A 302 redirect is temporary \u2014 search engines keep the original URL indexed."
                  />
                  <FaqItem
                    question="How many redirects are too many?"
                    answer="Each redirect adds latency. Google recommends no more than 3 hops. Chains of 5+ redirects should be reviewed and simplified where possible."
                  />
                  <FaqItem
                    question="What is a redirect loop?"
                    answer="A redirect loop occurs when URL A redirects to B, which redirects back to A (or through several URLs and eventually back to the start). This will never resolve and browsers will show an error."
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

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border/60 bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="space-y-3 border-t border-border/40 px-5 pb-5 pt-4 text-[14px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div>
      <h3 className="mb-1 text-[14px] font-medium text-foreground">{question}</h3>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{answer}</p>
    </div>
  );
}
