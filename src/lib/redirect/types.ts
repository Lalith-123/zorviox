export type RedirectStatus =
  | "redirect"
  | "success"
  | "client-error"
  | "server-error"
  | "informational"
  | "other-3xx"
  | "no-redirect";

export interface RedirectHop {
  step: number;
  url: string;
  statusCode: number;
  statusText: string;
  location: string | null;
  resolvedLocation: string | null;
  responseTime: number;
  headers: Record<string, string>;
  contentType: string | null;
  contentLength: number | null;
}

export interface RedirectChain {
  hops: RedirectHop[];
  totalRedirects: number;
  finalUrl: string;
  finalStatusCode: number;
  finalStatusText: string;
  totalTime: number;
  hasLoop: boolean;
  loopDetectedAt: number | null;
  limitExceeded: boolean;
}

export type IssueSeverity = "critical" | "error" | "warning" | "info";

export interface RedirectIssue {
  severity: IssueSeverity;
  message: string;
  detail?: string;
}

export interface RedirectAnalysis {
  inputUrl: string;
  chain: RedirectChain;
  isRedirect: boolean;
  redirectType: "none" | "direct" | "chain" | "loop" | "exceeded";
  issues: RedirectIssue[];
  seoObservations: { label: string; value: string; type: "good" | "review" | "problem" | "info" }[];
  metaRefresh: { detected: boolean; url: string | null; delay: number | null } | null;
  jsRedirect: { detected: boolean; patterns: string[] } | null;
  timing: {
    totalMs: number;
    hops: { url: string; ms: number }[];
  };
  domainInfo: {
    scheme: string;
    hostname: string;
    www: boolean;
    crossDomain: boolean;
    subdomains: string[];
    hops: { scheme: string; hostname: string; www: boolean }[];
  };
  headers: {
    server: string | null;
    cacheControl: string | null;
    hsts: string | null;
    lastModified: string | null;
    etag: string | null;
    age: string | null;
  };
}
