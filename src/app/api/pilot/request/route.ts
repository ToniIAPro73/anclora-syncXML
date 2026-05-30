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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  const html = `<pre style="font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`;

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
