import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { prisma, hasDatabase } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/password";
import { canUsePasswordAuth, getRuntimeConfigError, isExplicitLocalDemoMode } from "@/lib/security/env";
import { authRateLimiter, getRateLimitKey } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  const rateLimit = authRateLimiter.check(getRateLimitKey(request));
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  const configError = getRuntimeConfigError();
  if (configError) {
    return NextResponse.json(
      {
        error: "Configuracion de acceso incompleta",
        code: "SYNCXML_AUTH_CONFIG_INCOMPLETE",
      },
      { status: 503 },
    );
  }
  if (!canUsePasswordAuth()) {
    return NextResponse.json(
      {
        error: "Configuracion de acceso incompleta",
        code: "SYNCXML_AUTH_CONFIG_INCOMPLETE",
      },
      { status: 503 },
    );
  }
  if (isExplicitLocalDemoMode()) return NextResponse.json({ ok: true, demo: true });
  const { email, password } = await request.json().catch(() => ({ email: "", password: "" }));
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (hasDatabase() && normalizedEmail && typeof password === "string") {
    const user = await prisma.pilotUser.findUnique({ where: { email: normalizedEmail } }).catch(() => null);
    const expired = user?.expiresAt ? user.expiresAt.getTime() < Date.now() : false;
    if (user && user.status === "active" && expired) {
      return NextResponse.json(
        {
          error: "El acceso temporal ha caducado.",
          code: "SYNCXML_PILOT_ACCESS_EXPIRED",
        },
        { status: 401 },
      );
    }
    if (user && user.status === "active" && !expired && verifyPassword(password, user.passwordHash)) {
      await prisma.pilotUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => null);
      return setSessionCookie(NextResponse.json({ ok: true, role: user.role, email: user.email, temporaryPassword: user.temporaryPassword }), {
        email: user.email,
        role: user.role,
        temporaryPassword: user.temporaryPassword,
      });
    }
  }
  if (
    process.env.SYNCXML_ADMIN_PASSWORD &&
    password === process.env.SYNCXML_ADMIN_PASSWORD &&
    (!normalizedEmail || normalizedEmail === (process.env.SYNCXML_ADMIN_EMAIL || "antonio@anclora.com").toLowerCase())
  ) {
    const adminEmail = process.env.SYNCXML_ADMIN_EMAIL || "antonio@anclora.com";
    return setSessionCookie(NextResponse.json({ ok: true, role: "admin", email: adminEmail }), {
      email: adminEmail,
      role: "admin",
    });
  }
  return NextResponse.json({ error: "Credenciales invalidas", code: "SYNCXML_INVALID_CREDENTIALS" }, { status: 401 });
}
