import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { cancelSesLote } from "@/lib/ses/client";
import { summarizeSesHttpResponse } from "@/lib/ses/response";

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-anulacion:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;
    const body = await request.json().catch(() => ({}));
    const parsed = z.object({
      loteCode: z.string().min(1),
      environment: z.enum(["pre", "prod"]).optional(),
      dryRun: z.boolean().optional(),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    const result = await cancelSesLote(parsed.data.loteCode, { environment: parsed.data.environment, dryRun: parsed.data.dryRun ?? true });
    if (!("status" in result)) return NextResponse.json({ dryRun: true, environment: result.environment, endpoint: result.endpoint });
    return NextResponse.json(summarizeSesHttpResponse(result));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error SES" }, { status: 503 });
  }
}
