export interface CrawlOptions {
  startUrl: string;
  maxPages: number;
  maxDepth: number;
  checkExternal: boolean;
  concurrency: number;
}

export interface CrawlLink {
  url: string;
  normalizedUrl: string;
  sourcePage: string;
  anchorText: string;
  linkType: "internal" | "external" | "email" | "telephone" | "javascript" | "data" | "fragment" | "resource";
  rel: string[];
}

export interface RedirectHop {
  url: string;
  statusCode: number;
  location: string | null;
}

export type LinkStatus =
  | "healthy"
  | "redirected"
  | "broken"
  | "server-error"
  | "blocked"
  | "rate-limited"
  | "timeout"
  | "tls-error"
  | "dns-error"
  | "soft-404"
  | "invalid-url"
  | "fragment-issue"
  | "email"
  | "telephone"
  | "javascript"
  | "resource";

export interface LinkResult {
  normalizedUrl: string;
  url: string;
  status: LinkStatus;
  statusCode: number | null;
  finalUrl: string | null;
  contentType: string | null;
  redirectChain: RedirectHop[];
  responseTimeMs: number;
  occurrences: LinkOccurrence[];
  contentLength: number | null;
  recoveredAfterRetry: boolean;
  errorMessage: string | null;
}

export interface LinkOccurrence {
  sourcePage: string;
  anchorText: string;
  linkType: CrawlLink["linkType"];
  rel: string[];
  depth: number;
}

export interface CrawlPage {
  url: string;
  normalizedUrl: string;
  statusCode: number;
  depth: number;
  linksFound: CrawlLink[];
  title: string | null;
  contentLength: number;
  responseTimeMs: number;
}

export interface CrawlSummary {
  pagesScanned: number;
  linksDiscovered: number;
  urlsChecked: number;
  healthy: number;
  redirected: number;
  broken: number;
  serverErrors: number;
  blocked: number;
  timeouts: number;
  tlsErrors: number;
  dnsErrors: number;
  possibleSoft404: number;
  invalidUrls: number;
  fragmentIssues: number;
  emails: number;
  telephones: number;
  resources: number;
}

export interface CrawlResult {
  status: "completed" | "stopped" | "failed";
  startUrl: string;
  pagesScanned: number;
  linksDiscovered: number;
  urlsChecked: number;
  summary: CrawlSummary;
  links: LinkResult[];
  pages: CrawlPage[];
  startedAt: string;
  completedAt: string;
}

export interface CrawlProgress {
  status: "scanning" | "completed" | "stopped" | "failed";
  pagesScanned: number;
  linksChecked: number;
  currentUrl: string | null;
}

export const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fd/i,
  /^fe80/i,
  /^0:/,
  /^localhost$/i,
];

export const NON_HTTP_SCHEMES = ["mailto:", "tel:", "javascript:", "data:"];
