import type { DnsRecordType } from "./types";

export function normalizeHostname(input: string): string {
  let hostname = input.trim();

  if (hostname.startsWith("http://") || hostname.startsWith("https://")) {
    try {
      const url = new URL(hostname);
      hostname = url.hostname;
    } catch {
      // Fall through and try to extract manually
      hostname = hostname.replace(/^https?:\/\//, "").split("/")[0];
    }
  }

  hostname = hostname.split("?")[0].split("#")[0];

  if (hostname.endsWith(".")) {
    hostname = hostname.slice(0, -1);
  }

  hostname = hostname.toLowerCase();

  return hostname;
}

export function isIpAddress(hostname: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    return hostname.split(".").every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (ipv6Regex.test(hostname) && hostname.includes(":")) {
    return true;
  }

  return false;
}

export function isIpv4(hostname: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(hostname)) return false;
  return hostname.split(".").every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

export function isIpv6(hostname: string): boolean {
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  return ipv6Regex.test(hostname) && hostname.includes(":");
}

export function ipToPtr(ip: string): string {
  if (isIpv4(ip)) {
    const parts = ip.split(".").reverse();
    return `${parts.join(".")}.in-addr.arpa`;
  }

  if (isIpv6(ip)) {
    const expanded = expandIpv6(ip);
    const nibbles = expanded.replace(/:/g, "").split("").reverse();
    return `${nibbles.join(".")}.ip6.arpa`;
  }

  return "";
}

function expandIpv6(ip: string): string {
  const parts = ip.split(":");
  const expanded: string[] = [];

  for (const part of parts) {
    if (part === "") {
      const emptyCount = 8 - parts.filter((p) => p !== "").length + 1;
      for (let i = 0; i < emptyCount; i++) {
        expanded.push("0000");
      }
    } else {
      expanded.push(part.padStart(4, "0"));
    }
  }

  return expanded.join(":");
}

export function isValidHostname(hostname: string): { valid: boolean; error?: string } {
  if (!hostname) {
    return { valid: false, error: "Hostname cannot be empty." };
  }

  if (hostname.length > 253) {
    return {
      valid: false,
      error: "Hostname exceeds maximum length of 253 characters.",
    };
  }

  if (isIpAddress(hostname)) {
    return { valid: true };
  }

  const labels = hostname.split(".");

  if (labels.length < 1) {
    return { valid: false, error: "Hostname must have at least one label." };
  }

  for (const label of labels) {
    if (label.length === 0) {
      return { valid: false, error: "Hostname contains an empty label." };
    }

    if (label.length > 63) {
      return {
        valid: false,
        error: `Label "${label}" exceeds maximum length of 63 characters.`,
      };
    }

    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      return {
        valid: false,
        error: `Label "${label}" contains invalid characters. Only alphanumeric characters and hyphens are allowed.`,
      };
    }

    if (label.startsWith("-") || label.endsWith("-")) {
      return {
        valid: false,
        error: `Label "${label}" cannot start or end with a hyphen.`,
      };
    }
  }

  return { valid: true };
}

export function isReverseLookupType(recordType: DnsRecordType): boolean {
  return recordType === "PTR";
}
