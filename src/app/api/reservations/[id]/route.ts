import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteReservation, getReservation } from "@/lib/db/reservations";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const reservation = await getReservation(id);
  if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  return NextResponse.json({ reservation });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const reservation = await deleteReservation(id);
  return NextResponse.json({ reservation });
}
