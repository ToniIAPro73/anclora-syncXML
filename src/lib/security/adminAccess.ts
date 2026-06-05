/**
 * Admin access control for SyncXML
 * Restricts sensitive operations to admin users only
 */

import { NextResponse } from "next/server";

/**
 * Check if current environment allows admin SES access
 */
export function isAdminAccessAllowedInEnv(): boolean {
  const env = process.env.NODE_ENV || "development";
  const isProduction = env === "production";

  if (isProduction) {
    return process.env.SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION === "true";
  }

  return true; // Allow in dev/preview
}

/**
 * Restrict SES submission for pilot users
 */
export function restrictSESSubmissionForPilot(
  isPilotUser: boolean
): NextResponse<{ error: string; message: string }> | null {
  if (!isPilotUser) return null;

  return NextResponse.json(
    {
      error: "Pilot users cannot submit to SES",
      message:
        "El envío a SES no está disponible para usuarios piloto. " +
        "En esta fase puedes generar y descargar XML revisable.",
    },
    { status: 403 }
  );
}

/**
 * Format error response for SES access denied
 */
export function sesAccessDeniedResponse(reason: "pilot" | "admin-disabled" | "env") {
  const messages = {
    pilot: "Pilot users cannot submit to SES. XML generation only.",
    "admin-disabled": "Admin SES operations are disabled.",
    env: "SES operations not available in this environment.",
  };

  return NextResponse.json(
    {
      error: "SES submission denied",
      message: messages[reason],
      phase: "controlled-pilot",
    },
    { status: 403 }
  );
}

/**
 * Read admin access configuration from environment
 */
export function readAdminAccessConfig() {
  return {
    enabled: process.env.SYNCXML_ADMIN_ACCESS_ENABLED === "true",
    token: process.env.SYNCXML_ADMIN_ACCESS_TOKEN || "",
    env: process.env.NODE_ENV || "development",
    allowedEnvs: (process.env.SYNCXML_ADMIN_ACCESS_ALLOWED_ENV || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    allowInProduction: process.env.SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION === "true",
    email: process.env.SYNCXML_ADMIN_EMAIL || "admin@anclora.com",
    redirect: process.env.SYNCXML_ADMIN_ACCESS_REDIRECT || "/app",
  };
}

/**
 * Evaluate if admin access should be granted
 */
export function evaluateAdminAccess(config: {
  enabled: boolean;
  token: string;
  providedToken: string;
  env: string;
  allowedEnvs: string[];
  allowInProduction: boolean;
}): boolean {
  // If disabled globally, deny
  if (!config.enabled) return false;

  // If in production without explicit opt-in, deny
  if (config.env === "production" && !config.allowInProduction) {
    return false;
  }

  // If env not in allowed list, deny
  if (!config.allowedEnvs.includes(config.env)) {
    return false;
  }

  // If token provided and matches, allow
  if (config.token && config.providedToken === config.token) {
    return true;
  }

  return false;
}
