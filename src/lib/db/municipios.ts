import { hasDatabase, prisma } from "./prisma";
import type { MunicipioCatalogRecord, MunicipioLookupRepository } from "@/lib/municipios/resolveMunicipio";

export const prismaMunicipioRepository: MunicipioLookupRepository = {
  async findByProvince(codigoProvincia: string) {
    if (!hasDatabase()) return [];
    try {
      return await prisma.ineMunicipio.findMany({
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
    } catch {
      return [];
    }
  },
};

export async function listMunicipios(params: { codigoProvincia?: string | null; q?: string | null; limit?: number } = {}): Promise<MunicipioCatalogRecord[]> {
  if (!hasDatabase()) return [];
  const q = params.q?.trim();
  // When filtering by province return all (max ~400 per province). Only cap for open searches.
  const limit = params.codigoProvincia && !q ? undefined : Math.min(Math.max(params.limit ?? 80, 1), 500);
  try {
    return await prisma.ineMunicipio.findMany({
      where: {
        ...(params.codigoProvincia ? { codigoProvincia: params.codigoProvincia } : {}),
        ...(q ? { nombreNormalizado: { contains: q } } : {}),
      },
      orderBy: [{ codigoProvincia: "asc" }, { nombre: "asc" }],
      ...(limit !== undefined ? { take: limit } : {}),
      select: {
        codigoMunicipio: true,
        codigoProvincia: true,
        codigoMunicipioCorto: true,
        nombre: true,
        nombreNormalizado: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getMunicipiosLastSync() {
  if (!hasDatabase()) return null;
  try {
    const latest = await prisma.ineMunicipio.findFirst({
      orderBy: { lastSyncedAt: "desc" },
      select: { lastSyncedAt: true },
    });
    return latest?.lastSyncedAt ?? null;
  } catch {
    return null;
  }
}
