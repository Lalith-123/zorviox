export const LIMITS = {
  maxRedirects: 20,
  timeoutPerRequest: 15000,
  maxResponseBytes: 2 * 1024 * 1024,
  maxHtmlScanBytes: 16 * 1024,
  userAgent: "ZorvioxRedirectChecker/1.0",
} as const;

export const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export const ALL_3XX = new Set([300, 301, 302, 303, 304, 305, 306, 307, 308]);

export const STATUS_TEXTS: Record<number, string> = {
  200: "OK",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  410: "Gone",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};
