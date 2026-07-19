"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { track } from "./analytics";
import { PILOT_EMAIL, PRIVACY_HREF, TERMS_HREF } from "./landingData";

/**
 * Structured pilot request + pre-pilot feedback (FASE 9.1).
 *
 * Server-side email delivery: on submit it sends the request through the
 * controlled pilot API route. It never asks for real guest data, documents, or
 * SES credentials. It captures the commercial signal the v0.2 model requires:
 * pain, current workflow, volume, and willingness to pay.
 */

export function PilotRequestForm() {
  const { locale, copy } = useLandingI18n();
  const identity = [
    { name: "name", type: "text", required: true, ...copy.form.fields.name },
    { name: "email", type: "email", required: true, ...copy.form.fields.email },
    { name: "companyName", type: "text", required: false, ...copy.form.fields.companyName },
    { name: "role", type: "text", required: false, ...copy.form.fields.role },
  ] as const;
  const [values, setValues] = useState<Record<string, string>>({});
  const [excelUse, setExcelUse] = useState("");
  const [alojamiento, setAlojamiento] = useState("");
  const [reservas, setReservas] = useState("");
  const [inmuebles, setInmuebles] = useState("");
  const [pay, setPay] = useState("");
  const [model, setModel] = useState("");
  const [problema, setProblema] = useState("");
  const [alternativa, setAlternativa] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [acceptsSyntheticOrAnonymizedData, setAcceptsSyntheticOrAnonymizedData] = useState(false);
  const [acceptsPilotConditions, setAcceptsPilotConditions] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  const canSubmit = useMemo(
    () =>
      Boolean(
        values.name &&
          values.email &&
          alojamiento &&
          reservas &&
          problema &&
          alternativa &&
          acceptsPilotConditions,
      ),
    [
      acceptsPilotConditions,
      alojamiento,
      alternativa,
      problema,
      reservas,
      values.email,
      values.name,
    ],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    track("submit_pilot_request");
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/pilot/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          accommodationType: alojamiento,
          estimatedMonthlyReservations: reservas,
          currentWorkflow: alternativa || excelUse,
          mainPain: problema,
          wantsToValidate: tiempo || mensaje,
          acceptsSyntheticOrAnonymizedData,
          acceptsPilotConditions,
          locale,
          source: "syncxml_landing",
          inmuebles,
          reservas,
          excelUse,
          problema,
          alternativa,
          tiempo,
          muestraSintetica: acceptsSyntheticOrAnonymizedData,
          pay,
          model,
          presupuesto,
          mensaje,
          privacy: acceptsPilotConditions,
        }),
      });
      if (!response.ok) {
        setSubmitError(copy.form.submitError);
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(copy.form.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="l-card l-card-gold p-7 text-center">
        <span className="l-icon-tile mx-auto" aria-hidden="true">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <h2 className="l-h2 mt-4 text-2xl">{copy.form.successTitle}</h2>
        <p className="l-text mx-auto mt-3 max-w-md text-sm">
          {copy.form.successCopy}
        </p>
        <p className="l-text mx-auto mt-3 max-w-md text-xs">
          {copy.form.successEmail}{" "}
          <a className="l-gold" href={`mailto:${PILOT_EMAIL}`}>
            {PILOT_EMAIL}
          </a>
          .
        </p>
        <Link href="/" className="l-btn l-btn-ghost mt-6">
          {copy.form.back}
        </Link>
      </div>
    );
  }

  return (
    <form className="l-card p-6 md:p-8" onSubmit={onSubmit} noValidate>
      <Link href="/" className="l-nav-link mb-5 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {copy.form.back}
      </Link>

      <fieldset className="border-0 p-0">
        <legend className="l-eyebrow">{copy.form.identity}</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {identity.map((field) => (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="l-text text-sm">
                {field.label}
                {field.required ? <span className="l-gold"> *</span> : null}
              </span>
              <input
                className="l-input"
                type={field.type}
                required={field.required}
                aria-required={field.required}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) => set(field.name, event.target.value)}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-7 border-0 p-0">
        <legend className="l-eyebrow">{copy.form.operations}</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Choice label={copy.form.accommodationLabel} options={copy.form.accommodationOptions} value={alojamiento} onChange={setAlojamiento} name="alojamiento" />
          <Choice label={copy.form.propertyLabel} options={copy.form.propertyOptions} value={inmuebles} onChange={setInmuebles} name="inmuebles" />
          <Choice label={copy.form.reservationsLabel} options={copy.form.reservationOptions} value={reservas} onChange={setReservas} name="reservas" />
        </div>
        <div className="mt-4 grid gap-4">
          <Choice label={copy.form.excelLabel} options={copy.form.excelOptions} value={excelUse} onChange={setExcelUse} name="excel" inline />
          <Text label={copy.form.painLabel} value={problema} onChange={setProblema} placeholder={copy.form.painPlaceholder} />
          <Text label={copy.form.workflowLabel} value={alternativa} onChange={setAlternativa} placeholder={copy.form.workflowPlaceholder} />
          <Text label={copy.form.validateLabel} value={tiempo} onChange={setTiempo} />
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" checked={acceptsSyntheticOrAnonymizedData} onChange={(event) => setAcceptsSyntheticOrAnonymizedData(event.target.checked)} />
            <span className="l-text text-sm">{copy.form.syntheticConsent}</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-7 border-0 p-0">
        <legend className="l-eyebrow">{copy.form.payment}</legend>
        <div className="mt-4 grid gap-5">
          <Choice label={copy.form.payLabel} options={copy.form.payOptions} value={pay} onChange={setPay} name="pay" />
          <Choice label={copy.form.modelLabel} options={copy.form.modelOptions} value={model} onChange={setModel} name="model" />
          <Text label={copy.form.budgetLabel} value={presupuesto} onChange={setPresupuesto} />
          <Text label={copy.form.messageLabel} value={mensaje} onChange={setMensaje} multiline />
        </div>
      </fieldset>

      <label className="mt-6 flex items-start gap-3">
        <input type="checkbox" className="mt-1" checked={acceptsPilotConditions} onChange={(event) => setAcceptsPilotConditions(event.target.checked)} required aria-required />
        <span className="l-text text-sm">
          {copy.form.termsPrefix}{" "}
          <Link href={PRIVACY_HREF} className="l-gold">{copy.common.privacy}</Link> {copy.form.termsMiddle}{" "}
          <Link href={TERMS_HREF} className="l-gold">{copy.common.terms}</Link>. {copy.form.termsSuffix}
          <span className="l-gold"> *</span>
        </span>
      </label>

      {submitError ? (
        <p className="mt-4 text-sm text-[color:var(--l-amber)]" role="alert">
          {submitError}
        </p>
      ) : null}

      <button type="submit" className="l-btn l-btn-primary mt-6 w-full" disabled={!canSubmit || submitting}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {submitting ? copy.form.submitting : copy.form.submit}
      </button>
      <p className="l-text mt-3 text-xs">
        {copy.form.submitNote}
      </p>
    </form>
  );
}

function Choice({
  label,
  options,
  value,
  onChange,
  name,
  inline = false,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  name: string;
  inline?: boolean;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="l-text text-sm">{label}</legend>
      <div className={`mt-2 flex flex-wrap gap-2 ${inline ? "" : ""}`}>
        {options.map((option) => {
          const id = `${name}-${option}`;
          const active = value === option;
          return (
            <label
              key={option}
              htmlFor={id}
              className={`l-chip${active ? " is-active" : ""}`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                className="sr-only"
                checked={active}
                onChange={() => onChange(option)}
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="l-text text-sm">{label}</span>
      {multiline ? (
        <textarea
          className="l-input min-h-24 py-2.5"
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="l-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}
