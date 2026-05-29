import { describe, it, expect } from "vitest";
import { parseExcelBuffer } from "../src/lib/excel/parseExcel";
import { readFileSync } from "fs";
import path from "path";

describe("New Generated Excel Files", () => {
  const files = [
    "test-data/test4-clean-2esp.xlsx",
    "test-data/test5-familia-mixta.xlsx",
    "test-data/test6-europeos.xlsx",
    "test-data/test7-nie-autocorrect.xlsx",
    "test-data/test8-1noche-iban.xlsx",
    "test-data/test9-grupo-grande.xlsx",
  ];

  it.each(files)("should parse %s without throwing", async (file) => {
    const filePath = path.join(process.cwd(), file);
    const buffer = readFileSync(filePath);
    const parsed = await parseExcelBuffer(buffer, file);
    expect(parsed.guests.length).toBeGreaterThan(0);
    expect(parsed.reservation.reference).toBeDefined();
    expect(parsed.property.establishmentCode).toBeDefined();
  });

  it("should have correct data for test9-grupo-grande", async () => {
    const filePath = path.join(process.cwd(), "test-data/test9-grupo-grande.xlsx");
    const buffer = readFileSync(filePath);
    const parsed = await parseExcelBuffer(buffer, "test9-grupo-grande.xlsx");
    expect(parsed.guests.length).toBe(6);
  });
});
