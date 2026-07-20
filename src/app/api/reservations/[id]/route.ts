import { NextResponse } from "next/server";
import { getSessionOwnerId, getSessionUser, requireAuth } from "@/lib/auth";
import { deleteReservation, getReservation, ReservationPersistenceUnavailableError } from "@/lib/db/reservations";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;
    const user = await getSessionUser();
    const ownerId = user ? getSessionOwnerId(user) : undefined;
    if (!ownerId) return NextResponse.json({ error: "Sesión no válida para reservas" }, { status: 403 });
    const { id } = await context.params;
    const reservation = await getReservation(id, ownerId);
    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof ReservationPersistenceUnavailableError) {
      return NextResponse.json({ error: "Persistencia de reservas no disponible" }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo cargar la reserva" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;
    const user = await getSessionUser();
    const ownerId = user ? getSessionOwnerId(user) : undefined;
    if (!ownerId) return NextResponse.json({ error: "Sesión no válida para reservas" }, { status: 403 });
    const { id } = await context.params;
    const reservation = await deleteReservation(id, ownerId);
    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof ReservationPersistenceUnavailableError) {
      return NextResponse.json({ error: "Persistencia de reservas no disponible" }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo eliminar la reserva" }, { status: 500 });
  }
}
