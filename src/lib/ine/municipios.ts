import { prisma } from "@/lib/db/prisma";
import { normalizeMunicipioName } from "@/lib/municipios/normalize";

const INE_MUNICIPIOS_URL = "https://servicios.ine.es/wstempus/js/ES/VALORES_VARIABLE/19";
const BULK_WRITE_SIZE = 1_000;

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
  replaceMunicipios?(records: IneMunicipioRecord[], syncedAt: Date): Promise<Pick<IneSyncSummary, "inserted" | "updated" | "skipped">>;
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
  async replaceMunicipios(records, syncedAt) {
    const existing = await prisma.ineMunicipio.findMany({
      select: {
        codigoMunicipio: true,
        codigoProvincia: true,
        codigoMunicipioCorto: true,
        nombre: true,
        nombreNormalizado: true,
        ineId: true,
        ineVariableId: true,
      },
    });
    const existingByCode = new Map(existing.map((record) => [record.codigoMunicipio, record]));
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    for (const record of records) {
      const current = existingByCode.get(record.codigoMunicipio);
      if (!current) {
        inserted += 1;
      } else if (
        current.nombre !== record.nombre
        || current.nombreNormalizado !== record.nombreNormalizado
        || current.codigoProvincia !== record.codigoProvincia
        || current.codigoMunicipioCorto !== record.codigoMunicipioCorto
        || current.ineId !== (record.ineId ?? null)
        || current.ineVariableId !== (record.ineVariableId ?? null)
      ) {
        updated += 1;
      } else {
        skipped += 1;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.ineMunicipio.deleteMany();
      for (let index = 0; index < records.length; index += BULK_WRITE_SIZE) {
        const chunk = records.slice(index, index + BULK_WRITE_SIZE);
        await tx.ineMunicipio.createMany({
          data: chunk.map((record) => ({
            ...record,
            ineJerarquiaPadres: record.ineJerarquiaPadres === undefined ? undefined : JSON.parse(JSON.stringify(record.ineJerarquiaPadres)),
            lastSyncedAt: syncedAt,
          })),
        });
      }
    }, { timeout: 120_000 });

    return { inserted, updated, skipped };
  },
};

export async function syncIneMunicipios(options: { repository?: IneMunicipioSyncRepository; fetchAll?: () => Promise<IneMunicipioRaw[]> } = {}): Promise<IneSyncSummary> {
  const repository = options.repository ?? prismaIneMunicipioSyncRepository;
  const fetchAll = options.fetchAll ?? fetchIneMunicipios;
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

  let rawRecords: IneMunicipioRaw[];
  try {
    rawRecords = await fetchAll();
  } catch (error) {
    return {
      ...summary,
      ok: false,
      errors: [{ reason: error instanceof Error ? error.message : "Error consultando INE" }],
    };
  }

  summary.totalFetched = rawRecords.length;
  const recordsByCode = new Map<string, IneMunicipioRecord>();
  for (const raw of rawRecords) {
    const record = normalizeIneMunicipio(raw);
    if (!record) {
      summary.errors.push({ code: raw.Codigo, reason: "Registro INE incompleto o inválido" });
      continue;
    }
    recordsByCode.set(record.codigoMunicipio, record);
  }

  const records = Array.from(recordsByCode.values());
  if (!records.length) {
    return {
      ...summary,
      ok: false,
      errors: [...summary.errors, { reason: "INE no devolvió municipios válidos; se conserva el catálogo actual." }],
    };
  }
  try {
    if (repository.replaceMunicipios) {
      const result = await repository.replaceMunicipios(records, syncedAt);
      summary.inserted = result.inserted;
      summary.updated = result.updated;
      summary.skipped = result.skipped;
    } else {
      for (const record of records) {
        const result = await repository.upsertMunicipio(record, syncedAt);
        summary[result] += 1;
      }
    }
  } catch (error) {
    summary.ok = false;
    summary.errors.push({ reason: error instanceof Error ? error.message : "Error guardando municipios" });
  }
  if (summary.errors.length) summary.ok = false;
  return summary;
}

export async function fetchIneMunicipios(retries = 2): Promise<IneMunicipioRaw[]> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);
    try {
      const response = await fetch(INE_MUNICIPIOS_URL, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
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
