import { NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/db/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";
import { getSessionUser, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Base de datos no disponible." }, { status: 503 });
  }

  const session = await getSessionUser();
  if (!session || !session.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json().catch(() => ({
    currentPassword: "",
    newPassword: "",
  }));

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const user = await prisma.pilotUser.findUnique({ where: { email: session.email } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "La contraseña actual es incorrecta." }, { status: 401 });
  }

  const newHash = hashPassword(newPassword);
  await prisma.pilotUser.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      temporaryPassword: false,
      passwordRotatedAt: new Date(),
    },
  });

  return setSessionCookie(
    NextResponse.json({ ok: true }),
    { email: user.email, role: user.role, temporaryPassword: false }
  );
}
