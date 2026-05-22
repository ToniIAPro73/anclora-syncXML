import { NextResponse } from "next/server";
import { z } from "zod";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { requireAuth } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Archivo no recibido" }, { status: 400 });
  const parsed = z.object({ name: z.string().endsWith(".xlsx"), size: z.number().max(MAX_SIZE) }).safeParse({ name: file.name.toLowerCase(), size: file.size });
  if (!parsed.success) return NextResponse.json({ error: "Solo se admiten archivos .xlsx de hasta 5MB" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = parseExcelBuffer(buffer, file.name);
  return NextResponse.json({ parsed: result });
}
