"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SslCheckResult {
  hostname: string;
  port: number;
  reachable: boolean;
  certificate: {
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
  } | null;
  tls: {
    protocol: string;
    cipher: string;
    cipherVersion: string;
    alpn: string | null;
    sni: string;
    handshakeTimeMs: number;
  } | null;
  chain: {
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
  }[];
  diagnostics: {
    type: "success" | "warning" | "error" | "info";
    message: string;
  }[];
  httpRedirect: {
    httpToHttps: boolean;
    httpsToHttp: boolean;
    redirectUrl: string | null;
    statusCode: number | null;
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export function SslCertificateCheckerTool() {
  const [hostname, setHostname] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SslCheckResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLInputElement
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleCheck = useCallback(async () => {
    const trimmed = hostname.trim();
    if (!trimmed) {
      setError("Please enter a hostname or URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStage("Connecting securely...");

    const stages = [
      "Inspecting certificate...",
      "Analyzing TLS configuration...",
      "Building certificate chain...",
    ];
    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      if (stageIndex < stages.length) {
        setLoadingStage(stages[stageIndex]);
        stageIndex++;
      }
    }, 1200);

    try {
      const res = await fetch("/api/ssl-certificate-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong.");
        return;
      }

      setResult(data.result);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      clearInterval(stageInterval);
      setLoading(false);
      setLoadingStage(null);
    }
  }, [hostname]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCheck();
      }
    },
    [handleCheck]
  );

  const handleCopy = useCallback(() => {
    if (!result) return;
    const text = formatResultText(result);
    navigator.clipboard.writeText(text);
  }, [result]);

  const certificate = result?.certificate;
  const tls = result?.tls;
  const chain = result?.chain || [];
  const diagnostics = result?.diagnostics || [];

  const validityStatus = certificate
    ? certificate.isExpired
      ? "expired"
      : certificate.isNotYetValid
        ? "not-yet-valid"
        : "valid"
    : null;

  const expirationPercent = certificate
    ? Math.min(
        100,
        Math.max(
          0,
          (certificate.daysRemaining /
            Math.max(
              1,
              (new Date(certificate.validTo).getTime() -
                new Date(certificate.validFrom).getTime()) /
                (1000 * 60 * 60 * 24)
            )) *
            100
        )
      )
    : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-[12px] text-muted-foreground">
        SSL/TLS connections are established server-side. Results reflect the
        certificate presented by the target server.
      </div>

      {/* Input */}
      <div>
        <label
          htmlFor="ssl-hostname"
          className="mb-2 block text-[13px] font-medium text-foreground"
        >
          Hostname or URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="ssl-hostname"
            ref={inputRef}
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="example.com"
            className="h-11 flex-1 rounded-lg border border-border bg-card px-4 text-[14px] font-mono text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5"
          />
          <button
            onClick={handleCheck}
            disabled={loading || !hostname.trim()}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-all hover:opacity-80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Checking...
              </span>
            ) : (
              "Check Certificate"
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && loadingStage && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-[13px] text-muted-foreground">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          {loadingStage}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Status Banner */}
          <StatusBanner
            result={result}
            validityStatus={validityStatus}
            expirationPercent={expirationPercent}
          />

          {/* Diagnostics */}
          {diagnostics.length > 0 && (
            <div className="space-y-1.5">
              {diagnostics.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-lg px-4 py-2 text-[13px] ${
                    d.type === "success"
                      ? "bg-success/5 text-success"
                      : d.type === "error"
                        ? "bg-destructive/5 text-destructive"
                        : d.type === "warning"
                          ? "bg-warning/5 text-warning"
                          : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span className="mt-0.5">
                    {d.type === "success"
                      ? "\u2713"
                      : d.type === "error"
                        ? "\u2717"
                        : d.type === "warning"
                          ? "\u26A0"
                          : "\u2139"}
                  </span>
                  <span>{d.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Certificate Details */}
          {certificate && (
            <ExpandableSection
              title="Certificate Details"
              expanded={expandedSections["details"] ?? true}
              onToggle={() => toggleSection("details")}
            >
              <InfoGrid>
                <InfoItem label="Issuer" value={certificate.issuer} />
                <InfoItem label="Subject" value={certificate.subject} />
                <InfoItem
                  label="Valid From"
                  value={formatDate(certificate.validFrom)}
                />
                <InfoItem
                  label="Valid Until"
                  value={formatDate(certificate.validTo)}
                />
                <InfoItem
                  label="Days Remaining"
                  value={
                    certificate.isExpired
                      ? "Expired"
                      : certificate.isNotYetValid
                        ? "Not yet valid"
                        : `${certificate.daysRemaining} days`
                  }
                />
                <InfoItem label="Serial Number" value={certificate.serialNumber} mono />
                <InfoItem label="Version" value={certificate.version} />
                <InfoItem
                  label="Signature Algorithm"
                  value={certificate.signatureAlgorithm}
                />
                <InfoItem
                  label="Public Key"
                  value={`${certificate.publicKeyAlgorithm} ${certificate.keySize}`}
                />
                {certificate.keyUsage.length > 0 && (
                  <InfoItem
                    label="Key Usage"
                    value={certificate.keyUsage.join(", ")}
                  />
                )}
                {certificate.extendedKeyUsage.length > 0 && (
                  <InfoItem
                    label="Extended Key Usage"
                    value={certificate.extendedKeyUsage.join(", ")}
                  />
                )}
                {certificate.basicConstraints && (
                  <InfoItem
                    label="Basic Constraints"
                    value={
                      certificate.basicConstraints.isCA
                        ? "CA: true"
                        : "CA: false (end-entity)"
                    }
                  />
                )}
                <InfoItem
                  label="Self-Signed"
                  value={certificate.selfSigned ? "Yes" : "No"}
                />
                <InfoItem
                  label="Fingerprint (SHA-1)"
                  value={certificate.fingerprint}
                  mono
                />
                <InfoItem
                  label="Fingerprint (SHA-256)"
                  value={certificate.fingerprint256}
                  mono
                />
              </InfoGrid>
            </ExpandableSection>
          )}

          {/* Hostname Coverage */}
          {certificate && (
            <ExpandableSection
              title="Hostname Coverage"
              expanded={expandedSections["hostname"] ?? true}
              onToggle={() => toggleSection("hostname")}
            >
              <div className="space-y-1.5">
                {certificate.san.map((entry) => (
                  <div
                    key={entry}
                    className="flex items-center gap-2 text-[13px]"
                  >
                    <span className="text-success">\u2713</span>
                    <span className="font-mono text-foreground">{entry}</span>
                  </div>
                ))}
                {certificate.san.length === 0 && (
                  <p className="text-[13px] text-muted-foreground">
                    No Subject Alternative Names found.
                  </p>
                )}
              </div>
            </ExpandableSection>
          )}

          {/* Certificate Chain */}
          {chain.length > 0 && (
            <ExpandableSection
              title="Certificate Chain"
              expanded={expandedSections["chain"] ?? true}
              onToggle={() => toggleSection("chain")}
            >
              <div className="space-y-3">
                {chain.map((entry, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="text-success">\u2713</span>
                      <span className="font-medium text-foreground">
                        {entry.isCA
                          ? i === chain.length - 1
                            ? "Intermediate CA"
                            : "CA Certificate"
                          : "Leaf Certificate"}
                      </span>
                      {entry.selfSigned && (
                        <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[11px] text-warning">
                          Self-Signed
                        </span>
                      )}
                    </div>
                    <div className="ml-5 mt-1 text-[12px] text-muted-foreground">
                      <p>Subject: {entry.subject}</p>
                      <p>Issuer: {entry.issuer}</p>
                      <p>Sig: {entry.signatureAlgorithm}</p>
                    </div>
                    {i < chain.length - 1 && (
                      <div className="ml-2.5 py-1 text-[12px] text-muted-foreground/50">
                        {"\u2193"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* TLS Connection */}
          {tls && (
            <ExpandableSection
              title="TLS Connection"
              expanded={expandedSections["tls"] ?? true}
              onToggle={() => toggleSection("tls")}
            >
              <InfoGrid>
                <InfoItem label="TLS Version" value={tls.protocol} />
                <InfoItem label="Cipher Suite" value={tls.cipher} mono />
                <InfoItem
                  label="ALPN"
                  value={tls.alpn || "Not negotiated"}
                />
                <InfoItem label="SNI" value={tls.sni} mono />
                <InfoItem
                  label="Handshake Time"
                  value={`${tls.handshakeTimeMs}ms`}
                />
              </InfoGrid>
            </ExpandableSection>
          )}

          {/* HTTP / HTTPS */}
          {result.httpRedirect && (
            <ExpandableSection
              title="HTTP / HTTPS"
              expanded={expandedSections["http"] ?? false}
              onToggle={() => toggleSection("http")}
            >
              <InfoGrid>
                <InfoItem
                  label="HTTP to HTTPS Redirect"
                  value={
                    result.httpRedirect.httpToHttps
                      ? `Yes (${result.httpRedirect.statusCode})`
                      : "No"
                  }
                />
                {result.httpRedirect.redirectUrl && (
                  <InfoItem
                    label="Redirect Target"
                    value={result.httpRedirect.redirectUrl}
                    mono
                  />
                )}
              </InfoGrid>
            </ExpandableSection>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={handleCopy}
              className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Copy Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBanner({
  result,
  validityStatus,
  expirationPercent,
}: {
  result: SslCheckResult;
  validityStatus: "expired" | "not-yet-valid" | "valid" | null;
  expirationPercent: number;
}) {
  const certificate = result.certificate;

  return (
    <div
      className={`rounded-xl border p-4 ${
        !result.reachable
          ? "border-destructive/20 bg-destructive/5"
          : validityStatus === "expired"
            ? "border-destructive/20 bg-destructive/5"
            : validityStatus === "not-yet-valid"
              ? "border-warning/20 bg-warning/5"
              : "border-success/20 bg-success/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 text-lg ${
            !result.reachable
              ? "text-destructive"
              : validityStatus === "expired"
                ? "text-destructive"
                : validityStatus === "not-yet-valid"
                  ? "text-warning"
                  : "text-success"
          }`}
        >
          {!result.reachable
            ? "\u2717"
            : validityStatus === "expired"
              ? "\u2717"
              : validityStatus === "not-yet-valid"
                ? "\u26A0"
                : "\u2713"}
        </span>
        <div className="flex-1">
          <p
            className={`text-[15px] font-semibold ${
              !result.reachable
                ? "text-destructive"
                : validityStatus === "expired"
                  ? "text-destructive"
                  : validityStatus === "not-yet-valid"
                    ? "text-warning"
                    : "text-success"
            }`}
          >
            {!result.reachable
              ? "Connection Failed"
              : validityStatus === "expired"
                ? "Certificate Expired"
                : validityStatus === "not-yet-valid"
                  ? "Certificate Not Yet Valid"
                  : "Certificate Valid"}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {result.hostname}
            {result.port !== 443 && `:${result.port}`}
          </p>
          {certificate && !certificate.isExpired && !certificate.isNotYetValid && (
            <div className="mt-2">
              <p className="text-[12px] text-muted-foreground">
                Expires: {formatDate(certificate.validTo)}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {certificate.daysRemaining} days remaining
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    expirationPercent > 50
                      ? "bg-success"
                      : expirationPercent > 20
                        ? "bg-warning"
                        : "bg-destructive"
                  }`}
                  style={{ width: `${expirationPercent}%` }}
                />
              </div>
            </div>
          )}
          {certificate && certificate.isExpired && (
            <p className="mt-1 text-[12px] text-destructive">
              Expired on {formatDate(certificate.validTo)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpandableSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-[13px] font-semibold text-foreground">
          {title}
        </span>
        <span className="text-[12px] text-muted-foreground">
          {expanded ? "\u2212" : "+"}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-border/60 px-4 py-3">{children}</div>
      )}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
      {children}
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className={`${mono ? "font-mono text-[12px]" : ""} text-foreground break-all`}>
        {value}
      </span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return dateStr;
  }
}

function formatResultText(result: SslCheckResult): string {
  const lines: string[] = [];
  lines.push(`SSL Certificate Check: ${result.hostname}:${result.port}`);
  lines.push("");

  if (result.error) {
    lines.push(`Error: ${result.error.message}`);
    return lines.join("\n");
  }

  const c = result.certificate;
  if (c) {
    lines.push(`Status: ${c.isExpired ? "EXPIRED" : c.isNotYetValid ? "NOT YET VALID" : "VALID"}`);
    lines.push(`Issuer: ${c.issuer}`);
    lines.push(`Subject: ${c.subject}`);
    lines.push(`Valid From: ${c.validFrom}`);
    lines.push(`Valid Until: ${c.validTo}`);
    lines.push(`Days Remaining: ${c.daysRemaining}`);
    lines.push(`Serial: ${c.serialNumber}`);
    lines.push(`Version: ${c.version}`);
    lines.push(`Signature: ${c.signatureAlgorithm}`);
    lines.push(`Public Key: ${c.publicKeyAlgorithm} ${c.keySize}`);
    lines.push(`SANs: ${c.san.join(", ")}`);
    lines.push(`Self-Signed: ${c.selfSigned ? "Yes" : "No"}`);
  }

  const t = result.tls;
  if (t) {
    lines.push("");
    lines.push("TLS Connection:");
    lines.push(`  Protocol: ${t.protocol}`);
    lines.push(`  Cipher: ${t.cipher}`);
    lines.push(`  ALPN: ${t.alpn || "N/A"}`);
    lines.push(`  SNI: ${t.sni}`);
    lines.push(`  Handshake: ${t.handshakeTimeMs}ms`);
  }

  return lines.join("\n");
}
