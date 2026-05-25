import { randomUUID } from "node:crypto";
import type { SesSubmission as PrismaSesSubmission } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/db/prisma";
import { persistentStorageEnabled } from "@/lib/security/env";
import type {
  ParsedComunicacionResponse,
  ParsedConsultaLoteResponse,
} from "./parser";
import {
  collectSesErrors,
  deriveSesStatus,
  extractFirstCommunicationCode,
} from "./parser";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SesSubmissionStatus =
  | "DRAFT" | "SENT" | "ACCEPTED" | "PROCESSING"
  | "PROCESSED" | "FAILED" | "PARTIAL" | "UNKNOWN";

export type SesSubmissionRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  xmlHash: string;
  fileName?: string;
  reference?: string;
  environment: string;
  endpoint: string;
  landlordCode: string;
  establishmentCode?: string;
  applicationName: string;
  operationType: string;
  communicationType?: string;
  requestSoap?: string;
  responseSoap?: string;
  sesResponseCode?: string;
  sesResponseDescription?: string;
  sesBatchCode?: string;
  batchStatus?: string;
  batchProcessedAt?: string;
  communicationCode?: string;
  status: SesSubmissionStatus;
  sesErrors?: unknown;
  lastCheckedAt?: string;
  queryHistory?: unknown[];
};

export type CreateSesSubmissionInput = {
  xmlHash: string;
  fileName?: string;
  reference?: string;
  environment: string;
  endpoint: string;
  landlordCode: string;
  establishmentCode?: string;
  applicationName: string;
  operationType: string;
  communicationType?: string;
  requestSoap?: string;
};

// ─── In-memory fallback ──────────────────────────────────────────────────────

const mem = globalThis as unknown as { sesSubmissions?: SesSubmissionRecord[] };
mem.sesSubmissions ??= [];

function now() { return new Date().toISOString(); }

function memCreate(input: CreateSesSubmissionInput): SesSubmissionRecord {
  const record: SesSubmissionRecord = {
    id: randomUUID(),
    createdAt: now(),
    updatedAt: now(),
    status: "SENT",
    ...input,
  };
  mem.sesSubmissions!.push(record);
  return record;
}

function memUpdate(id: string, patch: Partial<SesSubmissionRecord>): SesSubmissionRecord | null {
  const idx = mem.sesSubmissions!.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated = { ...mem.sesSubmissions![idx], ...patch, updatedAt: now() };
  mem.sesSubmissions![idx] = updated;
  return updated;
}

function memList(limit = 50): SesSubmissionRecord[] {
  return [...mem.sesSubmissions!]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function memGet(id: string): SesSubmissionRecord | null {
  return mem.sesSubmissions!.find((r) => r.id === id) ?? null;
}

// ─── Prisma helpers ──────────────────────────────────────────────────────────

function dbToRecord(row: PrismaSesSubmission): SesSubmissionRecord {
  return {
    id: row.id,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    xmlHash: row.xmlHash,
    fileName: row.fileName ?? undefined,
    reference: row.reference ?? undefined,
    environment: row.environment,
    endpoint: row.endpoint,
    landlordCode: row.landlordCode,
    establishmentCode: row.establishmentCode ?? undefined,
    applicationName: row.applicationName,
    operationType: row.operationType,
    communicationType: row.communicationType ?? undefined,
    requestSoap: row.requestSoap ?? undefined,
    responseSoap: row.responseSoap ?? undefined,
    sesResponseCode: row.sesResponseCode ?? undefined,
    sesResponseDescription: row.sesResponseDescription ?? undefined,
    sesBatchCode: row.sesBatchCode ?? undefined,
    batchStatus: row.batchStatus ?? undefined,
    batchProcessedAt: row.batchProcessedAt instanceof Date ? row.batchProcessedAt.toISOString() : row.batchProcessedAt ?? undefined,
    communicationCode: row.communicationCode ?? undefined,
    status: row.status as SesSubmissionStatus,
    sesErrors: row.sesErrors ?? undefined,
    lastCheckedAt: row.lastCheckedAt instanceof Date ? row.lastCheckedAt.toISOString() : row.lastCheckedAt ?? undefined,
    queryHistory: Array.isArray(row.queryHistory) ? row.queryHistory : row.queryHistory ? [row.queryHistory] : undefined,
  };
}

function shouldUseDb() {
  return hasDatabase() && persistentStorageEnabled();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function createSesSubmission(input: CreateSesSubmissionInput): Promise<SesSubmissionRecord> {
  if (shouldUseDb()) {
    try {
      const row = await prisma.sesSubmission.create({ data: { ...input, status: "SENT" } });
      return dbToRecord(row);
    } catch { /* fallthrough to memory */ }
  }
  return memCreate(input);
}

export async function updateSesSubmissionFromComunicacion(
  id: string,
  parsed: ParsedComunicacionResponse,
  responseSoap: string,
): Promise<SesSubmissionRecord | null> {
  const derivedStatus = deriveSesStatus(parsed.responseCode, parsed.sesBatchCode, parsed.resultados);
  const communicationCode = extractFirstCommunicationCode(parsed);
  const errors = collectSesErrors(parsed.resultados);

  const patch = {
    sesResponseCode: parsed.responseCode,
    sesResponseDescription: parsed.responseDescription,
    sesBatchCode: parsed.sesBatchCode,
    responseSoap,
    status: derivedStatus,
    communicationCode,
    sesErrors: errors.length ? errors : undefined,
  };

  if (shouldUseDb()) {
    try {
      const row = await prisma.sesSubmission.update({
        where: { id },
        data: {
          sesResponseCode: patch.sesResponseCode,
          sesResponseDescription: patch.sesResponseDescription,
          sesBatchCode: patch.sesBatchCode,
          responseSoap,
          status: derivedStatus,
          communicationCode: patch.communicationCode,
          sesErrors: errors.length ? (errors as object[]) : undefined,
        },
      });
      return dbToRecord(row);
    } catch { /* fallthrough */ }
  }
  return memUpdate(id, patch);
}

export async function updateSesSubmissionFromLote(
  id: string,
  parsed: ParsedConsultaLoteResponse,
  responseSoap: string,
): Promise<SesSubmissionRecord | null> {
  const existing = await getSesSubmission(id);
  const communicationCode = extractFirstCommunicationCode(parsed) ?? existing?.communicationCode;
  const errors = collectSesErrors(parsed.resultados);
  const derivedStatus = deriveSesStatus(parsed.responseCode, existing?.sesBatchCode, parsed.resultados);

  const historyEntry = {
    checkedAt: now(),
    responseCode: parsed.responseCode,
    responseDescription: parsed.responseDescription,
    resultados: parsed.resultados.length,
  };

  const patch: Partial<SesSubmissionRecord> = {
    sesResponseCode: parsed.responseCode,
    sesResponseDescription: parsed.responseDescription,
    responseSoap,
    status: derivedStatus,
    communicationCode,
    sesErrors: errors.length ? errors : existing?.sesErrors,
    lastCheckedAt: now(),
    queryHistory: [...(existing?.queryHistory ?? []), historyEntry],
  };

  if (shouldUseDb()) {
    try {
      const row = await prisma.sesSubmission.update({
        where: { id },
        data: {
          sesResponseCode: patch.sesResponseCode,
          sesResponseDescription: patch.sesResponseDescription,
          responseSoap,
          status: derivedStatus,
          communicationCode: patch.communicationCode,
          sesErrors: patch.sesErrors as object,
          lastCheckedAt: new Date(),
          queryHistory: patch.queryHistory as object,
        },
      });
      return dbToRecord(row);
    } catch { /* fallthrough */ }
  }
  return memUpdate(id, patch);
}

export async function updateSesSubmissionStatus(
  id: string,
  status: SesSubmissionStatus,
  extra?: Partial<Pick<SesSubmissionRecord, "sesBatchCode" | "sesResponseCode" | "sesResponseDescription" | "responseSoap" | "sesErrors">>,
): Promise<SesSubmissionRecord | null> {
  const patch = { status, ...extra };
  if (shouldUseDb()) {
    try {
      const row = await prisma.sesSubmission.update({
        where: { id },
        data: {
          status,
          sesBatchCode: extra?.sesBatchCode,
          sesResponseCode: extra?.sesResponseCode,
          sesResponseDescription: extra?.sesResponseDescription,
          responseSoap: extra?.responseSoap,
          sesErrors: extra?.sesErrors !== undefined ? (extra.sesErrors as object) : undefined,
        },
      });
      return dbToRecord(row);
    } catch { /* fallthrough */ }
  }
  return memUpdate(id, patch);
}

export async function getSesSubmission(id: string): Promise<SesSubmissionRecord | null> {
  if (shouldUseDb()) {
    try {
      const row = await prisma.sesSubmission.findUnique({ where: { id } });
      return row ? dbToRecord(row) : null;
    } catch { /* fallthrough */ }
  }
  return memGet(id);
}

export async function getSesSubmissionByBatchCode(batchCode: string): Promise<SesSubmissionRecord | null> {
  if (shouldUseDb()) {
    try {
      const row = await prisma.sesSubmission.findFirst({ where: { sesBatchCode: batchCode }, orderBy: { createdAt: "desc" } });
      return row ? dbToRecord(row) : null;
    } catch { /* fallthrough */ }
  }
  return mem.sesSubmissions!.find((r) => r.sesBatchCode === batchCode) ?? null;
}

export async function listSesSubmissions(limit = 50): Promise<SesSubmissionRecord[]> {
  if (shouldUseDb()) {
    try {
      const rows = await prisma.sesSubmission.findMany({ orderBy: { createdAt: "desc" }, take: limit });
      return rows.map(dbToRecord);
    } catch { /* fallthrough */ }
  }
  return memList(limit);
}
