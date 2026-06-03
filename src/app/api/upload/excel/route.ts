import { NextResponse } from "next/server";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { requireAuth } from "@/lib/auth";
import { hashBuffer, pseudonymizeSession, recordAuditEvent } from "@/lib/audit";
import { validateUploadFile } from "@/lib/security/files";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { resolveParsedMunicipiosFromDb } from "@/lib/municipios/resolveMunicipio";
import { prismaMunicipioRepository } from "@/lib/db/municipios";
import type { GuestRecord } from "@/lib/domain";

// ── H-04: Hermes XML Pre-flight ─────────────────────────────────────────────
// Convert SyncXML internal ISO dates (yyyy-mm-dd) to the dd/mm/yyyy format the
// Hermes pre-flight endpoint expects. Returns "" when absent so that the worker
// (not this route) decides how to treat the missing value.
function toDdMmYyyy(iso?: string): string {
  if (!iso) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
}

function mapGuestToPreflightRow(guest: GuestRecord) {
  return {
    nombre: guest.firstName,
    apellido1: guest.surname1,
    apellido2: guest.surname2,
    fechaNacimiento: toDdMmYyyy(guest.birthDate),
    nationality: guest.nationalityIso3 ?? "",
    tipoDoc: guest.documentType ?? "OTRO",
    numDoc: guest.documentNumber ?? "",
    fechaLlegada: toDdMmYyyy(guest.arrivalDate),
    fechaSalida: toDdMmYyyy(guest.departureDate),
    email: guest.email ?? "",
  };
}

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(`upload:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Archivo no recibido" }, { status: 400 });
  recordAuditEvent({ eventType: "file_import_started", pseudonymousSessionId: pseudonymizeSession(request.headers.get("cookie")), language: "es", theme: "dark" });
  const fileValidation = validateUploadFile(file, [".xlsx", ".csv"]);
  if (!fileValidation.ok) {
    recordAuditEvent({ eventType: "file_import_failed", pseudonymousSessionId: pseudonymizeSession(request.headers.get("cookie")), validationResult: fileValidation.errorCode, language: "es", theme: "dark" });
    return NextResponse.json({ error: fileValidation.errorCode }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const parsed = parseExcelBuffer(buffer, fileValidation.safeName);
    const result = await resolveParsedMunicipiosFromDb(parsed, prismaMunicipioRepository);
    recordAuditEvent({
      eventType: result.validation.errors.length ? "validation_error_detected" : "file_import_validated",
      pseudonymousSessionId: pseudonymizeSession(request.headers.get("cookie")),
      recordCount: result.guests.length,
      validationResult: result.validation.status,
      fileHash: hashBuffer(buffer),
      language: "es",
      theme: "dark",
    });

    // ── H-04: Hermes XML Pre-flight gate ────────────────────────────────────
    const hermesUrl = process.env.HERMES_WORKER_URL;
    const hermesApiKey = process.env.HERMES_WORKER_API_KEY;
    let preflightWarnings: unknown[] = [];

    if (hermesUrl && hermesApiKey) {
      const mappedRows = result.guests.map(mapGuestToPreflightRow);
      const numPersonas = result.reservation.guestCount ?? mappedRows.length;
      const preflight = await fetch(`${hermesUrl}/xml-preflight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hermesApiKey}`,
        },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          rows: mappedRows,
          numPersonas,
          mode: "pilot",
        }),
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (preflight?.gate === "BLOCK") {
        return NextResponse.json(
          { error: "El archivo contiene errores críticos previos a la vista previa", preflight },
          { status: 422 },
        );
      }

      if (preflight?.gate === "WARN") {
        preflightWarnings = preflight.findings ?? [];
      }
    }

    return NextResponse.json({ parsed: result, preflightWarnings });
  } catch {
    recordAuditEvent({ eventType: "file_import_failed", pseudonymousSessionId: pseudonymizeSession(request.headers.get("cookie")), fileHash: hashBuffer(buffer), language: "es", theme: "dark" });
    return NextResponse.json({ error: "file.corrupt" }, { status: 400 });
  }
}
