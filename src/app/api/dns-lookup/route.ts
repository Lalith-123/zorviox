import { NextRequest, NextResponse } from "next/server";
import { lookupDns, lookupAllRecords } from "@/lib/dns/resolver";
import { normalizeHostname, isValidHostname } from "@/lib/dns/normalize";
import { SUPPORTED_RECORD_TYPES } from "@/lib/dns/types";
import type { DnsRecordType } from "@/lib/dns/types";
import { extractClientIp, checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = extractClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message:
            "Too many requests. Please wait a moment before trying again.",
        },
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { hostname: rawHostname, recordType } = body;

    if (!rawHostname || typeof rawHostname !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Please provide a hostname.",
          },
        },
        { status: 400 }
      );
    }

    const hostname = normalizeHostname(rawHostname);

    const validation = isValidHostname(hostname);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    if (recordType === "ALL") {
      const results = await lookupAllRecords(hostname);
      return NextResponse.json({ results });
    }

    if (
      !recordType ||
      typeof recordType !== "string" ||
      !SUPPORTED_RECORD_TYPES.includes(recordType as DnsRecordType)
    ) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: `Invalid record type. Supported types: ${SUPPORTED_RECORD_TYPES.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    const result = await lookupDns(hostname, recordType as DnsRecordType);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "An unexpected error occurred. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
