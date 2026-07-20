import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSesConfigStatus } from "@/lib/ses/config";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json({ status: getSesConfigStatus("pre") });
}
