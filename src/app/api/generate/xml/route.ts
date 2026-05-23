import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { generateHospitalityXml } from "@/lib/xml/generateHospitalityXml";
import { readReferenceTemplate } from "@/lib/xml/template";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { smartValidateParsedExcel } from "@/lib/validation";
import { resolveParsedMunicipiosFromDb } from "@/lib/municipios/resolveMunicipio";
import { prismaMunicipioRepository } from "@/lib/db/municipios";

export async function POST(request: Request) {
  const rateLimit = sensitiveRateLimiter.check(`generate:${getRateLimitKey(request)}`);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const parsed = z.object({ parsed: z.any() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  const template = await readReferenceTemplate();
  const withMunicipios = await resolveParsedMunicipiosFromDb(parsed.data.parsed, prismaMunicipioRepository);
  const validated = smartValidateParsedExcel(withMunicipios);
  const generated = generateHospitalityXml(validated, template);
  return NextResponse.json({ generated });
}
