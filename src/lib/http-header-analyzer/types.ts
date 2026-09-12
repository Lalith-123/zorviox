export type HeaderCategory =
  | "general"
  | "response"
  | "caching"
  | "security"
  | "cors"
  | "cookies"
  | "redirect"
  | "seo"
  | "cdn"
  | "unknown";

export type HeaderSeverity = "critical" | "high" | "medium" | "low" | "informational";

export type HeaderImportance = "essential" | "recommended" | "optional" | "informational";

export type AnalysisStatus = "present" | "missing" | "configured" | "needs-review" | "informational";

export interface HeaderEntry {
  name: string;
  value: string;
  category: HeaderCategory;
  description: string;
  importance: HeaderImportance;
}

export interface RedirectHop {
  url: string;
  statusCode: number;
  statusText: string;
  location: string | null;
  headers: Record<string, string>;
}

export interface SecurityFinding {
  header: string;
  status: AnalysisStatus;
  value: string | null;
  explanation: string;
  severity: HeaderSeverity;
}

export interface SeoFinding {
  header: string;
  status: AnalysisStatus;
  value: string | null;
  explanation: string;
}

export interface CacheFinding {
  header: string;
  status: AnalysisStatus;
  value: string | null;
  explanation: string;
}

export interface CorsFinding {
  header: string;
  status: AnalysisStatus;
  value: string | null;
  explanation: string;
}

export interface CookieInfo {
  name: string;
  value: string;
  domain: string | null;
  path: string | null;
  expires: string | null;
  maxAge: number | null;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  attributes: Record<string, string>;
}

export interface CookieFinding {
  cookie: CookieInfo;
  observations: string[];
}

export interface CspDirective {
  name: string;
  values: string[];
}

export interface CspAnalysis {
  directives: CspDirective[];
  hasUnsafeInline: boolean;
  hasUnsafeEval: boolean;
  hasWildcard: boolean;
  isReportOnly: boolean;
  observations: string[];
}

export interface AnalysisResult {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  httpVersion: string | null;
  responseTimeMs: number;
  redirectCount: number;
  redirectChain: RedirectHop[];
  contentType: string | null;
  contentLength: number | null;
  server: string | null;
  date: string | null;
  headers: Record<string, string>;
  headerEntries: HeaderEntry[];
  securityFindings: SecurityFinding[];
  seoFindings: SeoFinding[];
  cacheFindings: CacheFinding[];
  corsFindings: CorsFinding[];
  cookieFindings: CookieFinding[];
  cspAnalysis: CspAnalysis | null;
  hstsAnalysis: HstsAnalysis | null;
  error: { code: string; message: string } | null;
}

export interface HstsAnalysis {
  maxAge: number | null;
  includeSubDomains: boolean;
  preload: boolean;
  directives: string[];
  observations: string[];
}

export interface AnalysisError {
  code: string;
  message: string;
}

export const STATUS_CODE_DESCRIPTIONS: Record<number, string> = {
  200: "OK — Resource successfully retrieved",
  201: "Created — Resource successfully created",
  204: "No Content — Request succeeded, no content returned",
  301: "Moved Permanently — URL has permanently changed",
  302: "Found — Temporary redirect",
  303: "See Other — Response is at a different URL",
  304: "Not Modified — Cached response is still valid",
  307: "Temporary Redirect — Temporary redirect, method preserved",
  308: "Permanent Redirect — Permanent redirect, method preserved",
  400: "Bad Request — Server could not understand the request",
  401: "Unauthorized — Authentication required",
  403: "Forbidden — Server refused access",
  404: "Not Found — Resource does not exist",
  405: "Method Not Allowed — HTTP method not supported",
  408: "Request Timeout — Server timed out waiting for request",
  410: "Gone — Resource permanently removed",
  429: "Too Many Requests — Rate limited",
  500: "Internal Server Error — Server encountered an error",
  501: "Not Implemented — Server does not support the request",
  502: "Bad Gateway — Invalid response from upstream server",
  503: "Service Unavailable — Server temporarily unavailable",
  504: "Gateway Timeout — Upstream server did not respond",
};
