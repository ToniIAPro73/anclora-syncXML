import { after, NextResponse } from "next/server";
import { z } from "zod";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { Resend } from "resend";

export const maxDuration = 120;

const APP_NAME = "Anclora SyncXML";
const BRAND_BG = "#070A12";
const BRAND_SURFACE = "#101827";
const BRAND_SURFACE_ELEVATED = "#151F32";
const BRAND_ACCENT = "#BFA46A";
const BRAND_TEXT = "#F8FAFC";
const BRAND_MUTED = "#A8B3C7";

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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeValue(value: unknown, fallback = "No especificado") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function safeWebhookLabel(url: string | undefined) {
  if (!url) return "missing";
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return "invalid_url";
  }
}

function detailRow(label: string, value: unknown) {
  return `
    <tr>
      <td style="padding:8px 0;color:${BRAND_MUTED};font-size:13px;line-height:18px;width:190px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:${BRAND_TEXT};font-size:14px;line-height:20px;font-weight:600;">${escapeHtml(safeValue(value))}</td>
    </tr>
  `;
}

function section(title: string, rows: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 8px;border-bottom:1px solid rgba(191,164,106,0.34);color:${BRAND_ACCENT};font-size:12px;line-height:16px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">
          ${escapeHtml(title)}
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function buildPilotRequestEmail(normalized: {
  requestId: string;
  name: string;
  email: string;
  companyName?: string;
  role?: string;
  accommodationType: string;
  estimatedMonthlyReservations: string;
  currentWorkflow: string;
  mainPain: string;
  wantsToValidate: string;
}, data: z.infer<typeof requestSchema>, appUrl: string) {
  const baseUrl = appUrl.replace(/\/$/, "");
  const logoUrl = `${baseUrl}/brand/logo-anclora-syncxml-email.png`;
  const preview = `Nueva solicitud de piloto controlado recibida en ${APP_NAME}.`;
  const subject = `${APP_NAME} - solicitud de piloto controlado`;

  const text = [
    preview,
    "",
    "DATOS PERSONALES",
    `Request ID: ${normalized.requestId}`,
    `Nombre: ${normalized.name}`,
    `Email: ${normalized.email}`,
    `Empresa/alojamiento: ${safeValue(normalized.companyName)}`,
    `Rol: ${safeValue(normalized.role)}`,
    "",
    "OPERATIVA",
    `Tipo alojamiento: ${normalized.accommodationType}`,
    `Reservas/mes: ${normalized.estimatedMonthlyReservations}`,
    `Flujo actual: ${normalized.currentWorkflow}`,
    `Problema: ${normalized.mainPain}`,
    `Quiere validar: ${normalized.wantsToValidate}`,
    "Acepta muestra sintetica/anonimizada: Si",
    "Acepta condiciones piloto: Si",
    "",
    "DISPOSICION DE PAGO",
    `Interes: ${safeValue(data.pay)}`,
    `Modelo: ${safeValue(data.model)}`,
    `Presupuesto: ${safeValue(data.presupuesto)}`,
    "",
    "MENSAJE",
    safeValue(data.mensaje, "Sin mensaje adicional."),
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND_BG};font-family:Inter,Segoe UI,Arial,sans-serif;color:${BRAND_TEXT};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};padding:32px 16px;border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 18px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding-right:12px;">
                      <img src="${escapeHtml(logoUrl)}" width="48" height="48" alt="${APP_NAME}" style="display:block;width:48px;height:48px;border-radius:8px;object-fit:contain;">
                    </td>
                    <td>
                      <div style="color:${BRAND_TEXT};font-size:18px;line-height:24px;font-weight:800;">${APP_NAME}</div>
                      <div style="color:${BRAND_MUTED};font-size:13px;line-height:18px;">Piloto controlado</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid rgba(255,255,255,0.10);border-radius:8px;background:${BRAND_SURFACE};overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:28px 28px 10px;background:${BRAND_SURFACE_ELEVATED};border-bottom:1px solid rgba(255,255,255,0.08);">
                      <div style="display:inline-block;margin-bottom:12px;padding:6px 10px;border:1px solid rgba(191,164,106,0.42);border-radius:999px;color:${BRAND_ACCENT};font-size:12px;line-height:16px;font-weight:800;">Nueva solicitud</div>
                      <h1 style="margin:0;color:${BRAND_TEXT};font-size:24px;line-height:31px;font-weight:850;letter-spacing:0;">Piloto controlado recibido</h1>
                      <p style="margin:10px 0 0;color:${BRAND_MUTED};font-size:15px;line-height:22px;">Solicitud capturada desde la landing pública de ${APP_NAME}. Revisa el encaje operativo antes de conceder acceso.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 28px 28px;">
                      ${section("Datos personales", [
                        detailRow("Request ID", normalized.requestId),
                        detailRow("Nombre", normalized.name),
                        detailRow("Email", normalized.email),
                        detailRow("Empresa/alojamiento", normalized.companyName),
                        detailRow("Rol", normalized.role),
                      ].join(""))}
                      ${section("Operativa", [
                        detailRow("Tipo alojamiento", normalized.accommodationType),
                        detailRow("Reservas/mes", normalized.estimatedMonthlyReservations),
                        detailRow("Flujo actual", normalized.currentWorkflow),
                        detailRow("Problema", normalized.mainPain),
                        detailRow("Quiere validar", normalized.wantsToValidate),
                        detailRow("Muestra sintetica/anonimizada", "Si"),
                        detailRow("Condiciones piloto", "Si"),
                      ].join(""))}
                      ${section("Disposicion de pago", [
                        detailRow("Interes", data.pay),
                        detailRow("Modelo", data.model),
                        detailRow("Presupuesto", data.presupuesto),
                      ].join(""))}
                      <div style="margin-top:20px;padding:16px;border:1px solid rgba(255,255,255,0.10);border-radius:8px;background:rgba(255,255,255,0.035);">
                        <div style="color:${BRAND_ACCENT};font-size:12px;line-height:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">Mensaje</div>
                        <div style="margin-top:8px;color:${BRAND_TEXT};font-size:14px;line-height:21px;">${escapeHtml(safeValue(data.mensaje, "Sin mensaje adicional."))}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 4px 0;color:${BRAND_MUTED};font-size:12px;line-height:18px;">
                Email transaccional interno de ${APP_NAME}. No incluye datos reales de huespedes ni credenciales de acceso.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

async function forwardPilotRequestToNexus(input: {
  normalized: unknown;
  nexusWebhookUrl: string;
  nexusApiKey: string;
  requestId: string;
}) {
  const { normalized, nexusWebhookUrl, nexusApiKey, requestId } = input;
  try {
    console.info("Forwarding SyncXML pilot request to Nexus", {
      requestId,
      nexusWebhook: safeWebhookLabel(nexusWebhookUrl),
    });

    const response = await fetch(nexusWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${nexusApiKey}`,
      },
      body: JSON.stringify(normalized),
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      console.warn("Nexus rejected SyncXML pilot request", {
        requestId,
        status: response.status,
        nexusWebhook: safeWebhookLabel(nexusWebhookUrl),
      });
    }
  } catch (error) {
    console.error("Failed to forward SyncXML pilot request to Nexus", {
      requestId,
      nexusWebhook: safeWebhookLabel(nexusWebhookUrl),
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function sendPilotRequestEmail(input: {
  normalized: Parameters<typeof buildPilotRequestEmail>[0];
  data: z.infer<typeof requestSchema>;
  appUrl: string;
  resendApiKey: string;
  resendFrom: string;
  resendTo: string;
}) {
  const resend = new Resend(input.resendApiKey);
  const email = buildPilotRequestEmail(input.normalized, input.data, input.appUrl);
  const { error } = await resend.emails.send({
    from: input.resendFrom,
    to: input.resendTo,
    replyTo: input.normalized.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(getRateLimitKey(request));
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const nexusWebhookUrl = process.env.NEXUS_SYNCXML_WEBHOOK_URL || process.env.NEXUS_WEBHOOK_URL;
  const nexusApiKey = process.env.NEXUS_SYNCXML_WEBHOOK_SECRET || process.env.NEXUS_INTERNAL_API_KEY;
  
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL;
  const resendTo = process.env.ADMIN_EMAILS || process.env.SYNCXML_PILOT_REQUEST_TO;
  const appUrl = process.env.SYNCXML_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://anclora-syncxml.vercel.app";

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
      adminEmailSentBySyncxml: false,
    },
  };

  const queueNexusForward = () => {
    if (!nexusWebhookUrl || !nexusApiKey) {
      console.warn(`Nexus webhook is not fully configured; skipping background forward url=${Boolean(nexusWebhookUrl)} secret=${Boolean(nexusApiKey)}`, {
        requestId: normalized.requestId,
        hasNexusWebhookUrl: Boolean(nexusWebhookUrl),
        hasNexusWebhookSecret: Boolean(nexusApiKey),
      });
      return false;
    }

    after(() => forwardPilotRequestToNexus({
      normalized,
      nexusWebhookUrl,
      nexusApiKey,
      requestId: normalized.requestId,
    }));
    return true;
  };

  if (resendApiKey && resendFrom && resendTo) {
    try {
      await sendPilotRequestEmail({
        normalized,
        data,
        appUrl,
        resendApiKey,
        resendFrom,
        resendTo,
      });

      normalized.raw.adminEmailSentBySyncxml = true;
      queueNexusForward();
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Failed to send email via Resend", {
        requestId: normalized.requestId,
        message: error instanceof Error ? error.message : String(error),
      });
      if (queueNexusForward()) {
        return NextResponse.json({ ok: true, warning: "email_failed_nexus_queued" });
      }
      return NextResponse.json({ error: "No se pudo enviar la solicitud" }, { status: 502 });
    }
  }

  if (queueNexusForward()) {
    return NextResponse.json({ ok: true, warning: "email_not_configured_nexus_queued" });
  }

  return NextResponse.json({ error: "Configuración de envío no disponible" }, { status: 503 });
}
