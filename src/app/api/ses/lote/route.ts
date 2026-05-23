import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { querySesLote } from "@/lib/ses/client";

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(`ses-lote:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => ({}));
  const parsed = z.object({
    loteCodes: z.array(z.string().min(1)).min(1),
    environment: z.enum(["pre", "prod"]).optional(),
    dryRun: z.boolean().optional(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  const result = await querySesLote(parsed.data.loteCodes, { environment: parsed.data.environment, dryRun: parsed.data.dryRun ?? true });
  if ("dryRun" in result && result.dryRun) return NextResponse.json({ dryRun: true, environment: result.environment, endpoint: result.endpoint });
  return NextResponse.json(result);
}
