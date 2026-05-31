import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { authDisabled, canUsePasswordAuth, getSessionSecret, isExplicitLocalDemoMode, validateRuntimeConfig } from "./security/env";

export const COOKIE_NAME = "anclora-syncxml-session";

export type SessionUser = {
  email: string;
  role: "admin" | "pilot_user";
};

function signSession(payload: SessionUser) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function readSignedSession(value?: string): SessionUser | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;
  const expected = createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
    if (!parsed.email || !["admin", "pilot_user"].includes(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  validateRuntimeConfig();
  if (authDisabled() || isExplicitLocalDemoMode()) return { email: "demo@anclora.local", role: "admin" };
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  const signed = readSignedSession(value);
  if (signed) return signed;
  if (value && value === getSessionSecret()) return { email: process.env.SYNCXML_ADMIN_EMAIL || "antonio@anclora.com", role: "admin" };
  return null;
}

export async function isAuthenticated() {
  if (!canUsePasswordAuth()) return false;
  return Boolean(await getSessionUser());
}

export async function requireAuth() {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function setSessionCookie(response: NextResponse, user?: SessionUser) {
  const sessionSecret = getSessionSecret();
  if (!sessionSecret) return response;
  response.cookies.set(COOKIE_NAME, user ? signSession(user) : sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
