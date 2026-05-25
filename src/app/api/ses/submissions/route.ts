import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getRateLimitKey, sensitiveRateLimiter } from "@/lib/security/rateLimit";
import { listSesSubmissions, getSesSubmission } from "@/lib/ses/submissionRepository";

export async function GET(request: Request) {
  try {
    const rateLimit = sensitiveRateLimiter.check(`ses-submissions:${getRateLimitKey(request)}`);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    const unauthorized = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

    if (id) {
      const submission = await getSesSubmission(id);
      if (!submission) return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
      // Never return responseSoap or requestSoap in list; only in detail
      return NextResponse.json({ submission: sanitizeForFrontend(submission, true) });
    }

    const submissions = await listSesSubmissions(limit);
    return NextResponse.json({
      submissions: submissions.map((s) => sanitizeForFrontend(s, false)),
      total: submissions.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

function sanitizeForFrontend(record: ReturnType<typeof Object.assign>, includeRawSoap = false) {
  const { requestSoap: __req, responseSoap, ...rest } = record as { requestSoap?: string; responseSoap?: string; [k: string]: unknown };
  void __req;
  if (includeRawSoap) {
    return { ...rest, hasResponseSoap: Boolean(responseSoap), responseSoapLength: responseSoap?.length };
  }
  return { ...rest };
}
