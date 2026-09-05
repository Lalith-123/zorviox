export interface CertificateInfo {
  subject: string;
  subjectCN: string;
  subjectOrg: string | null;
  subjectOU: string | null;
  subjectCountry: string | null;
  issuer: string;
  issuerCN: string;
  issuerOrg: string | null;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  isExpired: boolean;
  isNotYetValid: boolean;
  serialNumber: string;
  version: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  keySize: string;
  san: string[];
  sanCount: number;
  keyUsage: string[];
  extendedKeyUsage: string[];
  basicConstraints: {
    isCA: boolean;
    pathLenConstraint: number | null;
  } | null;
  selfSigned: boolean;
  fingerprint: string;
  fingerprint256: string;
}

export interface TlsConnectionInfo {
  protocol: string;
  cipher: string;
  cipherVersion: string;
  alpn: string | null;
  sni: string;
  handshakeTimeMs: number;
}

export interface CertificateChainEntry {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  keySize: string;
  isCA: boolean;
  isRoot: boolean;
  isTrusted: boolean;
  selfSigned: boolean;
}

export interface SslCheckResult {
  hostname: string;
  port: number;
  reachable: boolean;
  certificate: CertificateInfo | null;
  tls: TlsConnectionInfo | null;
  chain: CertificateChainEntry[];
  diagnostics: SslDiagnostic[];
  hsts: HstsInfo | null;
  httpRedirect: HttpRedirectInfo | null;
  error: SslError | null;
}

export interface SslDiagnostic {
  type: "success" | "warning" | "error" | "info";
  message: string;
}

export interface SslError {
  code: string;
  message: string;
}

export interface HstsInfo {
  present: boolean;
  maxAge: number | null;
  includeSubDomains: boolean;
  preload: boolean;
  header: string | null;
}

export interface HttpRedirectInfo {
  httpToHttps: boolean;
  httpsToHttp: boolean;
  redirectUrl: string | null;
  statusCode: number | null;
}

export interface HostnameValidation {
  valid: boolean;
  reason: string;
  matchType: "exact" | "wildcard" | "san" | "none";
  matchedEntry: string | null;
}

export const INSECURE_TLS_VERSIONS = ["TLSv1", "TLSv1.1", "SSLv3", "SSLv2"];

export const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fd00:/,
  /^fe80:/,
  /^0:/,
  /^localhost$/i,
];
