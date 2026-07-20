import { NextResponse } from "next/server";
import { z } from "zod";
import { logRouteError, publicErrorResponse } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth";
import { requireSesProductionSendOptIn } from "@/lib/ses/access";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { querySesCatalog } from "@/lib/ses/client";
import { summarizeSesHttpResponse } from "@/lib/ses/response";

export async function POST(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-catalogo:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;
    const body = await request.json().catch(() => ({}));
    const parsed = z.object({
      catalog: z.string().min(1),
      environment: z.enum(["pre", "prod"]).optional(),
      dryRun: z.boolean().optional(),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    const productionDenied = requireSesProductionSendOptIn({
      environment: parsed.data.environment,
      dryRun: parsed.data.dryRun ?? true,
    });
    if (productionDenied) return productionDenied;
    const result = await querySesCatalog(parsed.data.catalog, { environment: parsed.data.environment, dryRun: parsed.data.dryRun ?? true });
    if (!("status" in result)) return NextResponse.json({ dryRun: true, environment: result.environment, endpoint: result.endpoint });
    return NextResponse.json(summarizeSesHttpResponse(result));
  } catch (error) {
    logRouteError("ses-catalogo", error);
    return publicErrorResponse(503, "SYNCXML_SES_CATALOG_FAILED", "No se pudo consultar el catalogo SES");
  }
}
