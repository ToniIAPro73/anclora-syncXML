"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw, Search, Trash2 } from "lucide-react";
import { formatDashboardDateTime } from "@/lib/dateFormat";
import { usePreferences } from "./AppPreferencesProvider";
import { maskDocument, maskEmail, maskPhone } from "@/lib/privacy/masking";

export function ReservationDashboard() {
  const { dictionary: t } = usePreferences();
  const [query, setQuery] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [busyAction, setBusyAction] = useState<"load" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ineBusy, setIneBusy] = useState(false);
  const [ineResult, setIneResult] = useState<any | null>(null);

  const load = useCallback(async (q = query, showMessage = true) => {
    setBusyAction("load");
    if (showMessage) setMessage(null);
    const response = await fetch(`/api/reservations${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await response.json();
    setReservations(data.reservations ?? []);
    setBusyAction(null);
    if (showMessage) setMessage(t.dashboardLoaded);
  }, [query, t.dashboardLoaded]);

  async function remove(id: string) {
    if (!window.confirm(t.deleteNotice)) return;
    setBusyAction("delete");
    setMessage(null);
    await fetch(`/api/reservations/${id}`, { method: "DELETE" });
    setSelected(null);
    setBusyAction(null);
    setMessage(t.reservationDeleted);
    await load(query, false);
  }

  useEffect(() => { void load(""); }, [load]);

  async function syncMunicipiosIne() {
    setIneBusy(true);
    setIneResult(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/ine/municipios/sync", { method: "POST" });
      const data = await response.json();
      setIneResult({ ...data, httpOk: response.ok });
    } catch {
      setIneResult({ ok: false, message: t.ineSyncFailed, errors: [{ reason: t.actionFailed }] });
    } finally {
      setIneBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold">{t.ineMunicipiosTitle}</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">{t.ineMunicipiosCopy}</p>
          </div>
          <button className="btn-primary" disabled={ineBusy} onClick={syncMunicipiosIne}>
            {ineBusy ? <><span className="spinner" aria-hidden="true" />{t.ineSyncing}</> : <><RefreshCw className="h-4 w-4" />{t.ineMunicipiosButton}</>}
          </button>
        </div>
        {ineResult && (
          <div className={`mt-4 rounded-lg border p-4 ${ineResult.ok ? "border-emerald-500/30" : "border-red-500/40"}`}>
            <p className="font-heading text-sm font-bold">{ineResult.ok ? t.ineSyncOk : t.ineSyncFailed}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <Metric label={t.ineFetched} value={String(ineResult.totalFetched ?? 0)} />
              <Metric label={t.ineInserted} value={String(ineResult.inserted ?? 0)} />
              <Metric label={t.ineUpdated} value={String(ineResult.updated ?? 0)} />
              <Metric label={t.ineSkipped} value={String(ineResult.skipped ?? 0)} />
              <Metric label={t.ineErrors} value={String(ineResult.errors?.length ?? 0)} />
              <Metric label={t.ineLastSync} value={ineResult.lastSyncedAt ? new Date(ineResult.lastSyncedAt).toLocaleString() : "-"} />
            </div>
          </div>
        )}
      </section>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="panel overflow-hidden">
        <div className="border-b border-app p-5">
          <h1 className="font-heading text-2xl font-black">{t.dashboard}</h1>
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
            </div>
            <button className="btn-secondary" disabled={Boolean(busyAction)} onClick={() => load()}>
              {busyAction === "load" ? <><span className="spinner" aria-hidden="true" />{t.processing}</> : t.dashboard}
            </button>
          </div>
          {message && <div className="mt-3 text-sm text-secondary" role="status">{message}</div>}
        </div>
        <div className="divide-y divide-app">
          {reservations.length ? reservations.map((reservation) => (
            <button key={reservation.id} className="block w-full p-4 text-left transition hover:bg-surface-elevated" onClick={() => setSelected(reservation)}>
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-heading font-bold">{reservation.reference ?? reservation.payload?.reservation?.reference ?? reservation.id}</p>
                  <p className="text-sm text-muted">{reservation.property?.name ?? reservation.payload?.property?.name ?? "-"}</p>
                </div>
                <span className="status-pill is-valid">{reservation.status}</span>
              </div>
            </button>
          )) : <p className="p-5 text-sm text-muted">{t.empty}</p>}
        </div>
      </section>
      <section className="panel p-5">
        {selected ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold">{selected.reference ?? selected.payload?.reservation?.reference}</h2>
                <p className="text-sm text-muted">{selected.property?.name ?? selected.payload?.property?.name}</p>
              </div>
              <div className="flex gap-2">
                <a className="btn-secondary" href={`/api/reservations/${selected.id}/download/xml`}><Download className="h-4 w-4" />XML</a>
                <button className="btn-danger" disabled={Boolean(busyAction)} onClick={() => remove(selected.id)}>
                  {busyAction === "delete" ? <><span className="spinner" aria-hidden="true" />{t.processing}</> : <><Trash2 className="h-4 w-4" />{t.delete}</>}
                </button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Metric label={t.checkIn} value={reservationDateTime(selected, "checkIn")} />
              <Metric label={t.checkOut} value={reservationDateTime(selected, "checkOut")} />
              <Metric label={t.guestCount} value={String(selected.guestCount ?? selected.payload?.guests?.length ?? 0)} />
            </div>
            <div className="overflow-x-auto rounded-lg border border-app">
              <table className="data-table">
                <thead><tr><th>{t.name}</th><th>{t.document}</th><th>{t.email}</th><th>{t.phone}</th></tr></thead>
                <tbody>
                  {(selected.guests ?? selected.payload?.guests ?? []).map((guest: any) => (
                    <tr key={guest.id ?? guest.sourceRow}>
                      <td>{guest.firstName} {guest.surname1}</td>
                      <td>{guest.documentType} {maskDocument(guest.documentNumber)}</td>
                      <td>{maskEmail(guest.email)}</td>
                      <td>{maskPhone(guest.phone)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : <p className="text-sm text-muted">{t.empty}</p>}
      </section>
      </div>
    </div>
  );
}

function reservationDateTime(reservation: any, type: "checkIn" | "checkOut") {
  const payload = reservation.normalizedPayloadJson ?? reservation.payload;
  const parsedReservation = payload?.reservation;
  if (type === "checkIn") {
    return formatDashboardDateTime(parsedReservation?.checkInDate ?? reservation.checkIn, parsedReservation?.checkInTime);
  }
  return formatDashboardDateTime(parsedReservation?.checkOutDate ?? reservation.checkOut, parsedReservation?.checkOutTime);
}

function Metric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="metric-card">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="metric-value">{value ?? "-"}</p>
    </div>
  );
}
