"use client";

import { useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { Ban, CheckCircle2, ClipboardCheck, Download, Eye, EyeOff, FileSpreadsheet, FileText, RadioTower, SearchCheck, Send, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import type { DuplicateResolution, GeneratedXmlResult, ParsedExcel } from "@/lib/domain";
import { smartValidateParsedExcel } from "@/lib/validation";
import { buildXmlDownloadFileName } from "@/lib/xml/fileName";
import { usePreferences } from "./AppPreferencesProvider";
import { unresolvedDuplicates } from "@/lib/duplicates";
import { maskAddress, maskDocument, maskEmail, maskPayment, maskPhone } from "@/lib/privacy/masking";

type BusyAction = "upload" | "validate" | "generate" | "consolidate" | null;
type WorkflowStep = 1 | 2 | 3 | 4;
type SesUiAction = "validate" | "prepare" | "sendPre" | "queryLot" | "queryCommunication" | "cancelLot" | "catalog" | null;

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
  const [consents, setConsents] = useState([false, false, false, false, false]);
  const [showFullData, setShowFullData] = useState(false);
  const [previewReviewed, setPreviewReviewed] = useState(false);
  const [mappingReviewed, setMappingReviewed] = useState(false);
  const [temporaryCleared, setTemporaryCleared] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validGuests = useMemo(() => parsed?.guests.filter((guest) => guest.errors.length === 0) ?? [], [parsed]);
  const consentAccepted = consents.every(Boolean);
  const duplicateBlockers = useMemo(() => (parsed ? unresolvedDuplicates(parsed) : []), [parsed]);
  const busy = Boolean(busyAction);
  const consolidationBlocker = useMemo(() => {
    if (!parsed || !generated) return t.xmlPreviewRequired;
    if (parsed.validation.errors.length || generated.validation.errors.length) return t.criticalErrorsBlocked;
    if (duplicateBlockers.length) return t.unresolvedDuplicatesBlocked;
    if (!previewReviewed) return t.previewReviewRequired;
    if (!mappingReviewed) return t.mappingReviewRequired;
    return null;
  }, [duplicateBlockers.length, generated, mappingReviewed, parsed, previewReviewed, t]);

  function chooseFile(file?: File | null) {
    if (!file) return;
    setSelectedFile(file);
    setMessage(null);
  }

  function requireConsentNotice() {
    setMessage(t.consentRequiredNotice);
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
        setMessage(fileErrorMessage(data.error, t));
        return;
      }
      setParsed(data.parsed);
      setGenerated(null);
      setConsolidated(false);
      setSmartValidated(false);
      setPreviewReviewed(false);
      setMappingReviewed(false);
      setTemporaryCleared(false);
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
    setPreviewReviewed(false);
    setMessage(next.validation.errors.length ? t.smartValidationErrors : t.smartValidationOk);
    setBusyAction(null);
  }

  async function consolidate() {
    if (consolidationBlocker) {
      setMessage(consolidationBlocker);
      setActiveStep(generated ? 3 : parsed ? 2 : 1);
      return;
    }
    if (!parsed || !generated) return;
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
    else {
      setMessage(t.xmlPreviewRequired);
      setActiveStep(parsed ? 2 : 1);
    }
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

  function clearOperation() {
    if (!window.confirm(t.clearOperationConfirm)) return;
    setSelectedFile(null);
    setParsed(null);
    setGenerated(null);
    setActiveStep(1);
    setConsolidated(false);
    setSmartValidated(false);
    setPreviewReviewed(false);
    setMappingReviewed(false);
    setShowFullData(false);
    setTemporaryCleared(true);
    setMessage(t.temporaryDataCleared);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updateDuplicateResolution(id: string, resolution: DuplicateResolution) {
    setParsed((current) => current
      ? { ...current, duplicates: (current.duplicates ?? []).map((duplicate) => (duplicate.id === id ? { ...duplicate, resolution } : duplicate)) }
      : current);
    setGenerated(null);
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
      <PrivacyModeCard onClear={clearOperation} hasData={Boolean(parsed || generated || selectedFile)} />

      {activeStep === 1 && (
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel p-6">
            <div className="flex items-start gap-4">
              <div className="icon-tile"><FileSpreadsheet className="h-5 w-5" /></div>
              <div>
                <h1 className="font-heading text-3xl font-black">{t.uploadTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted">{t.uploadCopy}</p>
                <p className="mt-3 text-sm text-warning">{t.noticeBeforeImport}</p>
              </div>
            </div>
            <ConsentPanel consents={consents} onChange={setConsents} />
            <button
              type="button"
              className={`upload-zone mt-6 ${dragActive ? "is-dragging" : ""} ${!consentAccepted ? "is-blocked" : ""}`}
              disabled={busy}
              aria-disabled={!consentAccepted}
              onClick={() => {
                if (!consentAccepted) {
                  requireConsentNotice();
                  return;
                }
                fileInputRef.current?.click();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                if (!consentAccepted) return;
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (!consentAccepted) return;
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                if (!consentAccepted) {
                  requireConsentNotice();
                  return;
                }
                chooseFile(event.dataTransfer.files.item(0));
              }}
            >
              <UploadCloud className="h-9 w-9 text-accent" />
              <span className="font-heading text-lg font-bold">{dragActive ? t.dropExcel : t.selectExcel}</span>
              <span className="text-sm text-muted">{t.clickOrDrop}</span>
              {selectedFile && <span className="upload-file">{t.fileSelected}: {selectedFile.name}</span>}
            </button>
            <input ref={fileInputRef} className="hidden" type="file" accept=".xlsx" disabled={busy || !consentAccepted} onChange={(event) => chooseFile(event.target.files?.[0])} />
            <div className="mt-5 flex justify-end">
              <button
                className="btn-primary"
                disabled={!selectedFile || busy}
                aria-disabled={Boolean(selectedFile && !consentAccepted)}
                onClick={() => {
                  if (!consentAccepted) {
                    requireConsentNotice();
                    return;
                  }
                  void upload();
                }}
              >
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
          showFullData={showFullData}
          onShowFullDataChange={setShowFullData}
          previewReviewed={previewReviewed}
          onPreviewReviewedChange={setPreviewReviewed}
          mappingReviewed={mappingReviewed}
          onMappingReviewedChange={setMappingReviewed}
          onDuplicateResolution={updateDuplicateResolution}
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
          canConsolidate={!consolidationBlocker}
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
          {parsed && <OperationSummary parsed={parsed} temporaryCleared={temporaryCleared} />}
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

function fileErrorMessage(error: unknown, t: ReturnType<typeof usePreferences>["dictionary"]) {
  if (error === "file.extension.invalid") return t.fileExtensionInvalid;
  if (error === "file.empty") return t.fileEmpty;
  if (error === "file.size.exceeded") return t.fileSizeExceeded;
  if (error === "file.mime.invalid") return t.fileMimeInvalid;
  if (error === "file.corrupt") return t.fileCorrupt;
  return typeof error === "string" ? error : t.actionFailed;
}

function ExcelReview({
  parsed,
  validGuests,
  busy,
  busyAction,
  smartValidated,
  onSmartValidate,
  onGenerate,
  showFullData,
  onShowFullDataChange,
  previewReviewed,
  onPreviewReviewedChange,
  mappingReviewed,
  onMappingReviewedChange,
  onDuplicateResolution,
}: {
  parsed: ParsedExcel;
  validGuests: number;
  busy: boolean;
  busyAction: BusyAction;
  smartValidated: boolean;
  onSmartValidate: () => void;
  onGenerate: () => void;
  showFullData: boolean;
  onShowFullDataChange: (value: boolean) => void;
  previewReviewed: boolean;
  onPreviewReviewedChange: (value: boolean) => void;
  mappingReviewed: boolean;
  onMappingReviewedChange: (value: boolean) => void;
  onDuplicateResolution: (id: string, resolution: DuplicateResolution) => void;
}) {
  const { dictionary: t } = usePreferences();
  const duplicateBlockers = unresolvedDuplicates(parsed);
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
          [t.code, parsed.property.establishmentCode],
          [t.name, parsed.property.name],
          [t.address, showFullData ? parsed.property.address : maskAddress(parsed.property.address)],
          [t.municipality, `${parsed.property.postalCode ?? ""} ${parsed.property.municipality ?? ""}`],
          [t.province, parsed.property.province],
        ]} />
        <InfoCard title={t.contractPayment} rows={[
          [t.contract, parsed.reservation.contractDate],
          [t.paymentType, parsed.payment.paymentType],
          ["IBAN", maskPayment(parsed.payment.iban)],
          ["Internet", String(parsed.reservation.internet ?? true)],
        ]} />
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app p-5">
          <div>
            <h2 className="font-heading text-xl font-bold">{t.guests}: {parsed.guests.length}</h2>
            <p className="mt-1 text-sm text-muted">{smartValidated ? t.smartValidationApplied : t.smartValidationPending}</p>
            <p className="mt-2 text-sm text-warning">{t.noticeBeforeConsolidate}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => onShowFullDataChange(!showFullData)}>
              {showFullData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{t.showFullData}
            </button>
            <button disabled={busy} onClick={onSmartValidate} className="btn-secondary disabled:opacity-45">
              {busyAction === "validate" ? <WorkingLabel label={t.processing} /> : <><ShieldCheck className="h-4 w-4" />{t.smartValidate}</>}
            </button>
            <button disabled={Boolean(parsed.validation.errors.length) || Boolean(duplicateBlockers.length) || !previewReviewed || !mappingReviewed || busy} onClick={onGenerate} className="btn-primary disabled:opacity-45">
              {busyAction === "generate" ? <WorkingLabel label={t.processing} /> : t.generateXml}
            </button>
          </div>
        </div>
        {showFullData && <div className="mx-5 mb-4 rounded-lg border border-app bg-surface-elevated p-3 text-sm text-warning">{t.fullDataWarning}</div>}
        <div className="mx-5 mb-4 flex flex-wrap gap-4">
          <label className="checkbox-row"><input type="checkbox" checked={previewReviewed} onChange={(event) => onPreviewReviewedChange(event.target.checked)} />{t.reviewPreview}</label>
          <label className="checkbox-row"><input type="checkbox" checked={mappingReviewed} onChange={(event) => onMappingReviewedChange(event.target.checked)} />{t.mappingReviewed}</label>
        </div>
        <GuestTable guests={parsed.guests} smartValidated={smartValidated} showFullData={showFullData} />
      </section>

      <IssuePanel title={t.warnings} issues={parsed.validation.warnings} />

      <section className="grid items-start gap-4 lg:grid-cols-2">
        <IssuePanel title={t.errors} issues={parsed.validation.errors} />
        <DuplicatePanel duplicates={parsed.duplicates ?? []} onResolve={onDuplicateResolution} />
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
  canConsolidate,
}: {
  generated: GeneratedXmlResult;
  activeView: "visual" | "xml";
  busy: boolean;
  busyAction: BusyAction;
  onViewChange: (view: "visual" | "xml") => void;
  onDownload: () => void;
  onConsolidate: () => void;
  canConsolidate: boolean;
}) {
  const { dictionary: t } = usePreferences();
  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold">XML</h2>
          <p className="mt-1 text-sm text-muted">{t.xmlNote}</p>
          <p className="mt-2 text-sm text-warning">{t.noticeBeforeExport}</p>
        </div>
        <div className="flex gap-2">
          <button className={`tab ${activeView === "visual" ? "is-active" : ""}`} onClick={() => onViewChange("visual")}>{t.visualView}</button>
          <button className={`tab ${activeView === "xml" ? "is-active" : ""}`} onClick={() => onViewChange("xml")}>{t.rawXml}</button>
        </div>
      </div>
      {activeView === "visual" ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoCard title={t.reservationSummary} rows={[[t.reference, generated.visual.reservation.reference], [t.checkIn, generated.visual.reservation.checkInDate], [t.checkOut, generated.visual.reservation.checkOutDate], [t.guestCount, String(generated.visual.guests.length)], [t.paymentType, generated.visual.payment.paymentType]]} />
          <InfoCard title={t.property} rows={[[t.code, generated.visual.property.establishmentCode], [t.name, generated.visual.property.name], [t.address, maskAddress(generated.visual.property.address)]]} />
          {generated.visual.guests.map((guest) => <InfoCard key={guest.sourceRow} title={`${guest.firstName} ${guest.surname1}`} rows={[[t.document, `${guest.documentType} ${maskDocument(guest.documentNumber)}`], [t.nationality, guest.nationalityIso3], [t.birthDate, guest.birthDate], [t.address, maskAddress(guest.address)], [t.email, maskEmail(guest.email)], [t.phone, maskPhone(guest.phone)]]} />)}
        </div>
      ) : (
        <pre className="mt-5 max-h-[520px] overflow-auto rounded-lg bg-black/45 p-4 text-xs text-emerald-200"><code>{generated.xml}</code></pre>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn-secondary" onClick={onDownload}><Download className="h-4 w-4" />{t.downloadXml}</button>
        <button
          className="btn-primary"
          onClick={onConsolidate}
          disabled={busy}
          aria-disabled={!canConsolidate}
        >
          {busyAction === "consolidate" ? <WorkingLabel label={t.processing} /> : <><CheckCircle2 className="h-4 w-4" />{t.consolidate}</>}
        </button>
      </div>
      <SesIntegrationPanel xml={generated.xml} />
    </section>
  );
}

function SesIntegrationPanel({ xml }: { xml: string }) {
  const { dictionary: t } = usePreferences();
  const [busyAction, setBusyAction] = useState<SesUiAction>(null);
  const [schemaOk, setSchemaOk] = useState<boolean | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [lotCode, setLotCode] = useState("");
  const [communicationCode, setCommunicationCode] = useState("");
  const [catalog, setCatalog] = useState("");

  async function run(action: SesUiAction, request: () => Promise<string>) {
    setBusyAction(action);
    setResult(null);
    try {
      setResult(await request());
    } catch {
      setResult(t.actionFailed);
    } finally {
      setBusyAction(null);
    }
  }

  async function validateSes() {
    await run("validate", async () => {
      const { response, data } = await fetchJson("/api/ses/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ xml, kind: "altaParteHospedaje" }),
      });
      const ok = Boolean(response.ok && data.validation?.ok);
      setSchemaOk(ok);
      return ok ? t.sesValidationOk : `${t.sesValidationFailed}: ${data.validation?.errors?.length ?? 0}`;
    });
  }

  async function prepareRequest() {
    await run("prepare", async () => {
      const { response, data } = await fetchJson("/api/ses/communicate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ xml, environment: "pre", dryRun: true }),
      });
      if (!response.ok) return data.error ?? t.actionFailed;
      setSchemaOk(true);
      return `${data.message ?? t.sesPreparedOk} ${data.xmlHash ? `${t.sesXmlHash}: ${data.xmlHash.slice(0, 12)}...` : ""}`;
    });
  }

  async function sendPreproduction() {
    if (!window.confirm(t.sesPreSendConfirm)) return;
    await run("sendPre", async () => {
      const { response, data } = await fetchJson("/api/ses/communicate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ xml, environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return data.error ?? t.actionFailed;
      return data.response?.ok ? t.sesPreSendOk : `${t.sesPreSendFailed}: ${data.response?.status ?? "-"}`;
    });
  }

  async function queryLot() {
    const value = lotCode.trim();
    if (!value) return setResult(t.sesCodeRequired);
    await run("queryLot", async () => {
      const { response, data } = await fetchJson("/api/ses/lote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loteCodes: [value], environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return data.error ?? t.actionFailed;
      return `${t.sesQueryCompleted}: ${data.status ?? "OK"}`;
    });
  }

  async function queryCommunication() {
    const value = communicationCode.trim();
    if (!value) return setResult(t.sesCodeRequired);
    await run("queryCommunication", async () => {
      const { response, data } = await fetchJson("/api/ses/comunicacion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ communicationCodes: [value], environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return data.error ?? t.actionFailed;
      return `${t.sesQueryCompleted}: ${data.status ?? "OK"}`;
    });
  }

  async function cancelLot() {
    const value = lotCode.trim();
    if (!value) return setResult(t.sesCodeRequired);
    if (!window.confirm(t.sesCancelConfirm)) return;
    await run("cancelLot", async () => {
      const { response, data } = await fetchJson("/api/ses/anulacion-lote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loteCode: value, environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return data.error ?? t.actionFailed;
      return `${t.sesCancelCompleted}: ${data.status ?? "OK"}`;
    });
  }

  async function queryCatalog() {
    const value = catalog.trim();
    if (!value) return setResult(t.sesCatalogRequired);
    await run("catalog", async () => {
      const { response, data } = await fetchJson("/api/ses/catalogo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ catalog: value, environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return data.error ?? t.actionFailed;
      return `${t.sesQueryCompleted}: ${data.status ?? "OK"}`;
    });
  }

  const working = Boolean(busyAction);

  return (
    <section className="ses-panel mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="icon-tile"><RadioTower className="h-5 w-5" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-xl font-black">{t.sesPanelTitle}</h3>
              <span className="status-pill is-valid">{t.sesPreproduction}</span>
              <span className="status-pill is-warning">{t.sesProductionBlocked}</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-secondary">{t.sesPanelCopy}</p>
          </div>
        </div>
        <div className="ses-schema-state">
          {schemaOk === true ? <CheckCircle2 className="h-4 w-4 text-accent" /> : schemaOk === false ? <Ban className="h-4 w-4 text-error" /> : <ShieldCheck className="h-4 w-4 text-muted" />}
          <span>{schemaOk === true ? t.sesSchemaValid : schemaOk === false ? t.sesSchemaInvalid : t.sesSchemaPending}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="ses-card">
          <h4 className="font-heading text-base font-bold">{t.sesTransmission}</h4>
          <p className="mt-1 text-sm text-muted">{t.sesTransmissionCopy}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled={working} onClick={validateSes}>
              {busyAction === "validate" ? <WorkingLabel label={t.processing} /> : <><ClipboardCheck className="h-4 w-4" />{t.sesValidateXml}</>}
            </button>
            <button type="button" className="btn-secondary" disabled={working} onClick={prepareRequest}>
              {busyAction === "prepare" ? <WorkingLabel label={t.processing} /> : <><ShieldCheck className="h-4 w-4" />{t.sesPrepareDryRun}</>}
            </button>
            <button type="button" className="btn-primary" disabled={working || schemaOk === false} onClick={sendPreproduction}>
              {busyAction === "sendPre" ? <WorkingLabel label={t.processing} /> : <><Send className="h-4 w-4" />{t.sesSendPreproduction}</>}
            </button>
          </div>
        </div>

        <div className="ses-card">
          <h4 className="font-heading text-base font-bold">{t.sesQueries}</h4>
          <p className="mt-1 text-sm text-muted">{t.sesQueriesCopy}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase text-muted">{t.sesLotCode}</span>
              <input className="input" value={lotCode} onChange={(event) => setLotCode(event.target.value)} placeholder="Lote" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase text-muted">{t.sesCommunicationCode}</span>
              <input className="input" value={communicationCode} onChange={(event) => setCommunicationCode(event.target.value)} placeholder="Codigo" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-bold uppercase text-muted">{t.sesCatalog}</span>
              <input className="input" value={catalog} onChange={(event) => setCatalog(event.target.value)} placeholder="TIPO_DOCUMENTO" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled={working} onClick={queryLot}>{busyAction === "queryLot" ? <WorkingLabel label={t.processing} /> : t.sesQueryLot}</button>
            <button type="button" className="btn-secondary" disabled={working} onClick={queryCommunication}>{busyAction === "queryCommunication" ? <WorkingLabel label={t.processing} /> : t.sesQueryCommunication}</button>
            <button type="button" className="btn-secondary" disabled={working} onClick={queryCatalog}>{busyAction === "catalog" ? <WorkingLabel label={t.processing} /> : t.sesQueryCatalog}</button>
            <button type="button" className="btn-danger" disabled={working} onClick={cancelLot}>{busyAction === "cancelLot" ? <WorkingLabel label={t.processing} /> : t.sesCancelLot}</button>
          </div>
        </div>
      </div>

      {result && <div className="ses-result mt-4" role="status">{result}</div>}
      <p className="mt-4 text-xs leading-5 text-muted">{t.sesPrivacyNote}</p>
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

function GuestTable({ guests, smartValidated, showFullData }: { guests: ParsedExcel["guests"]; smartValidated: boolean; showFullData: boolean }) {
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
        <thead><tr><th>{t.status}</th><th>#</th><th>{t.name}</th><th>{t.document}</th><th>{t.data}</th><th>{t.contact}</th><th>{t.address}</th><th>{t.guestWarnings}</th></tr></thead>
        <tbody>
          {guests.map((guest) => (
            <tr key={guest.sourceRow}>
              <td><StatusPill status={guest.validationStatus} /></td>
              <td>{guest.sourceRow}</td>
              <FieldCell state={fieldState(guest, ["firstName", "surname1", "surname2"], smartValidated)}><span className="font-semibold">{guest.firstName}</span><br />{guest.surname1} {guest.surname2}</FieldCell>
              <FieldCell state={fieldState(guest, ["documentNumber", "documentType"], smartValidated)}><span className="text-muted">{guest.documentType}</span><br />{showFullData ? guest.documentNumber : maskDocument(guest.documentNumber)}</FieldCell>
              <FieldCell state={fieldState(guest, ["birthDate", "nationalityIso3"], smartValidated)}><span className="text-muted">{t.birthShort}</span> {guest.birthDate}<br /><span className="text-muted">{t.countryShort}</span> {guest.nationalityIso3}</FieldCell>
              <FieldCell state={fieldState(guest, ["email", "phone"], smartValidated)}><span className="break-anywhere">{showFullData ? guest.email || "-" : maskEmail(guest.email)}</span><br /><span className="text-muted">{showFullData ? guest.phone || "-" : maskPhone(guest.phone)}</span></FieldCell>
              <FieldCell state={fieldState(guest, ["address", "postalCode", "municipalityCode"], smartValidated)}><span className="break-anywhere">{showFullData ? guest.address : maskAddress(guest.address)}</span></FieldCell>
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

function IssuePanel({ title, issues }: { title: string; issues: Array<{ code: string; message: string; severity: string; field?: string; sourceRow?: number }> }) {
  const { dictionary: t } = usePreferences();
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-app p-5">
        <h3 className="font-heading font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted">{t.issueSummary}: {issues.length}</p>
      </div>
      {issues.length ? (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t.severity}</th><th>{t.row}</th><th>{t.field}</th><th>{t.explanation}</th><th>{t.recommendedAction}</th></tr></thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={`${issue.code}-${index}`}>
                  <td><span className={`status-pill ${issue.severity === "error" ? "is-error" : "is-warning"}`}>{issue.severity === "error" ? t.errors : t.warnings}</span></td>
                  <td>{issue.sourceRow ?? "-"}</td>
                  <td>{issue.field || "-"}</td>
                  <td>{translateIssueMessage(issue.code, issue.message, t)}</td>
                  <td>{t.fixBeforeConsolidating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="p-5 text-sm text-muted">OK</p>}
    </div>
  );
}

function CompactIssueList({ issues }: { issues: Array<{ code: string; message: string; severity: string; field?: string }> }) {
  const { dictionary: t } = usePreferences();
  if (!issues.length) return <span className="text-muted">OK</span>;
  return (
    <div className="space-y-1">
      {issues.slice(0, 3).map((issue) => (
        <p key={issue.code + issue.field} className={issue.severity === "error" ? "text-error" : "text-warning"}>
          {translateIssueMessage(issue.code, issue.message, t).replace(" no informado", "").replace(" not provided", "").replace("Telefono", "Tel.").replace("Phone", "Tel.").replace("Codigo de municipio", "Cod. mun.").replace("Municipality code", "Mun. code").replace("Gemeindecode", "Gemeinde").replace("Soporte de documento", "Soporte doc.").replace("Document support", "Doc. support").replace("Dokumentnachweis", "Dok.")}
        </p>
      ))}
      {issues.length > 3 && <p className="text-muted">+{issues.length - 3}</p>}
    </div>
  );
}

function translateIssueMessage(code: string, fallback: string, t: ReturnType<typeof usePreferences>["dictionary"]) {
  if (code === "guest.phone.missing") return t.issuePhoneMissing;
  if (code === "guest.relationship.missing") return t.issueRelationshipMissing;
  if (code === "guest.sex.missing") return t.issueSexMissing;
  if (code === "guest.documentSupport.missing") return t.issueDocumentSupportMissing;
  if (code === "guest.municipalityCode.missing") return t.issueMunicipalityCodeMissing;
  return fallback;
}

function PrivacyModeCard({ onClear, hasData }: { onClear: () => void; hasData: boolean }) {
  const { dictionary: t } = usePreferences();
  return (
    <section className="panel border-accent/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-accent" />
          <div>
            <h2 className="font-heading text-base font-bold">{t.privateModeTitle}</h2>
            <p className="mt-1 text-sm text-secondary">{t.privateModeBanner}</p>
          </div>
        </div>
        <button type="button" className="btn-secondary" disabled={!hasData} onClick={onClear}><Trash2 className="h-4 w-4" />{t.clearOperationData}</button>
      </div>
    </section>
  );
}

function ConsentPanel({ consents, onChange }: { consents: boolean[]; onChange: (next: boolean[]) => void }) {
  const { dictionary: t } = usePreferences();
  const items = [t.consentAuthorised, t.consentNoLegalAdvice, t.consentReview, t.consentMinimisation, t.consentPrivateMode];
  const allSelected = consents.every(Boolean);
  return (
    <div className="mt-6 rounded-lg border border-app bg-surface-elevated p-4">
      <h2 className="font-heading text-base font-bold">{t.consentTitle}</h2>
      <p className="mt-1 text-sm text-muted">{t.consentIntro}</p>
      <label className="checkbox-row mt-4 rounded-lg border border-app bg-surface-elevated p-3 font-bold">
        <input type="checkbox" checked={allSelected} onChange={(event) => onChange(consents.map(() => event.target.checked))} />
        {t.selectAllConfirmations}
      </label>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <label key={item} className="checkbox-row">
            <input type="checkbox" checked={consents[index]} onChange={(event) => onChange(consents.map((value, itemIndex) => (itemIndex === index ? event.target.checked : value)))} />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

function DuplicatePanel({ duplicates, onResolve }: { duplicates: NonNullable<ParsedExcel["duplicates"]>; onResolve: (id: string, resolution: DuplicateResolution) => void }) {
  const { dictionary: t } = usePreferences();
  if (!duplicates.length) return <section className="panel p-5"><h3 className="font-heading font-bold">{t.duplicates}</h3><p className="mt-2 text-sm text-muted">OK</p></section>;
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-app p-5">
        <h3 className="font-heading font-bold">{t.duplicates}</h3>
        <p className="mt-1 text-sm text-warning">{t.reviewBeforeConsolidation}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>{t.status}</th><th>{t.row}</th><th>{t.explanation}</th><th>{t.recommendedAction}</th></tr></thead>
          <tbody>
            {duplicates.map((duplicate) => (
              <tr key={duplicate.id}>
                <td><span className={`status-pill ${duplicate.classification === "likely" ? "is-error" : "is-warning"}`}>{duplicate.classification === "likely" ? t.likelyDuplicate : t.possibleDuplicate}</span></td>
                <td>{duplicate.sourceRows.join(", ")}</td>
                <td>{duplicate.reasonCodes.join(", ")}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={`tab ${duplicate.resolution === "skip_new" ? "is-active" : ""}`} onClick={() => onResolve(duplicate.id, "skip_new")}>{t.skipNewRecord}</button>
                    <button type="button" className={`tab ${duplicate.resolution === "keep_both" ? "is-active" : ""}`} onClick={() => onResolve(duplicate.id, "keep_both")}>{t.keepBothRecords}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OperationSummary({ parsed, temporaryCleared }: { parsed: ParsedExcel; temporaryCleared: boolean }) {
  const { dictionary: t } = usePreferences();
  const skipped = (parsed.duplicates ?? []).filter((duplicate) => duplicate.resolution === "skip_new").length;
  return (
    <div className="mt-6">
      <InfoCard title={t.operationSummary} rows={[
        [t.existingRecords, "0"],
        [t.newRecords, String(parsed.guests.length - skipped)],
        [t.duplicatesDetected, String(parsed.duplicates?.length ?? 0)],
        [t.omittedRecords, String(skipped)],
        [t.correctedErrors, "0"],
        [t.pendingWarnings, String(parsed.validation.warnings.length)],
        [t.totalConsolidated, String(parsed.guests.length - skipped)],
        [t.privacyModeUsed, t.privateModeTitle],
        [t.temporaryDataStatus, temporaryCleared ? t.temporaryDataCleared : t.temporaryDataInSession],
      ]} />
    </div>
  );
}
