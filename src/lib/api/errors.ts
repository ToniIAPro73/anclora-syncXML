import { NextResponse } from "next/server";

function sanitizeErrorDetail(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .slice(0, 500);
}

export function logRouteError(context: string, error: unknown) {
  console.error(`[${context}]`, {
    name: error instanceof Error ? error.name : "UnknownError",
    detail: sanitizeErrorDetail(error),
  });
}

export function publicErrorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status });
}
