import { NextResponse } from "next/server";

export function requireSesProductionSendOptIn(options: { environment?: "pre" | "prod"; dryRun?: boolean }) {
  if (options.environment !== "prod" || options.dryRun !== false) return null;
  if (process.env.SYNCXML_ALLOW_SES_PRODUCTION_SEND === "true") return null;
  return NextResponse.json(
    {
      error: "SES production sending is disabled",
      code: "SYNCXML_SES_PRODUCTION_SEND_DISABLED",
    },
    { status: 403 },
  );
}
