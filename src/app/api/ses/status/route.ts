import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSesConfigStatus } from "@/lib/ses/config";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  return NextResponse.json({ status: getSesConfigStatus("pre") });
}
