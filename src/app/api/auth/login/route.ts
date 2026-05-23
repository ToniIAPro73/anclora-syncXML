import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { canUsePasswordAuth, getRuntimeConfigError, isExplicitLocalDemoMode } from "@/lib/security/env";

export async function POST(request: Request) {
  const configError = getRuntimeConfigError();
  if (configError) return NextResponse.json({ error: "Configuracion de acceso incompleta" }, { status: 503 });
  if (!canUsePasswordAuth()) {
    return NextResponse.json({ error: "Configuracion de acceso incompleta" }, { status: 503 });
  }
  if (isExplicitLocalDemoMode()) return NextResponse.json({ ok: true, demo: true });
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (process.env.SYNCXML_ADMIN_PASSWORD && password === process.env.SYNCXML_ADMIN_PASSWORD) {
    return setSessionCookie(NextResponse.json({ ok: true }));
  }
  return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
}
