import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { canUsePasswordAuth, getSessionSecret, isExplicitLocalDemoMode, validateRuntimeConfig } from "./security/env";

const COOKIE_NAME = "anclora-syncxml-session";

export async function isAuthenticated() {
  validateRuntimeConfig();
  if (!canUsePasswordAuth()) return false;
  if (isExplicitLocalDemoMode()) return true;
  return (await cookies()).get(COOKIE_NAME)?.value === getSessionSecret();
}

export async function requireAuth() {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function setSessionCookie(response: NextResponse) {
  const sessionSecret = getSessionSecret();
  if (!sessionSecret) return response;
  response.cookies.set(COOKIE_NAME, sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
