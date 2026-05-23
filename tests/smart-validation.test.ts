import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { smartValidateParsedExcel } from "@/lib/validation";

describe("smartValidateParsedExcel", () => {
  it("keeps the reference Excel valid for XML generation", () => {
    const parsed = parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx"), "registro_huespedes.xlsx");
    const validated = smartValidateParsedExcel(parsed);

    expect(validated.validation.errors).toHaveLength(0);
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
});
