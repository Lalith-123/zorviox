import dns from "dns";
import { promisify } from "util";

const dnsLookupAsync = promisify(dns.lookup);

const PRIVATE_IP_PATTERNS: RegExp[] = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  /^ff[0-9a-f]{2}:/i,
  /^::ffff:127\./,
  /^::ffff:10\./,
  /^::ffff:172\./,
  /^::ffff:192\.168\./,
  /^::ffff:169\.254\./,
];

const BLOCKED_HOSTNAMES = [
  "localhost",
  "metadata.google.internal",
  "169.254.169.254",
  "instance-metadata",
  "metadata",
];

function isPrivateIp(ip: string): boolean {
  const normalized = ip.trim().toLowerCase();
  if (normalized === "0.0.0.0" || normalized === "::" || normalized === "::0") return true;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(normalized));
}

function decodeNumericIp(hostname: string): string | null {
  if (/^0x[0-9a-f]+$/i.test(hostname)) {
    const num = parseInt(hostname, 16);
    if (!isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return `${(num >>> 24) & 0xff}.${(num >>> 16) & 0xff}.${(num >>> 8) & 0xff}.${num & 0xff}`;
    }
  }
  if (/^\d+$/.test(hostname)) {
    const num = parseInt(hostname, 10);
    if (!isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return `${(num >>> 24) & 0xff}.${(num >>> 16) & 0xff}.${(num >>> 8) & 0xff}.${num & 0xff}`;
    }
  }
  if (/^0\d+$/.test(hostname) || /^\d{10,}$/.test(hostname)) {
    const num = parseInt(hostname, 10);
    if (!isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return `${(num >>> 24) & 0xff}.${(num >>> 16) & 0xff}.${(num >>> 8) & 0xff}.${num & 0xff}`;
    }
  }
  return null;
}

function normalizeHostname(input: string): { hostname: string; port: number } {
  let cleaned = input.trim();

  if (cleaned.startsWith("https://")) {
    cleaned = cleaned.slice(8);
  } else if (cleaned.startsWith("http://")) {
    cleaned = cleaned.slice(7);
  }

  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];

  let port = 443;
  if (cleaned.includes(":")) {
    const parts = cleaned.split(":");
    const portNum = parseInt(parts[1], 10);
    if (!isNaN(portNum) && portNum > 0 && portNum <= 65535) {
      port = portNum;
    }
    cleaned = parts[0];
  }

  return { hostname: cleaned.toLowerCase(), port };
}

export function validateUrl(input: string): { valid: boolean; error?: string; url?: URL } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter a URL." };
  }

  let urlStr = trimmed;
  if (!trimmed.match(/^[a-zA-Z]+:\/\//)) {
    urlStr = "https://" + trimmed;
  }

  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    return { valid: false, error: "Please enter a valid URL." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { valid: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  if (url.protocol === "file:" || url.protocol === "ftp:" || url.protocol === "javascript:" || url.protocol === "data:") {
    return { valid: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  const { hostname } = normalizeHostname(urlStr);

  if (hostname.length > 253) {
    return { valid: false, error: "Hostname is too long." };
  }

  if (!hostname || hostname === ".") {
    return { valid: false, error: "Invalid hostname." };
  }

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { valid: false, error: "This hostname is not allowed." };
  }

  if (hostname.includes("..")) {
    return { valid: false, error: "Invalid hostname." };
  }

  if (isPrivateIp(hostname)) {
    return { valid: false, error: "Private/internal addresses are not allowed." };
  }

  const decodedIp = decodeNumericIp(hostname);
  if (decodedIp && isPrivateIp(decodedIp)) {
    return { valid: false, error: "This hostname resolves to a private address." };
  }

  return { valid: true, url };
}

export async function resolveAndValidate(hostname: string): Promise<{ allowed: boolean; ip?: string; error?: string }> {
  try {
    const { address } = await dnsLookupAsync(hostname);

    if (isPrivateIp(address)) {
      return {
        allowed: false,
        ip: address,
        error: `This hostname resolves to a private/internal IP address (${address}). Requests to private addresses are not allowed.`,
      };
    }

    if (address === "169.254.169.254") {
      return {
        allowed: false,
        ip: address,
        error: "This hostname resolves to a cloud metadata endpoint.",
      };
    }

    return { allowed: true, ip: address };
  } catch {
    return {
      allowed: false,
      error: "Could not resolve hostname.",
    };
  }
}

export function isRedirectSafe(location: string): { safe: boolean; error?: string } {
  try {
    const redirectUrl = new URL(location);

    if (!["http:", "https:"].includes(redirectUrl.protocol)) {
      return { safe: false, error: "Redirect targets a non-HTTP(S) protocol." };
    }

    const { hostname } = normalizeHostname(location);

    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      return { safe: false, error: "Redirect targets a blocked hostname." };
    }

    if (isPrivateIp(hostname)) {
      return { safe: false, error: "Redirect targets a private IP address." };
    }

    const decodedIp = decodeNumericIp(hostname);
    if (decodedIp && isPrivateIp(decodedIp)) {
      return { safe: false, error: "Redirect targets a private IP address via numeric representation." };
    }

    return { safe: true };
  } catch {
    return { safe: false, error: "Redirect location is not a valid URL." };
  }
}
