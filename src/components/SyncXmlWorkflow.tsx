"use client";

import { useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, FileText, SearchCheck, ShieldCheck, UploadCloud } from "lucide-react";
import type { GeneratedXmlResult, ParsedExcel } from "@/lib/domain";
import { smartValidateParsedExcel } from "@/lib/validation";
import { buildXmlDownloadFileName } from "@/lib/xml/fileName";
import { usePreferences } from "./AppPreferencesProvider";

type BusyAction = "upload" | "validate" | "generate" | "consolidate" | null;
type WorkflowStep = 1 | 2 | 3 | 4;

async function fetchJson(url: string, init: RequestInit, timeoutMs = 25000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function SyncXmlWorkflow() {
  const { dictionary: t } = usePreferences();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedExcel | null>(null);
  const [generated, setGenerated] = useState<GeneratedXmlResult | null>(null);
  const [activeView, setActiveView] = useState<"visual" | "xml">("visual");
  const [activeStep, setActiveStep] = useState<WorkflowStep>(1);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [consolidated, setConsolidated] = useState(false);
  const [smartValidated, setSmartValidated] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validGuests = useMemo(() => parsed?.guests.filter((guest) => guest.errors.length === 0) ?? [], [parsed]);
  const busy = Boolean(busyAction);

  function chooseFile(file?: File | null) {
    if (!file) return;
    setSelectedFile(file);
    setMessage(null);
  }

  async function upload(file = selectedFile) {
    if (!file) return;
    setBusyAction("upload");
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { response, data } = await fetchJson("/api/upload/excel", { method: "POST", body: form });
      if (!response.ok) {
        setMessage(data.error ?? t.actionFailed);
        return;
      }
      setParsed(data.parsed);
      setGenerated(null);
      setConsolidated(false);
      setSmartValidated(false);
      setActiveStep(2);
      setMessage(t.uploadComplete);
    } catch {
      setMessage(t.actionFailed);
    } finally {
      setBusyAction(null);
    }
  }

  async function generate() {
    if (!parsed) {
      setActiveStep(1);
      return;
    }
    setBusyAction("generate");
    setMessage(null);
    try {
      const { response, data } = await fetchJson("/api/generate/xml", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ parsed }),
      });
      if (!response.ok) {
        setMessage(data.error ?? t.actionFailed);
        return;
      }
      setGenerated(data.generated);
      setConsolidated(false);
      setActiveView("visual");
      setActiveStep(3);
      setMessage(t.xmlGeneratedOk);
    } catch {
      setMessage(t.actionFailed);
    } finally {
      setBusyAction(null);
    }
  }

  function validateSmart() {
    if (!parsed) return;
    setBusyAction("validate");
    const next = smartValidateParsedExcel(parsed);
    setParsed(next);
    setGenerated(null);
    setConsolidated(false);
    setSmartValidated(true);
    setMessage(next.validation.errors.length ? t.smartValidationErrors : t.smartValidationOk);
    setBusyAction(null);
  }

  async function consolidate() {
    if (!parsed || !generated) {
      setActiveStep(generated ? 3 : parsed ? 2 : 1);
      return;
    }
    setBusyAction("consolidate");
    setMessage(null);
    try {
      const { response, data } = await fetchJson("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ parsed, generated }),
      });
      if (!response.ok) {
        setMessage(data.error ?? t.actionFailed);
        return;
      }
      setConsolidated(true);
      setActiveStep(4);
      setMessage(`${t.consolidatedOk} ${data.reservation.reference ?? data.reservation.id}`);
    } catch {
      setMessage(t.actionFailed);
    } finally {
      setBusyAction(null);
    }
  }

  function handleStepClick(step: WorkflowStep) {
    if (busy) return;
    if (step === 1) {
      setActiveStep(1);
      return;
    }
    if (step === 2) {
      setActiveStep(parsed ? 2 : 1);
      return;
    }
    if (step === 3) {
      if (generated) setActiveStep(3);
      else void generate();
      return;
    }
    if (generated) void consolidate();
    else setActiveStep(parsed ? 2 : 1);
  }

  function downloadXml() {
    if (!generated) return;
    const blob = new Blob([generated.xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildXmlDownloadFileName(parsed);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <ProcessRail
        activeStep={activeStep}
        parsed={parsed}
        generated={generated}
        consolidated={consolidated}
        busyAction={busyAction}
        onStepClick={handleStepClick}
      />

      {message && <div className="process-message" role="status">{message}</div>}
      {busy && <div className="process-message is-working" role="status">{t.processing}</div>}

      {activeStep === 1 && (
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel p-6">
            <div className="flex items-start gap-4">
              <div className="icon-tile"><FileSpreadsheet className="h-5 w-5" /></div>
              <div>
                <h1 className="font-heading text-3xl font-black">{t.uploadTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted">{t.uploadCopy}</p>
              </div>
            </div>
            <button
              type="button"
              className={`upload-zone mt-6 ${dragActive ? "is-dragging" : ""}`}
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                chooseFile(event.dataTransfer.files.item(0));
              }}
            >
              <UploadCloud className="h-9 w-9 text-accent" />
              <span className="font-heading text-lg font-bold">{dragActive ? t.dropExcel : t.selectExcel}</span>
              <span className="text-sm text-muted">{t.clickOrDrop}</span>
              {selectedFile && <span className="upload-file">{t.fileSelected}: {selectedFile.name}</span>}
            </button>
            <input ref={fileInputRef} className="hidden" type="file" accept=".xlsx" disabled={busy} onChange={(event) => chooseFile(event.target.files?.[0])} />
            <div className="mt-5 flex justify-end">
              <button className="btn-primary" disabled={!selectedFile || busy} onClick={() => upload()}>
                {busyAction === "upload" ? <WorkingLabel label={t.processing} /> : t.importAction}
              </button>
            </div>
          </div>
          <div className="panel border-accent/30 p-6">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm leading-6 text-secondary">{t.privacyNotice}</p>
            </div>
          </div>
        </section>
      )}

      {activeStep === 2 && parsed && (
        <ExcelReview
          parsed={parsed}
          validGuests={validGuests.length}
          busy={busy}
          busyAction={busyAction}
          smartValidated={smartValidated}
          onSmartValidate={validateSmart}
          onGenerate={generate}
        />
      )}

      {activeStep === 3 && generated && parsed && (
        <XmlViewer
          generated={generated}
          activeView={activeView}
          busy={busy}
          busyAction={busyAction}
          onViewChange={setActiveView}
          onDownload={downloadXml}
          onConsolidate={consolidate}
        />
      )}

      {activeStep === 4 && (
        <section className="panel p-6">
          <div className="flex items-start gap-4">
            <div className="icon-tile"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <h2 className="font-heading text-2xl font-black">{t.processConsolidate}</h2>
              <p className="mt-2 text-sm text-secondary">{message ?? t.consolidatedOk}</p>
            </div>
          </div>
          {generated && (
            <div className="mt-5">
              <button className="btn-secondary" onClick={downloadXml}><Download className="h-4 w-4" />{t.downloadXml}</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ExcelReview({
  parsed,
  validGuests,
  busy,
  busyAction,
  smartValidated,
  onSmartValidate,
  onGenerate,
}: {
  parsed: ParsedExcel;
  validGuests: number;
  busy: boolean;
  busyAction: BusyAction;
  smartValidated: boolean;
  onSmartValidate: () => void;
  onGenerate: () => void;
}) {
  const { dictionary: t } = usePreferences();
  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard title={t.reservationSummary} rows={[
          [t.reference, parsed.reservation.reference],
          [t.checkIn, `${parsed.reservation.checkInDate ?? ""} ${parsed.reservation.checkInTime ?? ""}`],
          [t.checkOut, `${parsed.reservation.checkOutDate ?? ""} ${parsed.reservation.checkOutTime ?? ""}`],
          [t.guestCount, String(parsed.reservation.guestCount ?? validGuests)],
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
          <div>
            <h2 className="font-heading text-xl font-bold">{t.guests}: {parsed.guests.length}</h2>
            <p className="mt-1 text-sm text-muted">{smartValidated ? t.smartValidationApplied : t.smartValidationPending}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={onSmartValidate} className="btn-secondary disabled:opacity-45">
              {busyAction === "validate" ? <WorkingLabel label={t.processing} /> : <><ShieldCheck className="h-4 w-4" />{t.smartValidate}</>}
            </button>
            <button disabled={Boolean(parsed.validation.errors.length) || busy} onClick={onGenerate} className="btn-primary disabled:opacity-45">
              {busyAction === "generate" ? <WorkingLabel label={t.processing} /> : t.generateXml}
            </button>
          </div>
        </div>
        <GuestTable guests={parsed.guests} smartValidated={smartValidated} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <IssuePanel title={t.errors} issues={parsed.validation.errors} />
        <IssuePanel title={t.warnings} issues={parsed.validation.warnings} />
      </section>
    </>
  );
}

function XmlViewer({
  generated,
  activeView,
  busy,
  busyAction,
  onViewChange,
  onDownload,
  onConsolidate,
}: {
  generated: GeneratedXmlResult;
  activeView: "visual" | "xml";
  busy: boolean;
  busyAction: BusyAction;
  onViewChange: (view: "visual" | "xml") => void;
  onDownload: () => void;
  onConsolidate: () => void;
}) {
  const { dictionary: t } = usePreferences();
  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold">XML</h2>
          <p className="mt-1 text-sm text-muted">{t.xmlNote}</p>
        </div>
        <div className="flex gap-2">
          <button className={`tab ${activeView === "visual" ? "is-active" : ""}`} onClick={() => onViewChange("visual")}>{t.visualView}</button>
          <button className={`tab ${activeView === "xml" ? "is-active" : ""}`} onClick={() => onViewChange("xml")}>{t.rawXml}</button>
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
        <button className="btn-secondary" onClick={onDownload}><Download className="h-4 w-4" />{t.downloadXml}</button>
        <button className="btn-primary" onClick={onConsolidate} disabled={busy || Boolean(generated.validation.errors.length)}>
          {busyAction === "consolidate" ? <WorkingLabel label={t.processing} /> : <><CheckCircle2 className="h-4 w-4" />{t.consolidate}</>}
        </button>
      </div>
    </section>
  );
}

function ProcessRail({ activeStep, parsed, generated, consolidated, busyAction, onStepClick }: { activeStep: WorkflowStep; parsed: ParsedExcel | null; generated: GeneratedXmlResult | null; consolidated: boolean; busyAction: BusyAction; onStepClick: (step: WorkflowStep) => void }) {
  const { dictionary: t } = usePreferences();
  const steps: Array<{ step: WorkflowStep; label: string; icon: ComponentType<{ className?: string }>; done: boolean; busy: boolean }> = [
    { step: 1, label: t.processImport, icon: UploadCloud, done: Boolean(parsed), busy: busyAction === "upload" },
    { step: 2, label: t.processReview, icon: SearchCheck, done: Boolean(generated), busy: false },
    { step: 3, label: t.processXml, icon: FileText, done: Boolean(generated), busy: busyAction === "generate" },
    { step: 4, label: t.processConsolidate, icon: CheckCircle2, done: consolidated, busy: busyAction === "consolidate" },
  ];
  return (
    <section className="process-panel">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-sm font-black uppercase tracking-[0.18em] text-muted">{t.processTitle}</h2>
      </div>
      <div className="process-rail">
        {steps.map((item) => {
          const Icon = item.icon;
          const state = item.busy ? "active" : item.done ? "done" : activeStep === item.step ? "active" : "pending";
          return (
            <button key={item.step} type="button" className={`process-step is-${state}`} onClick={() => onStepClick(item.step)} disabled={Boolean(busyAction)}>
              <div className="process-step-index">{item.step}</div>
              <div className="process-step-icon"><Icon className="h-4 w-4" /></div>
              <div className="min-w-0 text-left">
                <p className="truncate font-heading text-sm font-bold">{item.label}</p>
                <p className="text-xs text-muted">{state === "active" ? t.processActive : state === "done" ? t.processDone : t.processPending}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function fieldState(guest: ParsedExcel["guests"][number], fields: string[], smartValidated: boolean) {
  const issues = guest.errors.concat(guest.warnings).filter((issue) => issue.field && fields.includes(issue.field));
  if (issues.some((issue) => issue.severity === "error")) return "error";
  if (issues.some((issue) => issue.severity === "warning")) return "warning";
  return smartValidated ? "valid" : "neutral";
}

function FieldCell({ state, children }: { state: "error" | "warning" | "valid" | "neutral"; children: ReactNode }) {
  return <td className={`field-cell is-${state}`}>{children}</td>;
}

function GuestTable({ guests, smartValidated }: { guests: ParsedExcel["guests"]; smartValidated: boolean }) {
  const { dictionary: t } = usePreferences();
  return (
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
          {guests.map((guest) => (
            <tr key={guest.sourceRow}>
              <td><StatusPill status={guest.validationStatus} /></td>
              <td>{guest.sourceRow}</td>
              <FieldCell state={fieldState(guest, ["firstName", "surname1", "surname2"], smartValidated)}><span className="font-semibold">{guest.firstName}</span><br />{guest.surname1} {guest.surname2}</FieldCell>
              <FieldCell state={fieldState(guest, ["documentNumber", "documentType"], smartValidated)}><span className="text-muted">{guest.documentType}</span><br />{guest.documentNumber}</FieldCell>
              <FieldCell state={fieldState(guest, ["birthDate", "nationalityIso3"], smartValidated)}><span className="text-muted">Nac.</span> {guest.birthDate}<br /><span className="text-muted">Pais</span> {guest.nationalityIso3}</FieldCell>
              <FieldCell state={fieldState(guest, ["email", "phone"], smartValidated)}><span className="break-anywhere">{guest.email || "-"}</span><br /><span className="text-muted">{guest.phone || "-"}</span></FieldCell>
              <FieldCell state={fieldState(guest, ["address", "postalCode", "municipalityCode"], smartValidated)}><span className="break-anywhere">{guest.address}</span></FieldCell>
              <td><CompactIssueList issues={guest.errors.concat(guest.warnings)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
