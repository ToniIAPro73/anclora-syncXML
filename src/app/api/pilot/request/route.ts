import { NextResponse } from "next/server";
import { Resend } from "resend";
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

function requiredEnv() {
  const missing: string[] = [];
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.SYNCXML_PILOT_REQUEST_TO;
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!from) missing.push("RESEND_FROM_EMAIL");
  if (!to) missing.push("SYNCXML_PILOT_REQUEST_TO");
  return { apiKey, from, to, missing };
}

function row(label: string, value: unknown) {
  const text = typeof value === "boolean" ? (value ? "Sí" : "No indicado") : String(value ?? "").trim();
  return `${label}: ${text || "-"}`;
}

function value(value: unknown) {
  return typeof value === "boolean" ? (value ? "Sí" : "No indicado") : String(value ?? "").trim() || "-";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function field(label: string, rawValue: unknown) {
  return `
    <tr>
      <td style="padding:10px 0;color:#8f9bb0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#f8fafc;font-size:15px;line-height:1.45;vertical-align:top;">${escapeHtml(value(rawValue))}</td>
    </tr>
  `;
}

function section(title: string, rows: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 10px;color:#d4af37;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;">${escapeHtml(title)}</td>
      </tr>
      <tr>
        <td style="border:1px solid rgba(255,255,255,.10);border-radius:14px;background:#111827;padding:8px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function buildPilotEmailHtml(data: z.infer<typeof requestSchema>) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anclora-syncxml.vercel.app";
  const logoUrl = new URL("/brand/logo-anclora-syncxml.png", siteUrl).toString();
  const fullName = `${data.nombre} ${data.apellidos}`;

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#05070d;color:#f8fafc;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#05070d 0%,#0b0f18 100%);padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;border-collapse:collapse;">
            <tr>
              <td style="border:1px solid rgba(212,175,55,.32);border-radius:24px;background:#0f1624;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.32);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:30px 32px 24px;background:radial-gradient(circle at top left,rgba(212,175,55,.18),transparent 40%),#101827;border-bottom:1px solid rgba(255,255,255,.08);">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:72px;vertical-align:middle;">
                            <img src="${logoUrl}" width="58" height="58" alt="Anclora SyncXML" style="display:block;border:0;width:58px;height:58px;object-fit:contain;" />
                          </td>
                          <td style="vertical-align:middle;">
                            <div style="color:#d4af37;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;">Piloto controlado</div>
                            <h1 style="margin:7px 0 0;color:#ffffff;font-size:25px;line-height:1.2;font-weight:800;">Nueva solicitud de piloto</h1>
                            <p style="margin:8px 0 0;color:#c7d2e4;font-size:15px;line-height:1.45;">${escapeHtml(fullName)} quiere valorar Anclora SyncXML.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 32px 32px;">
                      ${section("Contacto", [
                        field("Nombre", fullName),
                        field("Email", data.email),
                        field("Tipo de alojamiento", data.alojamiento),
                      ].join(""))}
                      ${section("Operativa", [
                        field("Nº de inmuebles", data.inmuebles),
                        field("Reservas/mes aprox.", data.reservas),
                        field("Trabaja con Excel/XLSX", data.excelUse),
                        field("Tiempo invertido hoy", data.tiempo),
                        field("Muestra sintética/anonimizada", Boolean(data.muestraSintetica)),
                      ].join(""))}
                      ${section("Necesidad", [
                        field("Principal problema", data.problema),
                        field("Alternativa actual", data.alternativa),
                      ].join(""))}
                      ${section("Interés comercial", [
                        field("Piloto de pago", data.pay),
                        field("Modelo preferido", data.model),
                        field("Presupuesto orientativo", data.presupuesto),
                        field("Mensaje", data.mensaje),
                      ].join(""))}
                      <p style="margin:24px 0 0;color:#8f9bb0;font-size:12px;line-height:1.6;">
                        Responde directamente a este correo: el email del solicitante se ha configurado como reply-to.
                        La solicitud no concede acceso automático ni crea cuenta de usuario.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:18px 8px 0;color:#687386;font-size:11px;">
                Anclora SyncXML forma parte del ecosistema tecnológico de Anclora Group.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(getRateLimitKey(request));
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const env = requiredEnv();
  if (env.missing.length) {
    return NextResponse.json({ error: "Configuración de envío no disponible" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });

  const data = parsed.data;
  const lines = [
    "Solicitud de piloto controlado - Anclora SyncXML",
    "",
    row("Nombre", `${data.nombre} ${data.apellidos}`),
    row("Email", data.email),
    row("Tipo de alojamiento", data.alojamiento),
    row("Nº de inmuebles", data.inmuebles),
    row("Reservas/mes aprox.", data.reservas),
    row("Trabaja con Excel/XLSX", data.excelUse),
    "",
    row("Principal problema operativo", data.problema),
    row("Alternativa actual", data.alternativa),
    row("Tiempo invertido hoy", data.tiempo),
    row("Puede usar muestra sintética/anonimizada", Boolean(data.muestraSintetica)),
    "",
    row("Interés en piloto de pago", data.pay),
    row("Modelo preferido", data.model),
    row("Rango/presupuesto orientativo", data.presupuesto),
    "",
    row("Mensaje", data.mensaje),
  ];
  const text = lines.join("\n");
  const html = buildPilotEmailHtml(data);

  const resend = new Resend(env.apiKey);
  const { error } = await resend.emails.send({
    from: env.from!,
    to: [env.to!],
    subject: "Solicitud de piloto controlado - Anclora SyncXML",
    replyTo: data.email,
    text,
    html,
  });

  if (error) return NextResponse.json({ error: "No se pudo enviar la solicitud" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
