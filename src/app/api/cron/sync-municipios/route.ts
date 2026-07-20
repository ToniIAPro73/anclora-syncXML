import { NextResponse } from "next/server";
import { logRouteError } from "@/lib/api/errors";
import { hasDatabase } from "@/lib/db/prisma";
import { syncIneMunicipios } from "@/lib/ine/municipios";

// Allow up to 5 minutes — the INE API can be slow
export const maxDuration = 300;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, message: "CRON_SECRET no configurado" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, message: "DATABASE_URL no configurada" }, { status: 503 });
  }
  try {
    const summary = await syncIneMunicipios();
    return NextResponse.json(summary, { status: summary.ok ? 200 : 207 });
  } catch (error) {
    logRouteError("cron-sync-municipios", error);
    return NextResponse.json({
      ok: false,
      message: "No se pudo sincronizar municipios INE",
      errors: [{ reason: "sync_failed" }],
    }, { status: 500 });
  }
}
