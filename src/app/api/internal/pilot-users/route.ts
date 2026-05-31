import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/db/prisma";
import { generateTemporaryPassword, hashPassword } from "@/lib/password";

const payloadSchema = z.object({
  requestId: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(180),
  role: z.enum(["pilot_user", "admin"]).default("pilot_user"),
  expiresAt: z.string().datetime().optional(),
  source: z.literal("anclora-nexus"),
  rotatePassword: z.boolean().optional(),
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
  if (!hasDatabase()) {
    return NextResponse.json({ error: "DATABASE_URL is required to create pilot users" }, { status: 503 });
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

  if (existing?.status === "active" && !data.rotatePassword) {
    return NextResponse.json({
      ok: true,
      pilotUserId: existing.id,
      email: existing.email,
      temporaryPassword: null,
      expiresAt: existing.expiresAt?.toISOString() ?? null,
      credentialStatus: "already_active",
    });
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = hashPassword(temporaryPassword);
  const user = existing
    ? await prisma.pilotUser.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          role: data.role,
          status: "active",
          sourceRequestId: data.requestId,
          expiresAt,
        },
      })
    : await prisma.pilotUser.create({
        data: {
          email,
          passwordHash,
          role: data.role,
          status: "active",
          sourceRequestId: data.requestId,
          expiresAt,
        },
      });

  return NextResponse.json({
    ok: true,
    pilotUserId: user.id,
    email: user.email,
    temporaryPassword,
    expiresAt: user.expiresAt?.toISOString() ?? null,
    credentialStatus: existing ? "rotated" : "created",
  });
}
