import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createReservation, listReservations } from "@/lib/db/reservations";
import { generateHospitalityXml } from "@/lib/xml/generateHospitalityXml";
import { readReferenceTemplate } from "@/lib/xml/template";
import { pseudonymizeSession, recordAuditEvent } from "@/lib/audit";
import { unresolvedDuplicates } from "@/lib/duplicates";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { smartValidateParsedExcel } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;
    const { searchParams } = new URL(request.url);
    const reservations = await listReservations(searchParams.get("q") ?? undefined);
    return NextResponse.json({ reservations });
  } catch {
    return NextResponse.json({ reservations: [] });
  }
}

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`consolidate:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;
    const body = await request.json();
    const payload = z.object({ parsed: z.any(), generated: z.any().optional() }).safeParse(body);
    if (!payload.success) return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    const parsed = smartValidateParsedExcel(payload.data.parsed);
    const generated = generateHospitalityXml(parsed, await readReferenceTemplate());
    if (generated.validation.errors.length) return NextResponse.json({ error: "La reserva contiene errores criticos", validation: generated.validation }, { status: 422 });
    if (unresolvedDuplicates(parsed).length) return NextResponse.json({ error: "Existen duplicados sin resolver" }, { status: 422 });
    const reservation = await createReservation({ parsed, generated });
    recordAuditEvent({
      eventType: "consolidation_confirmed",
      pseudonymousSessionId: pseudonymizeSession(request.headers.get("cookie")),
      recordCount: parsed.guests?.length ?? 0,
      validationResult: generated.validation.status,
      language: "es",
      theme: "dark",
    });
    return NextResponse.json({ reservation });
  } catch {
    return NextResponse.json({ error: "No se pudo consolidar la reserva" }, { status: 500 });
  }
}
