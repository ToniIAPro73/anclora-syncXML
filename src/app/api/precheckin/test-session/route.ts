import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createPrecheckinTestSession, toPublicPrecheckinSession } from "@/lib/precheckin";

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const parsed = z.object({
    parsed: z.object({
      reservation: z.record(z.string(), z.unknown()),
      property: z.record(z.string(), z.unknown()),
      guests: z.array(z.record(z.string(), z.unknown())).min(1),
    }).passthrough(),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const session = createPrecheckinTestSession(parsed.data.parsed as Parameters<typeof createPrecheckinTestSession>[0]);
  return NextResponse.json({
    session: toPublicPrecheckinSession(session),
    url: `/precheckin/${session.token}`,
  });
}
