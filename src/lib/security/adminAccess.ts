/**
 * Admin access control for SyncXML
 * Restricts sensitive operations to admin users only
 */

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";

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
