import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { querySesComunicacion } from "@/lib/ses/client";
import { parseConsultaComunicacionResponse } from "@/lib/ses/parser";

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-comunicacion:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;
    const body = await request.json().catch(() => ({}));
    const parsed = z.object({
      communicationCodes: z.array(z.string().min(1)).min(1),
      environment: z.enum(["pre", "prod"]).optional(),
      dryRun: z.boolean().optional(),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error SES" }, { status: 503 });
  }
}
