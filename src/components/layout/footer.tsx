import Link from "next/link";
import { Container } from "@/components/layout/container";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <span className="text-[13px] font-medium text-muted-foreground">
            Zorviox
          </span>
          <div className="flex gap-5">
            <Link
              href="/tools"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Tools
            </Link>
            <Link
              href="/privacy"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
