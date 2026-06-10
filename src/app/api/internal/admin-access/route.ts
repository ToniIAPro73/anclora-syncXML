import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { evaluateAdminAccess, readAdminAccessConfig } from "@/lib/security/adminAccess";

export const dynamic = "force-dynamic";

/** Generic response for every rejected attempt — never reveals why it failed. */
function denied() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

/**
 * Controlled admin access endpoint.
 *
 *   GET /api/internal/admin-access?token=<SYNCXML_ADMIN_ACCESS_TOKEN>
 *
 * On success it creates a normal admin session cookie and redirects to the
 * configured internal route. The token is never logged or echoed back.
 */
export async function GET(request: Request) {
  const config = readAdminAccessConfig();
  const url = new URL(request.url);
  const providedToken = url.searchParams.get("token") || "";

  const allowed = evaluateAdminAccess({
    enabled: config.enabled,
    token: config.token,
    providedToken,
    env: config.env,
    allowedEnvs: config.allowedEnvs,
    allowInProduction: config.allowInProduction,
  });

  if (!allowed) {
    // Audit without exposing the token or whether one was provided.
    console.warn(
      `[admin-access] denied env=${config.env} enabled=${config.enabled} prodOptIn=${config.allowInProduction}`,
    );
    return denied();
  }

  console.info(`[admin-access] granted env=${config.env}`);

  const redirectTarget = new URL(config.redirect || "/app", url.origin);
  const response = NextResponse.redirect(redirectTarget, 302);
  return setSessionCookie(response, { email: config.email, role: "admin" });
}
