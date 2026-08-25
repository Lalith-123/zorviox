import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tools",
  description: "Browse all free online tools on Zorviox.",
};

export default function ToolsPage() {
  return (
    <Container>
      <div className="py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="select-none text-muted-foreground/40">/</span>
              <span className="text-foreground">Tools</span>
            </li>
          </ol>
        </nav>

        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Tools
        </h1>
        <p className="mb-10 text-[15px] text-muted-foreground">
          Every tool on Zorviox, built to be fast, useful, and accessible.
        </p>

        <div className="space-y-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex items-center justify-between rounded-xl border border-border/80 bg-card px-5 py-4 text-left transition-all duration-200 hover:border-foreground/20 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            >
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-accent">
                  {tool.category}
                </div>
                <div className="mt-1 text-[15px] font-semibold text-foreground">
                  {tool.name}
                </div>
                <div className="mt-0.5 text-[13px] text-muted-foreground">
                  {tool.description}
                </div>
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
