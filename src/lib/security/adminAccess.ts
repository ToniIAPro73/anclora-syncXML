import { timingSafeEqual } from "node:crypto";
import { envFlag } from "./env";

/**
 * Controlled admin access mode.
 *
 * Lets an operator open the internal app with an `admin` session through a
 * secret URL guarded by a strong token. There is NO public admin bypass: the
 * mode is disabled by default, requires a token, and is blocked in production
 * unless a second explicit opt-in flag is set.
 *
 * See docs/ADMIN_ACCESS_MODE.md for the full operational guide.
 */

export type AdminAccessEnv = "production" | "preview" | "development";

const VALID_ENVS: readonly AdminAccessEnv[] = ["production", "preview", "development"];

/** Resolve the current deployment environment (Vercel first, then Node). */
export function resolveDeploymentEnv(): AdminAccessEnv {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnv === "production" || vercelEnv === "preview" || vercelEnv === "development") {
    return vercelEnv;
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

/** Constant-time token comparison that never throws on length mismatch. */
export function safeTokenEquals(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function parseAllowedEnvs(raw: string | undefined): AdminAccessEnv[] {
  return (raw ?? "preview,development")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is AdminAccessEnv => (VALID_ENVS as readonly string[]).includes(value));
}

export type AdminAccessInput = {
  enabled: boolean;
  /** Expected token from configuration. */
  token: string;
  /** Token supplied by the request. */
  providedToken: string;
  env: AdminAccessEnv;
  allowedEnvs: AdminAccessEnv[];
  allowInProduction: boolean;
};

/**
 * Pure decision function. Returns `true` only when every guard passes:
 *  1. mode enabled
 *  2. a token is configured
 *  3. environment is permitted (production needs the double opt-in flag)
 *  4. the provided token matches via constant-time comparison
 */
export function evaluateAdminAccess(input: AdminAccessInput): boolean {
  if (!input.enabled) return false;
  if (!input.token) return false;

  if (input.env === "production") {
    if (!input.allowInProduction) return false;
  } else if (!input.allowedEnvs.includes(input.env)) {
    return false;
  }

  return safeTokenEquals(input.providedToken, input.token);
}

export type AdminAccessConfig = {
  enabled: boolean;
  token: string;
  email: string;
  allowedEnvs: AdminAccessEnv[];
  redirect: string;
  allowInProduction: boolean;
  env: AdminAccessEnv;
};

/** Read the admin-access configuration from environment variables. */
export function readAdminAccessConfig(): AdminAccessConfig {
  return {
    enabled: envFlag("SYNCXML_ADMIN_ACCESS_ENABLED"),
    token: process.env.SYNCXML_ADMIN_ACCESS_TOKEN?.trim() || "",
    email: process.env.SYNCXML_ADMIN_EMAIL?.trim() || "antonio@anclora.com",
    allowedEnvs: parseAllowedEnvs(process.env.SYNCXML_ADMIN_ACCESS_ALLOWED_ENV),
    redirect: process.env.SYNCXML_ADMIN_ACCESS_REDIRECT?.trim() || "/app",
    allowInProduction: envFlag("SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION"),
    env: resolveDeploymentEnv(),
  };
}
