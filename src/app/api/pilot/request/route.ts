import { NextResponse } from "next/server";
import { z } from "zod";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { Resend } from "resend";

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
  
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;
  const resendTo = process.env.SYNCXML_PILOT_REQUEST_TO;

  if (!nexusWebhookUrl && !resendApiKey) {
    console.error("Missing Nexus and Resend configuration for pilot request forwarding");
    return NextResponse.json({ error: "Configuración de envío no disponible" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });

  const data = parsed.data;

  // Try Nexus first if configured
  if (nexusWebhookUrl && nexusApiKey) {
    try {
      const response = await fetch(nexusWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nexusApiKey}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return NextResponse.json({ ok: true });
      }
      console.warn(`Nexus responded with ${response.status}, falling back to Resend if available`);
    } catch (error) {
      console.error("Failed to forward request to Nexus:", error);
      if (!resendApiKey) {
        return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 502 });
      }
    }
  }

  // Fallback to Resend
  if (resendApiKey && resendFrom && resendTo) {
    try {
      const resend = new Resend(resendApiKey);
      const { error } = await resend.emails.send({
        from: resendFrom,
        to: resendTo,
        replyTo: data.email,
        subject: `Nueva solicitud de piloto: ${data.nombre} ${data.apellidos}`,
        text: `
Nueva solicitud de piloto controlado recibida.

DATOS PERSONALES
Nombre: ${data.nombre} ${data.apellidos}
Email: ${data.email}
Alojamiento: ${data.alojamiento || "No especificado"}

OPERATIVA
Inmuebles: ${data.inmuebles || "No especificado"}
Reservas/mes: ${data.reservas || "No especificado"}
¿Usa Excel?: ${data.excelUse || "No especificado"}
Problema: ${data.problema || "No especificado"}
Alternativa: ${data.alternativa || "No especificada"}
Tiempo: ${data.tiempo || "No especificado"}
¿Muestra sintética?: ${data.muestraSintetica ? "Sí" : "No"}

DISPOSICIÓN DE PAGO
¿Interés?: ${data.pay || "No especificado"}
Modelo: ${data.model || "No especificado"}
Presupuesto: ${data.presupuesto || "No especificado"}

MENSAJE
${data.mensaje || "Sin mensaje adicional."}
        `,
      });

      if (error) {
        throw error;
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      return NextResponse.json({ error: "No se pudo enviar la solicitud" }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Configuración de envío no disponible" }, { status: 503 });
}
