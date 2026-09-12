import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { HttpHeaderAnalyzerTool } from "@/components/tools/http-header-analyzer-tool";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { FaqItem } from "@/components/shared/faq-item";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "HTTP Header Analyzer \u2014 Check Response & Security Headers | Zorviox",
  description:
    "Free online HTTP header analyzer. Inspect response headers, analyze security headers, check CORS, cache directives, cookies, CSP, HSTS, and SEO headers.",
  alternates: {
    canonical: `${SITE.url}/tools/http-header-analyzer`,
  },
  openGraph: {
    title: "HTTP Header Analyzer \u2014 Check Response & Security Headers | Zorviox",
    description:
      "Free online HTTP header analyzer. Inspect response headers, analyze security headers, check CORS, cache directives, cookies, CSP, HSTS, and SEO headers.",
    url: `${SITE.url}/tools/http-header-analyzer`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Header Analyzer \u2014 Check Response & Security Headers | Zorviox",
    description:
      "Free online HTTP header analyzer. Inspect response headers, analyze security headers, check CORS, cache directives, cookies, CSP, HSTS, and SEO headers.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HTTP Header Analyzer",
  url: `${SITE.url}/tools/http-header-analyzer`,
  description:
    "Free online HTTP header analyzer. Inspect response headers, analyze security headers, check CORS, cache directives, cookies, CSP, HSTS, and SEO headers.",
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
    { "@type": "ListItem", position: 3, name: "HTTP Header Analyzer", item: `${SITE.url}/tools/http-header-analyzer` },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this HTTP header analyzer free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zorviox HTTP Header Analyzer is completely free with no usage limits.",
      },
    },
    {
      "@type": "Question",
      name: "Does this tool affect my website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This tool only reads publicly available HTTP response headers. It does not modify anything on your website.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work with both HTTP and HTTPS websites?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool supports both HTTP and HTTPS URLs. If no protocol is specified, it defaults to HTTPS.",
      },
    },
    {
      "@type": "Question",
      name: "What security headers does the tool analyze?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tool analyzes HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, and cross-origin headers (COOP, CORP, COEP).",
      },
    },
    {
      "@type": "Question",
      name: "Can I check headers for localhost or internal URLs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The tool cannot access private, internal, or localhost URLs. It only analyzes publicly accessible websites.",
      },
    },
    {
      "@type": "Question",
      name: "How does the tool handle redirects?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tool follows redirect chains (301, 302, 303, 307, 308) and displays each hop with its status code and location. It also detects redirect loops and excessive chains.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export the analysis results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can export the results as JSON, CSV, or raw text for documentation or further analysis.",
      },
    },
    {
      "@type": "Question",
      name: "Does this tool store my URL?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The Zorviox HTTP Header Analyzer does not permanently store analyzed URLs or their responses. The tool performs a live HTTP request each time you analyze a URL.",
      },
    },
  ],
};

export default function HttpHeaderAnalyzerPage() {
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
                <span className="text-foreground">HTTP Header Analyzer</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              HTTP Header Analyzer
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Inspect HTTP response headers from any website. Analyze security headers, caching,
              CORS, cookies, CSP, HSTS, and SEO directives in one comprehensive tool.
            </p>
          </div>

          {/* Tool */}
          <HttpHeaderAnalyzerTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Guide to HTTP Headers
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What are HTTP headers?">
                <p>
                  HTTP headers are key-value pairs exchanged between a client (browser) and a
                  server during HTTP communication. <strong>Request headers</strong> are sent by
                  the browser and include information like the accepted content types, cookies,
                  and the referring page. <strong>Response headers</strong> are sent by the server
                  and include metadata about the response: content type, caching instructions,
                  security policies, and more.
                </p>
                <p>
                  HTTP headers control many aspects of how browsers handle content: whether it is
                  cached, whether it can be framed, which origins can access it, and how search
                  engines should treat it. Understanding response headers is essential for web
                  development, security, SEO, and performance optimization.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What does an HTTP Header Analyzer do?">
                <p>
                  An HTTP header analyzer fetches a URL and captures all response headers returned
                  by the server. It then parses these headers and provides analysis on security
                  configuration, caching behavior, CORS settings, cookie attributes, and SEO
                  directives.
                </p>
                <p>
                  The Zorviox HTTP Header Analyzer goes beyond simply displaying headers. It
                  interprets each header&apos;s value, explains its purpose, detects potential misconfigurations,
                  and provides actionable observations based on the actual response.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Important HTTP response headers">
                <div className="space-y-4">
                  <HeaderExplainer
                    header="Cache-Control"
                    value="public, max-age=3600"
                    explanation="Controls how the response is cached. 'public' allows any cache to store it. 'max-age=3600' means the response is fresh for one hour. Other common directives include 'no-store' (do not cache), 'no-cache' (revalidate before use), and 'private' (browser-only caching)."
                  />
                  <HeaderExplainer
                    header="Content-Type"
                    value="text/html; charset=UTF-8"
                    explanation="Specifies the media type and character encoding of the response. The browser uses this to determine how to render or process the content."
                  />
                  <HeaderExplainer
                    header="Content-Encoding"
                    value="br"
                    explanation="Indicates the compression algorithm applied to the response body. Common values include 'br' (Brotli), 'gzip', and 'deflate'. Compression reduces transfer size and improves load times."
                  />
                  <HeaderExplainer
                    header="Location"
                    value="https://example.com/new-page"
                    explanation="Used with redirect status codes (301, 302, 307, 308) to indicate the URL the browser should navigate to."
                  />
                  <HeaderExplainer
                    header="ETag"
                    value='"abc123"'
                    explanation="An entity tag used for cache validation. The browser can send this value back with a conditional request to check if the cached response is still valid."
                  />
                  <HeaderExplainer
                    header="Last-Modified"
                    value="Tue, 01 Jan 2025 00:00:00 GMT"
                    explanation="Indicates the date and time the resource was last modified. Used with conditional requests to validate cached responses."
                  />
                  <HeaderExplainer
                    header="Vary"
                    value="Accept-Encoding, Origin"
                    explanation="Tells caches which request headers to consider when storing different representations of the resource. For example, 'Vary: Accept-Encoding' means the cache should store separate versions for different compression encodings."
                  />
                  <HeaderExplainer
                    header="Strict-Transport-Security"
                    value="max-age=31536000; includeSubDomains; preload"
                    explanation="HSTS instructs browsers to only use HTTPS for future connections to this site. 'max-age' specifies the duration in seconds. 'includeSubDomains' extends the policy to all subdomains. 'preload' signals eligibility for browser HSTS preload lists."
                  />
                  <HeaderExplainer
                    header="Content-Security-Policy"
                    value="default-src 'self'; script-src 'self'"
                    explanation="Defines which sources the browser is allowed to load content from. A well-configured CSP can mitigate XSS and data injection attacks by restricting inline scripts, eval(), and untrusted sources."
                  />
                  <HeaderExplainer
                    header="X-Content-Type-Options"
                    value="nosniff"
                    explanation="Prevents the browser from MIME-type sniffing, which can lead to security issues. The only valid value is 'nosniff'."
                  />
                  <HeaderExplainer
                    header="X-Frame-Options"
                    value="SAMEORIGIN"
                    explanation="Controls whether the page can be embedded in iframes. 'DENY' prevents all framing. 'SAMEORIGIN' only allows framing by the same origin. Note: CSP frame-ancestors provides similar functionality in modern browsers."
                  />
                  <HeaderExplainer
                    header="Referrer-Policy"
                    value="strict-origin-when-cross-origin"
                    explanation="Controls how much referrer information is sent with subsequent requests. Different policies offer different privacy and security tradeoffs."
                  />
                  <HeaderExplainer
                    header="X-Robots-Tag"
                    value="noindex"
                    explanation="HTTP-level robots directives for search engine crawlers. Directives like 'noindex', 'nofollow', and 'nosnippet' function similarly to HTML meta robots tags."
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Security headers explained">
                <p>
                  Security headers are HTTP response headers that instruct browsers to enable or
                  restrict certain security features. They are an important layer of defense but
                  are not a complete security solution on their own.
                </p>
                <p>
                  The most impactful security headers include:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Strict-Transport-Security (HSTS)</strong> &mdash; forces HTTPS for future connections</li>
                  <li><strong>Content-Security-Policy (CSP)</strong> &mdash; restricts content sources to prevent XSS</li>
                  <li><strong>X-Content-Type-Options</strong> &mdash; prevents MIME-type sniffing</li>
                  <li><strong>X-Frame-Options</strong> &mdash; controls iframe embedding to prevent clickjacking</li>
                  <li><strong>Referrer-Policy</strong> &mdash; controls referrer information leakage</li>
                  <li><strong>Permissions-Policy</strong> &mdash; controls browser feature access</li>
                </ul>
                <p>
                  Missing security headers do not automatically mean a website is vulnerable. The
                  appropriate set of headers depends on the application&apos;s requirements and architecture.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="SEO headers and their impact">
                <p>
                  Several HTTP headers affect how search engines crawl and index pages:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>X-Robots-Tag</strong> &mdash; provides HTTP-level robots directives (noindex, nofollow, etc.)</li>
                  <li><strong>Link (canonical)</strong> &mdash; specifies the canonical URL via HTTP header</li>
                  <li><strong>Status codes</strong> &mdash; 200 (indexable), 301 (permanent redirect), 404 (not found), 500 (server error)</li>
                  <li><strong>HTTPS</strong> &mdash; HTTPS is a confirmed ranking signal for Google</li>
                  <li><strong>Redirect chains</strong> &mdash; long chains waste crawl budget and slow down page loads</li>
                </ul>
                <p>
                  Headers alone do not determine search rankings. They are one of many factors that
                  influence how search engines understand and process your pages.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Cache headers explained">
                <p>
                  Caching headers control how content is stored and reused by browsers, CDNs, and
                  other caches. Proper caching can significantly improve page load times and reduce
                  server load.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Cache-Control directives</h4>
                    <ul className="list-disc pl-5 space-y-1 text-[13px] text-muted-foreground">
                      <li><code className="rounded bg-muted px-1 text-[12px]">no-store</code> &mdash; do not store the response anywhere</li>
                      <li><code className="rounded bg-muted px-1 text-[12px]">no-cache</code> &mdash; store but revalidate before each use</li>
                      <li><code className="rounded bg-muted px-1 text-[12px]">public</code> &mdash; any cache can store the response</li>
                      <li><code className="rounded bg-muted px-1 text-[12px]">private</code> &mdash; only the browser can store the response</li>
                      <li><code className="rounded bg-muted px-1 text-[12px]">max-age=N</code> &mdash; response is fresh for N seconds</li>
                      <li><code className="rounded bg-muted px-1 text-[12px]">s-maxage=N</code> &mdash; shared cache (CDN) max-age</li>
                      <li><code className="rounded bg-muted px-1 text-[12px]">immutable</code> &mdash; response will never change</li>
                    </ul>
                  </div>
                  <p>
                    A common misconception is that <code className="rounded bg-muted px-1 text-[12px]">no-cache</code> means
                    &quot;do not cache&quot;. In reality, <code className="rounded bg-muted px-1 text-[12px]">no-cache</code> means the
                    response can be stored but must be revalidated before each use.
                    <code className="rounded bg-muted px-1 text-[12px]">no-store</code> is the directive that prevents caching entirely.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="CORS (Cross-Origin Resource Sharing)">
                <p>
                  CORS is a browser security mechanism that restricts how web pages from one
                  origin can request resources from a different origin. The server controls CORS
                  behavior through response headers.
                </p>
                <p>
                  The key CORS header is <code className="rounded bg-muted px-1 text-[12px]">Access-Control-Allow-Origin</code>,
                  which specifies which origins are allowed to access the resource. A value of <code className="rounded bg-muted px-1 text-[12px]">*</code> allows
                  any origin, while a specific origin restricts access to that domain.
                </p>
                <p>
                  When <code className="rounded bg-muted px-1 text-[12px]">Access-Control-Allow-Origin: *</code> is combined
                  with <code className="rounded bg-muted px-1 text-[12px]">Access-Control-Allow-Credentials: true</code>,
                  browsers will reject the request because wildcard origins cannot be used with
                  credentialed CORS requests.
                </p>
                <p>
                  CORS headers reflect the server&apos;s cross-origin policy. They do not inherently
                  indicate a vulnerability. The appropriate CORS configuration depends on the
                  application&apos;s requirements.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to check HTTP headers">
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Enter a URL in the HTTP Header Analyzer input field</li>
                  <li>Click &quot;Analyze Headers&quot;</li>
                  <li>Review the overview for status, response time, and basic info</li>
                  <li>Check the Security Headers section for HSTS, CSP, X-Content-Type-Options, and other security headers</li>
                  <li>Review the SEO Headers section for X-Robots-Tag, canonical links, and redirect behavior</li>
                  <li>Examine the Caching section for Cache-Control, ETag, and Last-Modified headers</li>
                  <li>Check CORS headers if your application makes cross-origin requests</li>
                  <li>Review cookies for Secure, HttpOnly, and SameSite attributes</li>
                  <li>Use the All Headers section to search and filter the complete header set</li>
                  <li>Export results as JSON, CSV, or raw text for documentation</li>
                </ol>
              </CollapsibleSection>

              <CollapsibleSection title="HTTP Header vs Meta Tags">
                <p>
                  Both HTTP headers and HTML meta tags can provide metadata about a page, but
                  they serve different purposes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>HTTP headers</strong> are sent by the server before the HTML content. They control caching, security policies, CORS, and can include robots directives via X-Robots-Tag.</li>
                  <li><strong>Meta tags</strong> are embedded in the HTML document. They control viewport, description, Open Graph data, and robots directives via the meta robots tag.</li>
                </ul>
                <p>
                  When both HTTP headers and meta tags provide conflicting directives (e.g.,
                  X-Robots-Tag: noindex vs meta robots: index), search engines typically apply
                  the most restrictive directive.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Common HTTP header problems">
                <div className="space-y-3">
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Missing HSTS on HTTPS sites</h4>
                    <p className="text-[13px] text-muted-foreground">
                      HTTPS sites without HSTS allow the first connection to potentially be intercepted.
                      HSTS prevents this by instructing browsers to only use HTTPS.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Overly permissive CSP</h4>
                    <p className="text-[13px] text-muted-foreground">
                      A CSP with <code className="rounded bg-muted px-1 text-[12px]">unsafe-inline</code> or <code className="rounded bg-muted px-1 text-[12px]">unsafe-eval</code> significantly
                      reduces the protection the policy provides against XSS.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Missing X-Content-Type-Options</h4>
                    <p className="text-[13px] text-muted-foreground">
                      Without nosniff, the browser may perform MIME-type sniffing, which can lead to
                      security issues when the declared content type differs from the actual content.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Cookies without Secure or HttpOnly</h4>
                    <p className="text-[13px] text-muted-foreground">
                      Cookies without the Secure attribute may be sent over unencrypted connections.
                      Cookies without HttpOnly are accessible to JavaScript, which can be exploited
                      in XSS attacks.
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="Is this HTTP header analyzer free?"
                    answer="Yes. Zorviox HTTP Header Analyzer is completely free with no usage limits."
                  />
                  <FaqItem
                    question="Does this tool affect my website?"
                    answer="No. This tool only reads publicly available HTTP response headers. It does not modify anything on your website."
                  />
                  <FaqItem
                    question="Does it work with both HTTP and HTTPS websites?"
                    answer="Yes. The tool supports both HTTP and HTTPS URLs. If no protocol is specified, it defaults to HTTPS."
                  />
                  <FaqItem
                    question="What security headers does the tool analyze?"
                    answer="The tool analyzes HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, and cross-origin headers (COOP, CORP, COEP)."
                  />
                  <FaqItem
                    question="Can I check headers for localhost or internal URLs?"
                    answer="No. The tool cannot access private, internal, or localhost URLs. It only analyzes publicly accessible websites."
                  />
                  <FaqItem
                    question="How does the tool handle redirects?"
                    answer="The tool follows redirect chains (301, 302, 303, 307, 308) and displays each hop with its status code and location."
                  />
                  <FaqItem
                    question="Can I export the analysis results?"
                    answer="Yes. You can export the results as JSON, CSV, or raw text for documentation or further analysis."
                  />
                  <FaqItem
                    question="Does this tool store my URL?"
                    answer="No. The Zorviox HTTP Header Analyzer does not permanently store analyzed URLs or their responses."
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

function HeaderExplainer({
  header,
  value,
  explanation,
}: {
  header: string;
  value: string;
  explanation: string;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-2">
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] font-medium text-foreground">{header}</code>
        <span className="font-mono text-[11px] text-muted-foreground">{value}</span>
      </div>
      <p className="text-[13px] text-muted-foreground">{explanation}</p>
    </div>
  );
}
