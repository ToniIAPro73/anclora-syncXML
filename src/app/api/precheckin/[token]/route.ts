import { NextResponse } from "next/server";
import { getPrecheckinSession, submitPrecheckinTestData, toPublicPrecheckinSession } from "@/lib/precheckin";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";

const SECURITY_HEADERS = {
  "X-Robots-Tag": "noindex, noarchive, nosnippet",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
};

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const rateLimit = sensitiveRateLimiter.check(`precheckin-get:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const { token } = await context.params;
  const session = getPrecheckinSession(token);
  if (!session) return NextResponse.json({ error: "Pre-check-in no encontrado" }, { status: 404 });
  if (session.status === "REVOKED") return NextResponse.json({ error: "Enlace revocado" }, { status: 403 });
  if (session.status === "EXPIRED") return NextResponse.json({ error: "Enlace expirado" }, { status: 403 });

  return NextResponse.json({ session: toPublicPrecheckinSession(session) }, { headers: SECURITY_HEADERS });
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const rateLimit = sensitiveRateLimiter.check(`precheckin-post:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const { token } = await context.params;
  const body = await request.json().catch(() => ({}));
  const result = submitPrecheckinTestData(token, body);
  if (!result) return NextResponse.json({ error: "Pre-check-in no encontrado" }, { status: 404 });
  if (result.status === "REVOKED") return NextResponse.json({ error: "Enlace revocado" }, { status: 403 });
  if (result.status === "EXPIRED") return NextResponse.json({ error: "Enlace expirado" }, { status: 403 });
  if (result.issues.length) return NextResponse.json({ result }, { status: 422, headers: SECURITY_HEADERS });
  
  return NextResponse.json({ result }, { headers: SECURITY_HEADERS });
}
