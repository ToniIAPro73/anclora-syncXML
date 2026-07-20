import { NextResponse } from "next/server";
import { z } from "zod";
import { logRouteError, publicErrorResponse } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth";
import { requireSesProductionSendOptIn } from "@/lib/ses/access";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { querySesLote } from "@/lib/ses/client";
import { parseConsultaLoteResponse, sanitizeSoapForStorage, extractFirstCommunicationCode, collectSesErrors } from "@/lib/ses/parser";
import { getSesSubmissionByBatchCode, updateSesSubmissionFromLote } from "@/lib/ses/submissionRepository";

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-lote:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await request.json().catch(() => ({}));
    const parsed = z.object({
      loteCodes: z.array(z.string().min(1)).min(1),
      environment: z.enum(["pre", "prod"]).optional(),
      dryRun: z.boolean().optional(),
      submissionId: z.string().optional(),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

    const { loteCodes, environment, dryRun = true, submissionId } = parsed.data;
    const productionDenied = requireSesProductionSendOptIn({ environment, dryRun });
    if (productionDenied) return productionDenied;

    const result = await querySesLote(loteCodes, { environment, dryRun });
    if (!("status" in result)) {
      return NextResponse.json({ dryRun: true, environment: result.environment, endpoint: result.endpoint });
    }

    const httpResult = result as { ok: boolean; status: number; statusText: string; body: string; parsed: unknown };
    if (!httpResult.ok) {
      return NextResponse.json({
        ok: false,
        responseCode: String(httpResult.status),
        responseDescription: httpResult.statusText,
        message: `HTTP ${httpResult.status}: ${httpResult.statusText}`,
      }, { status: 502 });
    }

    const parsedResponse = parseConsultaLoteResponse(httpResult.body);
    const sanitizedSoap = sanitizeSoapForStorage(httpResult.body);
    const communicationCode = extractFirstCommunicationCode(parsedResponse);
    const sesErrors = collectSesErrors(parsedResponse.resultados);

    // Resolve which submission to update
    const batchCode = loteCodes[0];
    const resolvedId = submissionId ?? (await getSesSubmissionByBatchCode(batchCode))?.id;
    let updatedSubmission = null;
    if (resolvedId) {
      updatedSubmission = await updateSesSubmissionFromLote(resolvedId, parsedResponse, sanitizedSoap);
    }

    let message: string;
    if (!parsedResponse.ok) {
      message = `SES devolvió error al consultar el lote (código ${parsedResponse.responseCode}): ${parsedResponse.responseDescription}`;
    } else if (communicationCode) {
      message = `Lote procesado. Código de comunicación: ${communicationCode}`;
    } else if (sesErrors.length) {
      message = `Lote procesado con errores de validación (${sesErrors.length} error${sesErrors.length > 1 ? "es" : ""}). Corrige los datos y reenvía.`;
    } else if (parsedResponse.resultados.length) {
      message = "Lote pendiente de procesamiento. Vuelve a consultar en unos minutos.";
    } else {
      message = `Consulta completada: ${parsedResponse.responseDescription}`;
    }

    return NextResponse.json({
      ok: parsedResponse.ok,
      responseCode: parsedResponse.responseCode,
      responseDescription: parsedResponse.responseDescription,
      communicationCode,
      batchStatus: updatedSubmission?.status,
      submissionId: resolvedId,
      sesErrors: sesErrors.length ? sesErrors : undefined,
      resultados: parsedResponse.resultados.length,
      message,
    });
  } catch (error) {
    logRouteError("ses-lote", error);
    return publicErrorResponse(503, "SYNCXML_SES_LOTE_FAILED", "No se pudo consultar el lote SES");
  }
}
