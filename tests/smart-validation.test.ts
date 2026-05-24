import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { smartValidateParsedExcel } from "@/lib/validation";

describe("smartValidateParsedExcel", () => {
  it("flags missing SES municipality codes before XML generation", () => {
    const parsed = parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx"), "registro_huespedes.xlsx");
    const validated = smartValidateParsedExcel(parsed);

    expect(validated.validation.errors.filter((error) => error.code === "ses.readiness.municipalityCode.required")).toHaveLength(7);
    expect(validated.guests.every((guest) => guest.validationStatus !== "ERROR")).toBe(true);
  });

  it("allows SES readiness when Spanish municipality codes are present", () => {
    const parsed = parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx"), "registro_huespedes.xlsx");
    const validated = smartValidateParsedExcel({
      ...parsed,
      guests: parsed.guests.map((guest) => ({ ...guest, municipalityCode: "07040" })),
    });

    expect(validated.validation.errors.some((error) => error.code === "ses.readiness.municipalityCode.required")).toBe(false);
    expect(validated.guests.every((guest) => guest.validationStatus !== "ERROR")).toBe(true);
  });

  it("detects invalid Spanish document control letters", () => {
    const parsed = parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx"), "registro_huespedes.xlsx");
    const validated = smartValidateParsedExcel({
      ...parsed,
      guests: parsed.guests.map((guest, index) => index === 0 ? { ...guest, documentNumber: "73662591A" } : guest),
    });

    expect(validated.validation.errors.some((error) => error.code === "guest.document.control.invalid")).toBe(true);
  });

  it("detects invalid IBAN checksums", () => {
    const parsed = parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx"), "registro_huespedes.xlsx");
    const validated = smartValidateParsedExcel({
      ...parsed,
      payment: { ...parsed.payment, iban: "ES9121000418450200051333" },
    });

    expect(validated.validation.errors.some((error) => error.code === "payment.iban.invalid")).toBe(true);
  });

  it("does not require Spanish municipality codes or infer IBANs for EU-only guests", () => {
    const parsed = parseExcelBuffer(readFileSync("test-data/test2-eu-solo.xlsx"), "test2-eu-solo.xlsx");
    const validated = smartValidateParsedExcel(parsed);

    expect(validated.validation.errors).toHaveLength(0);
    expect(validated.validation.status).toBe("WARNING");
    expect(validated.guests.every((guest) => guest.countryIso3 !== "ESP" && !guest.municipalityCode)).toBe(true);
    expect(validated.validation.warnings.some((warning) => warning.code === "guest.phone.missing" && warning.sourceRow === 23)).toBe(true);
  });
});
