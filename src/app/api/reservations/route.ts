import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createReservation, listReservations } from "@/lib/db/reservations";
import { generateHospitalityXml } from "@/lib/xml/generateHospitalityXml";
import { readReferenceTemplate } from "@/lib/xml/template";

export async function GET(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(request.url);
  const reservations = await listReservations(searchParams.get("q") ?? undefined);
  return NextResponse.json({ reservations });
}

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const payload = z.object({ parsed: z.any(), generated: z.any().optional() }).safeParse(body);
  if (!payload.success) return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  const generated = payload.data.generated ?? generateHospitalityXml(payload.data.parsed, await readReferenceTemplate());
  if (generated.validation.errors.length) return NextResponse.json({ error: "La reserva contiene errores criticos", validation: generated.validation }, { status: 422 });
  const reservation = await createReservation({ parsed: payload.data.parsed, generated });
  return NextResponse.json({ reservation });
}
