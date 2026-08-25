import Link from "next/link";
import { Container } from "@/components/layout/container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="mb-3 text-6xl font-bold text-muted-foreground/20">404</p>
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Lost somewhere?
        </h1>
        <p className="mb-8 max-w-sm text-[14px] text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-5 text-[13px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97]"
          >
            Back to Zorviox
          </Link>
          <Link
            href="/tools"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Explore Tools
          </Link>
        </div>
      </div>
    </Container>
  );
}
