export function normalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    url.hash = "";
    let path = url.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return `${url.origin}${path}${url.search}`.toLowerCase();
  } catch {
    return urlStr.toLowerCase();
  }
}

export function getHostname(urlStr: string): string {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return "";
  }
}

export function isWww(hostname: string): boolean {
  return hostname.startsWith("www.");
}

export function stripWww(hostname: string): string {
  if (hostname.startsWith("www.")) return hostname.slice(4);
  return hostname;
}

export function areSameDomain(a: string, b: string): boolean {
  const hostA = stripWww(getHostname(a));
  const hostB = stripWww(getHostname(b));
  return hostA === hostB;
}

export function areSameHost(a: string, b: string): boolean {
  return getHostname(a).toLowerCase() === getHostname(b).toLowerCase();
}

export function getScheme(urlStr: string): string {
  try {
    return new URL(urlStr).protocol.replace(":", "");
  } catch {
    return "";
  }
}

export function describeHostChange(from: string, to: string): string {
  const fromHost = getHostname(from);
  const toHost = getHostname(to);
  const fromBase = stripWww(fromHost);
  const toBase = stripWww(toHost);

  if (fromBase === toBase && fromHost !== toHost) {
    if (!isWww(fromHost) && isWww(toHost)) return "Non-www to www";
    if (isWww(fromHost) && !isWww(toHost)) return "WWW to non-www";
  }

  if (fromBase !== toBase) {
    return `Cross-domain: ${fromBase} → ${toBase}`;
  }

  if (fromHost !== toHost) {
    return `Subdomain change: ${fromHost} → ${toHost}`;
  }

  return "";
}
