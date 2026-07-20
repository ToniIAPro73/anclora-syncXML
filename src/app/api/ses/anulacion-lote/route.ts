import { NextResponse } from "next/server";
import { z } from "zod";
import { logRouteError, publicErrorResponse } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth";
import { requireSesProductionSendOptIn } from "@/lib/ses/access";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { cancelSesLote } from "@/lib/ses/client";
import { summarizeSesHttpResponse } from "@/lib/ses/response";
import { cancelSesSubmissionByBatchCode } from "@/lib/ses/submissionRepository";

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-anulacion:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;
    const body = await request.json().catch(() => ({}));
    const parsed = z.object({
      loteCode: z.string().min(1),
      environment: z.enum(["pre", "prod"]).optional(),
      dryRun: z.boolean().optional(),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    const { loteCode, environment, dryRun = true } = parsed.data;
    const productionDenied = requireSesProductionSendOptIn({ environment, dryRun });
    if (productionDenied) return productionDenied;
    const result = await cancelSesLote(loteCode, { environment, dryRun });
    if (!("status" in result)) return NextResponse.json({ dryRun: true, environment: result.environment, endpoint: result.endpoint });
    const summary = summarizeSesHttpResponse(result);
    // Mark the corresponding submission as CANCELLED in the database so it no longer
    // blocks duplicate-detection on re-send. Only mark after a non-dry-run call.
    if (!dryRun) {
      await cancelSesSubmissionByBatchCode(loteCode).catch(() => { /* best-effort — do not fail the response */ });
    }
    return NextResponse.json(summary);
  } catch (error) {
    logRouteError("ses-anulacion-lote", error);
    return publicErrorResponse(503, "SYNCXML_SES_CANCEL_FAILED", "No se pudo anular el lote SES");
  }
}
