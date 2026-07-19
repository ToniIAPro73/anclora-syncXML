import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/db/prisma";
import { getInternalReplyTo } from "@/lib/email/delivery";
import { generateTemporaryPassword, hashPassword } from "@/lib/password";
import { pseudonymizeSession } from "@/lib/audit";
import { authRateLimiter, getRateLimitKey, passwordRecoveryLimiter } from "@/lib/security/rateLimit";

const APP_NAME = "Anclora SyncXML";
const BRAND_BG = "#070A12";
const BRAND_SURFACE = "#101827";
const BRAND_ACCENT = "#BFA46A";
const BRAND_TEXT = "#F8FAFC";
const BRAND_MUTED = "#A8B3C7";
const DEFAULT_ACCESS_WINDOW_DAYS = 7;

const schema = z.object({
  email: z.string().trim().email().max(254),
});

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildRecoveryEmail(input: {
  email: string;
  temporaryPassword: string;
  expiresAt: Date;
  appUrl: string;
}) {
  const baseUrl = input.appUrl.replace(/\/$/, "");
  const loginUrl = `${baseUrl}/login`;
  const logoUrl = `${baseUrl}/brand/logo-anclora-syncxml-email.png`;
  const expiresAt = input.expiresAt.toISOString();
  const subject = `${APP_NAME} - nueva contraseña temporal`;
  const text = [
    "Hemos reemitido una contraseña temporal para tu acceso al piloto controlado.",
    "",
    `Acceso: ${loginUrl}`,
    `Email autorizado: ${input.email}`,
    `Contraseña temporal: ${input.temporaryPassword}`,
    `Caduca: ${expiresAt}`,
    "",
    "Si no solicitaste esta reemisión, ignora este correo y contacta con Anclora.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:${BRAND_BG};font-family:Inter,Segoe UI,Arial,sans-serif;color:${BRAND_TEXT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};padding:32px 16px;border-collapse:collapse;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;border-collapse:collapse;">
          <tr><td style="padding:0 0 18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
              <td style="padding-right:12px;"><img src="${escapeHtml(logoUrl)}" width="48" height="48" alt="${APP_NAME}" style="display:block;width:48px;height:48px;border-radius:8px;object-fit:contain;"></td>
              <td><div style="font-size:18px;line-height:24px;font-weight:800;">${APP_NAME}</div><div style="color:${BRAND_MUTED};font-size:13px;line-height:18px;">Piloto controlado</div></td>
            </tr></table>
          </td></tr>
          <tr><td style="border:1px solid rgba(255,255,255,0.10);border-radius:8px;background:${BRAND_SURFACE};padding:28px;">
            <div style="display:inline-block;margin-bottom:12px;padding:6px 10px;border:1px solid rgba(191,164,106,0.42);border-radius:999px;color:${BRAND_ACCENT};font-size:12px;line-height:16px;font-weight:800;">Contraseña temporal</div>
            <h1 style="margin:0;color:${BRAND_TEXT};font-size:24px;line-height:31px;font-weight:850;">Nueva contraseña temporal</h1>
            <p style="margin:10px 0 0;color:${BRAND_MUTED};font-size:15px;line-height:22px;">Hemos reemitido tus credenciales del piloto controlado. Esta contraseña temporal mantiene la fecha de caducidad de tu acceso piloto.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:${BRAND_MUTED};font-size:13px;">Email autorizado</td><td style="padding:8px 0;color:${BRAND_TEXT};font-weight:700;">${escapeHtml(input.email)}</td></tr>
              <tr><td style="padding:8px 0;color:${BRAND_MUTED};font-size:13px;">Contraseña temporal</td><td style="padding:8px 0;color:${BRAND_TEXT};font-weight:800;">${escapeHtml(input.temporaryPassword)}</td></tr>
              <tr><td style="padding:8px 0;color:${BRAND_MUTED};font-size:13px;">Caduca</td><td style="padding:8px 0;color:${BRAND_TEXT};font-weight:700;">${escapeHtml(expiresAt)}</td></tr>
            </table>
            <a href="${escapeHtml(loginUrl)}" style="display:inline-block;margin-top:20px;padding:12px 16px;border-radius:8px;background:${BRAND_ACCENT};color:#070A12;text-decoration:none;font-size:14px;font-weight:900;">Acceder al piloto</a>
            <p style="margin:20px 0 0;color:${BRAND_MUTED};font-size:13px;line-height:20px;">Si no solicitaste esta reemisión, ignora este correo y contacta con Anclora.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  return { subject, text, html };
}

export async function POST(request: Request) {
  const rateLimit = authRateLimiter.check(getRateLimitKey(request));
  if (!rateLimit.allowed) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });
  const email = parsed.data.email.toLowerCase();
  const recoveryKey = `${getRateLimitKey(request)}:${email}`;
  if (!passwordRecoveryLimiter.check(recoveryKey).allowed) return NextResponse.json({ ok: true });

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.SYNCXML_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://anclora-syncxml.vercel.app";

  if (!hasDatabase() || !resendApiKey || !resendFrom) return NextResponse.json({ ok: true });

  const user = await prisma.pilotUser.findUnique({ where: { email } }).catch(() => null);
  if (!user || user.status !== "active") return NextResponse.json({ ok: true });

  const existingExpiry = user.expiresAt;
  if (existingExpiry && existingExpiry.getTime() < Date.now()) return NextResponse.json({ ok: true });

  const temporaryPassword = generateTemporaryPassword();
  const expiresAt = existingExpiry ?? new Date(Date.now() + DEFAULT_ACCESS_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  await prisma.pilotUser.update({
    where: { id: user.id },
    data: {
      passwordHash: hashPassword(temporaryPassword),
      expiresAt,
      status: "active",
    },
  });

  try {
    const resend = new Resend(resendApiKey);
    const emailPayload = buildRecoveryEmail({ email, temporaryPassword, expiresAt, appUrl });
    await resend.emails.send({
      from: resendFrom,
      to: email,
      replyTo: getInternalReplyTo(),
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
    });
  } catch (error) {
    console.error("Failed to send password recovery email", {
      emailHash: pseudonymizeSession(email),
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return NextResponse.json({ ok: true });
}
