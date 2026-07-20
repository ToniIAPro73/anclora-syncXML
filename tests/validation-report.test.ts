import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { smartValidateParsedExcel, validateGuest } from "@/lib/validation";
import { buildValidationReportCsv, buildValidationReportFileName } from "@/lib/validationReport";

describe("validation report CSV", () => {
  const workbookPath = "test-data/fixtures/registro_huespedes_synthetic.xlsx";

  it("exports blocking validation issues with reservation and guest context", async () => {
    const parsed = smartValidateParsedExcel(await parseExcelBuffer(readFileSync(workbookPath)));
    const csv = buildValidationReportCsv(parsed);

    expect(csv).toContain("tipo;ambito;severidad;codigo;fila;campo;mensaje");
    expect(csv).toContain("guest.municipalityCode.required");
    expect(csv).toContain("guest.documentSupport.required");
    expect(csv).toContain("5992657522");
  });

  it("exports a clean corrected flow as valid guests", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath));
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
    expect(csv).toContain("huesped;Lucia Romero;VALID");
  });

  it("normalizes validation report filenames", () => {
    expect(buildValidationReportFileName({ reservation: { reference: "R 1/2" } }, new Date(2026, 4, 24, 11, 5, 6)))
      .toBe("syncxml-validacion-R-1-2-240526110506.csv");
  });
});
