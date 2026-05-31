import { describe, expect, it } from "vitest";
import { generateTemporaryPassword, hashPassword, verifyPassword } from "@/lib/password";

describe("pilot user credentials", () => {
  it("hashes and verifies temporary passwords without storing clear text", () => {
    const password = generateTemporaryPassword();
    const stored = hashPassword(password);

    expect(stored).not.toContain(password);
    expect(stored).toMatch(/^pbkdf2\$/);
    expect(verifyPassword(password, stored)).toBe(true);
    expect(verifyPassword(`${password}x`, stored)).toBe(false);
  });

  it("generates URL-safe temporary passwords with enough entropy for email delivery", () => {
    const password = generateTemporaryPassword();

    expect(password.length).toBeGreaterThanOrEqual(20);
    expect(password).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
