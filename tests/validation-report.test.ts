import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { smartValidateParsedExcel, validateGuest } from "@/lib/validation";
import { buildValidationReportCsv, buildValidationReportFileName } from "@/lib/validationReport";

describe("validation report CSV", () => {
  it("exports blocking validation issues with reservation and guest context", () => {
    const parsed = smartValidateParsedExcel(parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx")));
    const csv = buildValidationReportCsv(parsed);

    expect(csv).toContain("tipo;ambito;severidad;codigo;fila;campo;mensaje");
    expect(csv).toContain("guest.municipalityCode.required");
    expect(csv).toContain("guest.documentSupport.required");
    expect(csv).toContain("5992657522");
  });

  it("exports a clean corrected flow as valid guests", () => {
    const parsed = parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx"));
    const corrected = smartValidateParsedExcel({
      ...parsed,
      guests: parsed.guests.map((guest) => validateGuest({
        ...guest,
        municipalityCode: "07040",
        documentSupport: "123456789",
        sex: "H",
      })),
    });
    const csv = buildValidationReportCsv(corrected);

    expect(corrected.validation.errors).toHaveLength(0);
    expect(csv).toContain("huesped;Aina Tamarit;VALID");
  });

  it("normalizes validation report filenames", () => {
    expect(buildValidationReportFileName({ reservation: { reference: "R 1/2" } }, new Date(2026, 4, 24, 11, 5, 6)))
      .toBe("syncxml-validacion-R-1-2-240526110506.csv");
  });
});
