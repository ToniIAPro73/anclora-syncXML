import { NextResponse } from "next/server";
import { reservationPayloadSchema } from "@/lib/api/parsedExcelPayload";
import { getSessionOwnerId, getSessionUser, requireAuth } from "@/lib/auth";
import { createReservation, listReservations, ReservationPersistenceUnavailableError } from "@/lib/db/reservations";
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
    const user = await getSessionUser();
    const ownerId = user ? getSessionOwnerId(user) : undefined;
    if (!ownerId) return NextResponse.json({ error: "Sesión no válida para reservas" }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const reservations = await listReservations({ ownerId, query: searchParams.get("q") ?? undefined });
    return NextResponse.json({ reservations });
  } catch (error) {
    if (error instanceof ReservationPersistenceUnavailableError) {
      return NextResponse.json({ error: "Persistencia de reservas no disponible" }, { status: 503 });
    }
    return NextResponse.json({ reservations: [] });
  }
}

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`consolidate:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;
    const user = await getSessionUser();
    const ownerId = user ? getSessionOwnerId(user) : undefined;
    if (!ownerId) return NextResponse.json({ error: "Sesión no válida para reservas" }, { status: 403 });
    const body = await request.json();
    const payload = reservationPayloadSchema.safeParse(body);
    if (!payload.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    const parsed = smartValidateParsedExcel(payload.data.parsed);
    const generated = generateHospitalityXml(parsed, await readReferenceTemplate());
    if (generated.validation.errors.length) return NextResponse.json({ error: "La reserva contiene errores críticos", validation: generated.validation }, { status: 422 });
    if (unresolvedDuplicates(parsed).length) return NextResponse.json({ error: "Existen duplicados sin resolver" }, { status: 422 });
    const reservation = await createReservation({ parsed, generated, ownerId });
    recordAuditEvent({
      eventType: "consolidation_confirmed",
      pseudonymousSessionId: pseudonymizeSession(request.headers.get("cookie")),
      recordCount: parsed.guests?.length ?? 0,
      validationResult: generated.validation.status,
      language: "es",
      theme: "dark",
    });
    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof ReservationPersistenceUnavailableError) {
      return NextResponse.json({ error: "Persistencia de reservas no disponible" }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo consolidar la reserva" }, { status: 500 });
  }
}
