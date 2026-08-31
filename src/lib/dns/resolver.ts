import dns from "dns";
import { promisify } from "util";
import type {
  DnsRecordType,
  DnsRecordUnion,
  DnsARecord,
  DnsAaaaRecord,
  DnsCnameRecord,
  DnsMxRecord,
  DnsNsRecord,
  DnsTxtRecord,
  DnsSoaRecord,
  DnsCaaRecord,
  DnsPtrRecord,
  DnsSrvRecord,
  DnsLookupResult,
  DnsError,
} from "./types";
import { normalizeHostname, isIpAddress, isIpv4, isIpv6, ipToPtr, isReverseLookupType } from "./normalize";

const resolve4Async = promisify(dns.resolve4);
const resolve6Async = promisify(dns.resolve6);
const resolveCnameAsync = promisify(dns.resolveCname);
const resolveMxAsync = promisify(dns.resolveMx);
const resolveNsAsync = promisify(dns.resolveNs);
const resolveTxtAsync = promisify(dns.resolveTxt);
const resolveSoaAsync = promisify(dns.resolveSoa);
const resolveSrvAsync = promisify(dns.resolveSrv);
const resolvePtrAsync = promisify(dns.resolvePtr);
const resolveAsync = promisify(dns.resolve);

const QUERY_TIMEOUT = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("ETIMEDOUT")), ms)
    ),
  ]);
}

function mapDnsError(err: unknown): DnsError {
  const error = err as { code?: string; message?: string };
  const code = error.code || "UNKNOWN";

  const messages: Record<string, string> = {
    ENOTFOUND:
      "The queried domain name does not exist (NXDOMAIN).",
    ENODATA:
      "The name exists but no record of the requested type was found (NODATA).",
    EREFUSED:
      "The DNS server refused to answer the query.",
    ETIMEDOUT:
      "The DNS query timed out. The server may be unreachable or the network may be experiencing issues.",
    ESERVFAIL:
      "The DNS server encountered an internal error while processing the query.",
    EBADRESP:
      "The DNS server returned an invalid or unexpected response.",
    EAI_BADFLAGS:
      "Invalid flags were passed to the DNS resolver.",
    EAI_NONAME:
      "The hostname does not exist or has no address records.",
  };

  return {
    code,
    message: messages[code] || `DNS error: ${error.message || "Unknown error"}`,
  };
}

async function resolveA(
  hostname: string
): Promise<DnsARecord[]> {
  const addresses = await withTimeout(resolve4Async(hostname), QUERY_TIMEOUT);
  return addresses.map(
    (addr): DnsARecord => ({
      type: "A",
      name: hostname,
      value: addr,
      address: addr,
      ttl: 0,
    })
  );
}

async function resolveAaaa(
  hostname: string
): Promise<DnsAaaaRecord[]> {
  const addresses = await withTimeout(resolve6Async(hostname), QUERY_TIMEOUT);
  return addresses.map(
    (addr): DnsAaaaRecord => ({
      type: "AAAA",
      name: hostname,
      value: addr,
      address: addr,
      ttl: 0,
    })
  );
}

async function resolveCname(
  hostname: string
): Promise<DnsCnameRecord[]> {
  const cnames = await withTimeout(resolveCnameAsync(hostname), QUERY_TIMEOUT);
  return cnames.map(
    (name): DnsCnameRecord => ({
      type: "CNAME",
      name: hostname,
      value: name,
      ttl: 0,
    })
  );
}

async function resolveMx(
  hostname: string
): Promise<DnsMxRecord[]> {
  const mxRecords = await withTimeout(resolveMxAsync(hostname), QUERY_TIMEOUT);
  return mxRecords
    .sort((a, b) => a.priority - b.priority)
    .map(
      (mx): DnsMxRecord => ({
        type: "MX",
        name: hostname,
        value: `${mx.priority} ${mx.exchange}`,
        exchange: mx.exchange,
        priority: mx.priority,
        ttl: 0,
      })
    );
}

async function resolveNs(
  hostname: string
): Promise<DnsNsRecord[]> {
  const nsRecords = await withTimeout(resolveNsAsync(hostname), QUERY_TIMEOUT);
  return nsRecords.map(
    (ns): DnsNsRecord => ({
      type: "NS",
      name: hostname,
      value: ns,
      ttl: 0,
    })
  );
}

async function resolveTxt(
  hostname: string
): Promise<DnsTxtRecord[]> {
  const txtRecords = await withTimeout(resolveTxtAsync(hostname), QUERY_TIMEOUT);
  return txtRecords.map(
    (txt): DnsTxtRecord => ({
      type: "TXT",
      name: hostname,
      value: txt.join(" "),
      ttl: 0,
    })
  );
}

async function resolveSoa(
  hostname: string
): Promise<DnsSoaRecord[]> {
  const soa = await withTimeout(resolveSoaAsync(hostname), QUERY_TIMEOUT);
  return [
    {
      type: "SOA",
      name: hostname,
      value: `${soa.nsname} ${soa.hostmaster} ${soa.serial} ${soa.refresh} ${soa.retry} ${soa.expire}`,
      nsname: soa.nsname,
      hostmaster: soa.hostmaster,
      serial: soa.serial,
      refresh: soa.refresh,
      retry: soa.retry,
      expire: soa.expire,
      minimum: 0,
      ttl: 0,
    },
  ];
}

async function resolveSrv(
  hostname: string
): Promise<DnsSrvRecord[]> {
  const srvRecords = await withTimeout(resolveSrvAsync(hostname), QUERY_TIMEOUT);
  return srvRecords
    .sort((a, b) => a.priority - b.priority || b.weight - a.weight)
    .map(
      (srv): DnsSrvRecord => ({
        type: "SRV",
        name: hostname,
        value: `${srv.priority} ${srv.weight} ${srv.port} ${srv.name}`,
        priority: srv.priority,
        weight: srv.weight,
        port: srv.port,
        target: srv.name,
        ttl: 0,
      })
    );
}

async function resolvePtr(
  hostname: string
): Promise<DnsPtrRecord[]> {
  let ptrName = hostname;

  if (isIpv4(hostname)) {
    ptrName = ipToPtr(hostname);
  } else if (isIpv6(hostname)) {
    ptrName = ipToPtr(hostname);
  }

  const ptrRecords = await withTimeout(resolvePtrAsync(ptrName), QUERY_TIMEOUT);
  return ptrRecords.map(
    (ptr): DnsPtrRecord => ({
      type: "PTR",
      name: hostname,
      value: ptr,
      ttl: 0,
    })
  );
}

async function resolveCaa(
  hostname: string
): Promise<DnsCaaRecord[]> {
  try {
    const records = await withTimeout(resolveAsync(hostname, "CAA"), QUERY_TIMEOUT);
    return records.map(
      (record): DnsCaaRecord => {
        const r = record as unknown as Record<string, unknown>;
        const tagVal = (r.tag as string) || "";
        const valueVal = (r.value as string) || "";
        return {
          type: "CAA",
          name: hostname,
          value: `${r.flags || 0} ${tagVal} ${valueVal}`,
          flags: (r.flags as number) || 0,
          tag: tagVal,
          ttl: 0,
        };
      }
    );
  } catch {
    return [];
  }
}

const RESOLVERS: Record<DnsRecordType, (hostname: string) => Promise<DnsRecordUnion[]>> = {
  A: resolveA,
  AAAA: resolveAaaa,
  CNAME: resolveCname,
  MX: resolveMx,
  NS: resolveNs,
  TXT: resolveTxt,
  SOA: resolveSoa,
  CAA: resolveCaa,
  PTR: resolvePtr,
  SRV: resolveSrv,
};

export async function lookupDns(
  hostname: string,
  recordType: DnsRecordType
): Promise<DnsLookupResult> {
  const normalized = normalizeHostname(hostname);
  const diagnostics: string[] = [];

  if (recordType === "PTR" && !isIpAddress(normalized)) {
    return {
      hostname: normalized,
      recordType,
      status: "ERROR",
      records: [],
      responseTimeMs: 0,
      error: {
        code: "INVALID_INPUT",
        message:
          "PTR lookups require an IP address. Please enter an IPv4 or IPv6 address.",
      },
      diagnostics,
    };
  }

  if (isReverseLookupType(recordType)) {
    diagnostics.push(
      `Performing reverse DNS lookup for ${normalized}`
    );
  }

  const start = Date.now();

  try {
    const resolver = RESOLVERS[recordType];
    const records = await resolver(normalized);
    const responseTimeMs = Date.now() - start;

    if (records.length === 0) {
      diagnostics.push(
        `No ${recordType} records were returned for ${normalized}.`
      );
    }

    return {
      hostname: normalized,
      recordType,
      status: "NOERROR",
      records,
      responseTimeMs,
      diagnostics,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    const dnsError = mapDnsError(err);

    if (dnsError.code === "ENOTFOUND") {
      diagnostics.push(
        `The hostname ${normalized} does not exist (NXDOMAIN).`
      );
    } else if (dnsError.code === "ENODATA") {
      diagnostics.push(
        `The hostname ${normalized} exists but has no ${recordType} records.`
      );
    }

    return {
      hostname: normalized,
      recordType,
      status: dnsError.code,
      records: [],
      responseTimeMs,
      error: dnsError,
      diagnostics,
    };
  }
}

export async function lookupAllRecords(
  hostname: string
): Promise<DnsLookupResult[]> {
  const types: DnsRecordType[] = [
    "A",
    "AAAA",
    "CNAME",
    "MX",
    "NS",
    "TXT",
    "SOA",
    "CAA",
    "SRV",
  ];

  const results = await Promise.allSettled(
    types.map((type) => lookupDns(hostname, type))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      hostname: normalizeHostname(hostname),
      recordType: types[index],
      status: "ERROR",
      records: [],
      responseTimeMs: 0,
      error: {
        code: "UNKNOWN",
        message: "An unexpected error occurred during DNS lookup.",
      },
      diagnostics: [],
    };
  });
}
