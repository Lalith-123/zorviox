import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { JsonSchemaGeneratorTool } from "@/components/tools/json-schema-generator-tool";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "JSON Schema Generator \u2014 Generate JSON Schema from JSON | Zorviox",
  description:
    "Free online tool to generate JSON Schema from JSON data. Supports Draft 2020-12 and Draft-07. Handles nested objects, arrays, multiple samples, and type inference. Client-side processing.",
  alternates: {
    canonical: `${SITE.url}/tools/json-schema-generator`,
  },
  openGraph: {
    title: "JSON Schema Generator \u2014 Generate JSON Schema from JSON | Zorviox",
    description:
      "Free online tool to generate JSON Schema from JSON data. Supports Draft 2020-12 and Draft-07. Handles nested objects, arrays, multiple samples, and type inference.",
    url: `${SITE.url}/tools/json-schema-generator`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Generator \u2014 Generate JSON Schema from JSON | Zorviox",
    description:
      "Free online tool to generate JSON Schema from JSON data. Supports Draft 2020-12 and Draft-07. Handles nested objects, arrays, multiple samples, and type inference.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON Schema Generator",
  url: `${SITE.url}/tools/json-schema-generator`,
  description:
    "Free online tool to generate JSON Schema from JSON data. Supports Draft 2020-12 and Draft-07. Handles nested objects, arrays, multiple samples, and type inference. Client-side processing.",
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
      name: "JSON Schema Generator",
      item: `${SITE.url}/tools/json-schema-generator`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this JSON Schema Generator free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zorviox JSON Schema Generator is completely free with no usage limits.",
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
      name: "What JSON Schema drafts are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tool supports JSON Schema Draft 2020-12 and Draft-07.",
      },
    },
    {
      "@type": "Question",
      name: "Can I provide multiple JSON samples?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can provide multiple JSON samples to get more accurate type inference, especially for optional properties and nullable values.",
      },
    },
    {
      "@type": "Question",
      name: "How does the tool handle empty arrays?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When an array is empty, the tool generates an unconstrained array schema since the item type cannot be inferred from the sample.",
      },
    },
  ],
};

export default function JsonSchemaGeneratorPage() {
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
                <span className="text-foreground">JSON Schema Generator</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              JSON Schema Generator
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Paste JSON data and generate a valid JSON Schema. Supports multiple samples, nested
              objects, arrays, and type inference.
            </p>
          </div>

          {/* Tool */}
          <JsonSchemaGeneratorTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Learn about JSON Schema
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is JSON Schema?">
                <p>
                  JSON Schema is a declarative language that allows you to define the structure,
                  content, and format of JSON data. It is used to validate JSON data, generate
                  interactive forms, and document APIs.
                </p>
                <p>
                  A JSON Schema describes what is required in a JSON document, what types values
                  should have, and how values should be constrained. It does not modify the
                  data itself.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a JSON Schema Generator?">
                <p>
                  A JSON Schema Generator analyzes JSON data and produces a JSON Schema that
                  describes its structure. Instead of writing a schema by hand, you provide
                  example data and the generator infers the types, required fields, and structure.
                </p>
                <p>
                  This is useful when you have existing JSON data and need to create a schema
                  for validation, documentation, or code generation.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="JSON Schema types">
                <p>JSON Schema supports the following basic types:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">string:</strong> Text values
                  </li>
                  <li>
                    <strong className="text-foreground">number:</strong> Numeric values including decimals
                  </li>
                  <li>
                    <strong className="text-foreground">integer:</strong> Whole numbers only
                  </li>
                  <li>
                    <strong className="text-foreground">boolean:</strong> true or false
                  </li>
                  <li>
                    <strong className="text-foreground">array:</strong> Ordered list of values
                  </li>
                  <li>
                    <strong className="text-foreground">object:</strong> Collection of key-value pairs
                  </li>
                  <li>
                    <strong className="text-foreground">null:</strong> Empty or null value
                  </li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="Required vs optional properties">
                <p>
                  In JSON Schema, you can specify which properties in an object are required.
                  A property is required if it must be present for the JSON to be valid.
                </p>
                <p>
                  When generating a schema from multiple samples, a property is marked as
                  required only if it appears in every sample. Properties that appear in some
                  samples but not others are marked as optional.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Arrays in JSON Schema">
                <p>
                  Arrays in JSON Schema are described using the <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">items</code> keyword.
                  This defines what type of values the array can contain.
                </p>
                <p>
                  For homogeneous arrays (all items of the same type), the items schema describes
                  that type. For heterogeneous arrays (items of different types), the items schema
                  can use <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">anyOf</code> or a type
                  array to represent the possible types.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="additionalProperties">
                <p>
                  The <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">additionalProperties</code> keyword
                  controls whether an object can have properties not defined in the schema.
                </p>
                <p>
                  When set to <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">false</code>, the object
                  can only have the properties explicitly defined. When set to <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">true</code> (or
                  omitted), additional properties are allowed.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="JSON Schema drafts">
                <p>
                  JSON Schema has several versions called drafts. The most commonly used are:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Draft 2020-12:</strong> The latest version with new features like
                    prefixItems and dynamicRef
                  </li>
                  <li>
                    <strong className="text-foreground">Draft-07:</strong> Widely supported version used in many tools
                  </li>
                </ul>
                <p>
                  This tool supports both drafts. Draft 2020-12 is recommended for new projects
                  unless you need compatibility with older tools.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="JSON Schema validation">
                <p>
                  JSON Schema validation checks whether a JSON document conforms to a schema.
                  It verifies types, required fields, constraints, and structure.
                </p>
                <p>
                  This tool validates your input against the generated schema to ensure the
                  schema accurately represents your data.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Common JSON Schema mistakes">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Confusing null with missing
                    </h4>
                    <p>
                      A missing property and a property set to null are not the same. This tool
                      distinguishes between them when generating schemas from multiple samples.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Over-constraining from a single sample
                    </h4>
                    <p>
                      A single example does not prove that future values must have the same
                      type. This tool uses conservative inference to avoid over-constraining.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Using oneOf incorrectly
                    </h4>
                    <p>
                      <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">oneOf</code> requires
                      exactly one subschema to match. For simple type unions, a type array
                      is often more appropriate.
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="Is this JSON Schema Generator free?"
                    answer="Yes. Zorviox JSON Schema Generator is completely free with no usage limits."
                  />
                  <FaqItem
                    question="Is my JSON data sent to a server?"
                    answer="No. All processing happens locally in your browser. Your JSON is never sent to any server."
                  />
                  <FaqItem
                    question="What JSON Schema drafts are supported?"
                    answer="The tool supports JSON Schema Draft 2020-12 and Draft-07."
                  />
                  <FaqItem
                    question="Can I provide multiple JSON samples?"
                    answer="Yes. You can provide multiple JSON samples to get more accurate type inference, especially for optional properties and nullable values."
                  />
                  <FaqItem
                    question="How does the tool handle empty arrays?"
                    answer="When an array is empty, the tool generates an unconstrained array schema since the item type cannot be inferred from the sample."
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
