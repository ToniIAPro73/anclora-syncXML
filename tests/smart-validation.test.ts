import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { smartValidateParsedExcel } from "@/lib/validation";

describe("smartValidateParsedExcel", () => {
  const workbookPath = "test-data/fixtures/registro_huespedes_synthetic.xlsx";

  it("flags missing SES municipality codes before XML generation", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath), "registro_huespedes_synthetic.xlsx");
    const validated = smartValidateParsedExcel(parsed);

    expect(validated.validation.errors.filter((error) => error.code === "guest.municipalityCode.required")).toHaveLength(7);
    expect(validated.validation.errors.filter((error) => error.code === "guest.documentSupport.required")).toHaveLength(7);
    expect(validated.guests.every((guest) => guest.validationStatus === "ERROR")).toBe(true);
  });

  it("allows SES readiness when Spanish municipality codes are present", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath), "registro_huespedes_synthetic.xlsx");
    const validated = smartValidateParsedExcel({
      ...parsed,
      guests: parsed.guests.map((guest) => ({ ...guest, municipalityCode: "07040", documentSupport: "123456789" })),
    });

    expect(validated.validation.errors.some((error) => error.code === "guest.municipalityCode.required")).toBe(false);
    expect(validated.validation.errors.some((error) => error.code === "guest.documentSupport.required")).toBe(false);
    expect(validated.guests.every((guest) => guest.validationStatus !== "ERROR")).toBe(true);
  });

  it("detects invalid Spanish document control letters", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath), "registro_huespedes_synthetic.xlsx");
    const validated = smartValidateParsedExcel({
      ...parsed,
      guests: parsed.guests.map((guest, index) => index === 0 ? { ...guest, documentNumber: "12345678A" } : guest),
    });

    expect(validated.validation.errors.some((error) => error.code === "guest.document.control.invalid")).toBe(true);
  });

  it("detects invalid IBAN checksums", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath), "registro_huespedes_synthetic.xlsx");
    const validated = smartValidateParsedExcel({
      ...parsed,
      payment: { ...parsed.payment, iban: "ES9121000418450200051333" },
    });

    expect(validated.validation.errors.some((error) => error.code === "payment.iban.invalid")).toBe(true);
  });

  it("does not require Spanish municipality codes or infer IBANs for EU-only guests but blocks missing postal codes", async () => {
    const parsed = await parseExcelBuffer(readFileSync("test-data/test2-eu-solo.xlsx"), "test2-eu-solo.xlsx");
    const validated = smartValidateParsedExcel(parsed);

    expect(validated.validation.errors).toHaveLength(1);
    expect(validated.validation.errors[0]).toMatchObject({ code: "guest.postalCode.required", sourceRow: 20 });
    expect(validated.validation.status).toBe("ERROR");
    expect(validated.guests.every((guest) => guest.countryIso3 !== "ESP" && !guest.municipalityCode)).toBe(true);
    expect(validated.validation.warnings.some((warning) => warning.code === "guest.phone.missing" && warning.sourceRow === 23)).toBe(false);
  });
});
