import { NextResponse } from "next/server";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { requireAuth } from "@/lib/auth";
import { hashBuffer, pseudonymizeSession, recordAuditEvent } from "@/lib/audit";
import { validateUploadFile } from "@/lib/security/files";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { resolveParsedMunicipiosFromDb } from "@/lib/municipios/resolveMunicipio";
import { prismaMunicipioRepository } from "@/lib/db/municipios";

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
    return NextResponse.json({ parsed: result });
  } catch {
    recordAuditEvent({ eventType: "file_import_failed", pseudonymousSessionId: pseudonymizeSession(request.headers.get("cookie")), fileHash: hashBuffer(buffer), language: "es", theme: "dark" });
    return NextResponse.json({ error: "file.corrupt" }, { status: 400 });
  }
}
