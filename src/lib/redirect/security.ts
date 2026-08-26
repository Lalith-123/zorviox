export function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "0.0.0.0" ||
    h === "[::1]"
  )
    return true;
  if (/^10\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^fc00:/i.test(h)) return true;
  if (/^fe80:/i.test(h)) return true;
  if (/^fd/i.test(h)) return true;
  if (h === "metadata.google.internal") return true;
  if (h.endsWith(".metadata.google.internal")) return true;
  return false;
}

export function validateUrl(urlStr: string): URL | null {
  try {
    const url = new URL(urlStr);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (isPrivateHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

export function validateRedirectDestination(
  location: string,
  currentUrl: string
): URL | null {
  let resolved: URL;
  try {
    resolved = new URL(location, currentUrl);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(resolved.protocol)) return null;
  if (isPrivateHost(resolved.hostname)) return null;

  return resolved;
}
