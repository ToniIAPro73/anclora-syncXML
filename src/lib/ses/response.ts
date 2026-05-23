import { createHash } from "node:crypto";

export function summarizeSesHttpResponse(result: { ok: boolean; status: number; statusText: string; body: string }) {
  return {
    ok: result.ok,
    status: result.status,
    statusText: result.statusText,
    responseHash: createHash("sha256").update(result.body || "").digest("hex"),
    hasBody: Boolean(result.body),
  };
}
