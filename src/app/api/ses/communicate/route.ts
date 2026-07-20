import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logRouteError, publicErrorResponse } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth";
import { requireSesProductionSendOptIn } from "@/lib/ses/access";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { validateSesHospedajesXml } from "@/lib/ses/schema";
import { sendParteHospedajeXml } from "@/lib/ses/client";
import { getSesConfig } from "@/lib/ses/config";
import {
  parseComunicacionResponse,
  sanitizeSoapForStorage,
  deriveSesStatus,
  extractFirstCommunicationCode,
  collectSesErrors,
} from "@/lib/ses/parser";
import {
  createSesSubmission,
  updateSesSubmissionFromComunicacion,
  updateSesSubmissionStatus,
} from "@/lib/ses/submissionRepository";
import { buildComunicacionEnvelope } from "@/lib/ses/client";
import { zipXmlBase64 } from "@/lib/ses/zip";

const BodySchema = z.object({
  xml: z.string().min(1),
  environment: z.enum(["pre", "prod"]).optional(),
  dryRun: z.boolean().optional(),
  reference: z.string().optional(),
  fileName: z.string().optional(),
  communicationType: z.enum(["PV", "RH", "AV", "RV"]).optional(),
});

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-communicate:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

    const { xml, environment = "pre", dryRun = true, reference, fileName, communicationType } = parsed.data;
    const productionDenied = requireSesProductionSendOptIn({ environment, dryRun });
    if (productionDenied) return productionDenied;

    // Validate XML type vs communicationType coherence
    const isParteHospedaje = xml.includes("altaParteHospedaje");
    const isReservaHospedaje = xml.includes("altaReservaHospedaje");
    const detectedType = isParteHospedaje ? "PV" : isReservaHospedaje ? "RH" : undefined;
    const effectiveCommunicationType = communicationType ?? detectedType ?? "PV";

    if (communicationType && detectedType && communicationType !== detectedType) {
      return NextResponse.json({
        error: `Tipo de comunicación incoherente: el XML es ${detectedType} pero se indicó ${communicationType}. Revisa el tipo antes de enviar.`,
      }, { status: 422 });
    }

    const validation = validateSesHospedajesXml(xml, isReservaHospedaje ? "altaReservaHospedaje" : "altaParteHospedaje");
    if (!validation.ok) {
      return NextResponse.json({ error: "XML no válido contra validación SES local", validation }, { status: 422 });
    }

    const xmlHash = createHash("sha256").update(xml).digest("hex");
    const config = getSesConfig(environment);

    // ── Dry run ──────────────────────────────────────────────────────────────
    if (dryRun) {
      const zippedXmlBase64 = zipXmlBase64(xml, isParteHospedaje ? "altaParteHospedaje.xml" : "altaReservaHospedaje.xml");
      buildComunicacionEnvelope({
        config: { ...config, landlordCode: config.landlordCode || "PENDING" },
        operation: "A",
        communicationType: effectiveCommunicationType as "PV" | "RH" | "AV" | "RV",
        zippedXmlBase64,
      });
      return NextResponse.json({
        ok: true,
        dryRun: true,
        environment: config.environment,
        endpoint: config.endpoint,
        xmlHash,
        communicationType: effectiveCommunicationType,
        message: "Petición SES preparada en modo simulación. No se ha enviado información al Ministerio.",
      });
    }

    // ── Real send ─────────────────────────────────────────────────────────────
    const submission = await createSesSubmission({
      xmlHash,
      fileName,
      reference,
      environment: config.environment,
      endpoint: config.endpoint,
      landlordCode: config.landlordCode,
      establishmentCode: undefined,
      applicationName: config.applicationName,
      operationType: "A",
      communicationType: effectiveCommunicationType,
      requestSoap: undefined, // SOAP body built inside client; headers never stored
    });

    let httpResult: { ok: boolean; status: number; statusText: string; body: string; parsed: unknown };
    try {
      const result = await sendParteHospedajeXml(xml, { environment, dryRun: false });
      if (!("status" in result)) {
        // Should not happen since dryRun=false, but guard
        await updateSesSubmissionStatus(submission.id, "UNKNOWN");
        return NextResponse.json({ ok: false, submissionId: submission.id, status: "UNKNOWN", message: "Respuesta inesperada del cliente SES" }, { status: 502 });
      }
      httpResult = result as typeof httpResult;
    } catch (networkError) {
      logRouteError("ses-communicate-network", networkError);
      await updateSesSubmissionStatus(submission.id, "FAILED", {
        sesResponseCode: "NETWORK_ERROR",
        sesResponseDescription: "SES network error",
      });
      return NextResponse.json({
        ok: false,
        submissionId: submission.id,
        status: "FAILED",
        message: "No se pudo conectar con SES.HOSPEDAJES",
      }, { status: 503 });
    }

    // HTTP error
    if (!httpResult.ok) {
      const sanitizedResponse = sanitizeSoapForStorage(httpResult.body);
      await updateSesSubmissionStatus(submission.id, "FAILED", {
        sesResponseCode: String(httpResult.status),
        sesResponseDescription: httpResult.statusText,
        responseSoap: sanitizedResponse,
      });
      const detail = httpResult.status === 401 || httpResult.status === 403
        ? "Credenciales SES incorrectas o sin permisos."
        : httpResult.status === 404
        ? "Endpoint SES no encontrado. Revisa la URL configurada."
        : `HTTP ${httpResult.status}: ${httpResult.statusText}`;
      return NextResponse.json({
        ok: false,
        submissionId: submission.id,
        status: "FAILED",
        message: detail,
        xmlHash,
      }, { status: 502 });
    }

    // Parse SOAP response
    const parsedResponse = parseComunicacionResponse(httpResult.body);
    const sanitizedResponseSoap = sanitizeSoapForStorage(httpResult.body);

    const updatedSubmission = await updateSesSubmissionFromComunicacion(
      submission.id,
      parsedResponse,
      sanitizedResponseSoap,
    );

    const finalStatus = updatedSubmission?.status ?? deriveSesStatus(parsedResponse.responseCode, parsedResponse.sesBatchCode, parsedResponse.resultados);
    const communicationCode = updatedSubmission?.communicationCode ?? extractFirstCommunicationCode(parsedResponse);
    const sesErrors = collectSesErrors(parsedResponse.resultados);

    // User-facing message
    let message: string;
    if (!parsedResponse.ok) {
      message = `SES devolvió errores de validación (código ${parsedResponse.responseCode}). Revisa los detalles técnicos antes de reenviar.`;
    } else if (parsedResponse.sesBatchCode) {
      message = `Comunicación enviada a SES.HOSPEDAJES. Lote SES: ${parsedResponse.sesBatchCode}. Consulta el lote para obtener el código final de comunicación.`;
    } else {
      message = "No se ha podido obtener el lote SES. El envío no debe considerarse trazado. Revisa la respuesta técnica.";
    }

    return NextResponse.json({
      ok: parsedResponse.ok,
      submissionId: submission.id,
      xmlHash,
      communicationType: effectiveCommunicationType,
      sesBatchCode: parsedResponse.sesBatchCode,
      sesResponseCode: parsedResponse.responseCode,
      sesResponseDescription: parsedResponse.responseDescription,
      communicationCode,
      status: finalStatus,
      sesErrors: sesErrors.length ? sesErrors : undefined,
      message,
      // Raw SOAP for technical accordion — only on explicit request (no default exposure)
      _rawResponse: undefined,
    });
  } catch (error) {
    logRouteError("ses-communicate", error);
    return publicErrorResponse(503, "SYNCXML_SES_COMMUNICATE_FAILED", "No se pudo procesar la comunicacion SES");
  }
}
