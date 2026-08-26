import type { RedirectHop } from "./types";

export function extractHeaders(
  response: Response
): Record<string, string> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

export function getRelevantHeaders(
  headers: Record<string, string>
): {
  server: string | null;
  cacheControl: string | null;
  hsts: string | null;
  lastModified: string | null;
  etag: string | null;
  age: string | null;
} {
  return {
    server: headers["server"] || null,
    cacheControl: headers["cache-control"] || null,
    hsts: headers["strict-transport-security"] || null,
    lastModified: headers["last-modified"] || null,
    etag: headers["etag"] || null,
    age: headers["age"] || null,
  };
}

export function getLocationFromHop(hop: RedirectHop): string | null {
  return hop.headers["location"] || null;
}
