import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("AuthGate session events", () => {
  it("notifies the app shell after changing a temporary password", () => {
    const source = readFileSync("src/components/AuthGate.tsx", "utf8");
    const changePasswordBlock = source.slice(
      source.indexOf("async function changePassword"),
      source.indexOf("if (checking)"),
    );

    expect(changePasswordBlock).toContain("window.dispatchEvent");
    expect(changePasswordBlock).toContain("syncxml:auth-changed");
  });
});
