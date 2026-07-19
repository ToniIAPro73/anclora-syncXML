import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { pseudonymizeSession } from "@/lib/audit";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";

const DEFAULT_FEEDBACK_TO = "antonio@anclora.com";

const feedbackSchema = z.object({
  language: z.string().trim().min(2).max(8).optional(),
  solved: z.string().trim().max(2000).optional(),
  value: z.string().trim().max(2000).optional(),
  doubts: z.string().trim().max(2000).optional(),
  trust: z.string().trim().max(2000).optional(),
  pay: z.string().trim().max(120).optional(),
  model: z.string().trim().max(160).optional(),
  recommend: z.string().trim().max(4).optional(),
});

function splitRecipients(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFeedbackEmail(input: {
  userEmail: string;
  language?: string;
  feedback: z.infer<typeof feedbackSchema>;
}) {
  const rows = [
    ["Usuario", input.userEmail],
    ["Idioma", input.language || "unknown"],
    ["Resolvió el problema", input.feedback.solved || "-"],
    ["Parte de más valor", input.feedback.value || "-"],
    ["Dudas", input.feedback.doubts || "-"],
    ["Confianza necesaria", input.feedback.trust || "-"],
    ["Disposición a pagar", input.feedback.pay || "-"],
    ["Modelo preferido", input.feedback.model || "-"],
    ["Recomendación 0-10", input.feedback.recommend || "-"],
  ];
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = [
    "<h1>Feedback del piloto SyncXML</h1>",
    ...rows.map(([label, value]) => `<p><strong>${label}:</strong><br>${String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>`),
  ].join("\n");
  return {
    subject: "Feedback del piloto SyncXML",
    text,
    html,
  };
}

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(getRateLimitKey(request));
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = feedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL;
  const feedbackTo = process.env.SYNCXML_FEEDBACK_TO || process.env.PILOT_FEEDBACK_TO || process.env.ADMIN_EMAILS || DEFAULT_FEEDBACK_TO;
  const recipients = splitRecipients(feedbackTo);
  if (!resendApiKey || !resendFrom || recipients.length === 0) {
    return NextResponse.json({ error: "Configuración de feedback no disponible" }, { status: 503 });
  }

  const email = buildFeedbackEmail({
    userEmail: user.email,
    language: parsed.data.language,
    feedback: parsed.data,
  });

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: recipients,
      replyTo: user.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send pilot feedback email", {
      userHash: pseudonymizeSession(user.email),
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "No se pudo enviar el feedback" }, { status: 502 });
  }
}
