"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/container";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

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

          <nav className="flex items-center gap-1">
            {!isHome && (
              <Link
                href="/tools"
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Tools
              </Link>
            )}
            <Link
              href="/tools/meta-tag-checker"
              className="hidden rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Meta Tag Checker
            </Link>
            <Link
              href="/tools/sitemap-analyzer"
              className="rounded-md bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97]"
            >
              Sitemap Analyzer
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
