import { describe, expect, it, vi, afterEach } from "vitest";
import type { ParsedExcel } from "@/lib/domain";
import { detectDuplicates, unresolvedDuplicates } from "@/lib/duplicates";
import { authDisabled, canUsePasswordAuth, persistentStorageEnabled, validateRuntimeConfig } from "@/lib/security/env";
import { validateUploadFile } from "@/lib/security/files";
import { maskAddress, maskDocument, maskEmail, maskPayment, maskPhone } from "@/lib/privacy/masking";
import { assertWellFormedXml, generateHospitalityXml } from "@/lib/xml/generateHospitalityXml";
import { createRateLimiter } from "@/lib/security/rateLimit";
import { validateForBackendConsolidation } from "@/lib/validation";

const OLD_ENV = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...OLD_ENV };
});

function parsedFixture(): ParsedExcel {
  return {
    fileName: "test.xlsx",
    sheets: ["Sheet1"],
    reservation: { reference: "R1", checkInDate: "2026-05-01", checkOutDate: "2026-05-03", guestCount: 2, roomCount: 1, internet: true },
    property: { establishmentCode: "0001", countryIso3: "ESP" },
    payment: { paymentType: "OTRO" },
    guests: [
      { sourceRow: 2, role: "VI", firstName: "Ana", surname1: "Garcia", birthDate: "1990-01-01", nationalityIso3: "ESP", documentType: "NIF", documentNumber: "12345678Z", arrivalDate: "2026-05-01", validationStatus: "VALID", errors: [], warnings: [] },
      { sourceRow: 3, role: "VI", firstName: "Ana", surname1: "Garcia", birthDate: "1990-01-01", nationalityIso3: "ESP", documentType: "NIF", documentNumber: "12345678Z", arrivalDate: "2026-05-01", validationStatus: "VALID", errors: [], warnings: [] },
    ],
    ignoredRows: [],
    rawRows: [],
    validation: { status: "VALID", errors: [], warnings: [] },
  };
}

describe("responsibility hardening", () => {
  it("masks sensitive data by default helpers", () => {
    expect(maskDocument("12345678Z")).toBe("****5678Z");
    expect(maskEmail("maria@example.com")).toBe("m***@example.com");
    expect(maskPhone("+34 600 111 123")).toBe("*** *** 123");
    expect(maskAddress("Calle Mayor 1 Madrid")).toBe("Calle Mayor ...");
    expect(maskPayment("ES9121000418450200051332")).toBe("****");
  });

  it("detects unresolved duplicates", () => {
    const parsed = parsedFixture();
    const duplicates = detectDuplicates(parsed);
    expect(duplicates.some((duplicate) => duplicate.classification === "likely")).toBe(true);
    expect(unresolvedDuplicates({ ...parsed, duplicates })).toHaveLength(2);
    expect(unresolvedDuplicates({ ...parsed, duplicates: duplicates.map((duplicate) => ({ ...duplicate, resolution: "keep_both" })) })).toHaveLength(0);
  });

  it("keeps persistent storage disabled unless explicitly enabled", () => {
    vi.stubEnv("SYNCXML_ENABLE_PERSISTENT_STORAGE", "false");
    expect(persistentStorageEnabled()).toBe(false);
    vi.stubEnv("SYNCXML_ENABLE_PERSISTENT_STORAGE", "true");
    expect(persistentStorageEnabled()).toBe(true);
  });

  it("blocks production config when critical secrets are absent", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SYNCXML_ADMIN_PASSWORD", "");
    vi.stubEnv("SESSION_SECRET", "");
    expect(() => validateRuntimeConfig()).toThrow(/Missing critical/);
    expect(canUsePasswordAuth()).toBe(false);
  });

  it("denies password auth when no admin password or session secret are configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SYNCXML_ADMIN_PASSWORD", "");
    vi.stubEnv("SESSION_SECRET", "");
    vi.stubEnv("AUTH_SECRET", "");
    expect(canUsePasswordAuth()).toBe(false);
  });

  it("allows an explicit temporary auth bypass flag", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SYNCXML_DISABLE_AUTH", "true");
    vi.stubEnv("SYNCXML_ADMIN_PASSWORD", "");
    vi.stubEnv("SESSION_SECRET", "");
    expect(authDisabled()).toBe(true);
    expect(() => validateRuntimeConfig()).not.toThrow();
    expect(canUsePasswordAuth()).toBe(true);
  });

  it("allows local demo only with explicit marker outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SYNCXML_LOCAL_DEMO", "true");
    expect(canUsePasswordAuth()).toBe(true);
  });

  it("validates file type, size and emptiness", () => {
    expect(validateUploadFile(new File([""], "empty.xlsx"), [".xlsx"]).ok).toBe(false);
    expect(validateUploadFile(new File(["x"], "../bad.exe"), [".xlsx"]).ok).toBe(false);
    expect(validateUploadFile(new File(["x"], "ok.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), [".xlsx"]).ok).toBe(true);
  });

  it("blocks dangerous XML structures", () => {
    expect(() => assertWellFormedXml("<!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]><foo>&xxe;</foo>")).toThrow();
  });

  it("escapes special characters in generated XML", () => {
    const parsed = parsedFixture();
    parsed.guests = [{ ...parsed.guests[0], firstName: "Ana & Lia", surname1: "Menor <Mayor>" }];
    parsed.reservation.guestCount = 1;
    const generated = generateHospitalityXml(parsed);
    expect(generated.xml).toContain("Ana &amp; Lia");
    expect(generated.xml).toContain("Menor &lt;Mayor&gt;");
    expect(assertWellFormedXml(generated.xml)).toBe(true);
  });

  it("applies backend critical validation before consolidation", () => {
    const parsed = parsedFixture();
    const validation = validateForBackendConsolidation({
      ...parsed,
      guests: parsed.guests.map((guest, index) => index === 0 ? { ...guest, documentNumber: "12345678A" } : guest),
    });

    expect(validation.errors.some((error) => error.code === "guest.document.control.invalid")).toBe(true);
  });

  it("rate limits repeated sensitive actions", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });

    expect(limiter.check("session-a").allowed).toBe(true);
    expect(limiter.check("session-a").allowed).toBe(true);
    expect(limiter.check("session-a").allowed).toBe(false);
    expect(limiter.check("session-b").allowed).toBe(true);
  });
});
