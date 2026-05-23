import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getReservation } from "@/lib/db/reservations";
import { buildXmlDownloadFileName } from "@/lib/xml/fileName";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const reservation = await getReservation(id) as any;
  if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  const xml = reservation.xml ?? reservation.generatedXml ?? "";
  if (!xml) return NextResponse.json({ error: "XML no disponible para esta reserva" }, { status: 404 });
  const fileName = buildXmlDownloadFileName({
    reservation: {
      reference: reservation.reference ?? reservation.normalizedPayloadJson?.reservation?.reference ?? reservation.payload?.reservation?.reference,
    },
    property: {
      establishmentCode:
        reservation.property?.establishmentCode
        ?? reservation.normalizedPayloadJson?.property?.establishmentCode
        ?? reservation.payload?.property?.establishmentCode,
    },
  });
  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName}"`,
    },
  });
}
