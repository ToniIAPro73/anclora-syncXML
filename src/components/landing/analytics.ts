/**
 * Lightweight, dependency-free analytics shim.
 *
 * It pushes events to `window.dataLayer` when an analytics layer (GTM, etc.)
 * is present, and is a no-op otherwise. No backend, no network calls, no new
 * dependencies — just a clean seam to wire real analytics later.
 */
export function track(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event, ...payload });
  }
}
