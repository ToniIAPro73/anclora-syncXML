import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pilot request synthetic sample handling", () => {
  it("does not require the applicant to provide their own synthetic sample", () => {
    const source = readFileSync("src/components/landing/PilotRequestForm.tsx", "utf8");
    const canSubmitBlock = source.slice(
      source.indexOf("const canSubmit = useMemo"),
      source.indexOf("async function onSubmit"),
    );

    expect(canSubmitBlock).not.toContain("acceptsSyntheticOrAnonymizedData &&");
    expect(canSubmitBlock).toContain("acceptsPilotConditions");
  });

  it("forwards the real sample availability value to Nexus", () => {
    const source = readFileSync("src/app/api/pilot/request/route.ts", "utf8");

    expect(source).toContain("acceptsSyntheticOrAnonymizedData: z.boolean().optional()");
    expect(source).toContain("const acceptsSyntheticOrAnonymizedData = Boolean");
    expect(source).toContain("acceptsSyntheticOrAnonymizedData,");
    expect(source).toContain("needsSyntheticSampleAttachments: !acceptsSyntheticOrAnonymizedData");
    expect(source).not.toContain("synthetic data acceptance required");
    expect(source).not.toContain("acceptsSyntheticOrAnonymizedData: true");
  });
});
