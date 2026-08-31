export type DnsRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "NS"
  | "TXT"
  | "SOA"
  | "CAA"
  | "PTR"
  | "SRV";

export const SUPPORTED_RECORD_TYPES: DnsRecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
  "SOA",
  "CAA",
  "PTR",
  "SRV",
];

export interface DnsRecord {
  type: DnsRecordType;
  name: string;
  value: string;
  ttl: number;
  class?: string;
}

export interface DnsARecord extends DnsRecord {
  type: "A";
  address: string;
}

export interface DnsAaaaRecord extends DnsRecord {
  type: "AAAA";
  address: string;
}

export interface DnsCnameRecord extends DnsRecord {
  type: "CNAME";
  value: string;
}

export interface DnsMxRecord extends DnsRecord {
  type: "MX";
  priority: number;
  exchange: string;
}

export interface DnsNsRecord extends DnsRecord {
  type: "NS";
  value: string;
}

export interface DnsTxtRecord extends DnsRecord {
  type: "TXT";
  value: string;
}

export interface DnsSoaRecord extends DnsRecord {
  type: "SOA";
  nsname: string;
  hostmaster: string;
  serial: number;
  refresh: number;
  retry: number;
  expire: number;
  minimum: number;
}

export interface DnsCaaRecord extends DnsRecord {
  type: "CAA";
  flags: number;
  tag: string;
  value: string;
}

export interface DnsPtrRecord extends DnsRecord {
  type: "PTR";
  value: string;
}

export interface DnsSrvRecord extends DnsRecord {
  type: "SRV";
  priority: number;
  weight: number;
  port: number;
  target: string;
}

export type DnsRecordUnion =
  | DnsARecord
  | DnsAaaaRecord
  | DnsCnameRecord
  | DnsMxRecord
  | DnsNsRecord
  | DnsTxtRecord
  | DnsSoaRecord
  | DnsCaaRecord
  | DnsPtrRecord
  | DnsSrvRecord;

export interface DnsError {
  code: string;
  message: string;
}

export interface DnsLookupResult {
  hostname: string;
  recordType: DnsRecordType | "ALL";
  status: string;
  records: DnsRecordUnion[];
  responseTimeMs: number;
  error?: DnsError;
  diagnostics: string[];
}

export interface DnsLookupRequest {
  hostname: string;
  recordType: DnsRecordType | "ALL";
}

export const DNS_ERROR_MESSAGES: Record<string, string> = {
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
  default: "An unexpected DNS error occurred.",
};
