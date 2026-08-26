"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="text-[15px] font-bold tracking-tight text-foreground transition-opacity hover:opacity-70"
          >
            Zorviox
          </Link>

          <nav className="flex items-center">
            <div className="group relative">
              <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                Tools
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="w-56 overflow-hidden rounded-xl border border-border/80 bg-card py-1.5 shadow-lg">
                  <Link
                    href="/tools/meta-tag-checker"
                    className="flex flex-col px-4 py-2.5 text-[13px] transition-colors hover:bg-muted/50"
                  >
                    <span className="font-medium text-foreground">Meta Tag Checker</span>
                    <span className="text-[11px] text-muted-foreground">Analyze SEO tags</span>
                  </Link>
                  <Link
                    href="/tools/sitemap-analyzer"
                    className="flex flex-col px-4 py-2.5 text-[13px] transition-colors hover:bg-muted/50"
                  >
                    <span className="font-medium text-foreground">Sitemap Analyzer</span>
                    <span className="text-[11px] text-muted-foreground">Audit XML sitemaps</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}
