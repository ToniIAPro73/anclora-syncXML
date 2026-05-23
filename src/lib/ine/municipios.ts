import { prisma } from "@/lib/db/prisma";
import { normalizeMunicipioName } from "@/lib/municipios/normalize";

const INE_MUNICIPIOS_URL = "https://servicios.ine.es/wstempus/js/ES/VALORES_VARIABLE/19";
const MAX_PAGES = 300;

export type IneMunicipioRaw = {
  Id?: number;
  FK_Variable?: number;
  Nombre?: string;
  Codigo?: string;
  FK_JerarquiaPadres?: unknown;
};

export type IneMunicipioRecord = {
  codigoMunicipio: string;
  codigoProvincia: string;
  codigoMunicipioCorto: string;
  nombre: string;
  nombreNormalizado: string;
  fuente: "INE";
  ineId?: number;
  ineVariableId?: number;
  ineJerarquiaPadres?: unknown;
};

export type IneSyncSummary = {
  ok: boolean;
  source: "INE";
  totalFetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ page?: number; code?: string; reason: string }>;
  lastSyncedAt: string;
};

export type IneMunicipioSyncRepository = {
  upsertMunicipio(record: IneMunicipioRecord, syncedAt: Date): Promise<"inserted" | "updated" | "skipped">;
};

export const prismaIneMunicipioSyncRepository: IneMunicipioSyncRepository = {
  async upsertMunicipio(record, syncedAt) {
    const existing = await prisma.ineMunicipio.findUnique({ where: { codigoMunicipio: record.codigoMunicipio } });
    if (!existing) {
      await prisma.ineMunicipio.create({
        data: {
          ...record,
          ineJerarquiaPadres: record.ineJerarquiaPadres === undefined ? undefined : JSON.parse(JSON.stringify(record.ineJerarquiaPadres)),
          lastSyncedAt: syncedAt,
        },
      });
      return "inserted";
    }
    const changed = existing.nombre !== record.nombre
      || existing.nombreNormalizado !== record.nombreNormalizado
      || existing.codigoProvincia !== record.codigoProvincia
      || existing.codigoMunicipioCorto !== record.codigoMunicipioCorto
      || existing.ineId !== (record.ineId ?? null)
      || existing.ineVariableId !== (record.ineVariableId ?? null);
    await prisma.ineMunicipio.update({
      where: { codigoMunicipio: record.codigoMunicipio },
      data: {
        ...(changed ? {
          nombre: record.nombre,
          nombreNormalizado: record.nombreNormalizado,
          codigoProvincia: record.codigoProvincia,
          codigoMunicipioCorto: record.codigoMunicipioCorto,
          ineId: record.ineId,
          ineVariableId: record.ineVariableId,
          ineJerarquiaPadres: record.ineJerarquiaPadres === undefined ? undefined : JSON.parse(JSON.stringify(record.ineJerarquiaPadres)),
        } : {}),
        lastSyncedAt: syncedAt,
      },
    });
    return changed ? "updated" : "skipped";
  },
};

export async function syncIneMunicipios(options: { repository?: IneMunicipioSyncRepository; fetchPage?: (page: number) => Promise<IneMunicipioRaw[]> } = {}): Promise<IneSyncSummary> {
  const repository = options.repository ?? prismaIneMunicipioSyncRepository;
  const fetchPage = options.fetchPage ?? fetchIneMunicipioPage;
  const syncedAt = new Date();
  const summary: IneSyncSummary = {
    ok: true,
    source: "INE",
    totalFetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    lastSyncedAt: syncedAt.toISOString(),
  };

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let rawPage: IneMunicipioRaw[];
    try {
      rawPage = await fetchPage(page);
    } catch (error) {
      summary.ok = false;
      summary.errors.push({ page, reason: error instanceof Error ? error.message : "Error consultando INE" });
      break;
    }
    if (!rawPage.length) break;
    summary.totalFetched += rawPage.length;
    for (const raw of rawPage) {
      const record = normalizeIneMunicipio(raw);
      if (!record) {
        summary.errors.push({ page, code: raw.Codigo, reason: "Registro INE incompleto o inválido" });
        continue;
      }
      try {
        const result = await repository.upsertMunicipio(record, syncedAt);
        summary[result] += 1;
      } catch (error) {
        summary.ok = false;
        summary.errors.push({ page, code: record.codigoMunicipio, reason: error instanceof Error ? error.message : "Error guardando municipio" });
      }
    }
  }
  return summary;
}

export async function fetchIneMunicipioPage(page: number, retries = 2): Promise<IneMunicipioRaw[]> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(`${INE_MUNICIPIOS_URL}?page=${page}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`INE respondió ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data as IneMunicipioRaw[] : [];
    } catch (error) {
      if (attempt === retries) throw error instanceof Error ? error : new Error("Timeout consultando INE");
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    } finally {
      clearTimeout(timeout);
    }
  }
  return [];
}

export function normalizeIneMunicipio(raw: IneMunicipioRaw): IneMunicipioRecord | null {
  const codigoMunicipio = String(raw.Codigo ?? "").padStart(5, "0");
  const nombre = String(raw.Nombre ?? "").trim();
  if (!/^\d{5}$/.test(codigoMunicipio) || !nombre) return null;
  return {
    codigoMunicipio,
    codigoProvincia: codigoMunicipio.slice(0, 2),
    codigoMunicipioCorto: codigoMunicipio.slice(2),
    nombre,
    nombreNormalizado: normalizeMunicipioName(nombre),
    fuente: "INE",
    ineId: raw.Id,
    ineVariableId: raw.FK_Variable,
    ineJerarquiaPadres: raw.FK_JerarquiaPadres,
  };
}
