"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/layout/container";
import { TOOLS } from "@/lib/constants";

export default function Home() {
  const [showTools, setShowTools] = useState(false);

  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Wordmark */}
          <h1 className="animate-fade-up text-5xl font-bold tracking-tighter text-foreground sm:text-7xl">
            Zorviox
          </h1>

          {/* Tagline */}
          <p className="animate-fade-up delay-100 mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
            Simple tools for the modern web.
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-200 mt-10">
            <button
              onClick={() => setShowTools((v) => !v)}
              className="group relative inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97]"
            >
              {showTools ? "Hide Tools" : "Explore Tools"}
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${showTools ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Tools section - animated reveal */}
          <div
            className={`w-full max-w-lg transition-all duration-300 ease-out ${
              showTools
                ? "mt-12 opacity-100 translate-y-0"
                : "mt-0 opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden"
            }`}
          >
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
        </div>
      </Container>
    </section>
  );
}
