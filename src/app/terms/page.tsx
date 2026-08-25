import type { Metadata } from "next";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <Container>
      <div className="max-w-2xl py-12 sm:py-16">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
          Terms of Service
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
            By using Zorviox, you agree to these terms of service.
          </p>
          <h2 className="pt-2 text-[15px] font-semibold text-foreground">
            Use of Tools
          </h2>
          <p>
            Our tools are provided as-is for informational and educational
            purposes. Results from our tools should not be considered
            professional advice.
          </p>
          <h2 className="pt-2 text-[15px] font-semibold text-foreground">
            Acceptable Use
          </h2>
          <p>
            You agree not to use our tools in any way that could damage, disable,
            or impair the service, or interfere with any other party&apos;s use
            of the service.
          </p>
          <h2 className="pt-2 text-[15px] font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p>
            Zorviox is provided without warranties. We are not liable for any
            damages arising from the use or inability to use our tools.
          </p>
        </div>
      </div>
    </Container>
  );
}
