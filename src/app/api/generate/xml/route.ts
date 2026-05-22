import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { generateHospitalityXml } from "@/lib/xml/generateHospitalityXml";
import { readReferenceTemplate } from "@/lib/xml/template";

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const parsed = z.object({ parsed: z.any() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  const template = await readReferenceTemplate();
  const generated = generateHospitalityXml(parsed.data.parsed, template);
  return NextResponse.json({ generated });
}
