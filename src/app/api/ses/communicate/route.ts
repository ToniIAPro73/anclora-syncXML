import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { validateSesHospedajesXml } from "@/lib/ses/schema";
import { sendReservaHospedajeXml } from "@/lib/ses/client";

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(`ses-communicate:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => ({}));
  const parsed = z.object({
    xml: z.string().min(1),
    environment: z.enum(["pre", "prod"]).optional(),
    dryRun: z.boolean().optional(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload invalido" }, { status: 400 });

  const validation = validateSesHospedajesXml(parsed.data.xml, "altaParteHospedaje");
  if (!validation.ok) return NextResponse.json({ error: "XML no valido contra validacion SES local", validation }, { status: 422 });

  const result = await sendReservaHospedajeXml(parsed.data.xml, {
    environment: parsed.data.environment,
    dryRun: parsed.data.dryRun ?? true,
  });
  const xmlHash = createHash("sha256").update(parsed.data.xml).digest("hex");

  if (!("status" in result)) {
    return NextResponse.json({
      dryRun: true,
      environment: result.environment,
      endpoint: result.endpoint,
      xmlHash,
      message: "Peticion SES preparada en modo simulacion. No se ha enviado informacion al Ministerio.",
    });
  }

  return NextResponse.json({
    sent: true,
    xmlHash,
    status: result.status,
    statusText: result.statusText,
    ok: result.ok,
    response: result.parsed ?? result.body,
  });
}
