import { describe, expect, it } from "vitest";
import type { ParsedExcel } from "@/lib/domain";
import { createPrecheckinTestSession, submitPrecheckinTestData, validatePrecheckinSubmission } from "@/lib/precheckin";

const parsed: ParsedExcel = {
  fileName: "villa.xlsx",
  sheets: ["Sheet1"],
  reservation: { reference: "5992657522", checkInDate: "2026-04-30", checkOutDate: "2026-05-03" },
  property: { name: "VILLA KENTIA" },
  payment: {},
  guests: [{
    sourceRow: 12,
    role: "VI",
    firstName: "Aina",
    surname1: "Tamarit",
    validationStatus: "VALID",
    errors: [],
    warnings: [],
  }],
  ignoredRows: [],
  rawRows: [],
  validation: { status: "VALID", errors: [], warnings: [] },
};

const validSubmission = {
  privacyAccepted: true,
  guests: [{
    sourceRow: 12,
    firstName: "Aina",
    surname1: "Tamarit",
    surname2: "Serra",
    documentType: "NIF",
    documentNumber: "73662591P",
    documentSupport: "ABC123456",
    birthDate: "1990-01-01",
    nationalityIso3: "ESP",
    sex: "M",
    address: "Calle Mayor 1",
    municipality: "Palma",
    municipalityCode: "07040",
    postalCode: "07001",
    countryIso3: "ESP",
    phone: "600000000",
    relationship: "TI",
  }],
};

describe("phase 5 test pre-check-in", () => {
  it("creates a metadata-only test session from a parsed reservation", () => {
    const session = createPrecheckinTestSession(parsed, new Date("2026-05-24T10:00:00Z"));

    expect(session.reservationReference).toBe("5992657522");
    expect(session.propertyName).toBe("VILLA KENTIA");
    expect(session.metadataPolicy.storesDocumentImages).toBe(false);
    expect(session.metadataPolicy.storesLegalRegistry).toBe(false);
    expect(session.metadataPolicy.productRole).toBe("SES_AUTHORITATIVE_METADATA_ONLY");
  });

  it("blocks document images and requires privacy acceptance", () => {
    const issues = validatePrecheckinSubmission({ ...validSubmission, privacyAccepted: false, documentImage: "base64" }, 1);

    expect(issues.some((issue) => issue.code === "precheckin.documentImage.blocked")).toBe(true);
    expect(issues.some((issue) => issue.code === "precheckin.privacy.required")).toBe(true);
  });

  it("accepts a complete submission and stores only an operational hash", () => {
    const session = createPrecheckinTestSession(parsed);
    const result = submitPrecheckinTestData(session.token, validSubmission);

    expect(result?.issues).toEqual([]);
    expect(result?.status).toBe("SUBMITTED_FOR_REVIEW");
    expect(result?.submissionHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
