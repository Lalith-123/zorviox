import type { RedirectChain, RedirectIssue } from "./types";
import {
  getHostname,
  getScheme,
  isWww,
  stripWww,
  areSameDomain,
} from "./normalize";
import { REDIRECT_STATUSES } from "./limits";

export function generateSeoObservations(
  chain: RedirectChain
): {
  label: string;
  value: string;
  type: "good" | "review" | "problem" | "info";
}[] {
  const observations: {
    label: string;
    value: string;
    type: "good" | "review" | "problem" | "info";
  }[] = [];

  if (!chain.hops.length) return observations;

  const inputHostname = getHostname(chain.hops[0].url);
  const finalHostname = getHostname(chain.finalUrl);
  const inputScheme = getScheme(chain.hops[0].url);
  const finalScheme = getScheme(chain.finalUrl);

  // Redirect type
  if (chain.totalRedirects === 0) {
    observations.push({
      label: "No redirect",
      value: "The URL does not redirect",
      type: "info",
    });
  } else if (chain.hasLoop) {
    observations.push({
      label: "Redirect loop",
      value: "The redirect chain loops back on itself — this will never resolve",
      type: "problem",
    });
  } else if (chain.totalRedirects > 5) {
    observations.push({
      label: "Long redirect chain",
      value: `${chain.totalRedirects} redirects — each hop adds latency and can affect SEO crawling`,
      type: "problem",
    });
  } else if (chain.totalRedirects > 2) {
    observations.push({
      label: "Redirect chain",
      value: `${chain.totalRedirects} redirects — consider reducing to 1–2 hops`,
      type: "review",
    });
  } else {
    observations.push({
      label: "Clean redirect",
      value: `${chain.totalRedirects} redirect — direct and efficient`,
      type: "good",
    });
  }

  // Permanent vs temporary
  const lastRedirectHop = chain.hops.find(
    (h) => REDIRECT_STATUSES.has(h.statusCode) && h.resolvedLocation
  );
  if (lastRedirectHop) {
    if (lastRedirectHop.statusCode === 301 || lastRedirectHop.statusCode === 308) {
      observations.push({
        label: "Permanent redirect",
        value: `HTTP ${lastRedirectHop.statusCode} — browsers and search engines will update to the new URL`,
        type: "good",
      });
    } else if (lastRedirectHop.statusCode === 302 || lastRedirectHop.statusCode === 307) {
      observations.push({
        label: "Temporary redirect",
        value: `HTTP ${lastRedirectHop.statusCode} — search engines will keep the original URL indexed`,
        type: "review",
      });
    } else if (lastRedirectHop.statusCode === 303) {
      observations.push({
        label: "See Other",
        value: "HTTP 303 — used after POST to redirect with GET",
        type: "info",
      });
    }
  }

  // HTTP to HTTPS
  if (inputScheme === "http" && finalScheme === "https") {
    observations.push({
      label: "HTTP → HTTPS",
      value: "Good — redirects HTTP to HTTPS for security",
      type: "good",
    });
  }

  // HTTPS to HTTP
  if (inputScheme === "https" && finalScheme === "http") {
    observations.push({
      label: "HTTPS → HTTP",
      value: "Redirecting from HTTPS to HTTP reduces security — review this redirect",
      type: "warning" as "problem",
    });
  }

  // WWW changes
  if (!isWww(inputHostname) && isWww(finalHostname) && stripWww(inputHostname) === stripWww(finalHostname)) {
    observations.push({
      label: "Non-www to www",
      value: `Redirecting to www.${stripWww(inputHostname)} — consistent choice, but pick one and stick with it`,
      type: "review",
    });
  }

  if (isWww(inputHostname) && !isWww(finalHostname) && stripWww(inputHostname) === stripWww(finalHostname)) {
    observations.push({
      label: "WWW to non-www",
      value: `Redirecting to ${stripWww(inputHostname)} — consistent choice, but pick one and stick with it`,
      type: "review",
    });
  }

  // Cross-domain
  if (!areSameDomain(chain.hops[0].url, chain.finalUrl)) {
    observations.push({
      label: "Cross-domain redirect",
      value: `${getHostname(chain.hops[0].url)} → ${getHostname(chain.finalUrl)}`,
      type: "review",
    });
  }

  // Final status
  if (chain.finalStatusCode >= 200 && chain.finalStatusCode < 300) {
    observations.push({
      label: "Final destination reachable",
      value: `HTTP ${chain.finalStatusCode} — the final URL returns a successful response`,
      type: "good",
    });
  } else if (chain.finalStatusCode === 404) {
    observations.push({
      label: "Final destination not found",
      value: "HTTP 404 — the redirect chain is valid but the final page does not exist",
      type: "problem",
    });
  } else if (chain.finalStatusCode === 410) {
    observations.push({
      label: "Final destination gone",
      value: "HTTP 410 — the resource has been permanently removed",
      type: "info",
    });
  } else if (chain.finalStatusCode >= 400 && chain.finalStatusCode < 500) {
    observations.push({
      label: "Client error at destination",
      value: `HTTP ${chain.finalStatusCode} — the final URL returns a client error`,
      type: "problem",
    });
  } else if (chain.finalStatusCode >= 500) {
    observations.push({
      label: "Server error at destination",
      value: `HTTP ${chain.finalStatusCode} — the final URL returns a server error`,
      type: "problem",
    });
  }

  // Timing
  if (chain.totalTime > 5000) {
    observations.push({
      label: "Slow redirect chain",
      value: `${(chain.totalTime / 1000).toFixed(1)}s total — each redirect adds latency`,
      type: "review",
    });
  }

  return observations;
}

export function generateIssues(
  chain: RedirectChain
): RedirectIssue[] {
  const issues: RedirectIssue[] = [];

  if (chain.hasLoop) {
    issues.push({
      severity: "critical",
      message: "Redirect loop detected",
      detail: `The chain loops back at step ${chain.loopDetectedAt}. This URL will never resolve.`,
    });
  }

  if (chain.limitExceeded) {
    issues.push({
      severity: "error",
      message: "Redirect limit exceeded",
      detail: `The chain exceeds the maximum of ${20} redirects.`,
    });
  }

  const lastHop = chain.hops[chain.hops.length - 1];
  if (lastHop && lastHop.statusCode === 0) {
    issues.push({
      severity: "error",
      message: "Connection failed",
      detail: lastHop.statusText,
    });
  }

  for (const hop of chain.hops) {
    if (hop.location && !hop.resolvedLocation) {
      issues.push({
        severity: "warning",
        message: "Invalid Location header",
        detail: `Step ${hop.step}: "${hop.location}" could not be resolved`,
      });
    }

    if (REDIRECT_STATUSES.has(hop.statusCode) && !hop.location) {
      issues.push({
        severity: "warning",
        message: "Redirect without Location header",
        detail: `Step ${hop.step}: HTTP ${hop.statusCode} has no Location header`,
      });
    }
  }

  if (chain.totalRedirects >= 3) {
    issues.push({
      severity: "info",
      message: "Consider reducing redirect hops",
      detail: `Each redirect adds latency. A chain of ${chain.totalRedirects} redirects can be simplified.`,
    });
  }

  return issues;
}
