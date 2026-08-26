export interface SitemapUrl {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
}

export interface SitemapChild {
  loc: string;
  lastmod: string | null;
  urlCount: number | null;
  status: number | null;
  error: string | null;
  urls: SitemapUrl[];
  children: SitemapChild[];
  type: "urlset" | "sitemapindex" | "error";
}

export type IssueSeverity = "critical" | "error" | "warning" | "info";

export interface SitemapIssue {
  severity: IssueSeverity;
  message: string;
  url?: string;
}

export interface RobotsTxtInfo {
  sitemaps: string[];
  raw: string;
  fetched: boolean;
  error: string | null;
}

export interface SitemapAnalysis {
  inputUrl: string;
  finalUrl: string;
  redirectCount: number;
  httpStatus: number;
  contentType: string | null;
  responseTime: number;
  sitemapType: "urlset" | "sitemapindex" | "error";
  totalUrls: number;
  totalChildSitemaps: number;
  urls: SitemapUrl[];
  childSitemaps: SitemapChild[];
  issues: SitemapIssue[];
  stats: {
    urlsWithLastmod: number;
    urlsWithoutLastmod: number;
    urlsWithPriority: number;
    urlsWithoutPriority: number;
    urlsWithChangefreq: number;
    urlsWithoutChangefreq: number;
    duplicateUrls: number;
    invalidUrls: number;
    urlsWithFragments: number;
    urlsWithQueryParams: number;
    httpUrls: number;
    domainMismatch: number;
    invalidLastmod: number;
    futureLastmod: number;
    identicalLastmod: number;
    invalidPriority: number;
    invalidChangefreq: number;
    maxChangefreqCount: number;
    emptyLocCount: number;
  };
  domain: string;
  scheme: string;
  robotsTxt: RobotsTxtInfo;
  score: {
    total: number;
    passed: number;
    checks: { label: string; passed: boolean }[];
  };
  sitemapLimits: {
    maxUrls: number;
    maxSitemapIndexEntries: number;
    maxFileSizeMB: number;
  };
}
