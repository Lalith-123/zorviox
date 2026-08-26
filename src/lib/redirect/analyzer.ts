import { validateUrl } from "./security";
import { analyzeWithMetaRefresh } from "./chain";
import { getHostname, getScheme, isWww, stripWww, areSameDomain } from "./normalize";
import { generateSeoObservations, generateIssues } from "./scoring";
import { getRelevantHeaders } from "./headers";
import type { RedirectAnalysis } from "./types";

export async function analyzeRedirect(urlStr: string): Promise<RedirectAnalysis> {
  const validation = validateUrl(urlStr);
  if (!validation) {
    return {
      inputUrl: urlStr,
      chain: {
        hops: [],
        totalRedirects: 0,
        finalUrl: urlStr,
        finalStatusCode: 0,
        finalStatusText: "Invalid URL",
        totalTime: 0,
        hasLoop: false,
        loopDetectedAt: null,
        limitExceeded: false,
      },
      isRedirect: false,
      redirectType: "none",
      issues: [
        {
          severity: "critical",
          message: "Invalid URL",
          detail: "The URL is not valid or points to a private/local address.",
        },
      ],
      seoObservations: [],
      metaRefresh: null,
      jsRedirect: null,
      timing: { totalMs: 0, hops: [] },
      domainInfo: {
        scheme: "",
        hostname: "",
        www: false,
        crossDomain: false,
        subdomains: [],
        hops: [],
      },
      headers: {
        server: null,
        cacheControl: null,
        hsts: null,
        lastModified: null,
        etag: null,
        age: null,
      },
    };
  }

  const startTime = Date.now();
  const { chain, metaRefresh, jsRedirect } = await analyzeWithMetaRefresh(urlStr);
  const totalTime = Date.now() - startTime;

  const issues = generateIssues(chain);
  const seoObservations = generateSeoObservations(chain);

  let redirectType: RedirectAnalysis["redirectType"] = "none";
  if (chain.hasLoop) {
    redirectType = "loop";
  } else if (chain.limitExceeded) {
    redirectType = "exceeded";
  } else if (chain.totalRedirects > 2) {
    redirectType = "chain";
  } else if (chain.totalRedirects > 0) {
    redirectType = "direct";
  }

  const inputHostname = getHostname(urlStr);
  const hops = chain.hops.map((h) => ({
    scheme: getScheme(h.url),
    hostname: getHostname(h.url),
    www: isWww(getHostname(h.url)),
  }));

  const subdomains = new Set<string>();
  for (const hop of hops) {
    const base = stripWww(hop.hostname);
    if (hop.hostname !== base && hop.hostname !== `www.${base}`) {
      subdomains.add(hop.hostname);
    }
  }

  const lastHop = chain.hops[chain.hops.length - 1];
  const lastHeaders = lastHop ? getRelevantHeaders(lastHop.headers) : null;

  return {
    inputUrl: urlStr,
    chain,
    isRedirect: chain.totalRedirects > 0,
    redirectType,
    issues,
    seoObservations,
    metaRefresh,
    jsRedirect,
    timing: {
      totalMs: totalTime,
      hops: chain.hops.map((h) => ({ url: h.url, ms: h.responseTime })),
    },
    domainInfo: {
      scheme: getScheme(urlStr),
      hostname: inputHostname,
      www: isWww(inputHostname),
      crossDomain: !areSameDomain(urlStr, chain.finalUrl),
      subdomains: [...subdomains],
      hops,
    },
    headers: {
      server: lastHeaders?.server || null,
      cacheControl: lastHeaders?.cacheControl || null,
      hsts: lastHeaders?.hsts || null,
      lastModified: lastHeaders?.lastModified || null,
      etag: lastHeaders?.etag || null,
      age: lastHeaders?.age || null,
    },
  };
}
