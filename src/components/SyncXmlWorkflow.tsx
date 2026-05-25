"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, Ban, CheckCircle2, ClipboardCheck, Clock, Copy, Download, Eye, EyeOff, FileSpreadsheet, FileText, History, Link2, RadioTower, RefreshCw, Search, SearchCheck, Send, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import type { DuplicateResolution, GeneratedXmlResult, GuestRecord, ParsedExcel, ValidationIssue } from "@/lib/domain";
import { smartValidateParsedExcel, validateGuest } from "@/lib/validation";
import { buildXmlDownloadFileName } from "@/lib/xml/fileName";
import { usePreferences } from "./AppPreferencesProvider";
import { unresolvedDuplicates } from "@/lib/duplicates";
import { maskAddress, maskDocument, maskEmail, maskPayment, maskPhone } from "@/lib/privacy/masking";
import { normalizeMunicipioName, provinceCodeFromPostalCode } from "@/lib/municipios/normalize";
import { buildValidationReportCsv, buildValidationReportFileName } from "@/lib/validationReport";

type BusyAction = "upload" | "validate" | "generate" | "consolidate" | null;
type WorkflowStep = 1 | 2 | 3 | 4;
type SesUiAction = "validate" | "prepare" | "sendPre" | "queryLot" | "queryCommunication" | "cancelLot" | "catalog" | "refreshHistory" | null;
type SesStatus = {
  readyForPreproduction: boolean;
  hasCredentials: boolean;
  hasLandlordCode: boolean;
  endpoint: string;
};
type SesSubmissionSummary = {
  id: string;
  createdAt: string;
  reference?: string;
  communicationType?: string;
  xmlHash: string;
  sesBatchCode?: string;
  status: string;
  communicationCode?: string;
  sesResponseCode?: string;
  sesResponseDescription?: string;
  sesErrors?: unknown;
};
type SesSendResult = {
  ok: boolean;
  submissionId?: string;
  sesBatchCode?: string;
  sesResponseCode?: string;
  sesResponseDescription?: string;
  communicationCode?: string;
  status?: string;
  message?: string;
  sesErrors?: unknown;
  xmlHash?: string;
  communicationType?: string;
};
type SesQueryResult = {
  ok: boolean;
  responseCode?: string;
  responseDescription?: string;
  communicationCode?: string;
  batchStatus?: string;
  submissionId?: string;
  sesErrors?: unknown;
  message?: string;
};
type GuestCorrectionPatch = Partial<Pick<GuestRecord, "surname2" | "documentType" | "documentNumber" | "municipality" | "municipalityCode" | "postalCode" | "sex" | "relationship" | "documentSupport" | "phone" | "phone2" | "email" | "address">>;
type MunicipioOption = { codigoMunicipio: string; codigoProvincia: string; nombre: string; nombreNormalizado: string };

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
  const SESSION_KEY = "syncxml-session";

  // Reset state when "Nueva reserva" is clicked from within the workflow page
  useEffect(() => {
    function handleNew() {
      sessionStorage.removeItem(SESSION_KEY);
      setSelectedFile(null);
      setParsed(null);
      setGenerated(null);
      setActiveStep(1);
      setConsolidated(false);
      setSmartValidated(false);
      setPreviewReviewed(false);
      setMappingReviewed(false);
      setShowFullData(false);
      setTemporaryCleared(false);
      setMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    window.addEventListener("syncxml:new", handleNew);
    return () => window.removeEventListener("syncxml:new", handleNew);
  }, []);

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data.parsed) { setParsed(data.parsed); setSmartValidated(data.smartValidated ?? false); setPreviewReviewed(data.previewReviewed ?? false); setMappingReviewed(data.mappingReviewed ?? false); }
      if (data.generated) setGenerated(data.generated);
      if (data.consolidated) setConsolidated(true);
      if (data.activeStep) setActiveStep(data.activeStep);
    } catch { /* ignore */ }
  }, []);

  // Persist session on state changes
  useEffect(() => {
    if (!parsed && !generated) { sessionStorage.removeItem(SESSION_KEY); return; }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ activeStep, parsed, generated, consolidated, smartValidated, previewReviewed, mappingReviewed }));
    } catch { /* quota exceeded */ }
  }, [activeStep, parsed, generated, consolidated, smartValidated, previewReviewed, mappingReviewed]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeStep]);

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
    const validated = smartValidateParsedExcel(parsed);
    if (validated.validation.errors.length) {
      setParsed(validated);
      setGenerated(null);
      setConsolidated(false);
      setSmartValidated(true);
      setPreviewReviewed(false);
      setActiveStep(2);
      setMessage(t.smartValidationErrors);
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
      setMessage(data.generated.validation.errors.length ? t.xmlGeneratedWithIssues : t.xmlGeneratedOk);
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
    if (step === 1) { setActiveStep(1); return; }
    if (step === 2) { setActiveStep(parsed ? 2 : 1); return; }
    if (step === 3) {
      if (generated) { setActiveStep(3); return; }
      void generate();
      return;
    }
    if (consolidated) { setActiveStep(4); return; }
    if (generated) void consolidate();
    else { setMessage(t.xmlPreviewRequired); setActiveStep(parsed ? 2 : 1); }
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

  function downloadValidationReport() {
    if (!parsed) return;
    const blob = new Blob([buildValidationReportCsv(parsed)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildValidationReportFileName(parsed);
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearOperation() {
    if (!window.confirm(t.clearOperationConfirm)) return;
    sessionStorage.removeItem(SESSION_KEY);
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

  function updateGuestCorrection(sourceRow: number, patch: GuestCorrectionPatch) {
    setParsed((current) => {
      if (!current) return current;
      const guests = current.guests.map((guest) => {
        const editableGuest = toEditableGuest(guest);
        const nextGuest = guest.sourceRow === sourceRow ? { ...editableGuest, ...patch } : editableGuest;
        return validateGuest(nextGuest);
      });
      return smartValidateParsedExcel({ ...current, guests });
    });
    setGenerated(null);
    setConsolidated(false);
    setSmartValidated(true);
    setPreviewReviewed(false);
    setMessage(t.manualCorrectionApplied);
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

      <TraceabilityPanel
        selectedFileName={selectedFile?.name ?? parsed?.fileName}
        parsed={parsed}
        generated={generated}
        consolidated={consolidated}
        smartValidated={smartValidated}
        previewReviewed={previewReviewed}
        mappingReviewed={mappingReviewed}
      />

      {message && <div className={`process-message ${processMessageTone(message, t)}`} role="status">{message}</div>}
      {busy && <div className="process-message is-working" role="status">{t.processing}</div>}

      {activeStep === 1 && (
        <>
          {/* Fila 2: Aceptación informada (izq) + Área de importación (dcha) */}
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="panel p-6">
              <div className="flex items-start gap-4">
                <div className="icon-tile"><FileSpreadsheet className="h-5 w-5" /></div>
                <div>
                  <h1 className="font-heading text-3xl font-black">{t.uploadTitle}</h1>
                  <p className="mt-2 text-sm text-muted">{t.uploadCopy}</p>
                  <p className="mt-3 text-sm text-warning">{t.noticeBeforeImport}</p>
                </div>
              </div>
              <ConsentPanel consents={consents} onChange={setConsents} />
            </div>
            <div className="panel p-6 flex flex-col">
              <button
                type="button"
                className={`upload-zone flex-1 ${dragActive ? "is-dragging" : ""} ${!consentAccepted ? "is-blocked" : ""}`}
                disabled={busy}
                aria-disabled={!consentAccepted}
                onClick={() => {
                  if (!consentAccepted) { requireConsentNotice(); return; }
                  fileInputRef.current?.click();
                }}
                onDragEnter={(event) => { event.preventDefault(); if (!consentAccepted) return; setDragActive(true); }}
                onDragOver={(event) => { event.preventDefault(); if (!consentAccepted) return; setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  if (!consentAccepted) { requireConsentNotice(); return; }
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
                    if (!consentAccepted) { requireConsentNotice(); return; }
                    void upload();
                  }}
                >
                  {busyAction === "upload" ? <WorkingLabel label={t.processing} /> : t.importAction}
                </button>
              </div>
            </div>
          </section>

          {/* Fila 3: Modo privado (izq) + Aviso de privacidad (dcha) */}
          <section className="grid gap-6 lg:grid-cols-2">
            <PrivacyModeCard onClear={clearOperation} hasData={Boolean(parsed || generated || selectedFile)} />
            <div className="panel border-accent/30 p-6">
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-accent" />
                <p className="text-sm leading-6 text-secondary">{t.privacyNotice}</p>
              </div>
            </div>
          </section>
        </>
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
          onDownloadValidationReport={downloadValidationReport}
          showFullData={showFullData}
          onShowFullDataChange={setShowFullData}
          previewReviewed={previewReviewed}
          onPreviewReviewedChange={setPreviewReviewed}
          mappingReviewed={mappingReviewed}
          onMappingReviewedChange={setMappingReviewed}
          onDuplicateResolution={updateDuplicateResolution}
          onGuestCorrection={updateGuestCorrection}
          onClear={clearOperation}
          hasData={Boolean(parsed || generated || selectedFile)}
        />
      )}

      {activeStep === 3 && generated && parsed && (
        <XmlViewer
          parsed={parsed}
          generated={generated}
          activeView={activeView}
          busy={busy}
          busyAction={busyAction}
          onViewChange={setActiveView}
          onDownload={downloadXml}
          onConsolidate={consolidate}
          canConsolidate={!consolidationBlocker}
          consolidationBlocker={consolidationBlocker}
          onClear={clearOperation}
          hasData={Boolean(parsed || generated || selectedFile)}
        />
      )}

      {activeStep === 4 && (
        <>
          {/* Card consolidación */}
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
          {/* Modo privado */}
          <PrivacyModeCard onClear={clearOperation} hasData={Boolean(parsed || generated || selectedFile)} />
        </>
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
  onDownloadValidationReport,
  showFullData,
  onShowFullDataChange,
  previewReviewed,
  onPreviewReviewedChange,
  mappingReviewed,
  onMappingReviewedChange,
  onDuplicateResolution,
  onGuestCorrection,
  onClear,
  hasData,
}: {
  parsed: ParsedExcel;
  validGuests: number;
  busy: boolean;
  busyAction: BusyAction;
  smartValidated: boolean;
  onSmartValidate: () => void;
  onGenerate: () => void;
  onDownloadValidationReport: () => void;
  showFullData: boolean;
  onShowFullDataChange: (value: boolean) => void;
  previewReviewed: boolean;
  onPreviewReviewedChange: (value: boolean) => void;
  mappingReviewed: boolean;
  onMappingReviewedChange: (value: boolean) => void;
  onDuplicateResolution: (id: string, resolution: DuplicateResolution) => void;
  onGuestCorrection: (sourceRow: number, patch: GuestCorrectionPatch) => void;
  onClear: () => void;
  hasData: boolean;
}) {
  const { dictionary: t } = usePreferences();
  const duplicateBlockers = unresolvedDuplicates(parsed);
  return (
    <>
      {/* 3. Tabla de huéspedes */}
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
            <button type="button" className="btn-secondary" disabled={busy} onClick={onDownloadValidationReport}>
              <Download className="h-4 w-4" />{t.downloadValidationReport}
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

      {/* 4. Resumen reserva, establecimiento, contrato */}
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

      {/* 5. Revisión guiada */}
      <ManualCorrectionPanel parsed={parsed} onGuestCorrection={onGuestCorrection} />

      {/* 6. Validaciones */}
      <UnifiedIssuesPanel
        warnings={parsed.validation.warnings}
        errors={parsed.validation.errors}
        duplicates={parsed.duplicates ?? []}
        onDuplicateResolve={onDuplicateResolution}
      />

      {/* 7. Modo privado */}
      <PrivacyModeCard onClear={onClear} hasData={hasData} />
    </>
  );
}

function XmlViewer({
  parsed,
  generated,
  activeView,
  busy,
  busyAction,
  onViewChange,
  onDownload,
  onConsolidate,
  canConsolidate,
  consolidationBlocker,
  onClear,
  hasData,
}: {
  parsed: ParsedExcel;
  generated: GeneratedXmlResult;
  activeView: "visual" | "xml";
  busy: boolean;
  busyAction: BusyAction;
  onViewChange: (view: "visual" | "xml") => void;
  onDownload: () => void;
  onConsolidate: () => void;
  canConsolidate: boolean;
  consolidationBlocker: string | null;
  onClear: () => void;
  hasData: boolean;
}) {
  const { dictionary: t } = usePreferences();
  const hasXmlErrors = generated.validation.errors.length > 0;
  return (
    <>
      {/* Card XML */}
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
          <XmlTreeView generated={generated} />
        ) : (
          <pre className="mt-5 max-h-[520px] overflow-auto rounded-lg bg-black/45 p-4 text-xs text-emerald-200"><code>{generated.xml}</code></pre>
        )}
      </section>

      {/* Card mensaje / incidencias */}
      <section className="panel p-5">
        <div className={`human-review-gate ${canConsolidate ? "is-valid" : "is-warning"}`}>
          <ShieldCheck className="h-4 w-4" />
          <span>{canConsolidate ? t.humanReviewReady : consolidationBlocker}</span>
        </div>
        {hasXmlErrors && <div className="mt-4"><IssuePanel title={t.xmlValidationIssues} issues={generated.validation.errors} /></div>}
      </section>

      {/* Botones descargar y consolidar */}
      <section className="panel p-5">
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={onDownload} disabled={hasXmlErrors} title={hasXmlErrors ? t.xmlDownloadBlocked : undefined}><Download className="h-4 w-4" />{t.downloadXml}</button>
          <button className="btn-primary" onClick={onConsolidate} disabled={busy || !canConsolidate}>
            {busyAction === "consolidate" ? <WorkingLabel label={t.processing} /> : <><CheckCircle2 className="h-4 w-4" />{t.consolidate}</>}
          </button>
        </div>
      </section>

      {/* Servicios SES.HOSPEDAJES */}
      <SesIntegrationPanel xml={generated.xml} />

      {/* Pre-check-in de prueba */}
      <PrecheckinTestPanel parsed={parsed} />

      {/* Modo privado */}
      <PrivacyModeCard onClear={onClear} hasData={hasData} />
    </>
  );
}

function PrecheckinTestPanel({ parsed }: { parsed: ParsedExcel }) {
  const { dictionary: t } = usePreferences();
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function createLink() {
    setBusy(true);
    setStatus(null);
    try {
      const { response, data } = await fetchJson("/api/precheckin/test-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ parsed }),
      });
      if (!response.ok) {
        setStatus(data.error ?? t.actionFailed);
        return;
      }
      const nextLink = `${window.location.origin}${data.url}`;
      setLink(nextLink);
      setStatus(t.precheckinLinkReady);
    } catch {
      setStatus(t.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setStatus(t.precheckinLinkCopied);
  }

  return (
    <section className="ses-panel mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="icon-tile"><Link2 className="h-5 w-5" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-xl font-black">{t.precheckinPanelTitle}</h3>
              <span className="status-pill is-warning">{t.precheckinTestMode}</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-secondary">{t.precheckinPanelCopy}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="ses-card">
          <h4 className="font-heading text-base font-bold">{t.precheckinGuestLink}</h4>
          <p className="mt-1 text-sm text-muted">{t.precheckinGuestLinkCopy}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled={busy} onClick={createLink}>
              {busy ? <WorkingLabel label={t.processing} /> : <><Link2 className="h-4 w-4" />{t.precheckinCreateLink}</>}
            </button>
            <button type="button" className="btn-secondary" disabled={!link} onClick={copyLink}>
              <Copy className="h-4 w-4" />{t.precheckinCopyLink}
            </button>
          </div>
        </div>

        <div className="ses-card">
          <h4 className="font-heading text-base font-bold">{t.precheckinMetadataOnly}</h4>
          <p className="mt-1 text-sm text-muted">{t.precheckinMetadataCopy}</p>
          {link && <a className="mt-4 block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-accent underline" href={link} target="_blank" rel="noreferrer">{link}</a>}
        </div>
      </div>

      {status && <div className="ses-result mt-4" role="status">{status}</div>}
    </section>
  );
}

function sesStatusLabel(status: string, t: ReturnType<typeof usePreferences>["dictionary"]): string {
  const map: Record<string, string> = {
    SENT: t.sesStatusSent,
    ACCEPTED: t.sesStatusAccepted,
    PROCESSING: t.sesStatusProcessing,
    PROCESSED: t.sesStatusProcessed,
    FAILED: t.sesStatusFailed,
    PARTIAL: t.sesStatusPartial,
    UNKNOWN: t.sesStatusUnknown,
  };
  return map[status] ?? status;
}

function sesCommunicationTypeLabel(type: string | undefined, t: ReturnType<typeof usePreferences>["dictionary"]): string {
  if (!type) return "—";
  const map: Record<string, string> = {
    PV: t.sesTypePV,
    RH: t.sesTypeRH,
    AV: t.sesTypeAV,
    RV: t.sesTypeRV,
  };
  return map[type] ?? type;
}

function SesIntegrationPanel({ xml }: { xml: string }) {
  const { dictionary: t } = usePreferences();
  const [busyAction, setBusyAction] = useState<SesUiAction>(null);
  const [schemaOk, setSchemaOk] = useState<boolean | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [lotCode, setLotCode] = useState("");
  const [communicationCode, setCommunicationCode] = useState("");
  const [catalog, setCatalog] = useState("");
  const [sesStatus, setSesStatus] = useState<SesStatus | null>(null);
  const [sesIssues, setSesIssues] = useState<ValidationIssue[]>([]);
  const [sendResult, setSendResult] = useState<SesSendResult | null>(null);
  const [queryResult, setQueryResult] = useState<SesQueryResult | null>(null);
  const [showTechResponse, setShowTechResponse] = useState(false);
  const [copyLabelBatch, setCopyLabelBatch] = useState(false);
  const [history, setHistory] = useState<SesSubmissionSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchJson("/api/ses/status", { method: "GET" }).then(({ response, data }) => {
      if (active && response.ok) setSesStatus(data.status);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
    await navigator.clipboard.writeText(text).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function refreshHistory() {
    setBusyAction("refreshHistory");
    try {
      const { response, data } = await fetchJson("/api/ses/submissions", { method: "GET" });
      if (response.ok) setHistory(data.submissions ?? []);
    } catch { /* ignore */ } finally {
      setBusyAction(null);
    }
  }

  async function run(action: SesUiAction, request: () => Promise<string>) {
    setBusyAction(action);
    setResult(null);
    setSesIssues([]);
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
      setSesIssues(ok ? [] : (data.validation?.errors ?? []));
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
      if (!response.ok) {
        setSesIssues(data.validation?.errors ?? []);
        return sesErrorMessage(data.error, t);
      }
      setSchemaOk(true);
      return `${data.message ?? t.sesPreparedOk} ${data.xmlHash ? `${t.sesXmlHash}: ${data.xmlHash.slice(0, 12)}...` : ""}`;
    });
  }

  async function sendPreproduction() {
    if (!window.confirm(t.sesPreSendConfirm)) return;
    if (!sesStatus?.readyForPreproduction) { setResult(t.sesConfigMissing); return; }
    setSendResult(null);
    setQueryResult(null);
    setShowTechResponse(false);
    setBusyAction("sendPre");
    setResult(null);
    setSesIssues([]);
    try {
      const { response, data } = await fetchJson("/api/ses/communicate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ xml, environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) {
        setResult(sesErrorMessage(data.error, t));
        setSendResult({ ok: false, message: data.error });
        return;
      }
      const sr: SesSendResult = {
        ok: data.ok,
        submissionId: data.submissionId,
        sesBatchCode: data.sesBatchCode,
        sesResponseCode: data.sesResponseCode,
        sesResponseDescription: data.sesResponseDescription,
        communicationCode: data.communicationCode,
        status: data.status,
        message: data.message,
        sesErrors: data.sesErrors,
        xmlHash: data.xmlHash,
        communicationType: data.communicationType,
      };
      setSendResult(sr);
      setSchemaOk(data.ok);
      if (data.sesBatchCode) setLotCode(data.sesBatchCode);
      if (data.communicationCode) setCommunicationCode(data.communicationCode);
      setResult(null);
      if (showHistory) void refreshHistory();
    } catch {
      setResult(t.actionFailed);
    } finally {
      setBusyAction(null);
    }
  }

  async function queryLot() {
    const value = lotCode.trim();
    if (!value) return setResult(t.sesCodeRequired);
    if (!sesStatus?.hasCredentials) return setResult(t.sesCredentialsMissing);
    setQueryResult(null);
    setBusyAction("queryLot");
    setResult(null);
    try {
      const submissionId = sendResult?.submissionId;
      const { response, data } = await fetchJson("/api/ses/lote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loteCodes: [value], environment: "pre", dryRun: false, submissionId }),
      }, 45000);
      if (!response.ok) { setResult(sesErrorMessage(data.error, t)); return; }
      const qr: SesQueryResult = {
        ok: data.ok,
        responseCode: data.responseCode,
        responseDescription: data.responseDescription,
        communicationCode: data.communicationCode,
        batchStatus: data.batchStatus,
        submissionId: data.submissionId,
        sesErrors: data.sesErrors,
        message: data.message,
      };
      setQueryResult(qr);
      if (data.communicationCode) setCommunicationCode(data.communicationCode);
      if (sendResult && data.status) setSendResult({ ...sendResult, status: data.batchStatus, communicationCode: data.communicationCode ?? sendResult.communicationCode });
      if (showHistory) void refreshHistory();
    } catch {
      setResult(t.actionFailed);
    } finally {
      setBusyAction(null);
    }
  }

  async function queryCommunication() {
    const value = communicationCode.trim();
    if (!value) return setResult(t.sesCodeRequired);
    if (!sesStatus?.hasCredentials) return setResult(t.sesCredentialsMissing);
    await run("queryCommunication", async () => {
      const { response, data } = await fetchJson("/api/ses/comunicacion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ communicationCodes: [value], environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return sesErrorMessage(data.error, t);
      return data.message ?? `${t.sesQueryCompleted}: ${data.responseDescription ?? "OK"}`;
    });
  }

  async function cancelLot() {
    const value = lotCode.trim();
    if (!value) return setResult(t.sesCodeRequired);
    if (!sesStatus?.hasCredentials) return setResult(t.sesCredentialsMissing);
    if (!window.confirm(t.sesCancelConfirm)) return;
    await run("cancelLot", async () => {
      const { response, data } = await fetchJson("/api/ses/anulacion-lote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loteCode: value, environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return sesErrorMessage(data.error, t);
      return `${t.sesCancelCompleted}: ${data.status ?? "OK"}`;
    });
  }

  async function queryCatalog() {
    const value = catalog.trim();
    if (!value) return setResult(t.sesCatalogRequired);
    if (!sesStatus?.hasCredentials) return setResult(t.sesCredentialsMissing);
    await run("catalog", async () => {
      const { response, data } = await fetchJson("/api/ses/catalogo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ catalog: value, environment: "pre", dryRun: false }),
      }, 45000);
      if (!response.ok) return sesErrorMessage(data.error, t);
      return data.message ?? `${t.sesQueryCompleted}: ${data.responseDescription ?? "OK"}`;
    });
  }

  function downloadTraceability() {
    if (!sendResult) return;
    const payload = {
      submissionId: sendResult.submissionId,
      createdAt: new Date().toISOString(),
      xmlHash: sendResult.xmlHash,
      environment: "pre",
      communicationType: sendResult.communicationType,
      sesBatchCode: sendResult.sesBatchCode,
      sesResponseCode: sendResult.sesResponseCode,
      sesResponseDescription: sendResult.sesResponseDescription,
      status: queryResult?.batchStatus ?? sendResult.status,
      communicationCode: queryResult?.communicationCode ?? sendResult.communicationCode,
      sesErrors: queryResult?.sesErrors ?? sendResult.sesErrors ?? [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ses-trazabilidad-${sendResult.sesBatchCode ?? sendResult.submissionId ?? Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const working = Boolean(busyAction);
  const activeCommunicationCode = queryResult?.communicationCode ?? sendResult?.communicationCode ?? communicationCode.trim();
  const activeStatus = queryResult?.batchStatus ?? sendResult?.status;

  return (
    <section className="ses-panel mt-6">
      {/* Header */}
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

      {sesStatus && !sesStatus.readyForPreproduction && (
        <div className="ses-config-alert mt-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t.sesConfigMissing}</span>
        </div>
      )}

      {/* ── Send result traceability card ── */}
      {sendResult && (
        <div className={`mt-5 rounded-lg border p-4 ${sendResult.ok ? "border-accent/30 bg-accent/5" : "border-error/30 bg-error/5"}`}>
          <div className="flex flex-wrap items-center gap-2">
            {sendResult.ok
              ? <CheckCircle2 className="h-5 w-5 text-accent" />
              : <AlertTriangle className="h-5 w-5 text-error" />}
            <span className="font-heading font-bold">{t.sesSendStatus}:</span>
            <span className={`status-pill ${sendResult.ok ? "is-valid" : "is-error"}`}>
              {activeStatus ? sesStatusLabel(activeStatus, t) : sendResult.ok ? t.sesStatusAccepted : t.sesStatusFailed}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {sendResult.sesBatchCode && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase text-muted">{t.sesBatchCodeLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black">{sendResult.sesBatchCode}</span>
                  <button
                    type="button"
                    className="btn-secondary py-0.5 px-2 text-xs"
                    onClick={() => copyToClipboard(sendResult.sesBatchCode!, setCopyLabelBatch)}
                  >
                    <Copy className="h-3 w-3" />
                    {copyLabelBatch ? t.sesCopied : t.sesCopyBatch}
                  </button>
                </div>
              </div>
            )}

            {activeCommunicationCode && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase text-muted">{t.sesCommunicationCodeLabel}</span>
                <span className="font-mono text-base font-black">{activeCommunicationCode}</span>
              </div>
            )}

            {sendResult.communicationType && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase text-muted">{t.sesSendStatus}</span>
                <span className="text-sm">{sesCommunicationTypeLabel(sendResult.communicationType, t)}</span>
              </div>
            )}

            {sendResult.sesResponseCode && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase text-muted">SES</span>
                <span className="text-sm">{sendResult.sesResponseCode} — {sendResult.sesResponseDescription}</span>
              </div>
            )}

            {sendResult.xmlHash && (
              <div className="flex flex-col gap-0.5 sm:col-span-2">
                <span className="text-xs font-bold uppercase text-muted">{t.sesXmlHash}</span>
                <span className="font-mono text-xs text-muted">{sendResult.xmlHash.slice(0, 24)}…</span>
              </div>
            )}
          </div>

          {!sendResult.sesBatchCode && sendResult.ok && (
            <p className="mt-3 flex items-start gap-2 text-sm text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {t.sesNoLotWarning}
            </p>
          )}

          {sendResult.message && (
            <p className="mt-3 text-sm text-secondary">{sendResult.message}</p>
          )}

          {/* Query result update */}
          {queryResult && (
            <div className="mt-3 border-t border-current/10 pt-3">
              {queryResult.communicationCode && (
                <p className="text-sm font-bold text-accent">
                  {t.sesCommunicationCodeLabel}: {queryResult.communicationCode}
                </p>
              )}
              {queryResult.message && <p className="mt-1 text-sm text-secondary">{queryResult.message}</p>}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {sendResult.sesBatchCode && (
              <button
                type="button"
                className="btn-secondary"
                disabled={working || !sesStatus?.hasCredentials}
                onClick={queryLot}
              >
                {busyAction === "queryLot" ? <WorkingLabel label={t.processing} /> : <><Search className="h-4 w-4" />{t.sesConsultBatch}</>}
              </button>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowTechResponse((v) => !v)}
            >
              {showTechResponse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {t.sesTechnicalResponse}
            </button>
            {(sendResult.sesBatchCode || sendResult.submissionId) && (
              <button type="button" className="btn-secondary" onClick={downloadTraceability}>
                <Download className="h-4 w-4" />{t.sesDownloadTraceability}
              </button>
            )}
          </div>

          {/* Technical accordion */}
          {showTechResponse && (
            <div className="mt-4 rounded-lg border border-current/10 bg-black/30 p-3 text-xs">
              <p className="font-bold text-muted mb-2">{t.sesTechnicalResponse}</p>
              <pre className="overflow-auto whitespace-pre-wrap text-emerald-300 max-h-48">
                {JSON.stringify({
                  submissionId: sendResult.submissionId,
                  sesResponseCode: sendResult.sesResponseCode,
                  sesResponseDescription: sendResult.sesResponseDescription,
                  sesBatchCode: sendResult.sesBatchCode,
                  status: activeStatus,
                  communicationCode: activeCommunicationCode,
                  sesErrors: sendResult.sesErrors,
                }, null, 2)}
              </pre>
            </div>
          )}

          {/* SES errors */}
          {(sendResult.sesErrors as unknown[])?.length > 0 && (
            <div className="mt-3 rounded-lg border border-error/30 bg-error/5 p-3">
              <p className="text-xs font-bold text-error mb-1">SES Errors</p>
              <pre className="text-xs text-error overflow-auto max-h-32">
                {JSON.stringify(sendResult.sesErrors, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── Transmission + Queries grid ── */}
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
            <button type="button" className="btn-primary" disabled={working || schemaOk === false || !sesStatus?.readyForPreproduction} onClick={sendPreproduction}>
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
              <input className="input" value={lotCode} onChange={(event) => setLotCode(event.target.value)} placeholder={t.sesLotPlaceholder} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase text-muted">{t.sesCommunicationCode}</span>
              <input className="input" value={communicationCode} onChange={(event) => setCommunicationCode(event.target.value)} placeholder={t.sesCommunicationPlaceholder} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-bold uppercase text-muted">{t.sesCatalog}</span>
              <select className="input" value={catalog} onChange={(event) => setCatalog(event.target.value)} aria-label={t.sesCatalog}>
                <option value="" disabled>{t.sesCatalogPlaceholder}</option>
                <option value="TIPO_DOCUMENTO">{t.sesCatalogDocumentType}</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled={working || !sesStatus?.hasCredentials} onClick={queryLot}>
              {busyAction === "queryLot" ? <WorkingLabel label={t.processing} /> : t.sesQueryLot}
            </button>
            <button type="button" className="btn-secondary" disabled={working || !sesStatus?.hasCredentials} onClick={queryCommunication}>
              {busyAction === "queryCommunication" ? <WorkingLabel label={t.processing} /> : t.sesQueryCommunication}
            </button>
            <button type="button" className="btn-secondary" disabled={working || !sesStatus?.hasCredentials} onClick={queryCatalog}>
              {busyAction === "catalog" ? <WorkingLabel label={t.processing} /> : t.sesQueryCatalog}
            </button>
            <button type="button" className="btn-danger" disabled={working || !sesStatus?.hasCredentials} onClick={cancelLot}>
              {busyAction === "cancelLot" ? <WorkingLabel label={t.processing} /> : t.sesCancelLot}
            </button>
          </div>
        </div>
      </div>

      {result && <div className="ses-result mt-4" role="status">{result}</div>}
      {sesIssues.length > 0 && <div className="mt-4"><IssuePanel title={t.xmlValidationIssues} issues={sesIssues} /></div>}

      {/* ── History section ── */}
      <div className="mt-5 border-t border-current/10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors"
            onClick={() => { setShowHistory((v) => !v); if (!showHistory) void refreshHistory(); }}
          >
            <History className="h-4 w-4" />
            {t.sesHistoryTitle}
          </button>
          {showHistory && (
            <button type="button" className="btn-secondary py-1 px-2 text-xs" disabled={busyAction === "refreshHistory"} onClick={refreshHistory}>
              {busyAction === "refreshHistory" ? <WorkingLabel label={t.processing} /> : <><RefreshCw className="h-3 w-3" />{t.sesHistoryRefresh}</>}
            </button>
          )}
        </div>

        {showHistory && (
          <div className="mt-3">
            {history.length === 0 ? (
              <p className="text-sm text-muted">{t.sesHistoryEmpty}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-current/10 text-left text-muted">
                      <th className="pb-2 pr-3">{t.sesHistoryDate}</th>
                      <th className="pb-2 pr-3">{t.reference}</th>
                      <th className="pb-2 pr-3">{t.sesHistoryType}</th>
                      <th className="pb-2 pr-3">{t.sesHistoryBatch}</th>
                      <th className="pb-2 pr-3">{t.sesHistoryCommunicationCode}</th>
                      <th className="pb-2 pr-3">{t.sesHistoryStatus}</th>
                      <th className="pb-2">{t.sesHistoryActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b border-current/5 hover:bg-current/5">
                        <td className="py-1.5 pr-3 tabular-nums text-muted">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-1.5 pr-3">{item.reference ?? "—"}</td>
                        <td className="py-1.5 pr-3">{item.communicationType ?? "—"}</td>
                        <td className="py-1.5 pr-3 font-mono font-bold">{item.sesBatchCode ?? "—"}</td>
                        <td className="py-1.5 pr-3 font-mono">{item.communicationCode ?? "—"}</td>
                        <td className="py-1.5 pr-3">
                          <span className={`status-pill ${item.status === "PROCESSED" ? "is-valid" : item.status === "FAILED" ? "is-error" : "is-warning"}`}>
                            {sesStatusLabel(item.status, t)}
                          </span>
                        </td>
                        <td className="py-1.5">
                          {item.sesBatchCode && (
                            <button
                              type="button"
                              className="btn-secondary py-0.5 px-2 text-xs"
                              onClick={() => { setLotCode(item.sesBatchCode!); void queryLot(); }}
                            >
                              <Clock className="h-3 w-3" />
                              {t.sesConsultBatch}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">{t.sesPrivacyNote}</p>
    </section>
  );
}

function TraceabilityPanel({
  selectedFileName,
  parsed,
  generated,
  consolidated,
  smartValidated,
  previewReviewed,
  mappingReviewed,
}: {
  selectedFileName?: string;
  parsed: ParsedExcel | null;
  generated: GeneratedXmlResult | null;
  consolidated: boolean;
  smartValidated: boolean;
  previewReviewed: boolean;
  mappingReviewed: boolean;
}) {
  const { dictionary: t } = usePreferences();
  const criticalErrors = (parsed?.validation.errors.length ?? 0) + (generated?.validation.errors.length ?? 0);
  const duplicateBlockers = parsed ? unresolvedDuplicates(parsed).length : 0;
  const milestones = [
    { label: t.traceImport, value: selectedFileName ?? t.processPending, done: Boolean(parsed), blocked: false },
    { label: t.traceValidate, value: parsed ? `${criticalErrors} ${t.errors.toLowerCase()}` : t.processPending, done: Boolean(parsed && smartValidated && criticalErrors === 0), blocked: criticalErrors > 0 },
    { label: t.tracePreview, value: previewReviewed ? t.processDone : t.processPending, done: previewReviewed, blocked: false },
    { label: t.traceMapping, value: mappingReviewed ? t.processDone : t.processPending, done: mappingReviewed, blocked: false },
    { label: t.traceDuplicates, value: parsed ? `${duplicateBlockers} ${t.processPending.toLowerCase()}` : t.processPending, done: Boolean(parsed && duplicateBlockers === 0), blocked: duplicateBlockers > 0 },
    { label: t.traceXml, value: generated ? t.processDone : t.processPending, done: Boolean(generated), blocked: false },
    { label: t.traceConsolidate, value: consolidated ? t.processDone : t.processPending, done: consolidated, blocked: false },
  ];
  return (
    <section className="trace-panel">
      <div>
        <h2 className="font-heading text-base font-bold">{t.traceabilityTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.traceabilityCopy}</p>
      </div>
      <div className="trace-grid">
        {milestones.map((item) => (
          <div key={item.label} className={`trace-item ${item.blocked ? "is-blocked" : item.done ? "is-done" : ""}`}>
            <span className="trace-dot" />
            <span className="trace-label">{item.label}</span>
            <span className="trace-value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function XmlTreeView({ generated }: { generated: GeneratedXmlResult }) {
  const { dictionary: t } = usePreferences();
  const reservation = generated.visual.reservation;
  const property = generated.visual.property;
  const payment = generated.visual.payment;
  return (
    <div className="xml-tree mt-5">
      <div className="xml-node is-root">
        <div className="xml-node-header">
          <FileText className="h-4 w-4" />
          <span>{t.xmlTreeTitle}</span>
          <span className="status-pill is-valid">{t.sesSchemaValid}</span>
        </div>
        <div className="xml-branch">
          <InfoCard title={t.xmlTreeRequest} rows={[[t.code, property.establishmentCode], [t.name, property.name], [t.address, maskAddress(property.address)]]} />
          <InfoCard title={t.xmlTreeContract} rows={[[t.reference, reservation.reference], [t.checkIn, reservation.checkInDate], [t.checkOut, reservation.checkOutDate], [t.guestCount, String(generated.visual.guests.length)], [t.paymentType, payment.paymentType]]} />
          <InfoCard title={t.xmlTreePayment} rows={[[t.paymentType, payment.paymentType], ["IBAN", maskPayment(payment.iban)], ["Internet", String(reservation.internet ?? true)]]} />
        </div>
        <div className="mt-4">
          <h3 className="font-heading text-base font-bold">{t.xmlTreeGuests}</h3>
          <div className="xml-guest-grid mt-3">
            {generated.visual.guests.map((guest) => <XmlGuestNode key={guest.sourceRow} guest={guest} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function XmlGuestNode({ guest }: { guest: ParsedExcel["guests"][number] }) {
  const { dictionary: t } = usePreferences();
  return (
    <article className="xml-guest-node">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-heading text-sm font-bold">{guest.firstName} {guest.surname1}</h4>
          <p className="mt-1 text-xs text-muted">{t.newRecord}</p>
        </div>
        <StatusPill status={guest.validationStatus} />
      </div>
      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between gap-3"><dt className="text-muted">{t.document}</dt><dd>{guest.documentType} {maskDocument(guest.documentNumber)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">{t.birthDate}</dt><dd>{guest.birthDate ?? "-"}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">{t.nationality}</dt><dd>{guest.nationalityIso3 ?? "-"}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">{t.contact}</dt><dd>{maskEmail(guest.email)} · {maskPhone(guest.phone)}</dd></div>
      </dl>
    </article>
  );
}

function sesErrorMessage(error: unknown, t: ReturnType<typeof usePreferences>["dictionary"]) {
  if (typeof error === "string" && error.includes("Missing SES.HOSPEDAJES configuration")) return t.sesConfigMissing;
  if (typeof error === "string" && error.includes("production sending is blocked")) return t.sesProductionBlocked;
  return typeof error === "string" ? error : t.actionFailed;
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
          const isActive = activeStep === item.step;
          const state = item.busy ? "active" : isActive ? "active" : item.done ? "done" : "pending";
          const navigable = !busyAction && (item.done || isActive);
          return (
            <button key={item.step} type="button" className={`process-step is-${state}${navigable && !isActive ? " cursor-pointer" : ""}`} onClick={() => onStepClick(item.step)} disabled={Boolean(busyAction)}>
              <div className="process-step-index">{item.step}</div>
              <div className="process-step-icon"><Icon className="h-4 w-4" /></div>
              <div className="min-w-0 text-left">
                <p className="truncate font-heading text-sm font-bold">{item.label}</p>
                <p className="text-xs text-muted">{isActive ? t.processActive : state === "done" ? t.processDone : t.processPending}</p>
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

function toEditableGuest(guest: GuestRecord): Omit<GuestRecord, "validationStatus" | "errors" | "warnings"> {
  return {
    sourceRow: guest.sourceRow,
    role: guest.role,
    firstName: guest.firstName,
    surname1: guest.surname1,
    surname2: guest.surname2,
    birthDate: guest.birthDate,
    nationalityIso3: guest.nationalityIso3,
    documentType: guest.documentType,
    documentNumber: guest.documentNumber,
    documentSupport: guest.documentSupport,
    sex: guest.sex,
    address: guest.address,
    addressComplement: guest.addressComplement,
    municipality: guest.municipality,
    municipalityCode: guest.municipalityCode,
    postalCode: guest.postalCode,
    countryIso3: guest.countryIso3,
    phone: guest.phone,
    phone2: guest.phone2,
    email: guest.email,
    relationship: guest.relationship,
    arrivalDate: guest.arrivalDate,
    departureDate: guest.departureDate,
  };
}

function FieldCell({ state, children }: { state: "error" | "warning" | "valid" | "neutral"; children: ReactNode }) {
  return <td className={`field-cell is-${state}`}>{children}</td>;
}

function hasIssueForField(guest: GuestRecord, field: keyof GuestCorrectionPatch) {
  return guest.errors.concat(guest.warnings).some((issue) => issue.field === field);
}

function needsMunicipioCorrection(guest: GuestRecord) {
  return guest.countryIso3 === "ESP" && (hasIssueForField(guest, "municipalityCode") || !guest.municipalityCode);
}

function hasManualCorrectionFields(guest: GuestRecord) {
  return needsMunicipioCorrection(guest)
    || hasIssueForField(guest, "municipality")
    || hasIssueForField(guest, "address")
    || hasIssueForField(guest, "postalCode")
    || hasIssueForField(guest, "surname2")
    || hasIssueForField(guest, "documentType")
    || hasIssueForField(guest, "documentNumber")
    || hasIssueForField(guest, "sex")
    || hasIssueForField(guest, "relationship")
    || hasIssueForField(guest, "documentSupport")
    || hasIssueForField(guest, "phone")
    || hasIssueForField(guest, "phone2")
    || hasIssueForField(guest, "email");
}

function ManualCorrectionPanel({
  parsed,
  onGuestCorrection,
}: {
  parsed: ParsedExcel;
  onGuestCorrection: (sourceRow: number, patch: GuestCorrectionPatch) => void;
}) {
  const { dictionary: t } = usePreferences();
  const guestsWithIssues = parsed.guests.filter(hasManualCorrectionFields);

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold">{t.manualCorrectionsTitle}</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted">{t.manualCorrectionsCopy}</p>
        </div>
        <span className={`status-pill ${parsed.validation.errors.length ? "is-error" : guestsWithIssues.length ? "is-warning" : "is-valid"}`}>
          {parsed.validation.errors.length ? `${parsed.validation.errors.length} ${t.errors}` : guestsWithIssues.length ? `${guestsWithIssues.length} ${t.warnings}` : "OK"}
        </span>
      </div>
      {guestsWithIssues.length ? (
        <div className="manual-correction-grid mt-5">
          {guestsWithIssues.map((guest) => (
            <article className="manual-correction-card" key={guest.sourceRow}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-muted">{t.row} {guest.sourceRow}</p>
                  <h4 className="break-anywhere font-heading font-bold">{guest.firstName} {guest.surname1} {guest.surname2}</h4>
                </div>
                <StatusPill status={guest.validationStatus} />
              </div>
              <div className="manual-correction-fields">
                {needsMunicipioCorrection(guest) && (
                  <MunicipioCorrectionField guest={guest} onGuestCorrection={onGuestCorrection} />
                )}
                {hasIssueForField(guest, "municipality") && guest.countryIso3 !== "ESP" && (
                  <CorrectionInput
                    label={t.municipality}
                    value={guest.municipality}
                    maxLength={100}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { municipality: value })}
                  />
                )}
                {hasIssueForField(guest, "address") && (
                  <CorrectionInput
                    label={t.address}
                    value={guest.address}
                    maxLength={100}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { address: value })}
                  />
                )}
                {hasIssueForField(guest, "postalCode") && (
                  <CorrectionInput
                    label={t.postalCode}
                    value={guest.postalCode}
                    maxLength={20}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { postalCode: value })}
                  />
                )}
                {hasIssueForField(guest, "surname2") && (
                  <CorrectionInput
                    label={`${t.name} 2`}
                    value={guest.surname2}
                    maxLength={50}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { surname2: value })}
                  />
                )}
                {hasIssueForField(guest, "documentType") && (
                  <CorrectionSelect
                    label={t.document}
                    value={guest.documentType}
                    options={[
                      ["", t.selectValue],
                      ["NIF", "NIF"],
                      ["NIE", "NIE"],
                      ["PAS", "PAS"],
                      ["OTRO", "OTRO"],
                    ]}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { documentType: value as GuestRecord["documentType"] | undefined })}
                  />
                )}
                {hasIssueForField(guest, "documentNumber") && (
                  <CorrectionInput
                    label={t.document}
                    value={guest.documentNumber}
                    maxLength={15}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { documentNumber: value?.toUpperCase() })}
                  />
                )}
                {hasIssueForField(guest, "sex") && (
                  <CorrectionSelect
                    label={t.sex}
                    value={guest.sex}
                    options={[
                      ["", t.selectValue],
                      ["H", "H"],
                      ["M", "M"],
                      ["O", "O"],
                    ]}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { sex: value as GuestRecord["sex"] | undefined })}
                  />
                )}
                {hasIssueForField(guest, "relationship") && (
                  <CorrectionInput
                    label={t.relationship}
                    value={guest.relationship}
                    maxLength={2}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { relationship: value?.toUpperCase() })}
                  />
                )}
                {hasIssueForField(guest, "documentSupport") && (
                  <CorrectionInput
                    label={t.documentSupport}
                    value={guest.documentSupport}
                    maxLength={9}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { documentSupport: value })}
                  />
                )}
                {hasIssueForField(guest, "phone") && (
                  <CorrectionInput
                    label={t.phone}
                    value={guest.phone}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { phone: value })}
                  />
                )}
                {hasIssueForField(guest, "phone2") && (
                  <CorrectionInput
                    label={`${t.phone} 2`}
                    value={guest.phone2}
                    maxLength={20}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { phone2: value })}
                  />
                )}
                {hasIssueForField(guest, "email") && (
                  <CorrectionInput
                    label={t.email}
                    value={guest.email}
                    onChange={(value) => onGuestCorrection(guest.sourceRow, { email: value })}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-app bg-surface-elevated p-4 text-sm text-muted">{t.noManualCorrections}</p>
      )}
    </section>
  );
}

function MunicipioCorrectionField({
  guest,
  onGuestCorrection,
}: {
  guest: GuestRecord;
  onGuestCorrection: (sourceRow: number, patch: GuestCorrectionPatch) => void;
}) {
  const { dictionary: t } = usePreferences();
  const uid = useId();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<MunicipioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const provinceCode = provinceCodeFromPostalCode(guest.postalCode) ?? "";
  const selected = useMemo(() => options.find((m) => m.codigoMunicipio === guest.municipalityCode)
    ?? (guest.municipalityCode ? {
      codigoMunicipio: guest.municipalityCode,
      codigoProvincia: guest.municipalityCode.slice(0, 2),
      nombre: guest.municipality || guest.municipalityCode,
      nombreNormalizado: normalizeMunicipioName(guest.municipality || guest.municipalityCode),
    } : undefined), [guest.municipality, guest.municipalityCode, options]);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusIdx(-1);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Scroll focused item into view
  useEffect(() => {
    if (focusIdx >= 0 && listRef.current) {
      (listRef.current.children[focusIdx] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
    }
  }, [focusIdx]);

  useEffect(() => {
    const cleaned = query.trim();
    if (!open || cleaned.length < 2) {
      setOptions(selected ? [selected] : []);
      setLoading(false);
      return;
    }
    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: cleaned, limit: "30" });
        if (provinceCode) params.set("province", provinceCode);
        const response = await fetch(`/api/admin/ine/municipios?${params.toString()}`);
        const data = await response.json();
        const fetched: MunicipioOption[] = data.municipios ?? [];
        if (active) setOptions(fetched);
      } catch {
        if (active) setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [open, provinceCode, query, selected]);

  const visibleOptions = options.slice(0, 30);

  function select(m: MunicipioOption) {
    onGuestCorrection(guest.sourceRow, { municipalityCode: m.codigoMunicipio });
    setQuery("");
    setOpen(false);
    setFocusIdx(-1);
  }

  function clear() {
    onGuestCorrection(guest.sourceRow, { municipalityCode: undefined });
    setQuery("");
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) { setOpen(true); setFocusIdx(0); e.preventDefault(); return; }
    if (e.key === "ArrowDown") { setFocusIdx((i) => Math.min(i + 1, visibleOptions.length - 1)); e.preventDefault(); }
    else if (e.key === "ArrowUp") { setFocusIdx((i) => Math.max(i - 1, 0)); e.preventDefault(); }
    else if (e.key === "Enter" && focusIdx >= 0) { const m = visibleOptions[focusIdx]; if (m) select(m); e.preventDefault(); }
    else if (e.key === "Escape") { setOpen(false); setFocusIdx(-1); }
  }

  return (
    <div ref={wrapperRef} className="manual-field relative">
      <span className="text-xs font-bold uppercase text-muted">{t.selectMunicipio}</span>
      <div className="municipio-searchbox flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-accent/40 transition-shadow">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        {provinceCode && (
          <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 font-mono text-xs font-bold text-accent select-none">
            {provinceCode}
          </span>
        )}
        {selected && (
          <span className="shrink-0 rounded bg-accent/10 px-1.5 py-0.5 font-mono text-xs font-bold text-accent/80 select-none border border-accent/20">
            {selected.codigoMunicipio.slice(2)}
          </span>
        )}
        <input
          ref={inputRef}
          id={uid}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          placeholder={selected ? selected.nombre : t.municipality}
          value={query}
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setFocusIdx(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={`${uid}-list`}
          aria-activedescendant={focusIdx >= 0 ? `${uid}-opt-${focusIdx}` : undefined}
          role="combobox"
        />
        {selected && (
          <button type="button" aria-label="Borrar selección" onClick={clear}
            className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full text-muted transition-colors hover:bg-error/20 hover:text-error text-xs leading-none">
            ✕
          </button>
        )}
      </div>
      {open && query.trim().length >= 2 && visibleOptions.length > 0 && (
        <ul
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          className="municipio-options mt-2 max-h-64 overflow-y-auto rounded-lg border border-app bg-surface shadow-2xl"
        >
          {visibleOptions.map((m, idx) => (
            <li
              key={m.codigoMunicipio}
              id={`${uid}-opt-${idx}`}
              role="option"
              aria-selected={m.codigoMunicipio === guest.municipalityCode}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm transition-colors ${
                idx === focusIdx ? "bg-accent/15 text-primary" : "hover:bg-surface-elevated"
              } ${m.codigoMunicipio === guest.municipalityCode ? "font-semibold" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); select(m); }}
              onMouseEnter={() => setFocusIdx(idx)}
            >
              <span className="truncate">{m.nombre}</span>
              <span className="shrink-0 font-mono text-xs text-muted">{m.codigoMunicipio}</span>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim().length >= 2 && !loading && visibleOptions.length === 0 && (
        <div className="municipio-options mt-2 rounded-lg border border-app bg-surface px-3 py-2.5 text-sm text-muted shadow-2xl">
          {t.municipioAutoResolveFailed}
        </div>
      )}
      {open && query.trim().length >= 2 && loading && (
        <div className="municipio-options mt-2 rounded-lg border border-app bg-surface px-3 py-2.5 text-sm text-muted shadow-2xl">
          {t.processing}
        </div>
      )}
    </div>
  );
}

function CorrectionInput({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value?: string;
  maxLength?: number;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label className="manual-field">
      <span>{label}</span>
      <input
        className="input"
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value.trim() || undefined)}
      />
    </label>
  );
}

function CorrectionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: Array<[string, string]>;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label className="manual-field">
      <span>{label}</span>
      <select className="input" value={value ?? ""} onChange={(event) => onChange(event.target.value || undefined)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue || "empty"} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function GuestTable({ guests, smartValidated, showFullData }: { guests: ParsedExcel["guests"]; smartValidated: boolean; showFullData: boolean }) {
  const { dictionary: t } = usePreferences();
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const totalPages = Math.ceil(guests.length / pageSize);
  const pageGuests = guests.slice(page * pageSize, (page + 1) * pageSize);
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
        <thead><tr><th>{t.status}</th><th>#</th><th>{t.name}</th><th>{t.document}</th><th>{t.data}</th><th>{t.contact}</th><th>{t.address}</th><th>{t.warnings}</th></tr></thead>
        <tbody>
          {pageGuests.map((guest) => (
            <tr key={guest.sourceRow}>
              <td><StatusPill status={guest.validationStatus} /></td>
              <td>{guest.sourceRow}</td>
              <FieldCell state={fieldState(guest, ["firstName", "surname1", "surname2"], smartValidated)}><span className="font-semibold">{guest.firstName}</span><br />{guest.surname1} {guest.surname2}</FieldCell>
              <FieldCell state={fieldState(guest, ["documentNumber", "documentType"], smartValidated)}><span className="text-muted">{guest.documentType}</span><br />{showFullData ? guest.documentNumber : maskDocument(guest.documentNumber)}</FieldCell>
              <FieldCell state={fieldState(guest, ["birthDate", "nationalityIso3"], smartValidated)}><span className="text-muted">{t.birthShort}</span> {guest.birthDate}<br /><span className="text-muted">{t.countryShort}</span> {guest.nationalityIso3}</FieldCell>
              <FieldCell state={fieldState(guest, ["email", "phone"], smartValidated)}><span className="break-anywhere">{showFullData ? guest.email || "-" : maskEmail(guest.email)}</span><br /><span className="text-muted">{showFullData ? guest.phone || "-" : maskPhone(guest.phone)}</span></FieldCell>
              <FieldCell state={fieldState(guest, ["address", "postalCode", "municipality", "municipalityCode"], smartValidated)}><span className="break-anywhere">{showFullData ? guest.address : maskAddress(guest.address)}</span></FieldCell>
              <td><CompactIssueList issues={guest.errors.concat(guest.warnings)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPage={(p) => { setPage(p); }} />}
    </div>
  );
}

function WorkingLabel({ label }: { label: string }) {
  return <><span className="spinner" aria-hidden="true" />{label}</>;
}

function processMessageTone(message: string, t: ReturnType<typeof usePreferences>["dictionary"]) {
  const errorMessages = [
    t.actionFailed,
    t.smartValidationErrors,
    t.xmlGeneratedWithIssues,
    t.criticalErrorsBlocked,
    t.unresolvedDuplicatesBlocked,
    t.xmlPreviewRequired,
    t.previewReviewRequired,
    t.mappingReviewRequired,
    t.consentRequiredNotice,
  ] as string[];
  if (errorMessages.includes(message) || message.includes(t.criticalErrorsBlocked)) return "is-error";
  if (message === t.smartValidationApplied || message === t.manualCorrectionApplied) return "is-warning";
  return "is-success";
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string | number | undefined]> }) {
  return <div className="panel p-5"><h3 className="font-heading text-lg font-bold">{title}</h3><dl className="mt-4 space-y-2">{rows.map(([key, value]) => <div key={key} className="flex justify-between gap-4 text-sm"><dt className="text-muted">{key}</dt><dd className="text-right font-semibold text-secondary">{value || "-"}</dd></div>)}</dl></div>;
}

function StatusPill({ status }: { status: string }) {
  const label = status === "ERROR" ? "ERR" : status === "WARNING" ? "AVISO" : "OK";
  return <span className={`status-pill ${status === "ERROR" ? "is-error" : status === "WARNING" ? "is-warning" : "is-valid"}`}>{label}</span>;
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-app px-5 py-3 text-sm text-muted">
      <button type="button" className="btn-secondary py-1 text-xs disabled:opacity-40" disabled={page === 0} onClick={() => onPage(page - 1)}>← Anterior</button>
      <span>{page + 1} / {totalPages}</span>
      <button type="button" className="btn-secondary py-1 text-xs disabled:opacity-40" disabled={page === totalPages - 1} onClick={() => onPage(page + 1)}>Siguiente →</button>
    </div>
  );
}

function IssuePanel({ title, issues }: { title: string; issues: Array<{ code: string; message: string; severity: string; field?: string; sourceRow?: number }> }) {
  const { dictionary: t } = usePreferences();
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(issues.length / pageSize);
  const pageIssues = issues.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-app p-5">
        <h3 className="font-heading font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted">{t.issueSummary}: {issues.length}</p>
      </div>
      {issues.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>{t.severity}</th><th>{t.row}</th><th>{t.field}</th><th>{t.explanation}</th><th>{t.recommendedAction}</th></tr></thead>
              <tbody>
                {pageIssues.map((issue, index) => (
                  <tr key={`${issue.code}-${index}`}>
                    <td><span className={`status-pill ${issue.severity === "error" ? "is-error" : "is-warning"}`}>{issue.severity === "error" ? "ERR" : "AVISO"}</span></td>
                    <td>{issue.sourceRow ?? "-"}</td>
                    <td>{issue.field || "-"}</td>
                    <td>{translateIssueMessage(issue.code, issue.message, t)}</td>
                    <td>{t.fixBeforeConsolidating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPage={setPage} />}
        </>
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
          {translateIssueMessage(issue.code, issue.message, t).replace(" no informado", "").replace(" not provided", "").replace("Teléfono", "Tel.").replace("Phone", "Tel.").replace("Código de municipio", "Cod. mun.").replace("Municipality code", "Mun. code").replace("Gemeindecode", "Gemeinde").replace("Soporte de documento", "Soporte doc.").replace("Document support", "Doc. support").replace("Dokumentnachweis", "Dok.")}
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
  if (code === "guest.documentSupport.required") return t.issueDocumentSupportRequired;
  if (code === "guest.municipalityCode.missing") return t.issueMunicipalityCodeMissing;
  if (code === "guest.municipality.required") return t.issueMunicipalityRequired;
  if (code === "guest.postalCode.required") return t.issuePostalCodeRequired;
  if (code === "guest.postalCode.invalid") return t.issuePostalCodeInvalid;
  if (code === "guest.contact.required") return t.issueContactRequired;
  if (code === "ses.readiness.municipalityCode.required") return t.issueSesMunicipalityCodeRequired;
  if (code === "municipality.autoResolved") return t.municipioAutoResolved;
  return fallback;
}

function issueRecommendedAction(issue: { severity: string }, t: ReturnType<typeof usePreferences>["dictionary"]) {
  return issue.severity === "error" ? t.fixBeforeConsolidating : t.reviewWarningAction;
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

function UnifiedIssuesPanel({
  warnings,
  errors,
  duplicates,
  onDuplicateResolve,
}: {
  warnings: Array<{ code: string; message: string; severity: string; field?: string; sourceRow?: number }>;
  errors: Array<{ code: string; message: string; severity: string; field?: string; sourceRow?: number }>;
  duplicates: NonNullable<ParsedExcel["duplicates"]>;
  onDuplicateResolve: (id: string, resolution: DuplicateResolution) => void;
}) {
  const { dictionary: t } = usePreferences();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  type IssueRow =
    | { kind: "issue"; issue: { code: string; message: string; severity: string; field?: string; sourceRow?: number } }
    | { kind: "duplicate"; dup: NonNullable<ParsedExcel["duplicates"]>[number] };

  const allRows: IssueRow[] = [
    ...errors.map((issue) => ({ kind: "issue" as const, issue })),
    ...warnings.map((issue) => ({ kind: "issue" as const, issue })),
    ...duplicates.map((dup) => ({ kind: "duplicate" as const, dup })),
  ];

  const totalPages = Math.ceil(allRows.length / pageSize);
  const pageRows = allRows.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-app p-5">
        <div>
          <h3 className="font-heading font-bold">{t.validations}</h3>
          <p className="mt-1 text-sm text-muted">{t.errors}: {errors.length} · {t.warnings}: {warnings.length} · {t.duplicates}: {duplicates.length}</p>
        </div>
        {errors.length > 0 && <span className="status-pill is-error">{errors.length} {t.errors}</span>}
      </div>
      {allRows.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.severity}</th>
                  <th>{t.row}</th>
                  <th>{t.field}</th>
                  <th>{t.explanation}</th>
                  <th>{t.recommendedAction}</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  if (row.kind === "issue") {
                    const { issue } = row;
                    return (
                      <tr key={`issue-${issue.code}-${idx}`}>
                        <td><span className={`status-pill ${issue.severity === "error" ? "is-error" : "is-warning"}`}>{issue.severity === "error" ? "ERR" : "AVISO"}</span></td>
                        <td>{issue.sourceRow ?? "-"}</td>
                        <td>{issue.field || "-"}</td>
                        <td>{translateIssueMessage(issue.code, issue.message, t)}</td>
                        <td>{issueRecommendedAction(issue, t)}</td>
                      </tr>
                    );
                  }
                  const { dup } = row;
                  return (
                    <tr key={`dup-${dup.id}`}>
                      <td><span className={`status-pill ${dup.classification === "likely" ? "is-error" : "is-warning"}`}>DUP</span></td>
                      <td>{dup.sourceRows.join(", ")}</td>
                      <td>-</td>
                      <td>{dup.reasonCodes.join(", ")}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <button type="button" className={`tab text-xs ${dup.resolution === "skip_new" ? "is-active" : ""}`} onClick={() => onDuplicateResolve(dup.id, "skip_new")}>{t.skipNewRecord}</button>
                          <button type="button" className={`tab text-xs ${dup.resolution === "keep_both" ? "is-active" : ""}`} onClick={() => onDuplicateResolve(dup.id, "keep_both")}>{t.keepBothRecords}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPage={setPage} />}
        </>
      ) : <p className="p-5 text-sm text-muted">OK</p>}
    </div>
  );
}

function OperationSummary({ parsed, temporaryCleared }: { parsed: ParsedExcel; temporaryCleared: boolean }) {
  const { dictionary: t } = usePreferences();
  const skipped = (parsed.duplicates ?? []).filter((duplicate) => duplicate.resolution === "skip_new").length;
  const rows: Array<[string, string | number]> = [
    [t.existingRecords, "0"],
    [t.newRecords, parsed.guests.length - skipped],
    [t.duplicatesDetected, parsed.duplicates?.length ?? 0],
    [t.omittedRecords, skipped],
    [t.correctedErrors, "0"],
    [t.pendingWarnings, parsed.validation.warnings.length],
    [t.totalConsolidated, parsed.guests.length - skipped],
    [t.privacyModeUsed, t.privateModeTitle],
    [t.temporaryDataStatus, temporaryCleared ? t.temporaryDataCleared : t.temporaryDataInSession],
  ];
  return (
    <div className="mt-6">
      <h3 className="font-heading text-lg font-bold">{t.operationSummary}</h3>
      <div className="summary-grid mt-4">
        {rows.map(([label, value]) => (
          <div key={label} className="metric-card">
            <p className="text-xs font-bold uppercase text-muted">{label}</p>
            <p className="metric-value">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
