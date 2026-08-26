export const LIMITS = {
  timeout: 15000,
  maxResponseBytes: 60 * 1024 * 1024,
  maxUrls: 50000,
  maxSitemapIndexEntries: 50000,
  maxRedirects: 5,
  maxChildSitemaps: 100,
  maxRecursionDepth: 3,
  maxConcurrentFetches: 5,
  maxDecompressedBytes: 60 * 1024 * 1024,
} as const;

export const CHANGEFREQ_VALID = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
] as const;
