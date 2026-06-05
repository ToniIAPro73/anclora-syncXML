/**
 * Test suite for pilot demo fixture
 * Verifies that the synthetic pilot dataset and quick start guides exist
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Pilot Demo Fixture", () => {
  describe("Excel synthetic data", () => {
    it("should have pilot-demo-stable.xlsx file", () => {
      const filePath = path.join(
        process.cwd(),
        "test-data/pilot-demo-stable.xlsx"
      );
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("pilot Excel file should be at least 20KB (valid Excel)", () => {
      const filePath = path.join(
        process.cwd(),
        "test-data/pilot-demo-stable.xlsx"
      );
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(20000); // 20KB minimum for valid Excel
    });
  });

  describe("Quick start guides", () => {
    const guideLanguages = ["ES", "EN", "DE"];

    guideLanguages.forEach((lang) => {
      it(`should have PILOT_QUICK_START_${lang}.md guide`, () => {
        const filePath = path.join(
          process.cwd(),
          `docs/pilot/PILOT_QUICK_START_${lang}.md`
        );
        expect(fs.existsSync(filePath)).toBe(true);
      });

      it(`PILOT_QUICK_START_${lang}.md should contain legal disclaimer`, () => {
        const filePath = path.join(
          process.cwd(),
          `docs/pilot/PILOT_QUICK_START_${lang}.md`
        );
        const content = fs.readFileSync(filePath, "utf-8");

        // Verify key sections exist
        expect(content).toContain("disclaimer");
        expect(content).toContain("synthetic");
        expect(content).toContain("SES");

        // Language-specific disclaimers
        if (lang === "ES") {
          expect(content).toContain(
            "datos sintéticos o anonimizados"
          );
          expect(content).toContain(
            "no realiza envíos oficiales"
          );
        } else if (lang === "EN") {
          expect(content).toContain("synthetic or anonymized");
          expect(content).toContain("official submission");
        } else if (lang === "DE") {
          expect(content).toContain("synthetischen");
          expect(content).toContain("Übermittlung");
        }
      });

      it(`PILOT_QUICK_START_${lang}.md should warn against real data`, () => {
        const filePath = path.join(
          process.cwd(),
          `docs/pilot/PILOT_QUICK_START_${lang}.md`
        );
        const content = fs.readFileSync(filePath, "utf-8");
        expect(content.toLowerCase()).toContain("not use real");
      });
    });
  });

  describe("Pilot resources availability", () => {
    it("pilot assets directory should exist", () => {
      const dirPath = path.join(process.cwd(), "docs/pilot");
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it("should have at least 3 quick start guides (ES, EN, DE)", () => {
      const dirPath = path.join(process.cwd(), "docs/pilot");
      const files = fs.readdirSync(dirPath);
      const quickStarts = files.filter((f) =>
        f.includes("PILOT_QUICK_START")
      );
      expect(quickStarts.length).toBeGreaterThanOrEqual(3);
    });
  });
});
