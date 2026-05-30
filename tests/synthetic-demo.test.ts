import { describe, expect, it } from "vitest";
import { buildSyntheticParsedExcel } from "@/lib/demo/syntheticDataset";
import { smartValidateParsedExcel } from "@/lib/validation";
import { detectDuplicates } from "@/lib/duplicates";

const PII_FORBIDDEN = [
  // Real-looking document patterns must not appear; the dataset uses 00000000T / X1234567.
  /\b\d{8}[A-HJ-NP-TV-Z]\b/, // real DNI letters (T allowed only as the demo zero-doc)
];

describe("synthetic demo dataset", () => {
  const parsed = buildSyntheticParsedExcel();

  it("hydrates the ParsedExcel shape without a file", () => {
    expect(parsed.guests.length).toBe(4);
    expect(parsed.reservation.reference).toBe("DEMO-2026-0001");
    expect(parsed.validation.status).toBe("PENDING");
  });

  it("uses only example.com emails", () => {
    for (const guest of parsed.guests) {
      if (guest.email) expect(guest.email).toMatch(/@example\.com$/);
    }
  });

  it("produces at least one operational error and one pending field after validation", () => {
    const validated = smartValidateParsedExcel(parsed);
    const totalErrors = validated.guests.reduce((n, g) => n + g.errors.length, 0)
      + validated.validation.errors.length;
    expect(totalErrors).toBeGreaterThan(0);
    // The second guest intentionally has no document number.
    const pending = parsed.guests.find((g) => g.sourceRow === 3);
    expect(pending?.documentNumber).toBe("");
  });

  it("contains at least one detectable duplicate", () => {
    const duplicates = detectDuplicates(parsed);
    expect(duplicates.length).toBeGreaterThan(0);
  });

  it("does not embed obviously real PII patterns beyond the fake placeholders", () => {
    const blob = JSON.stringify(parsed);
    // The only document numbers present are the synthetic 00000000T and X1234567.
    const docs = parsed.guests.map((g) => g.documentNumber ?? "");
    expect(new Set(docs)).toEqual(new Set(["00000000T", "", "X1234567"]));
    // No phone outside the 6000000xx demo range.
    for (const guest of parsed.guests) {
      if (guest.phone) expect(guest.phone).toMatch(/^60000000\d$/);
    }
    expect(PII_FORBIDDEN.every((re) => !re.test(blob) || /00000000T/.test(blob))).toBe(true);
  });
});
