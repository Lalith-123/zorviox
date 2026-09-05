import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SslCertificateCheckerTool } from "@/components/tools/ssl-certificate-checker-tool";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { FaqItem } from "@/components/shared/faq-item";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "SSL Certificate Checker \u2014 Check SSL/TLS Certificate & Expiry | Zorviox",
  description:
    "Free online SSL certificate checker. Inspect TLS certificates, expiration dates, issuer, hostname coverage, certificate chain, cipher suite, TLS version, and security configuration.",
  alternates: {
    canonical: `${SITE.url}/tools/ssl-certificate-checker`,
  },
  openGraph: {
    title: "SSL Certificate Checker \u2014 Check SSL/TLS Certificate & Expiry | Zorviox",
    description:
      "Free online SSL certificate checker. Inspect TLS certificates, expiration, issuer, hostname coverage, certificate chain, and security configuration.",
    url: `${SITE.url}/tools/ssl-certificate-checker`,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSL Certificate Checker \u2014 Check SSL/TLS Certificate & Expiry | Zorviox",
    description:
      "Free online SSL certificate checker. Inspect TLS certificates, expiration, issuer, hostname coverage, certificate chain, and security configuration.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SSL Certificate Checker",
  url: `${SITE.url}/tools/ssl-certificate-checker`,
  description:
    "Free online SSL certificate checker. Inspect TLS certificates, expiration dates, issuer, hostname coverage, certificate chain, cipher suite, TLS version, and security configuration.",
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
      name: "SSL Certificate Checker",
      item: `${SITE.url}/tools/ssl-certificate-checker`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can this tool check certificates for internal or localhost servers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This tool connects to publicly resolvable hostnames over TLS. It cannot check certificates on localhost, private IPs, or internal network addresses.",
      },
    },
    {
      "@type": "Question",
      name: "Does the tool store my lookup history?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Lookups are processed in real time and the results are not stored. The tool does not maintain any history of checked domains.",
      },
    },
    {
      "@type": "Question",
      name: "Why does my website show 'Certificate Expired' when it works in my browser?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your browser may have a cached version of the certificate. Clear your browser cache and reload. If the certificate truly expired, your browser may be allowing you to proceed past the warning.",
      },
    },
    {
      "@type": "Question",
      name: "What does it mean when the certificate chain shows a warning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A chain warning means the server did not send all required intermediate certificates. Some browsers may still validate the chain using their own cache, but others will show an error.",
      },
    },
    {
      "@type": "Question",
      name: "Is TLS 1.2 still secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. TLS 1.2 is still considered secure when configured with modern cipher suites. TLS 1.3 offers performance and security improvements, but TLS 1.2 remains widely supported and safe for production use.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between the certificate issuer and the subject?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The subject is the entity the certificate belongs to (the website). The issuer is the Certificate Authority that signed and issued the certificate. For self-signed certificates, the subject and issuer are the same.",
      },
    },
    {
      "@type": "Question",
      name: "Can I check an HTTPS website on a non-standard port?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Enter the hostname followed by a colon and the port number, like example.com:8443. The tool will attempt a TLS connection on that specific port.",
      },
    },
  ],
};

export default function SslCertificateCheckerPage() {
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
                <span className="text-foreground">SSL Certificate Checker</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              SSL Certificate Checker
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Check the TLS certificate and security configuration of any website.
              Inspect expiration, issuer, hostname coverage, certificate chain, and
              cipher suite details.
            </p>
          </div>

          {/* Tool */}
          <SslCertificateCheckerTool />

          {/* Educational content */}
          <div className="mt-14 border-t border-border/60 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Learn about SSL/TLS Certificates
            </h2>
            <div className="space-y-2">
              <CollapsibleSection title="What is an SSL certificate?">
                <p>
                  An SSL certificate is a digital document that binds a cryptographic key to an
                  organization&apos;s identity. It enables encrypted communication between a web server
                  and a browser. The certificate contains information about the subject (the website),
                  the issuer (the Certificate Authority), the validity period, the public key, and
                  extensions that define how the certificate can be used.
                </p>
                <p>
                  Despite the name, modern certificates are actually used with TLS (Transport Layer
                  Security), not the older SSL protocol. The term &quot;SSL certificate&quot; persists because
                  of historical convention.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What does an SSL certificate checker do?">
                <p>
                  An SSL certificate checker connects to a web server over TLS and inspects the
                  certificate it presents. It can determine whether the certificate is currently
                  valid, who issued it, which hostnames it covers, how long until it expires, and
                  whether the certificate chain can be trusted.
                </p>
                <p>
                  This tool also checks the TLS protocol version, cipher suite, ALPN negotiation,
                  SNI behavior, and HTTP redirect configuration.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to check an SSL certificate">
                <ol className="ml-5 list-decimal space-y-2">
                  <li>
                    <strong className="text-foreground">Enter the hostname:</strong> Type the domain
                    name (like <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">example.com</code>)
                    or paste a full URL.
                  </li>
                  <li>
                    <strong className="text-foreground">Click &quot;Check Certificate&quot;:</strong> The tool
                    establishes a TLS connection to the server.
                  </li>
                  <li>
                    <strong className="text-foreground">Review the results:</strong> The tool displays
                    certificate details, hostname coverage, chain information, and security diagnostics.
                  </li>
                </ol>
              </CollapsibleSection>

              <CollapsibleSection title="How to tell if an SSL certificate is valid">
                <p>
                  A valid SSL certificate must satisfy several conditions: it must be within its
                  validity period (not expired and not yet valid), the hostname must match the
                  certificate&apos;s Subject Alternative Names (SANs) or Common Name (CN), and the
                  certificate chain must be trusted by the checking environment.
                </p>
                <p>
                  This tool checks all three conditions separately: date validity, hostname validation,
                  and chain trust. Each is reported independently so you can understand exactly what
                  is or is not verified.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to check SSL certificate expiration">
                <p>
                  The SSL Certificate Checker shows the exact expiration date and calculates the
                  number of days remaining. It also classifies the status as Valid, Expiring Soon
                  (within 30 days), Expired, or Not Yet Valid.
                </p>
                <p>
                  Certificate expiration is one of the most common SSL issues. Browsers will show
                  security warnings when a certificate has expired, which can cause visitors to leave
                  your site and break API integrations.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What happens when an SSL certificate expires?">
                <p>
                  When an SSL certificate expires, browsers display security warnings to visitors.
                  Most browsers allow users to bypass these warnings, but many visitors will not
                  proceed past the warning page. This results in lost traffic and broken trust.
                </p>
                <p>
                  Expired certificates also break programmatic access: API clients, mobile apps, and
                  automated systems that enforce TLS validation will fail to connect. Letting a
                  certificate expire can cause significant downtime.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is TLS?">
                <p>
                  TLS (Transport Layer Security) is the cryptographic protocol that provides
                  encrypted communication over a network. It is used for HTTPS, email encryption,
                  and many other protocols. TLS 1.2 and TLS 1.3 are the current versions in active
                  use.
                </p>
                <p>
                  TLS 1.3 offers improved performance and security over TLS 1.2 by removing legacy
                  algorithms and reducing the number of round trips required for the handshake. Both
                  versions are considered secure when properly configured.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="SSL vs TLS">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border/60 text-left text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Feature</th>
                        <th className="px-3 py-2 font-medium">SSL</th>
                        <th className="px-3 py-2 font-medium">TLS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/30">
                        <td className="px-3 py-2 text-foreground">Status</td>
                        <td className="px-3 py-2 text-muted-foreground">Deprecated</td>
                        <td className="px-3 py-2 text-foreground">Active</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="px-3 py-2 text-foreground">Latest Version</td>
                        <td className="px-3 py-2 text-muted-foreground">3.0</td>
                        <td className="px-3 py-2 text-foreground">1.3</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="px-3 py-2 text-foreground">Handshake</td>
                        <td className="px-3 py-2 text-muted-foreground">2 round trips</td>
                        <td className="px-3 py-2 text-foreground">1 round trip (1.3)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-foreground">Security</td>
                        <td className="px-3 py-2 text-muted-foreground">Vulnerable</td>
                        <td className="px-3 py-2 text-foreground">Secure</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2">
                  The term &quot;SSL certificate&quot; is still commonly used to refer to TLS certificates
                  because the X.509 certificate format is the same regardless of which protocol
                  version is in use.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a certificate chain?">
                <p>
                  A certificate chain is the hierarchy of certificates used to establish trust.
                  When your browser connects to a website, it receives the leaf (end-entity)
                  certificate and zero or more intermediate certificates. The browser builds a
                  chain from the leaf up to a trusted root certificate in its trust store.
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Leaf Certificate</span>
                  <span className="text-muted-foreground/50">{"\u2193"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Intermediate CA</span>
                  <span className="text-muted-foreground/50">{"\u2193"}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Trusted Root CA</span>
                </p>
                <p>
                  If a server omits intermediate certificates, some clients may fail to validate
                  the chain. This tool identifies where the chain breaks and reports the issue.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a certificate authority?">
                <p>
                  A Certificate Authority (CA) is a trusted organization that issues digital
                  certificates. CAs verify the identity of certificate applicants before issuing
                  certificates. Well-known CAs include Let&apos;s Encrypt, DigiCert, Sectigo, and
                  GlobalSign.
                </p>
                <p>
                  Root CAs are pre-installed in operating systems and browsers. Intermediate CAs
                  issue certificates on behalf of root CAs, creating a chain of trust that can be
                  validated without directly involving the root.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a SAN certificate?">
                <p>
                  A SAN (Subject Alternative Name) certificate can secure multiple domain names
                  with a single certificate. SANs are listed in the certificate&apos;s Subject
                  Alternative Name extension and are the primary mechanism browsers use for
                  hostname validation.
                </p>
                <p>
                  Modern certificates use SAN rather than the Common Name (CN) field for hostname
                  identification. If a certificate has SAN entries, the browser checks against
                  those entries and ignores the CN.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What is a wildcard certificate?">
                <p>
                  A wildcard certificate uses an asterisk (*) to match any subdomain one level
                  below the base domain. For example, <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12px]">*.example.com</code> matches:
                </p>
                <ul className="ml-5 mt-1 list-disc space-y-1">
                  <li>www.example.com</li>
                  <li>api.example.com</li>
                  <li>mail.example.com</li>
                </ul>
                <p className="mt-1">
                  But it does NOT match:
                </p>
                <ul className="ml-5 mt-1 list-disc space-y-1">
                  <li>example.com (the bare domain)</li>
                  <li>a.b.example.com (sub-subdomains)</li>
                </ul>
              </CollapsibleSection>

              <CollapsibleSection title="What is a self-signed certificate?">
                <p>
                  A self-signed certificate is one that is signed by the same entity whose
                  identity it certifies, rather than by a trusted Certificate Authority. Self-signed
                  certificates are common in development, testing, and internal environments.
                </p>
                <p>
                  Browsers do not trust self-signed certificates by default because there is no
                  third-party verification of the identity. Public websites should use certificates
                  issued by a trusted CA. However, self-signed certificates are perfectly valid for
                  private or internal use cases.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What does an SSL hostname mismatch mean?">
                <p>
                  A hostname mismatch occurs when the domain name you are connecting to does not
                  match any entry in the certificate&apos;s Subject Alternative Names (SANs) or
                  Common Name (CN). This usually happens when a certificate is issued for one
                  domain but the server is being accessed via a different domain.
                </p>
                <p>
                  Common causes include: using a certificate for www.example.com to serve
                  example.com, shared hosting configurations, or CDN mismatches. The certificate
                  needs to be reissued with the correct hostname(s).
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="What does the TLS version mean?">
                <p>
                  The TLS version indicates which version of the Transport Layer Security protocol
                  is being used. TLS 1.2 and TLS 1.3 are the current secure versions. Older
                  versions like TLS 1.0 and TLS 1.1 have known vulnerabilities and have been
                  deprecated by major browsers.
                </p>
                <p>
                  This tool reports the negotiated TLS version during the handshake. TLS 1.3
                  offers improved performance and security, while TLS 1.2 remains widely supported
                  and secure when configured with modern cipher suites.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="How to fix common SSL certificate errors">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Certificate Expired
                    </h4>
                    <p>
                      Renew the certificate before it expires. Many CAs offer automatic renewal.
                      Set up monitoring to alert before expiration.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Hostname Mismatch
                    </h4>
                    <p>
                      Reissue the certificate with the correct domain name(s). Include all
                      subdomains and the bare domain as SAN entries.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Incomplete Certificate Chain
                    </h4>
                    <p>
                      Configure the server to send the complete certificate chain, including
                      intermediate certificates. Most CAs provide the full chain.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-[13px] font-medium text-foreground">
                      Self-Signed Certificate
                    </h4>
                    <p>
                      For public websites, obtain a certificate from a trusted CA. Let&apos;s Encrypt
                      offers free certificates. For internal use, add the certificate to the
                      trust store.
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Frequently Asked Questions" defaultOpen>
                <div className="space-y-5">
                  <FaqItem
                    question="Can this tool check certificates for internal or localhost servers?"
                    answer="No. This tool connects to publicly resolvable hostnames over TLS. It cannot check certificates on localhost, private IPs, or internal network addresses."
                  />
                  <FaqItem
                    question="Does the tool store my lookup history?"
                    answer="No. Lookups are processed in real time and the results are not stored. The tool does not maintain any history of checked domains."
                  />
                  <FaqItem
                    question="Why does my website show 'Certificate Expired' when it works in my browser?"
                    answer="Your browser may have a cached version of the certificate. Clear your browser cache and reload. If the certificate truly expired, your browser may be allowing you to proceed past the warning."
                  />
                  <FaqItem
                    question="What does it mean when the certificate chain shows a warning?"
                    answer="A chain warning means the server did not send all required intermediate certificates. Some browsers may still validate the chain using their own cache, but others will show an error."
                  />
                  <FaqItem
                    question="Is TLS 1.2 still secure?"
                    answer="Yes. TLS 1.2 is still considered secure when configured with modern cipher suites. TLS 1.3 offers performance and security improvements, but TLS 1.2 remains widely supported and safe for production use."
                  />
                  <FaqItem
                    question="What is the difference between the certificate issuer and the subject?"
                    answer="The subject is the entity the certificate belongs to (the website). The issuer is the Certificate Authority that signed and issued the certificate. For self-signed certificates, the subject and issuer are the same."
                  />
                  <FaqItem
                    question="Can I check an HTTPS website on a non-standard port?"
                    answer="Yes. Enter the hostname followed by a colon and the port number, like example.com:8443. The tool will attempt a TLS connection on that specific port."
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
