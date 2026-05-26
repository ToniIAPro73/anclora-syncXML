import { describe, expect, it } from "vitest";
import { autoCorrectParsedExcel } from "@/lib/autoCorrect";
import type { ParsedExcel } from "@/lib/domain";

function makeMinimalParsed(overrides: Partial<ParsedExcel> = {}): ParsedExcel {
  return {
    sheets: [],
    reservation: {},
    property: {},
    payment: {},
    guests: [],
    ignoredRows: [],
    rawRows: [],
    validation: { status: "PENDING", errors: [], warnings: [] },
    ...overrides,
  };
}

describe("autoCorrectParsedExcel", () => {
  it("trims whitespace from guest names", () => {
    const input = makeMinimalParsed({
      guests: [{
        sourceRow: 2,
        role: "VI",
        firstName: "  Ana  ",
        surname1: " García ",
        validationStatus: "PENDING",
        errors: [],
        warnings: [],
      }],
    });
    const { data, corrections } = autoCorrectParsedExcel(input);
    expect(data.guests[0].firstName).toBe("Ana");
    expect(data.guests[0].surname1).toBe("García");
    expect(corrections.some((c) => c.field === "firstName" && c.from === "  Ana  " && c.to === "Ana")).toBe(true);
  });

  it("uppercases ISO3 country and nationality codes", () => {
    const input = makeMinimalParsed({
      guests: [{
        sourceRow: 3,
        role: "VI",
        firstName: "Juan",
        surname1: "Perez",
        nationalityIso3: "esp",
        countryIso3: "esp",
        validationStatus: "PENDING",
        errors: [],
        warnings: [],
      }],
    });
    const { data, corrections } = autoCorrectParsedExcel(input);
    expect(data.guests[0].nationalityIso3).toBe("ESP");
    expect(data.guests[0].countryIso3).toBe("ESP");
    expect(corrections.some((c) => c.field === "nationalityIso3")).toBe(true);
  });

  it("uppercases documentType and sex", () => {
    const input = makeMinimalParsed({
      guests: [{
        sourceRow: 4,
        role: "VI",
        firstName: "Maria",
        surname1: "Lopez",
        documentType: "pas" as "PAS",
        sex: "m" as "M",
        validationStatus: "PENDING",
        errors: [],
        warnings: [],
      }],
    });
    const { data } = autoCorrectParsedExcel(input);
    expect(data.guests[0].documentType).toBe("PAS");
    expect(data.guests[0].sex).toBe("M");
  });

  it("pads postal codes shorter than 5 digits", () => {
    const input = makeMinimalParsed({
      guests: [{
        sourceRow: 5,
        role: "VI",
        firstName: "Luis",
        surname1: "Ruiz",
        postalCode: "8001",
        validationStatus: "PENDING",
        errors: [],
        warnings: [],
      }],
    });
    const { data, corrections } = autoCorrectParsedExcel(input);
    expect(data.guests[0].postalCode).toBe("08001");
    expect(corrections.some((c) => c.field === "postalCode" && c.from === "8001" && c.to === "08001")).toBe(true);
  });

  it("converts DD/MM/YYYY dates to YYYY-MM-DD", () => {
    const input = makeMinimalParsed({
      guests: [{
        sourceRow: 6,
        role: "VI",
        firstName: "Paco",
        surname1: "Gil",
        birthDate: "15/03/1985",
        arrivalDate: "01/05/2026",
        validationStatus: "PENDING",
        errors: [],
        warnings: [],
      }],
    });
    const { data, corrections } = autoCorrectParsedExcel(input);
    expect(data.guests[0].birthDate).toBe("1985-03-15");
    expect(data.guests[0].arrivalDate).toBe("2026-05-01");
    expect(corrections.some((c) => c.field === "birthDate")).toBe(true);
  });

  it("converts DD-MM-YYYY dates to YYYY-MM-DD", () => {
    const input = makeMinimalParsed({
      guests: [{
        sourceRow: 7,
        role: "VI",
        firstName: "Paco",
        surname1: "Gil",
        arrivalDate: "01-05-2026",
        validationStatus: "PENDING",
        errors: [],
        warnings: [],
      }],
    });
    const { data } = autoCorrectParsedExcel(input);
    expect(data.guests[0].arrivalDate).toBe("2026-05-01");
  });

  it("normalizes IBAN: removes spaces and uppercases", () => {
    const input = makeMinimalParsed({
      payment: { iban: "  es21 0049 0001 5121 1234 5678  " },
    });
    const { data, corrections } = autoCorrectParsedExcel(input);
    expect(data.payment.iban).toBe("ES2100490001512112345678");
    expect(corrections.some((c) => c.field === "iban")).toBe(true);
  });

  it("converts reservation dates from DD/MM/YYYY", () => {
    const input = makeMinimalParsed({
      reservation: { checkInDate: "10/06/2026", contractDate: "01/01/2026" },
    });
    const { data, corrections } = autoCorrectParsedExcel(input);
    expect(data.reservation.checkInDate).toBe("2026-06-10");
    expect(data.reservation.contractDate).toBe("2026-01-01");
    expect(corrections.length).toBe(2);
  });

  it("does not add corrections when data is already clean", () => {
    const input = makeMinimalParsed({
      guests: [{
        sourceRow: 2,
        role: "VI",
        firstName: "Ana",
        surname1: "García",
        nationalityIso3: "ESP",
        documentType: "PAS",
        sex: "M",
        arrivalDate: "2026-05-01",
        validationStatus: "PENDING",
        errors: [],
        warnings: [],
      }],
    });
    const { corrections } = autoCorrectParsedExcel(input);
    expect(corrections).toHaveLength(0);
  });
});
