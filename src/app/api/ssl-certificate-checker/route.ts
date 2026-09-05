import { NextRequest, NextResponse } from "next/server";
import { performSslCheck } from "@/lib/ssl";
import { extractClientIp } from "@/lib/utils";

const VALID_PORT_RANGE = { min: 1, max: 65535 };

function isValidHostname(input: string): { valid: boolean; error?: string } {
  const cleaned = input
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
    .toLowerCase();

  if (!cleaned) {
    return { valid: false, error: "Please enter a hostname." };
  }

  if (cleaned.length > 253) {
    return { valid: false, error: "Hostname is too long." };
  }

  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleaned)) {
    return { valid: false, error: "Please enter a hostname, not an IP address." };
  }

  const hostnameRegex =
    /^(?!-)[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
  if (!hostnameRegex.test(cleaned)) {
    return {
      valid: false,
      error: "Invalid hostname format. Please enter a valid domain name.",
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  const ip = extractClientIp(request);

  try {
    const body = await request.json();
    const { hostname: rawHostname, port: rawPort } = body;

    if (!rawHostname || typeof rawHostname !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Please enter a hostname or URL.",
          },
        },
        { status: 400 }
      );
    }

    const port = rawPort ? parseInt(rawPort, 10) : 443;
    if (isNaN(port) || port < VALID_PORT_RANGE.min || port > VALID_PORT_RANGE.max) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PORT",
            message: `Port must be between ${VALID_PORT_RANGE.min} and ${VALID_PORT_RANGE.max}.`,
          },
        },
        { status: 400 }
      );
    }

    const validation = isValidHostname(rawHostname);
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

    const result = await performSslCheck(rawHostname, port, ip);
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
