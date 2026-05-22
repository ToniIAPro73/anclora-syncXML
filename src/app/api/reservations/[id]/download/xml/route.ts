import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getReservation } from "@/lib/db/reservations";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const reservation = await getReservation(id) as any;
  if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  const xml = reservation.xml ?? reservation.normalizedPayloadJson?.xml ?? "";
  return new NextResponse(xml || "<error>XML no disponible en esta instalacion</error>", {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "content-disposition": `attachment; filename="syncxml-${reservation.reference ?? id}.xml"`,
    },
  });
}
