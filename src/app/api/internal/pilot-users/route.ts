import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/db/prisma";
import { generateTemporaryPassword, hashPassword } from "@/lib/password";
import { getPersistentPilotAuthConfigError } from "@/lib/security/env";

const payloadSchema = z.object({
  requestId: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(180).optional(),
  company: z.string().trim().max(180).optional(),
  rotatePassword: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || request.headers.get("x-api-key") || "";
}

export async function POST(request: Request) {
  const expectedSecret = process.env.SYNCXML_INTERNAL_API_SECRET;
  const token = getBearerToken(request);
  if (!expectedSecret || token !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const configError = getPersistentPilotAuthConfigError();
  if (configError || !hasDatabase()) {
    return NextResponse.json(
      {
        ok: false,
        code: "SYNCXML_PILOT_AUTH_CONFIG_INCOMPLETE",
        message: "Persistent pilot authentication is not ready.",
      },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existing = await prisma.pilotUser.findUnique({ where: { email } });
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    return NextResponse.json(
      {
        ok: false,
        code: "SYNCXML_PILOT_USER_EXPIRY_INVALID",
        message: "Pilot user expiry must be in the future.",
      },
      { status: 400 },
    );
  }

  if (existing?.status === "active" && !data.rotatePassword) {
    return NextResponse.json({
      ok: true,
      pilotUserId: existing.id,
      userId: existing.id,
      email: existing.email,
      status: existing.status,
      expiresAt: existing.expiresAt?.toISOString() ?? null,
      created: false,
      reactivated: false,
      rotatedPassword: false,
      temporaryPassword: null,
      loginReady: true,
    });
  }

  const reactivated = existing?.status !== "active";
  const rotatedPassword = !!data.rotatePassword && !reactivated;

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = hashPassword(temporaryPassword);
  
  const user = existing
    ? await prisma.pilotUser.update({
        where: { id: existing.id },
        data: {
          name: data.name ?? existing.name,
          company: data.company ?? existing.company,
          passwordHash,
          temporaryPassword: true,
          status: "active",
          sourceRequestId: data.requestId,
          expiresAt,
        },
      })
    : await prisma.pilotUser.create({
        data: {
          email,
          name: data.name,
          company: data.company,
          passwordHash,
          temporaryPassword: true,
          status: "active",
          sourceRequestId: data.requestId,
          expiresAt,
        },
      });

  const persisted = await prisma.pilotUser.findUnique({ where: { id: user.id } });
  const persistedExpiry = persisted?.expiresAt ? persisted.expiresAt.getTime() : null;
  if (
    !persisted
    || persisted.email !== email
    || persisted.status !== "active"
    || !persisted.passwordHash
    || Boolean(persistedExpiry && persistedExpiry <= Date.now())
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "SYNCXML_PILOT_USER_NOT_PERSISTED",
        message: "Pilot user could not be confirmed as login-ready.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    pilotUserId: persisted.id,
    userId: persisted.id,
    email: persisted.email,
    status: persisted.status,
    expiresAt: persisted.expiresAt?.toISOString() ?? null,
    created: !existing,
    reactivated,
    rotatedPassword,
    temporaryPassword,
    loginReady: true,
  });
}
