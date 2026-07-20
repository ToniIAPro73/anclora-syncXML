import { NextResponse } from "next/server";
import { z } from "zod";
import { logRouteError, publicErrorResponse } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth";
import { requireSesProductionSendOptIn } from "@/lib/ses/access";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { querySesComunicacion } from "@/lib/ses/client";
import { parseConsultaComunicacionResponse } from "@/lib/ses/parser";

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-comunicacion:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;
    const body = await request.json().catch(() => ({}));
    const parsed = z.object({
      communicationCodes: z.array(z.string().min(1)).min(1),
      environment: z.enum(["pre", "prod"]).optional(),
      dryRun: z.boolean().optional(),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    const productionDenied = requireSesProductionSendOptIn({
      environment: parsed.data.environment,
      dryRun: parsed.data.dryRun ?? true,
    });
    if (productionDenied) return productionDenied;

    const result = await querySesComunicacion(parsed.data.communicationCodes, {
      environment: parsed.data.environment,
      dryRun: parsed.data.dryRun ?? true,
    });
    if (!("status" in result)) {
      return NextResponse.json({ dryRun: true, environment: result.environment, endpoint: result.endpoint });
    }

    const httpResult = result as { ok: boolean; status: number; statusText: string; body: string };
    const parsedResponse = parseConsultaComunicacionResponse(httpResult.body);

    return NextResponse.json({
      ok: parsedResponse.ok,
      responseCode: parsedResponse.responseCode,
      responseDescription: parsedResponse.responseDescription,
      communicationCount: parsedResponse.communications.length,
      message: parsedResponse.ok
        ? `Consulta completada: ${parsedResponse.responseDescription}`
        : `Error SES ${parsedResponse.responseCode}: ${parsedResponse.responseDescription}`,
    });
  } catch (error) {
    logRouteError("ses-comunicacion", error);
    return publicErrorResponse(503, "SYNCXML_SES_COMMUNICATION_QUERY_FAILED", "No se pudo consultar la comunicacion SES");
  }
}
