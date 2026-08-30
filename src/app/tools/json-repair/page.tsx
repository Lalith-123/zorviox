import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { JsonRepairTool } from "@/components/tools/json-repair-tool";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "JSON Repair Tool \u2014 Fix & Validate Invalid JSON | Zorviox",
  description:
    "Free online tool to repair malformed JSON. Fix trailing commas, missing quotes, unquoted properties, and syntax errors. Client-side processing for privacy.",
  alternates: {
    canonical: `${SITE.url}/tools/json-repair`,
  },
  openGraph: {
    title: "JSON Repair Tool \u2014 Fix & Validate Invalid JSON | Zorviox",
    description:
      "Free online tool to repair malformed JSON. Fix trailing commas, missing quotes, unquoted properties, and syntax errors.",
    url: `${SITE.url}/tools/json-repair`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Repair Tool \u2014 Fix & Validate Invalid JSON | Zorviox",
    description:
      "Free online tool to repair malformed JSON. Fix trailing commas, missing quotes, unquoted properties, and syntax errors.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON Repair Tool",
  url: `${SITE.url}/tools/json-repair`,
  description:
    "Free online tool to repair malformed JSON. Fix trailing commas, missing quotes, unquoted properties, and syntax errors. Client-side processing for privacy.",
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
      name: "JSON Repair Tool",
      item: `${SITE.url}/tools/json-repair`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this JSON repair tool free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zorviox JSON Repair Tool is completely free with no usage limits.",
      },
    },
    {
      "@type": "Question",
      name: "Is my JSON data sent to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All processing happens locally in your browser. Your JSON is never sent to any server.",
      },
    },
    {
      "@type": "Question",
      name: "Can this tool fix any broken JSON?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tool can fix many common issues like trailing commas, missing quotes, and unquoted properties. However, some malformed JSON is ambiguous and cannot be safely repaired without understanding your intended structure.",
      },
    },
    {
      "@type": "Question",
      name: "What is a trailing comma?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A trailing comma is a comma after the last element in an object or array, like {\"a\": 1,}. This is invalid JSON but common in JavaScript. The tool removes these automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Why can't I use single quotes in JSON?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JSON specification requires double quotes for strings. Single quotes are valid in JavaScript but not in JSON. The tool can convert single-quoted strings to double-quoted when unambiguous.",
      },
    },
  ],
};

export default function JsonRepairPage() {
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
                <span className="text-foreground">JSON Repair Tool</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              JSON Repair Tool
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Paste malformed JSON and get it fixed instantly. The tool identifies syntax errors,
              applies safe repairs, and explains every change.
            </p>
          </div>

          {/* Tool */}
          <JsonRepairTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Learn about JSON
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is JSON?">
                <p>
                  JSON (JavaScript Object Notation) is a lightweight data interchange format. It
                  is easy for humans to read and write, and easy for machines to parse and
                  generate. JSON is built on two structures:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Objects:</strong> collections of
                    key-value pairs, written as{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      {`{"key": "value"}`}
                    </code>
                  </li>
                  <li>
                    <strong className="text-foreground">Arrays:</strong> ordered lists of
                    values, written as{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      [1, 2, 3]
                    </code>
                  </li>
                </ul>
                <p>
                  JSON is widely used for API responses, configuration files, and data storage.
                  It became the de facto standard for web APIs, replacing XML in most modern
                  applications.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What does a JSON repair tool do?">
                <p>
                  A JSON repair tool analyzes malformed JSON, identifies syntax errors, and
                  applies safe corrections. Unlike a simple parser that just says &quot;invalid
                  JSON,&quot; a repair tool explains what went wrong and fixes what it can.
                </p>
                <p>
                  The goal is to preserve your data while fixing syntax. A good repair tool
                  never silently changes values or types — it only makes corrections that are
                  unambiguous and clearly required by the JSON specification.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Why is my JSON invalid?">
                <p>Common reasons JSON fails to parse:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Trailing commas:</strong> A comma after
                    the last element in an object or array
                  </li>
                  <li>
                    <strong className="text-foreground">Missing commas:</strong> No comma between
                    object properties or array elements
                  </li>
                  <li>
                    <strong className="text-foreground">Unquoted property names:</strong>{" "}
                    JavaScript allows{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      {`{name: "John"}`}
                    </code>
                    , but JSON requires{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      {`{"name": "John"}`}
                    </code>
                  </li>
                  <li>
                    <strong className="text-foreground">Single quotes:</strong> JSON requires
                    double quotes for all strings
                  </li>
                  <li>
                    <strong className="text-foreground">Comments:</strong> JSON does not support
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      {`// or /* */`}
                    </code>{" "}
                    comments
                  </li>
                  <li>
                    <strong className="text-foreground">Missing colons:</strong> Between property
                    names and values
                  </li>
                  <li>
                    <strong className="text-foreground">Invalid escape sequences:</strong>{" "}
                    Characters like{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">\c</code>{" "}
                    are not valid JSON escapes
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Common JSON errors">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Trailing comma</h4>
                    <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`// Invalid
{
  "name": "John",
  "age": 25,    // trailing comma
}

// Valid
{
  "name": "John",
  "age": 25
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Missing comma</h4>
                    <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`// Invalid
{
  "name": "John"
  "age": 25     ← missing comma
}

// Valid
{
  "name": "John",
  "age": 25
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">Unquoted property</h4>
                    <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`// Invalid (JavaScript)
{
  name: "John"
}

// Valid JSON
{
  "name": "John"
}`}
                    </pre>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Trailing commas">
                <p>
                  Trailing commas are the most common JSON syntax error. They occur when a
                  comma appears after the last element in an object or array. While valid in
                  JavaScript, they are invalid in JSON.
                </p>
                <p>
                  This often happens when developers copy code from JavaScript into JSON files
                  or when items are removed from the end of a list without removing the
                  trailing comma.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Missing commas">
                <p>
                  Missing commas occur when object properties or array elements are not
                  separated by commas. This typically happens when adding new properties
                  or when copying and pasting values.
                </p>
                <p>
                  JSON requires commas between every element in an object or array, except
                  after the last element.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Single vs double quotes">
                <p>
                  JSON requires double quotes for all strings — both property names and
                  string values. Single quotes are not valid in JSON.
                </p>
                <p>
                  This is a common source of confusion because JavaScript allows both.
                  When copying data from JavaScript code into JSON, single quotes must be
                  converted to double quotes.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Unquoted property names">
                <p>
                  In JavaScript, you can write{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                    {`{name: "John"}`}
                  </code>
                  . In JSON, property names must always be enclosed in double quotes:
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 text-[12px] leading-relaxed text-foreground">
{`{"name": "John"}`}
                </pre>
              </CollapsibleSection>

              <CollapsibleSection title="JSON vs JavaScript objects">
                <p>
                  JSON is a data format, not a programming language. While it is derived
                  from JavaScript object syntax, it has stricter rules:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>No trailing commas</li>
                  <li>No single quotes</li>
                  <li>No unquoted property names</li>
                  <li>No comments</li>
                  <li>No undefined values</li>
                  <li>No functions</li>
                  <li>No NaN or Infinity</li>
                </ul>
                <p>
                  Many &quot;invalid JSON&quot; errors come from pasting JavaScript object literals
                  directly into JSON files or API requests.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to validate JSON">
                <p>There are several ways to validate JSON:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Browser console:</strong> Use{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      JSON.parse(yourString)
                    </code>
                  </li>
                  <li>
                    <strong className="text-foreground">Command line:</strong> Use{" "}
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">
                      python -m json.tool file.json
                    </code>
                  </li>
                  <li>
                    <strong className="text-foreground">Online tools:</strong> Use this Zorviox
                    JSON Repair Tool for detailed error reporting and automatic fixes
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="JSON formatting vs JSON repair">
                <p>
                  <strong className="text-foreground">Formatting</strong> (or pretty-printing)
                  takes valid JSON and makes it more readable by adding indentation and
                  line breaks. It does not change the data.
                </p>
                <p>
                  <strong className="text-foreground">Repair</strong> takes invalid JSON,
                  identifies syntax errors, and applies corrections to make it valid. This
                  may change the structure but should not change the data semantics.
                </p>
                <p>
                  This tool does both: it repairs invalid JSON, and once valid, you can
                  format or minify the result.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="Is this JSON repair tool free?"
                    answer="Yes. Zorviox JSON Repair Tool is completely free with no usage limits."
                  />
                  <FaqItem
                    question="Is my JSON data sent to a server?"
                    answer="No. All processing happens locally in your browser. Your JSON is never sent to any server."
                  />
                  <FaqItem
                    question="Can this tool fix any broken JSON?"
                    answer="The tool can fix many common issues like trailing commas, missing quotes, and unquoted properties. However, some malformed JSON is ambiguous and cannot be safely repaired without understanding your intended structure."
                  />
                  <FaqItem
                    question="What is a trailing comma?"
                    answer='A trailing comma is a comma after the last element in an object or array, like {"a": 1,}. This is invalid JSON but common in JavaScript. The tool removes these automatically.'
                  />
                  <FaqItem
                    question="Why can't I use single quotes in JSON?"
                    answer="JSON specification requires double quotes for strings. Single quotes are valid in JavaScript but not in JSON. The tool can convert single-quoted strings to double-quoted when unambiguous."
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
