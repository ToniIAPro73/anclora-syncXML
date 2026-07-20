import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { ExcelParseLimitError, EXCEL_PARSE_LIMITS, parseExcelBuffer } from "@/lib/excel/parseExcel";

async function workbookBuffer(sheetCount: number, rows: string[][]) {
  const workbook = new ExcelJS.Workbook();
  for (let i = 0; i < sheetCount; i += 1) {
    const worksheet = workbook.addWorksheet(`Sheet${i + 1}`);
    rows.forEach((row) => worksheet.addRow(row));
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

describe("parseExcelBuffer", () => {
  const workbookPath = "test-data/fixtures/registro_huespedes_synthetic.xlsx";

  it("detects the synthetic guests and metadata", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath), "registro_huespedes_synthetic.xlsx");

    expect(parsed.guests).toHaveLength(7);
    expect(parsed.property.establishmentCode).toBe("0000044116");
    expect(parsed.property.name).toBe("VILLA KENTIA");
    expect(parsed.reservation.reference).toBe("5992657522");
    expect(parsed.reservation.checkInDate).toBe("2026-04-30");
    expect(parsed.reservation.checkOutDate).toBe("2026-05-03");
    expect(parsed.reservation.guestCount).toBe(7);
    expect(parsed.payment.paymentType).toBe("PLATF");
  });

  it("does not treat metadata rows as guests", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath), "registro_huespedes_synthetic.xlsx");

    expect(parsed.guests.map((guest) => guest.firstName)).not.toContain("REFERENCIA");
    expect(parsed.rawRows.length).toBe(25);
  });

  it("normalizes document and nationality without warning when another contact value exists", async () => {
    const parsed = await parseExcelBuffer(readFileSync(workbookPath), "registro_huespedes_synthetic.xlsx");

    expect(parsed.guests[0].documentType).toBe("NIF");
    expect(parsed.guests[0].nationalityIso3).toBe("ESP");
    expect(parsed.guests[6].warnings.some((warning) => warning.code === "guest.phone.missing")).toBe(false);
  });

  it("reads metadata before the guest table in EU-only test files", async () => {
    const euOnly = await parseExcelBuffer(readFileSync("test-data/test2-eu-solo.xlsx"), "test2-eu-solo.xlsx");

    expect(euOnly.guests).toHaveLength(8);
    expect(euOnly.property.establishmentCode).toBe("0000004630");
    expect(euOnly.property.name).toBe("Hotel Playa Dorada");
    expect(euOnly.reservation.reference).toBe("RES-2026-002");
    expect(euOnly.reservation.checkInDate).toBe("2026-06-15");
    expect(euOnly.reservation.checkOutDate).toBe("2026-06-20");
    expect(euOnly.payment.paymentType).toBe("OTRO");
    expect(euOnly.guests.find((guest) => guest.sourceRow === 19)?.postalCode).toBe("1100-048");
    expect(euOnly.guests.find((guest) => guest.sourceRow === 19)?.municipality).toBe("Lisboa");
    expect(euOnly.guests.find((guest) => guest.sourceRow === 21)?.postalCode).toBe("1000");
    expect(euOnly.guests.find((guest) => guest.sourceRow === 22)?.postalCode).toBe("111 51");
  });

  it("rejects workbooks over the sheet budget", async () => {
    const buffer = await workbookBuffer(EXCEL_PARSE_LIMITS.maxSheets + 1, [["Nombre"]]);

    await expect(parseExcelBuffer(buffer, "too-many-sheets.xlsx")).rejects.toThrow(ExcelParseLimitError);
  });

  it("rejects sheets over the row budget", async () => {
    const rows = Array.from({ length: EXCEL_PARSE_LIMITS.maxRowsPerSheet + 1 }, () => ["value"]);
    const buffer = await workbookBuffer(1, rows);

    await expect(parseExcelBuffer(buffer, "too-many-rows.xlsx")).rejects.toThrow(ExcelParseLimitError);
  });

  it("rejects rows over the column budget", async () => {
    const row = Array.from({ length: EXCEL_PARSE_LIMITS.maxColumnsPerRow + 1 }, (_, index) => `value-${index}`);
    const buffer = await workbookBuffer(1, [row]);

    await expect(parseExcelBuffer(buffer, "too-many-columns.xlsx")).rejects.toThrow(ExcelParseLimitError);
  });
});
