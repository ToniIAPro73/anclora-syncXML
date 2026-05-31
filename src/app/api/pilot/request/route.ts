import { NextResponse } from "next/server";
import { z } from "zod";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { Resend } from "resend";

const requestSchema = z.object({
  name: z.string().trim().min(1).max(180).optional(),
  nombre: z.string().trim().min(1).max(120).optional(),
  apellidos: z.string().trim().min(1).max(160).optional(),
  email: z.string().trim().email().max(254),
  companyName: z.string().trim().max(200).optional(),
  role: z.string().trim().max(120).optional(),
  accommodationType: z.string().trim().min(1).max(120).optional(),
  estimatedMonthlyReservations: z.string().trim().min(1).max(80).optional(),
  currentWorkflow: z.string().trim().min(1).max(1200).optional(),
  mainPain: z.string().trim().min(1).max(1200).optional(),
  wantsToValidate: z.string().trim().max(1200).optional(),
  acceptsSyntheticOrAnonymizedData: z.literal(true).optional(),
  acceptsPilotConditions: z.literal(true).optional(),
  locale: z.string().trim().max(12).optional(),
  source: z.literal("syncxml_landing").optional(),
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
}).superRefine((value, ctx) => {
  const name = value.name || [value.nombre, value.apellidos].filter(Boolean).join(" ").trim();
  if (!name) ctx.addIssue({ code: "custom", message: "name required", path: ["name"] });
  if (!(value.acceptsSyntheticOrAnonymizedData ?? value.muestraSintetica)) {
    ctx.addIssue({ code: "custom", message: "synthetic data acceptance required", path: ["acceptsSyntheticOrAnonymizedData"] });
  }
  if (!(value.acceptsPilotConditions ?? value.privacy)) {
    ctx.addIssue({ code: "custom", message: "pilot conditions acceptance required", path: ["acceptsPilotConditions"] });
  }
});

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(getRateLimitKey(request));
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const nexusWebhookUrl = process.env.NEXUS_SYNCXML_WEBHOOK_URL || process.env.NEXUS_WEBHOOK_URL;
  const nexusApiKey = process.env.NEXUS_SYNCXML_WEBHOOK_SECRET || process.env.NEXUS_INTERNAL_API_KEY;
  
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL;
  const resendTo = process.env.ADMIN_EMAILS || process.env.SYNCXML_PILOT_REQUEST_TO;

  if (!nexusWebhookUrl && !resendApiKey) {
    console.error("Missing Nexus and Resend configuration for pilot request forwarding");
    return NextResponse.json({ error: "Configuración de envío no disponible" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });

  const data = parsed.data;
  const normalized = {
    requestId: crypto.randomUUID(),
    name: data.name || [data.nombre, data.apellidos].filter(Boolean).join(" ").trim(),
    email: data.email,
    companyName: data.companyName || data.alojamiento,
    role: data.role,
    accommodationType: data.accommodationType || data.alojamiento || "No especificado",
    estimatedMonthlyReservations: data.estimatedMonthlyReservations || data.reservas || "No especificado",
    currentWorkflow: data.currentWorkflow || data.alternativa || data.excelUse || "No especificado",
    mainPain: data.mainPain || data.problema || "No especificado",
    wantsToValidate: data.wantsToValidate || data.tiempo || data.mensaje || "No especificado",
    acceptsSyntheticOrAnonymizedData: true,
    acceptsPilotConditions: true,
    locale: data.locale || "es",
    source: "syncxml_landing",
    raw: {
      properties: data.inmuebles,
      paymentInterest: data.pay,
      preferredModel: data.model,
      budget: data.presupuesto,
      message: data.mensaje,
    },
  };

  // Try Nexus first if configured
  if (nexusWebhookUrl && nexusApiKey) {
    try {
      const response = await fetch(nexusWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nexusApiKey}`
        },
        body: JSON.stringify(normalized)
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
        replyTo: normalized.email,
        subject: `Nueva solicitud de piloto: ${normalized.name}`,
        text: `
Nueva solicitud de piloto controlado recibida.

DATOS PERSONALES
Request ID: ${normalized.requestId}
Nombre: ${normalized.name}
Email: ${normalized.email}
Empresa/alojamiento: ${normalized.companyName || "No especificado"}
Rol: ${normalized.role || "No especificado"}

OPERATIVA
Tipo alojamiento: ${normalized.accommodationType}
Reservas/mes: ${normalized.estimatedMonthlyReservations}
Flujo actual: ${normalized.currentWorkflow}
Problema: ${normalized.mainPain}
Quiere validar: ${normalized.wantsToValidate}
Acepta muestra sintética/anonimizada: Sí
Acepta condiciones piloto: Sí

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
