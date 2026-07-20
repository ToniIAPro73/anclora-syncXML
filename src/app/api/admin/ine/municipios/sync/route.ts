import { NextResponse } from "next/server";
import { logRouteError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth";
import { hasDatabase } from "@/lib/db/prisma";
import { syncIneMunicipios } from "@/lib/ine/municipios";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";

// Allow up to 5 minutes — the INE API can be slow
export const maxDuration = 300;

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(`ine-sync:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ ok: false, message: "Demasiadas solicitudes", errors: [{ reason: "rate_limited" }] }, { status: 429 });
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  if (!hasDatabase()) return NextResponse.json({ ok: false, message: "DATABASE_URL no configurada", errors: [{ reason: "database_unavailable" }] }, { status: 503 });
  try {
    const summary = await syncIneMunicipios();
    return NextResponse.json(summary, { status: summary.ok ? 200 : 207 });
  } catch (error) {
    logRouteError("ine-municipios-sync", error);
    return NextResponse.json({
      ok: false,
      message: "No se pudo sincronizar municipios INE",
      errors: [{ reason: "sync_failed" }],
    }, { status: 500 });
  }
}
