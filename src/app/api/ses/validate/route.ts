import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { validateSesHospedajesXml } from "@/lib/ses/schema";

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(`ses-validate:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => ({}));
  const parsed = z.object({ xml: z.string().min(1), kind: z.enum(["altaParteHospedaje", "altaReservaHospedaje"]).optional() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  const validation = validateSesHospedajesXml(parsed.data.xml, parsed.data.kind ?? "altaParteHospedaje");
  return NextResponse.json({ validation });
}
