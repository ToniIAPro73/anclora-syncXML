import { hasDatabase, prisma } from "./prisma";
import type { MunicipioCatalogRecord, MunicipioLookupRepository } from "@/lib/municipios/resolveMunicipio";

export const prismaMunicipioRepository: MunicipioLookupRepository = {
  async findByProvince(codigoProvincia: string) {
    if (!hasDatabase()) return [];
    return prisma.ineMunicipio.findMany({
      where: { codigoProvincia },
      orderBy: { nombre: "asc" },
      select: {
        codigoMunicipio: true,
        codigoProvincia: true,
        codigoMunicipioCorto: true,
        nombre: true,
        nombreNormalizado: true,
      },
    });
  },
};

export async function listMunicipios(params: { codigoProvincia?: string | null; q?: string | null; limit?: number } = {}): Promise<MunicipioCatalogRecord[]> {
  if (!hasDatabase()) return [];
  const q = params.q?.trim();
  const limit = Math.min(Math.max(params.limit ?? 80, 1), 200);
  return prisma.ineMunicipio.findMany({
    where: {
      ...(params.codigoProvincia ? { codigoProvincia: params.codigoProvincia } : {}),
      ...(q ? { nombreNormalizado: { contains: q } } : {}),
    },
    orderBy: [{ codigoProvincia: "asc" }, { nombre: "asc" }],
    take: limit,
    select: {
      codigoMunicipio: true,
      codigoProvincia: true,
      codigoMunicipioCorto: true,
      nombre: true,
      nombreNormalizado: true,
    },
  });
}

export async function getMunicipiosLastSync() {
  if (!hasDatabase()) return null;
  const latest = await prisma.ineMunicipio.findFirst({
    orderBy: { lastSyncedAt: "desc" },
    select: { lastSyncedAt: true },
  });
  return latest?.lastSyncedAt ?? null;
}
