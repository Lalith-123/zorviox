import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { DnsLookupTool } from "@/components/tools/dns-lookup-tool";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { FaqItem } from "@/components/shared/faq-item";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "DNS Lookup Tool \u2014 Check A, AAAA, MX, CNAME & More | Zorviox",
  description:
    "Free online DNS lookup tool. Check A, AAAA, MX, CNAME, NS, TXT, SOA, CAA, SRV, and PTR records. Reverse DNS lookup, DNSSEC detection, and comprehensive diagnostics.",
  alternates: {
    canonical: `${SITE.url}/tools/dns-lookup`,
  },
  openGraph: {
    title: "DNS Lookup Tool \u2014 Check A, AAAA, MX, CNAME & More | Zorviox",
    description:
      "Free online DNS lookup tool. Check A, AAAA, MX, CNAME, NS, TXT, SOA, CAA, SRV, and PTR records. Reverse DNS lookup and comprehensive diagnostics.",
    url: `${SITE.url}/tools/dns-lookup`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DNS Lookup Tool \u2014 Check A, AAAA, MX, CNAME & More | Zorviox",
    description:
      "Free online DNS lookup tool. Check A, AAAA, MX, CNAME, NS, TXT, SOA, CAA, SRV, and PTR records. Reverse DNS lookup and comprehensive diagnostics.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "DNS Lookup Tool",
  url: `${SITE.url}/tools/dns-lookup`,
  description:
    "Free online DNS lookup tool. Check A, AAAA, MX, CNAME, NS, TXT, SOA, CAA, SRV, and PTR records.",
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
      name: "DNS Lookup Tool",
      item: `${SITE.url}/tools/dns-lookup`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a DNS lookup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A DNS lookup is the process of querying the Domain Name System to translate a domain name into an IP address or to retrieve specific DNS records like MX, CNAME, NS, and TXT records.",
      },
    },
    {
      "@type": "Question",
      name: "What is an A record in DNS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An A record maps a domain name to an IPv4 address. For example, example.com might have an A record pointing to 93.184.216.34.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between NXDOMAIN and NOERROR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NXDOMAIN means the domain does not exist. NOERROR with no records means the domain exists but has no records of the requested type. This is an important distinction in DNS diagnostics.",
      },
    },
    {
      "@type": "Question",
      name: "What is a CNAME record?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CNAME (Canonical Name) record aliases one domain name to another. For example, www.example.com might be a CNAME pointing to example.com.",
      },
    },
    {
      "@type": "Question",
      name: "What is an MX record?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An MX (Mail Exchange) record specifies the mail server responsible for receiving email for a domain. Multiple MX records can exist with different priorities.",
      },
    },
    {
      "@type": "Question",
      name: "What does TTL mean in DNS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TTL (Time To Live) is the number of seconds a DNS record should be cached by resolvers. After the TTL expires, the resolver must query the authoritative server again.",
      },
    },
    {
      "@type": "Question",
      name: "Can I do a reverse DNS lookup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Enter an IP address (like 8.8.8.8) and select PTR record type to perform a reverse DNS lookup, which returns the hostname associated with the IP address.",
      },
    },
  ],
};

export default function DnsLookupPage() {
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
                <span className="text-foreground">DNS Lookup</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              DNS Lookup Tool
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Inspect DNS records for any domain. Check A, AAAA, MX, CNAME, NS, TXT, SOA,
              CAA, SRV, and PTR records with detailed diagnostics.
            </p>
          </div>

          {/* Tool */}
          <DnsLookupTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Learn about DNS
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is DNS?">
                <p>
                  DNS (Domain Name System) is the phonebook of the Internet. It translates
                  human-readable domain names like <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">example.com</code> into
                  IP addresses that computers use to identify each other on the network.
                </p>
                <p>
                  Without DNS, you would need to remember IP addresses like <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">93.184.216.34</code> instead
                  of memorable domain names.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a DNS lookup?">
                <p>
                  A DNS lookup is the process of querying the Domain Name System to retrieve
                  information about a domain. This can include translating a domain name to an
                  IP address (forward lookup) or translating an IP address back to a domain
                  name (reverse lookup).
                </p>
                <p>
                  DNS lookups are fundamental to how the Internet works. Every time you visit
                  a website, your browser performs a DNS lookup to find the server&apos;s IP address.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="DNS record types explained">
                <div className="space-y-4">
                  <RecordTypeExplainer
                    type="A"
                    title="A Record"
                    description="Maps a domain name to an IPv4 address. This is the most fundamental DNS record type."
                    example="example.com → 93.184.216.34"
                  />
                  <RecordTypeExplainer
                    type="AAAA"
                    title="AAAA Record"
                    description="Maps a domain name to an IPv6 address. IPv6 addresses are longer and use hexadecimal notation."
                    example="example.com → 2606:2800:220:1:248:1893:25c8:1946"
                  />
                  <RecordTypeExplainer
                    type="CNAME"
                    title="CNAME Record"
                    description="Creates an alias from one domain name to another. The target domain must have its own A or AAAA record."
                    example="www.example.com → example.com"
                  />
                  <RecordTypeExplainer
                    type="MX"
                    title="MX Record"
                    description="Specifies the mail server responsible for receiving email. Multiple MX records can exist with different priorities. Lower numbers indicate higher priority."
                    example="10 mail.example.com, 20 backup.example.com"
                  />
                  <RecordTypeExplainer
                    type="NS"
                    title="NS Record"
                    description="Identifies the authoritative name servers for a domain. These servers hold the actual DNS records."
                    example="ns1.example.com, ns2.example.com"
                  />
                  <RecordTypeExplainer
                    type="TXT"
                    title="TXT Record"
                    description="Stores arbitrary text information. Commonly used for SPF, DKIM, domain verification, and other purposes."
                    example="v=spf1 include:_spf.google.com ~all"
                  />
                  <RecordTypeExplainer
                    type="SOA"
                    title="SOA Record"
                    description="Contains administrative information about the DNS zone, including the primary name server, responsible person, serial number, and timing parameters."
                    example="ns1.example.com admin.example.com 2024010101 3600 900 604800 86400"
                  />
                  <RecordTypeExplainer
                    type="CAA"
                    title="CAA Record"
                    description="Specifies which Certificate Authorities (CAs) are authorized to issue SSL/TLS certificates for the domain."
                    example="0 issue letsencrypt.org"
                  />
                  <RecordTypeExplainer
                    type="SRV"
                    title="SRV Record"
                    description="Specifies the host and port for specific services. Used by protocols like SIP, XMPP, and Minecraft."
                    example="10 5 443 service.example.com"
                  />
                  <RecordTypeExplainer
                    type="PTR"
                    title="PTR Record"
                    description="Used for reverse DNS lookups. Maps an IP address back to a domain name."
                    example="8.8.8.8 → dns.google"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="What does TTL mean?">
                <p>
                  TTL (Time To Live) is the number of seconds that a DNS record should be
                  cached by DNS resolvers. After the TTL expires, the resolver must query the
                  authoritative DNS server again to get fresh data.
                </p>
                <p>
                  A TTL of 300 seconds means resolvers will cache the record for 5 minutes.
                  Lower TTL values mean changes propagate faster but increase DNS query load.
                  Higher TTL values reduce load but slow down propagation of changes.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is NXDOMAIN?">
                <p>
                  NXDOMAIN (Non-Existent Domain) is a DNS response code indicating that the
                  queried domain name does not exist in the DNS. This means no DNS records
                  are configured for that domain.
                </p>
                <p>
                  It&apos;s important to distinguish NXDOMAIN from NOERROR with no records. A
                  NOERROR response with an empty answer section means the domain exists but
                  has no records of the requested type. NXDOMAIN means the domain itself
                  does not exist.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is DNSSEC?">
                <p>
                  DNSSEC (DNS Security Extensions) adds cryptographic signatures to DNS records.
                  These signatures allow resolvers to verify that DNS responses are authentic
                  and have not been tampered with.
                </p>
                <p>
                  DNSSEC-related record types include DNSKEY, DS, RRSIG, NSEC, and NSEC3.
                  Finding DNSSEC records means DNSSEC-related records are present, but it does
                  not automatically mean DNSSEC validation is successful.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How DNS resolution works">
                <ol className="ml-5 list-decimal space-y-2">
                  <li>
                    <strong className="text-foreground">Query:</strong> Your device sends a DNS query to a recursive resolver.
                  </li>
                  <li>
                    <strong className="text-foreground">Cache check:</strong> The resolver checks its cache. If found, it returns the cached result.
                  </li>
                  <li>
                    <strong className="text-foreground">Root query:</strong> If not cached, the resolver queries a root name server.
                  </li>
                  <li>
                    <strong className="text-foreground">TLD query:</strong> The root server directs the resolver to the TLD (Top-Level Domain) server.
                  </li>
                  <li>
                    <strong className="text-foreground">Authoritative query:</strong> The TLD server directs the resolver to the authoritative name server.
                  </li>
                  <li>
                    <strong className="text-foreground">Response:</strong> The authoritative server returns the answer, which the resolver caches and returns to your device.
                  </li>
                </ol>
              </CollapsibleSection>

              <CollapsibleSection title="Common DNS problems">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      NXDOMAIN
                    </h4>
                    <p>
                      The domain does not exist. Check for typos or ensure the domain is
                      registered and has DNS configured.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      SERVFAIL
                    </h4>
                    <p>
                      The DNS server encountered an error. This could indicate a problem with
                      the authoritative name server or DNSSEC validation failure.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Timeout
                    </h4>
                    <p>
                      The DNS query timed out. The server may be unreachable or the network
                      may be experiencing issues.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      CNAME loop
                    </h4>
                    <p>
                      A CNAME record points to another CNAME, creating an infinite loop.
                      DNS resolvers will detect this and return an error.
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="What is a DNS lookup?"
                    answer="A DNS lookup is the process of querying the Domain Name System to translate a domain name into an IP address or to retrieve specific DNS records like MX, CNAME, NS, and TXT records."
                  />
                  <FaqItem
                    question="What is an A record in DNS?"
                    answer="An A record maps a domain name to an IPv4 address. For example, example.com might have an A record pointing to 93.184.216.34."
                  />
                  <FaqItem
                    question="What is the difference between NXDOMAIN and NOERROR?"
                    answer="NXDOMAIN means the domain does not exist. NOERROR with no records means the domain exists but has no records of the requested type."
                  />
                  <FaqItem
                    question="What is a CNAME record?"
                    answer="A CNAME (Canonical Name) record aliases one domain name to another. For example, www.example.com might be a CNAME pointing to example.com."
                  />
                  <FaqItem
                    question="What is an MX record?"
                    answer="An MX (Mail Exchange) record specifies the mail server responsible for receiving email for a domain. Multiple MX records can exist with different priorities."
                  />
                  <FaqItem
                    question="Can I do a reverse DNS lookup?"
                    answer="Yes. Enter an IP address (like 8.8.8.8) and select PTR record type to perform a reverse DNS lookup."
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

function RecordTypeExplainer({
  type,
  title,
  description,
  example,
}: {
  type: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div>
      <h4 className="mb-1 text-[13px] font-medium text-foreground">
        <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">{type}</code>{" "}
        {title}
      </h4>
      <p className="text-[13px] text-muted-foreground">{description}</p>
      <p className="mt-1 text-[12px] text-muted-foreground/60">
        Example: <code className="font-mono">{example}</code>
      </p>
    </div>
  );
}
