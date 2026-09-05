import tls from "tls";
import net from "net";
import dns from "dns";
import crypto from "crypto";
import { promisify } from "util";
import type {
  CertificateInfo,
  TlsConnectionInfo,
  CertificateChainEntry,
  SslCheckResult,
  SslDiagnostic,
  HostnameValidation,
} from "./types";
import { PRIVATE_IP_PATTERNS, INSECURE_TLS_VERSIONS } from "./types";

const dnsLookupAsync = promisify(dns.lookup);
const CONNECTION_TIMEOUT = 10000;

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
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

function parseX509Certificate(raw: Buffer, peerCert: tls.PeerCertificate): CertificateInfo {
  const x509 = new crypto.X509Certificate(raw);

  const sanList = x509.subjectAltName
    ? x509.subjectAltName
        .split(",")
        .map((s) => s.trim().replace(/^DNS:/, ""))
        .filter((s) => s.length > 0)
    : [];

  const now = new Date();
  const validFrom = new Date(x509.validFrom);
  const validTo = new Date(x509.validTo);
  const daysRemaining = Math.ceil(
    (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const keyInfo = parsePublicKeyInfo(peerCert);

  const keyUsage = x509.keyUsage ? [...x509.keyUsage] : [];
  const extKeyUsage = peerCert.ext_key_usage
    ? peerCert.ext_key_usage.map((eku) => formatExtendedKeyUsage(eku))
    : [];

  const basicConstraints = parseBasicConstraints(x509);

  const selfSigned = x509.issuer === x509.subject;

  return {
    subject: x509.subject,
    subjectCN: getFieldFromDn(x509.subject, "CN"),
    subjectOrg: getFieldFromDn(x509.subject, "O") || null,
    subjectOU: getFieldFromDn(x509.subject, "OU") || null,
    subjectCountry: getFieldFromDn(x509.subject, "C") || null,
    issuer: x509.issuer,
    issuerCN: getFieldFromDn(x509.issuer, "CN"),
    issuerOrg: getFieldFromDn(x509.issuer, "O") || null,
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    daysRemaining,
    isExpired: now > validTo,
    isNotYetValid: now < validFrom,
    serialNumber: x509.serialNumber,
    version: x509.subject,
    signatureAlgorithm: extractSignatureAlgorithm(x509),
    publicKeyAlgorithm: keyInfo.algorithm,
    keySize: keyInfo.size,
    san: sanList,
    sanCount: sanList.length,
    keyUsage,
    extendedKeyUsage: extKeyUsage,
    basicConstraints,
    selfSigned,
    fingerprint: x509.fingerprint || "",
    fingerprint256: peerCert.fingerprint256 || "",
  };
}

function getFieldFromDn(dn: string, field: string): string {
  const match = dn.match(new RegExp(`${field}=([^,]+)`));
  return match ? match[1].trim() : "";
}

function parsePublicKeyInfo(cert: tls.PeerCertificate): { algorithm: string; size: string } {
  try {
    const bits = cert.bits || 0;
    const nistCurve = cert.nistCurve;

    if (nistCurve) {
      return { algorithm: "ECDSA", size: nistCurve };
    }

    if (bits > 0) {
      return { algorithm: "RSA", size: `${bits}-bit` };
    }

    return { algorithm: "unknown", size: "unknown" };
  } catch {
    return { algorithm: "unknown", size: "unknown" };
  }
}

function formatExtendedKeyUsage(oid: string): string {
  const map: Record<string, string> = {
    "1.3.6.1.5.5.7.3.1": "TLS Web Server Authentication",
    "1.3.6.1.5.5.7.3.2": "TLS Web Client Authentication",
    "1.3.6.1.5.5.7.3.3": "Code Signing",
    "1.3.6.1.5.5.7.3.4": "Email Protection",
    "1.3.6.1.5.5.7.3.8": "Time Stamping",
    "1.3.6.1.5.5.7.3.9": "OCSP Signing",
  };
  return map[oid] || oid;
}

function extractSignatureAlgorithm(x509: crypto.X509Certificate): string {
  try {
    const sigAlg = x509.toString().match(/Signature Algorithm: ([^\n]+)/);
    return sigAlg ? sigAlg[1].trim() : "unknown";
  } catch {
    return "unknown";
  }
}

function parseBasicConstraints(
  x509: crypto.X509Certificate
): { isCA: boolean; pathLenConstraint: number | null } | null {
  try {
    const text = x509.toString();
    const bcMatch = text.match(/X509v3 Basic Constraints:\s*\n\s*(.+)/);
    if (bcMatch) {
      const bcStr = bcMatch[1];
      const isCA = bcStr.includes("CA:TRUE");
      const pathMatch = bcStr.match(/pathlen:(\d+)/);
      return {
        isCA,
        pathLenConstraint: pathMatch ? parseInt(pathMatch[1], 10) : null,
      };
    }
  } catch {
    // Fall through
  }
  return null;
}

function validateHostname(
  hostname: string,
  cert: CertificateInfo
): HostnameValidation {
  const sanList = cert.san;

  if (sanList.length > 0) {
    for (const entry of sanList) {
      if (matchHostname(hostname, entry)) {
        return {
          valid: true,
          reason: `Hostname matches SAN entry: ${entry}`,
          matchType: entry.startsWith("*.") ? "wildcard" : "exact",
          matchedEntry: entry,
        };
      }
    }
    return {
      valid: false,
      reason: "Hostname does not match any SAN entries",
      matchType: "none",
      matchedEntry: null,
    };
  }

  if (cert.subjectCN) {
    if (matchHostname(hostname, cert.subjectCN)) {
      return {
        valid: true,
        reason: `Hostname matches Common Name: ${cert.subjectCN}`,
        matchType: cert.subjectCN.startsWith("*.") ? "wildcard" : "exact",
        matchedEntry: cert.subjectCN,
      };
    }
  }

  return {
    valid: false,
    reason: "Hostname does not match certificate subject",
    matchType: "none",
    matchedEntry: null,
  };
}

function matchHostname(hostname: string, pattern: string): boolean {
  const h = hostname.toLowerCase();
  const p = pattern.toLowerCase();

  if (h === p) return true;

  if (p.startsWith("*.")) {
    const suffix = p.slice(1);
    if (h.endsWith(suffix)) {
      const prefix = h.slice(0, h.length - suffix.length);
      if (prefix.includes(".")) {
        return false;
      }
      return prefix.length > 0;
    }
    return false;
  }

  return false;
}

function getCn(obj: { CN?: string | string[] } | undefined): string {
  if (!obj || !obj.CN) return "Unknown";
  return Array.isArray(obj.CN) ? obj.CN[0] || "Unknown" : obj.CN;
}

function buildChainFromCerts(
  leafCert: tls.PeerCertificate,
  issuerCert?: tls.PeerCertificate
): CertificateChainEntry[] {
  const chain: CertificateChainEntry[] = [];

  chain.push({
    subject: getCn(leafCert.subject),
    issuer: getCn(leafCert.issuer),
    validFrom: leafCert.valid_from,
    validTo: leafCert.valid_to,
    serialNumber: leafCert.serialNumber || "",
    signatureAlgorithm: "unknown",
    publicKeyAlgorithm: "unknown",
    keySize: "unknown",
    isCA: false,
    isRoot: false,
    isTrusted: true,
    selfSigned:
      getCn(leafCert.issuer) === getCn(leafCert.subject),
  });

  if (issuerCert) {
    chain.push({
      subject: getCn(issuerCert.subject),
      issuer: getCn(issuerCert.issuer),
      validFrom: issuerCert.valid_from,
      validTo: issuerCert.valid_to,
      serialNumber: issuerCert.serialNumber || "",
      signatureAlgorithm: "unknown",
      publicKeyAlgorithm: "unknown",
      keySize: "unknown",
      isCA: true,
      isRoot:
        getCn(issuerCert.issuer) === getCn(issuerCert.subject),
      isTrusted: true,
      selfSigned:
        getCn(issuerCert.issuer) === getCn(issuerCert.subject),
    });
  }

  return chain;
}

export async function checkSslCertificate(
  input: string
): Promise<SslCheckResult> {
  const { hostname, port } = normalizeHostname(input);
  const diagnostics: SslDiagnostic[] = [];

  try {
    const { address } = await dnsLookupAsync(hostname);
    if (isPrivateIp(address)) {
      return {
        hostname,
        port,
        reachable: false,
        certificate: null,
        tls: null,
        chain: [],
        diagnostics: [
          {
            type: "error",
            message:
              "This hostname resolves to a private/internal IP address. SSL certificate checking is not available for private addresses.",
          },
        ],
        hsts: null,
        httpRedirect: null,
        error: {
          code: "PRIVATE_HOST",
          message:
            "Cannot check SSL certificates for private/internal IP addresses.",
        },
      };
    }
  } catch {
    return {
      hostname,
      port,
      reachable: false,
      certificate: null,
      tls: null,
      chain: [],
      diagnostics: [
        {
          type: "error",
          message: `Could not resolve hostname: ${hostname}`,
        },
      ],
      hsts: null,
      httpRedirect: null,
      error: {
        code: "DNS_FAILURE",
        message: `Could not resolve hostname: ${hostname}`,
      },
    };
  }

  return new Promise((resolve) => {
    const startTime = Date.now();

    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: CONNECTION_TIMEOUT,
        ALPNProtocols: ["h2", "http/1.1"],
      },
      () => {
        const handshakeTimeMs = Date.now() - startTime;
        const cert = socket.getPeerCertificate(true);
        const protocol = socket.getProtocol() || "unknown";
        const cipher = socket.getCipher();
        const alpn = socket.alpnProtocol || null;

        if (!cert || !cert.subject || !cert.raw) {
          socket.destroy();
          resolve({
            hostname,
            port,
            reachable: true,
            certificate: null,
            tls: null,
            chain: [],
            diagnostics: [
              {
                type: "error",
                message: "No certificate was presented by the server.",
              },
            ],
            hsts: null,
            httpRedirect: null,
            error: {
              code: "NO_CERTIFICATE",
              message: "No certificate was presented by the server.",
            },
          });
          return;
        }

        const certificate = parseX509Certificate(cert.raw as Buffer, cert);
        const hostnameValidation = validateHostname(hostname, certificate);

        const tlsInfo: TlsConnectionInfo = {
          protocol,
          cipher: cipher?.name || "unknown",
          cipherVersion: cipher?.version || "unknown",
          alpn,
          sni: hostname,
          handshakeTimeMs,
        };

        const chain = buildChainFromCerts(cert, cert.issuerCertificate);

        if (certificate.isExpired) {
          diagnostics.push({
            type: "error",
            message: `Certificate has expired. It was valid until ${new Date(certificate.validTo).toLocaleDateString()}.`,
          });
        } else if (certificate.isNotYetValid) {
          diagnostics.push({
            type: "error",
            message: `Certificate is not yet valid. It becomes valid on ${new Date(certificate.validFrom).toLocaleDateString()}.`,
          });
        } else {
          diagnostics.push({
            type: "success",
            message: "Certificate is currently within its validity period.",
          });
        }

        if (hostnameValidation.valid) {
          diagnostics.push({
            type: "success",
            message: `Hostname matches: ${hostnameValidation.matchedEntry}`,
          });
        } else {
          diagnostics.push({
            type: "error",
            message: hostnameValidation.reason,
          });
        }

        if (certificate.selfSigned) {
          diagnostics.push({
            type: "warning",
            message:
              "Certificate appears to be self-signed. Public websites should use certificates from a trusted Certificate Authority.",
          });
        }

        if (INSECURE_TLS_VERSIONS.includes(protocol)) {
          diagnostics.push({
            type: "warning",
            message: `TLS protocol ${protocol} is considered outdated. Consider upgrading to TLS 1.2 or TLS 1.3.`,
          });
        } else {
          diagnostics.push({
            type: "success",
            message: `TLS protocol ${protocol} is being used.`,
          });
        }

        if (certificate.daysRemaining <= 30 && certificate.daysRemaining > 0) {
          diagnostics.push({
            type: "warning",
            message: `Certificate expires in ${certificate.daysRemaining} days.`,
          });
        } else if (certificate.daysRemaining > 30) {
          diagnostics.push({
            type: "success",
            message: `Certificate has ${certificate.daysRemaining} days until expiration.`,
          });
        }

        socket.destroy();

        resolve({
          hostname,
          port,
          reachable: true,
          certificate,
          tls: tlsInfo,
          chain,
          diagnostics,
          hsts: null,
          httpRedirect: null,
          error: null,
        });
      }
    );

    socket.on("error", (err) => {
      const errObj = err as NodeJS.ErrnoException;

      let errorCode = "TLS_ERROR";
      let errorMessage = `TLS connection failed: ${err.message}`;

      if (errObj.code === "ENOTFOUND") {
        errorCode = "DNS_FAILURE";
        errorMessage = `Could not resolve hostname: ${hostname}`;
      } else if (errObj.code === "ECONNREFUSED") {
        errorCode = "CONNECTION_REFUSED";
        errorMessage = `Connection refused on port ${port}`;
      } else if (errObj.code === "ETIMEDOUT" || errObj.code === "ESOCKETTIMEDOUT") {
        errorCode = "TIMEOUT";
        errorMessage = `Connection timed out after ${CONNECTION_TIMEOUT}ms`;
      } else if (errObj.code === "CERT_HAS_EXPIRED") {
        errorCode = "CERT_EXPIRED";
        errorMessage = "The certificate has expired";
      } else if (errObj.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
        errorCode = "HOSTNAME_MISMATCH";
        errorMessage = "Hostname does not match the certificate";
      } else if (err.message.includes("self signed")) {
        errorCode = "SELF_SIGNED";
        errorMessage = "Certificate is self-signed";
      } else if (err.message.includes("unable to verify")) {
        errorCode = "UNTRUSTED";
        errorMessage = "Certificate chain could not be verified";
      }

      resolve({
        hostname,
        port,
        reachable: false,
        certificate: null,
        tls: null,
        chain: [],
        diagnostics: [
          {
            type: "error",
            message: errorMessage,
          },
        ],
        hsts: null,
        httpRedirect: null,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        hostname,
        port,
        reachable: false,
        certificate: null,
        tls: null,
        chain: [],
        diagnostics: [
          {
            type: "error",
            message: `Connection timed out after ${CONNECTION_TIMEOUT}ms`,
          },
        ],
        hsts: null,
        httpRedirect: null,
        error: {
          code: "TIMEOUT",
          message: `Connection timed out after ${CONNECTION_TIMEOUT}ms`,
        },
      });
    });
  });
}

export async function checkHttpRedirect(
  hostname: string
): Promise<{
  httpToHttps: boolean;
  httpsToHttp: boolean;
  redirectUrl: string | null;
  statusCode: number | null;
}> {
  return new Promise((resolve) => {
    const req = net.connect(80, hostname, () => {
      req.end(
        `HEAD / HTTP/1.1\r\nHost: ${hostname}\r\nConnection: close\r\n\r\n`
      );
    });

    let data = "";
    req.on("data", (chunk) => {
      data += chunk.toString();
    });

    req.on("end", () => {
      const statusCodeMatch = data.match(/^HTTP\/[\d.]+ (\d+)/m);
      const statusCode = statusCodeMatch
        ? parseInt(statusCodeMatch[1], 10)
        : null;
      const locationMatch = data.match(/^location:\s*(.+)$/im);
      const redirectUrl = locationMatch ? locationMatch[1].trim() : null;

      const httpToHttps =
        statusCode !== null &&
        statusCode >= 300 &&
        statusCode < 400 &&
        redirectUrl !== null &&
        redirectUrl.startsWith("https://");

      resolve({
        httpToHttps,
        httpsToHttp: false,
        redirectUrl,
        statusCode,
      });
    });

    req.on("error", () => {
      resolve({
        httpToHttps: false,
        httpsToHttp: false,
        redirectUrl: null,
        statusCode: null,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        httpToHttps: false,
        httpsToHttp: false,
        redirectUrl: null,
        statusCode: null,
      });
    });
  });
}
