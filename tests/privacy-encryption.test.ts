import { describe, expect, it } from "vitest";
import { decryptBuffer, decryptString, encryptBuffer, encryptString } from "@/lib/privacy/encryption";
import { sanitizeFileName } from "@/lib/normalizers";

describe("privacy encryption", () => {
  it("encrypts and decrypts with distinct IVs", () => {
    process.env.SYNCXML_FILE_ENCRYPTION_KEY = "test-secret";
    const input = Buffer.from("personal-data");
    const one = encryptBuffer(input);
    const two = encryptBuffer(input);
    expect(one.iv).not.toBe(two.iv);
    expect(decryptBuffer(one.encrypted, one.iv, one.authTag).toString()).toBe("personal-data");
  });

  it("encrypts and decrypts strings for persistent personal fields", () => {
    process.env.SYNCXML_FILE_ENCRYPTION_KEY = "test-secret";
    const encrypted = encryptString("Aina Tamarit");
    expect(encrypted).toMatch(/^enc:v1:/);
    expect(decryptString(encrypted)).toBe("Aina Tamarit");
  });

  it("sanitizes file names", () => {
    expect(sanitizeFileName("../DNI 123 registro huéspedes.xlsx")).toBe("DNI-123-registro-huespedes.xlsx");
  });
});
