import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMunicipiosLastSync, listMunicipios } from "@/lib/db/municipios";
import { normalizeMunicipioName, provinceCodeFromPostalCode } from "@/lib/municipios/normalize";

export async function GET(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province") || provinceCodeFromPostalCode(searchParams.get("postalCode") ?? undefined);
  const q = searchParams.get("q");
  const limit = Number.parseInt(searchParams.get("limit") ?? "80", 10);
  const municipios = await listMunicipios({
    codigoProvincia: province,
    q: q ? normalizeMunicipioName(q) : null,
    limit: Number.isFinite(limit) ? limit : 80,
  });
  const lastSyncedAt = await getMunicipiosLastSync();
  return NextResponse.json({ municipios, lastSyncedAt: lastSyncedAt?.toISOString() ?? null });
}
