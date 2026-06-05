import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ParsedExcel, ValidationIssue } from "@/lib/domain";
import { smartValidateParsedExcel } from "@/lib/validation";

const fixturePath = "test-data/fixtures/synthetic-validation-edge-cases.json";

function loadFixture(): ParsedExcel {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as ParsedExcel;
}

function hasIssue(issues: ValidationIssue[], code: string, sourceRow?: number): boolean {
  return issues.some((issue) => issue.code === code && (sourceRow === undefined || issue.sourceRow === sourceRow));
}

describe("synthetic XML validation fixtures", () => {
  it("keeps edge-case fixture data synthetic and reviewable", () => {
    const parsed = loadFixture();

    expect(parsed.fileName).toContain("synthetic");
    expect(parsed.guests).toHaveLength(5);
    expect(parsed.guests.every((guest) => !guest.email || guest.email.endsWith("@example.com"))).toBe(true);
    expect(parsed.guests.every((guest) => !guest.phone || /^60000000\d$/.test(guest.phone))).toBe(true);
    expect(new Set(parsed.guests.map((guest) => guest.documentNumber ?? ""))).toEqual(
      new Set(["00000000T", "00000001R", "12345678A", "US0000001"]),
    );
  });

  it("covers missing fields, invalid documents, invalid dates, duplicates, and non-EU documents", () => {
    const validated = smartValidateParsedExcel(loadFixture());
    const errors = validated.validation.errors;
    const warnings = validated.validation.warnings;

    expect(hasIssue(errors, "guest.firstName.required", 3)).toBe(true);
    expect(hasIssue(errors, "guest.address.required", 3)).toBe(true);
    expect(hasIssue(errors, "guest.documentSupport.required", 3)).toBe(true);
    expect(hasIssue(errors, "guest.document.control.invalid", 4)).toBe(true);
    expect(hasIssue(errors, "guest.birthDate.format.invalid", 5)).toBe(true);
    expect(hasIssue(warnings, "guest.document.duplicate", 6)).toBe(true);
    expect(validated.duplicates?.some((duplicate) => duplicate.classification === "likely")).toBe(true);

    expect(hasIssue(errors, "guest.municipalityCode.required", 5)).toBe(false);
    expect(validated.guests.find((guest) => guest.sourceRow === 5)?.countryIso3).toBe("USA");
  });
});
