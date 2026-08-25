import type { Metadata } from "next";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <Container>
      <div className="max-w-2xl py-12 sm:py-16">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <div className="space-y-4 text-[14px] leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">Last updated:</strong>{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            Zorviox respects your privacy. This policy describes how we handle
            information when you use our tools and website.
          </p>
          <h2 className="pt-2 text-[15px] font-semibold text-foreground">
            Information We Collect
          </h2>
          <p>
            Our tools are designed to work without collecting personal
            information. When you use the Meta Tag Checker, the URL you submit is
            fetched to analyze its meta tags. This URL is not stored, logged, or
            shared with third parties.
          </p>
          <h2 className="pt-2 text-[15px] font-semibold text-foreground">
            Cookies
          </h2>
          <p>
            We do not use tracking cookies. We may use essential cookies required
            for the website to function properly.
          </p>
          <h2 className="pt-2 text-[15px] font-semibold text-foreground">
            Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Changes will be
            posted on this page with an updated date.
          </p>
        </div>
      </div>
    </Container>
  );
}
