import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 210_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64url");
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export function generateTemporaryPassword() {
  return randomBytes(18).toString("base64url");
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterationsRaw, salt, expected] = storedHash.split("$");
  if (scheme !== "pbkdf2" || !iterationsRaw || !salt || !expected) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations < 100_000) return false;
  const actual = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST);
  const expectedBuffer = Buffer.from(expected, "base64url");
  if (actual.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actual, expectedBuffer);
}
