"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, FileText, SearchCheck, ShieldCheck, UploadCloud } from "lucide-react";
import type { GeneratedXmlResult, ParsedExcel } from "@/lib/domain";
import { usePreferences } from "./AppPreferencesProvider";

export function SyncXmlWorkflow() {
  const { dictionary: t } = usePreferences();
  const [parsed, setParsed] = useState<ParsedExcel | null>(null);
  const [generated, setGenerated] = useState<GeneratedXmlResult | null>(null);
  const [activeView, setActiveView] = useState<"visual" | "xml">("visual");
  const [busyAction, setBusyAction] = useState<"upload" | "generate" | "consolidate" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [consolidated, setConsolidated] = useState(false);

  const validGuests = useMemo(() => parsed?.guests.filter((guest) => guest.errors.length === 0) ?? [], [parsed]);
  const busy = Boolean(busyAction);

  async function upload(file: File) {
    setBusyAction("upload");
    setMessage(null);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload/excel", { method: "POST", body: form });
    const data = await response.json();
    setBusyAction(null);
    if (!response.ok) {
      setMessage(data.error ?? "Error");
      return;
    }
    setParsed(data.parsed);
    setGenerated(null);
    setConsolidated(false);
    setMessage(t.uploadComplete);
  }

  async function generate() {
    if (!parsed) return;
    setBusyAction("generate");
    setMessage(null);
    const response = await fetch("/api/generate/xml", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ parsed }) });
    const data = await response.json();
    setBusyAction(null);
    if (!response.ok) {
      setMessage(data.error ?? "Error");
      return;
    }
    setGenerated(data.generated);
    setConsolidated(false);
    setActiveView("visual");
    setMessage(t.xmlGeneratedOk);
  }

  async function consolidate() {
    if (!parsed || !generated) return;
    setBusyAction("consolidate");
    setMessage(null);
    const response = await fetch("/api/reservations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ parsed, generated }) });
    const data = await response.json();
    setBusyAction(null);
    if (!response.ok) {
      setMessage(data.error ?? "Error");
      return;
    }
    setConsolidated(true);
    setMessage(`${t.consolidatedOk} ${data.reservation.reference ?? data.reservation.id}`);
  }

  function downloadXml() {
    if (!generated) return;
    const blob = new Blob([generated.xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `syncxml-${parsed?.reservation.reference ?? Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6">
          <div className="flex items-start gap-4">
            <div className="icon-tile"><FileSpreadsheet className="h-5 w-5" /></div>
            <div>
              <h1 className="font-heading text-3xl font-black">{t.uploadTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">{t.uploadCopy}</p>
            </div>
          </div>
          <label className={`mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-contrast transition hover:brightness-110 ${busy ? "cursor-wait opacity-75" : "cursor-pointer"}`}>
            <input className="hidden" type="file" accept=".xlsx" disabled={busy} onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} />
            {busyAction === "upload" ? <WorkingLabel label={t.processing} /> : t.selectExcel}
          </label>
        </div>
        <div className="panel border-accent/30 p-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-accent" />
            <p className="text-sm leading-6 text-secondary">{t.privacyNotice}</p>
          </div>
        </div>
      </section>

      <ProcessRail parsed={parsed} generated={generated} consolidated={consolidated} busyAction={busyAction} />

      {message && <div className="process-message" role="status">{message}</div>}
      {busy && <div className="process-message is-working" role="status">{t.processing}</div>}

      {parsed && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <InfoCard title={t.reservationSummary} rows={[
              [t.reference, parsed.reservation.reference],
              [t.checkIn, `${parsed.reservation.checkInDate ?? ""} ${parsed.reservation.checkInTime ?? ""}`],
              [t.checkOut, `${parsed.reservation.checkOutDate ?? ""} ${parsed.reservation.checkOutTime ?? ""}`],
              [t.guestCount, String(parsed.reservation.guestCount ?? validGuests.length)],
            ]} />
            <InfoCard title={t.property} rows={[
              ["Codigo", parsed.property.establishmentCode],
              ["Nombre", parsed.property.name],
              ["Direccion", parsed.property.address],
              ["Municipio", `${parsed.property.postalCode ?? ""} ${parsed.property.municipality ?? ""}`],
              ["Provincia", parsed.property.province],
            ]} />
            <InfoCard title={t.contractPayment} rows={[
              ["Contrato", parsed.reservation.contractDate],
              [t.paymentType, parsed.payment.paymentType],
              ["Internet", String(parsed.reservation.internet ?? true)],
            ]} />
          </section>

          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app p-5">
              <h2 className="font-heading text-xl font-bold">{t.guests}: {parsed.guests.length}</h2>
              <button disabled={Boolean(parsed.validation.errors.length) || busy} onClick={generate} className="btn-primary disabled:cursor-not-allowed disabled:opacity-45">
                {busyAction === "generate" ? <WorkingLabel label={t.processing} /> : t.generateXml}
              </button>
            </div>
            <div className="guest-table-wrap">
              <table className="data-table guest-table">
                <colgroup>
                  <col className="w-[7%]" />
                  <col className="w-[4%]" />
                  <col className="w-[15%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[18%]" />
                  <col className="w-[22%]" />
                  <col className="w-[13%]" />
                </colgroup>
                <thead><tr><th>Est.</th><th>#</th><th>{t.name}</th><th>Doc.</th><th>Datos</th><th>Contacto</th><th>Dir.</th><th>Avisos</th></tr></thead>
                <tbody>
                  {parsed.guests.map((guest) => (
                    <tr key={guest.sourceRow}>
                      <td><StatusPill status={guest.validationStatus} /></td>
                      <td>{guest.sourceRow}</td>
                      <td className="font-semibold">{guest.firstName}<br />{guest.surname1} {guest.surname2}</td>
                      <td><span className="text-muted">{guest.documentType}</span><br />{guest.documentNumber}</td>
                      <td><span className="text-muted">Nac.</span> {guest.birthDate}<br /><span className="text-muted">Pais</span> {guest.nationalityIso3}</td>
                      <td className="break-anywhere">{guest.email || "-"}<br /><span className="text-muted">{guest.phone || "-"}</span></td>
                      <td className="break-anywhere">{guest.address}</td>
                      <td><CompactIssueList issues={guest.errors.concat(guest.warnings)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <IssuePanel title={t.errors} issues={parsed.validation.errors} />
            <IssuePanel title={t.warnings} issues={parsed.validation.warnings} />
          </section>
        </>
      )}

      {generated && (
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold">XML</h2>
              <p className="mt-1 text-sm text-muted">{t.xmlNote}</p>
            </div>
            <div className="flex gap-2">
              <button className={`tab ${activeView === "visual" ? "is-active" : ""}`} onClick={() => setActiveView("visual")}>{t.visualView}</button>
              <button className={`tab ${activeView === "xml" ? "is-active" : ""}`} onClick={() => setActiveView("xml")}>{t.rawXml}</button>
            </div>
          </div>
          {activeView === "visual" ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard title={t.reservationSummary} rows={[[t.reference, generated.visual.reservation.reference], [t.checkIn, generated.visual.reservation.checkInDate], [t.checkOut, generated.visual.reservation.checkOutDate], [t.guestCount, String(generated.visual.guests.length)], [t.paymentType, generated.visual.payment.paymentType]]} />
              <InfoCard title={t.property} rows={[["Codigo", generated.visual.property.establishmentCode], ["Nombre", generated.visual.property.name], ["Direccion", generated.visual.property.address]]} />
              {generated.visual.guests.map((guest) => <InfoCard key={guest.sourceRow} title={`${guest.firstName} ${guest.surname1}`} rows={[[t.document, `${guest.documentType} ${guest.documentNumber}`], [t.nationality, guest.nationalityIso3], [t.birthDate, guest.birthDate], [t.address, guest.address], [t.email, guest.email], [t.phone, guest.phone]]} />)}
            </div>
          ) : (
            <pre className="mt-5 max-h-[520px] overflow-auto rounded-lg bg-black/45 p-4 text-xs text-emerald-200"><code>{generated.xml}</code></pre>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-secondary" onClick={downloadXml}><Download className="h-4 w-4" />{t.downloadXml}</button>
            <button className="btn-primary" onClick={consolidate} disabled={busy || Boolean(generated.validation.errors.length)}>
              {busyAction === "consolidate" ? <WorkingLabel label={t.processing} /> : <><CheckCircle2 className="h-4 w-4" />{t.consolidate}</>}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ProcessRail({ parsed, generated, consolidated, busyAction }: { parsed: ParsedExcel | null; generated: GeneratedXmlResult | null; consolidated: boolean; busyAction: "upload" | "generate" | "consolidate" | null }) {
  const { dictionary: t } = usePreferences();
  const steps = [
    { key: "import", label: t.processImport, icon: UploadCloud, done: Boolean(parsed), active: busyAction === "upload" },
    { key: "review", label: t.processReview, icon: SearchCheck, done: Boolean(generated), active: Boolean(parsed && !generated && busyAction !== "generate") },
    { key: "xml", label: t.processXml, icon: FileText, done: Boolean(generated), active: busyAction === "generate" },
    { key: "consolidate", label: t.processConsolidate, icon: CheckCircle2, done: consolidated, active: busyAction === "consolidate" },
  ];
  return (
    <section className="process-panel">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-sm font-black uppercase tracking-[0.18em] text-muted">{t.processTitle}</h2>
      </div>
      <div className="process-rail">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const state = step.active ? "active" : step.done ? "done" : "pending";
          return (
            <div key={step.key} className={`process-step is-${state}`}>
              <div className="process-step-index">{index + 1}</div>
              <div className="process-step-icon"><Icon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-bold">{step.label}</p>
                <p className="text-xs text-muted">{state === "active" ? t.processActive : state === "done" ? t.processDone : t.processPending}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WorkingLabel({ label }: { label: string }) {
  return <><span className="spinner" aria-hidden="true" />{label}</>;
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string | number | undefined]> }) {
  return <div className="panel p-5"><h3 className="font-heading text-lg font-bold">{title}</h3><dl className="mt-4 space-y-2">{rows.map(([key, value]) => <div key={key} className="flex justify-between gap-4 text-sm"><dt className="text-muted">{key}</dt><dd className="text-right font-semibold text-secondary">{value || "-"}</dd></div>)}</dl></div>;
}

function StatusPill({ status }: { status: string }) {
  const label = status === "ERROR" ? "ERR" : status === "WARNING" ? "WARN" : "OK";
  return <span className={`status-pill ${status === "ERROR" ? "is-error" : status === "WARNING" ? "is-warning" : "is-valid"}`}>{label}</span>;
}

function IssuePanel({ title, issues }: { title: string; issues: Array<{ code: string; message: string; severity: string; sourceRow?: number }> }) {
  return <div className="panel p-5"><h3 className="font-heading font-bold">{title}</h3>{issues.length ? <ul className="mt-3 space-y-2 text-sm">{issues.map((issue, index) => <li key={`${issue.code}-${index}`} className="flex gap-2 text-secondary"><AlertTriangle className={issue.severity === "error" ? "h-4 w-4 text-error" : "h-4 w-4 text-warning"} />{issue.sourceRow ? `Fila ${issue.sourceRow}: ` : ""}{issue.message}</li>)}</ul> : <p className="mt-3 text-sm text-muted">OK</p>}</div>;
}

function CompactIssueList({ issues }: { issues: Array<{ code: string; message: string; severity: string; field?: string }> }) {
  if (!issues.length) return <span className="text-muted">OK</span>;
  return (
    <div className="space-y-1">
      {issues.slice(0, 3).map((issue) => (
        <p key={issue.code + issue.field} className={issue.severity === "error" ? "text-error" : "text-warning"}>
          {issue.message.replace(" no informado", "").replace("Telefono", "Tel.").replace("Codigo de municipio", "Cod. mun.").replace("Soporte de documento", "Soporte doc.")}
        </p>
      ))}
      {issues.length > 3 && <p className="text-muted">+{issues.length - 3}</p>}
    </div>
  );
}
