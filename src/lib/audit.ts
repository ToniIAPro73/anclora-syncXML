import { createHash, randomUUID } from "node:crypto";
import type { AppLanguage, AppTheme } from "./domain";

export const auditEventTypes = [
  "import_batch_created",
  "reservation_imported",
  "file_import_started",
  "file_import_validated",
  "file_import_failed",
  "mapping_reviewed",
  "validation_completed",
  "duplicates_detected",
  "consolidation_preview_generated",
  "consolidation_confirmed",
  "local_package_generated",
  "xml_generated",
  "xml_exported",
  "operation_cleared",
  "session_cleared",
  "privacy_mode_enabled",
  "privacy_mode_changed",
  "validation_error_detected",
] as const;

export type AuditEventType = (typeof auditEventTypes)[number];

export type SafeAuditEvent = {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  pseudonymousSessionId: string;
  recordCount?: number;
  validationResult?: string;
  fileHash?: string;
  language?: AppLanguage;
  theme?: AppTheme;
};

const store = globalThis as unknown as { syncXmlAuditEvents?: SafeAuditEvent[] };
store.syncXmlAuditEvents ??= [];

export function hashBuffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function pseudonymizeSession(input?: string | null) {
  return createHash("sha256").update(input || "anonymous-session").digest("hex").slice(0, 20);
}

export function recordAuditEvent(input: Omit<SafeAuditEvent, "id" | "timestamp">) {
  const event: SafeAuditEvent = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...input,
  };
  store.syncXmlAuditEvents?.push(event);
  return event;
}

export function listAuditEvents() {
  return [...(store.syncXmlAuditEvents ?? [])];
}

export function clearAuditEvents() {
  store.syncXmlAuditEvents = [];
}
