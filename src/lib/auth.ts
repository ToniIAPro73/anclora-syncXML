import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "anclora-syncxml-session";

export async function isAuthenticated() {
  if (process.env.NODE_ENV !== "production" && !process.env.SYNCXML_ADMIN_PASSWORD) return true;
  return (await cookies()).get(COOKIE_NAME)?.value === process.env.AUTH_SECRET;
}

export async function requireAuth() {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function setSessionCookie(response: NextResponse) {
  if (!process.env.AUTH_SECRET) return response;
  response.cookies.set(COOKIE_NAME, process.env.AUTH_SECRET, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
