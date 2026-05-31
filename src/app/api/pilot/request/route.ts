import { NextResponse } from "next/server";
import { z } from "zod";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";

const requestSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  apellidos: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  alojamiento: z.string().trim().max(200).optional(),
  inmuebles: z.string().trim().max(80).optional(),
  reservas: z.string().trim().max(80).optional(),
  excelUse: z.string().trim().max(80).optional(),
  problema: z.string().trim().max(1200).optional(),
  alternativa: z.string().trim().max(1200).optional(),
  tiempo: z.string().trim().max(400).optional(),
  muestraSintetica: z.boolean().optional(),
  pay: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  presupuesto: z.string().trim().max(400).optional(),
  mensaje: z.string().trim().max(1600).optional(),
  privacy: z.literal(true),
});

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(getRateLimitKey(request));
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const nexusWebhookUrl = process.env.NEXUS_WEBHOOK_URL;
  const nexusApiKey = process.env.NEXUS_INTERNAL_API_KEY;

  if (!nexusWebhookUrl || !nexusApiKey) {
    console.error("Missing Nexus configuration for pilot request forwarding");
    return NextResponse.json({ error: "Configuración de envío no disponible" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });

  const data = parsed.data;

  try {
    const response = await fetch(nexusWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nexusApiKey}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Nexus responded with ${response.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to forward request to Nexus:", error);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 502 });
  }
}
