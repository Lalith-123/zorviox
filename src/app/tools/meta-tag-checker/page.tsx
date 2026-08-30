import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { MetaTagCheckerTool } from "@/components/tools/meta-tag-checker-tool";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Meta Tag Checker — Analyze Website SEO Tags | Zorviox",
  description:
    "Free online tool to check any website's meta tags, Open Graph data, Twitter cards, and SEO metadata. Instant analysis with actionable insights.",
  alternates: {
    canonical: `${SITE.url}/tools/meta-tag-checker`,
  },
  openGraph: {
    title: "Meta Tag Checker — Analyze Website SEO Tags | Zorviox",
    description:
      "Free online tool to check any website's meta tags, Open Graph data, Twitter cards, and SEO metadata.",
    url: `${SITE.url}/tools/meta-tag-checker`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Tag Checker — Analyze Website SEO Tags | Zorviox",
    description:
      "Free online tool to check any website's meta tags, Open Graph data, Twitter cards, and SEO metadata.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Meta Tag Checker",
  url: `${SITE.url}/tools/meta-tag-checker`,
  description:
    "Free online tool to check any website's meta tags, Open Graph data, Twitter cards, and SEO metadata.",
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
      name: "Meta Tag Checker",
      item: `${SITE.url}/tools/meta-tag-checker`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this meta tag checker free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zorviox Meta Tag Checker is completely free with no usage limits.",
      },
    },
    {
      "@type": "Question",
      name: "Does this tool affect my website's SEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This tool only reads publicly available HTML. It does not modify anything on your website.",
      },
    },
    {
      "@type": "Question",
      name: "Why can't I check some URLs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tool cannot access private or local URLs (like localhost or internal network addresses). It also cannot check non-HTML pages.",
      },
    },
    {
      "@type": "Question",
      name: "What does the metadata health score mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The score is a simple checklist based on the presence of essential meta tags. It is not a Google ranking score and does not predict search rankings.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I check my meta tags?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Check after making changes to your site's metadata, when launching a new page, or periodically as part of routine SEO maintenance.",
      },
    },
  ],
};

export default function MetaTagCheckerPage() {
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
                <span className="text-foreground">Meta Tag Checker</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Meta Tag Checker
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Analyze the important SEO and social metadata of any public webpage. Enter a URL
              below to see what search engines and social platforms see.
            </p>
          </div>

          {/* Tool */}
          <MetaTagCheckerTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Learn about meta tags
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is a Meta Tag Checker?">
                <p>
                  A meta tag checker is a tool that reads the HTML of a webpage and shows you the
                  metadata that search engines and social platforms use to understand and display
                  your content. This includes title tags, meta descriptions, Open Graph tags, and
                  more.
                </p>
                <p>
                  By analyzing these elements, you can identify missing or poorly optimized metadata
                  that may be affecting how your website appears in Google search results or when
                  shared on social media.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What are meta tags?">
                <p>
                  Meta tags are HTML elements placed in the{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                    &lt;head&gt;
                  </code>{" "}
                  section of a web page. They provide information about the page to search engines,
                  browsers, and social platforms. Unlike visible page content, meta tags are not
                  displayed to users — but they play a critical role in how your website is indexed
                  and shared.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Why are meta tags important for SEO?">
                <p>
                  Meta tags directly influence how your website appears in search results and when
                  shared on platforms like Facebook, Twitter, and LinkedIn. Well-crafted meta tags
                  can improve your click-through rates and help search engines understand your content.
                </p>
                <p>They serve three primary purposes:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Search visibility:</strong> Help search
                    engines understand and rank your content
                  </li>
                  <li>
                    <strong className="text-foreground">Social sharing:</strong> Control how your
                    page appears when shared on social platforms
                  </li>
                  <li>
                    <strong className="text-foreground">Browser behavior:</strong> Control viewport,
                    charset, and other rendering settings
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="What meta tags should a website have?">
                <p>
                  At minimum, every web page should include these essential meta tags:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Title tag:</strong> The page title shown in
                    search results and browser tabs
                  </li>
                  <li>
                    <strong className="text-foreground">Meta description:</strong> A brief summary
                    shown below the title in search results
                  </li>
                  <li>
                    <strong className="text-foreground">Viewport:</strong> Ensures proper rendering
                    on mobile devices
                  </li>
                  <li>
                    <strong className="text-foreground">Charset:</strong> Declares the character
                    encoding (usually UTF-8)
                  </li>
                  <li>
                    <strong className="text-foreground">Canonical URL:</strong> Tells search engines
                    the preferred version of the page
                  </li>
                </ul>
                <p>
                  For better social sharing, also include Open Graph and Twitter Card tags.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to write a good title tag">
                <p>A good title tag should be:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Between 30 and 60 characters (longer titles may be truncated in search results)</li>
                  <li>Unique for each page on your website</li>
                  <li>Descriptive of the page content</li>
                  <li>Include your primary keyword naturally</li>
                  <li>Include your brand name, typically at the end</li>
                </ul>
                <p>
                  Title length guidelines are practical suggestions, not strict rules. Google may
                  display titles differently based on the search query and context.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to write a good meta description">
                <p>A good meta description should be:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Between 120 and 160 characters (longer descriptions may be truncated)</li>
                  <li>A compelling summary of the page content</li>
                  <li>Include relevant keywords naturally</li>
                  <li>Unique for each page</li>
                  <li>Encourage users to click through from search results</li>
                </ul>
                <p>
                  Avoid keyword stuffing or writing descriptions that don&apos;t match the page
                  content. Google may rewrite descriptions that seem spammy or inaccurate.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is Open Graph?">
                <p>
                  Open Graph is a protocol originally created by Facebook that allows web pages to
                  become rich objects in social graphs. When you share a link on Facebook, LinkedIn,
                  or other platforms, the Open Graph tags determine what title, description, and
                  image are displayed.
                </p>
                <p>
                  The most important Open Graph tags are{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">og:title</code>,{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                    og:description
                  </code>
                  ,{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">og:image</code>,
                  and{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">og:url</code>.
                  Without these tags, social platforms may display incomplete or incorrectly
                  formatted previews of your content.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a canonical URL?">
                <p>
                  A canonical URL tells search engines which version of a page is the preferred one
                  when multiple URLs lead to the same or similar content. This helps prevent
                  duplicate content issues.
                </p>
                <p>
                  For example, if your page is accessible at both{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                    example.com/page
                  </code>{" "}
                  and{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                    example.com/page/
                  </code>
                  , the canonical tag tells Google which one to index. Without a canonical tag,
                  search engines may treat these as separate pages, diluting your SEO authority.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Common meta tag mistakes">
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Missing title or description:</strong>{" "}
                    Every page should have both. These are the first things search engines look at.
                  </li>
                  <li>
                    <strong className="text-foreground">Duplicate titles across pages:</strong>{" "}
                    Each page needs a unique title that accurately describes its content.
                  </li>
                  <li>
                    <strong className="text-foreground">Overly long titles:</strong> Titles over
                    ~60 characters are often truncated in search results, potentially cutting off
                    important information.
                  </li>
                  <li>
                    <strong className="text-foreground">Missing Open Graph tags:</strong> Without
                    these, your social media shares will look incomplete or use fallback content.
                  </li>
                  <li>
                    <strong className="text-foreground">Missing viewport tag:</strong> Your site
                    won&apos;t render properly on mobile devices, which affects both user experience
                    and mobile search rankings.
                  </li>
                  <li>
                    <strong className="text-foreground">Keyword stuffing:</strong> Unnatural keyword
                    repetition in titles and descriptions can make your content look spammy and may
                    hurt rather than help SEO.
                  </li>
                  <li>
                    <strong className="text-foreground">Missing canonical URL:</strong> Can lead to
                    duplicate content issues where search engines don&apos;t know which version to
                    index.
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="Is this meta tag checker free?"
                    answer="Yes. Zorviox Meta Tag Checker is completely free with no usage limits."
                  />
                  <FaqItem
                    question="Does this tool affect my website's SEO?"
                    answer="No. This tool only reads publicly available HTML. It does not modify anything on your website."
                  />
                  <FaqItem
                    question="Why can't I check some URLs?"
                    answer="The tool cannot access private or local URLs (like localhost or internal network addresses). It also cannot check non-HTML pages."
                  />
                  <FaqItem
                    question="What does the metadata health score mean?"
                    answer="The score is a simple checklist based on the presence of essential meta tags. It is not a Google ranking score and does not predict search rankings."
                  />
                  <FaqItem
                    question="How often should I check my meta tags?"
                    answer="Check after making changes to your site's metadata, when launching a new page, or periodically as part of routine SEO maintenance."
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
