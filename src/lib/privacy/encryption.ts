import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const value = process.env.SYNCXML_FILE_ENCRYPTION_KEY;
  if (!value) throw new Error("SYNCXML_FILE_ENCRYPTION_KEY no configurada");
  if (/^[A-Za-z0-9+/=]{44}$/.test(value)) return Buffer.from(value, "base64");
  return createHash("sha256").update(value).digest();
}

export function encryptBuffer(buffer: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return {
    encrypted,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

export function decryptBuffer(encrypted: Buffer, iv: string, authTag: string) {
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
