import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (!process.env.SYNCXML_ADMIN_PASSWORD || password === process.env.SYNCXML_ADMIN_PASSWORD) {
    return setSessionCookie(NextResponse.json({ ok: true }));
  }
  return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
}
