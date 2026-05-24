import { NextResponse } from "next/server";
import { getPrecheckinSession, submitPrecheckinTestData, toPublicPrecheckinSession } from "@/lib/precheckin";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = getPrecheckinSession(token);
  if (!session) return NextResponse.json({ error: "Pre-check-in no encontrado" }, { status: 404 });
  return NextResponse.json({ session: toPublicPrecheckinSession(session) });
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const body = await request.json().catch(() => ({}));
  const result = submitPrecheckinTestData(token, body);
  if (!result) return NextResponse.json({ error: "Pre-check-in no encontrado" }, { status: 404 });
  if (result.issues.length) return NextResponse.json({ result }, { status: 422 });
  return NextResponse.json({ result });
}
