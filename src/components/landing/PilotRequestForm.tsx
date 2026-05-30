"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { track } from "./analytics";
import { PILOT_EMAIL, PRIVACY_HREF, TERMS_HREF } from "./landingData";

/**
 * Structured pilot request + pre-pilot feedback (FASE 9.1).
 *
 * No backend and no PII storage: on submit it composes a mailto with the
 * answers so the lead is handled manually. It never asks for real guest data,
 * documents, or SES credentials. It captures the commercial signal the v0.2
 * model requires — pain, current workflow, volume, and willingness to pay.
 */

type Field = { name: string; label: string; type?: "text" | "email"; required?: boolean; placeholder?: string };

const IDENTITY: Field[] = [
  { name: "nombre", label: "Nombre", required: true },
  { name: "apellidos", label: "Apellidos", required: true },
  { name: "email", label: "Email principal", type: "email", required: true },
  { name: "alojamiento", label: "Tipo de alojamiento", placeholder: "Vivienda turística, pensión, gestor…" },
];

const ACCOMMODATION_OPTIONS = ["1–2 inmuebles", "3–10 inmuebles", "11–30 inmuebles", "Más de 30"];
const RESERVAS_OPTIONS = ["Menos de 10", "10–30", "31–80", "Más de 80"];
const PAY_OPTIONS = ["Sí, me interesa", "Quizá, según resultado", "Aún no lo sé", "No por ahora"];
const MODEL_OPTIONS = ["Pago único", "Cuota mensual", "Setup + mensual", "Por reserva", "Servicio a medida"];

export function PilotRequestForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [excelUse, setExcelUse] = useState("");
  const [reservas, setReservas] = useState("");
  const [inmuebles, setInmuebles] = useState("");
  const [pay, setPay] = useState("");
  const [model, setModel] = useState("");
  const [problema, setProblema] = useState("");
  const [alternativa, setAlternativa] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [muestraSintetica, setMuestraSintetica] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  const canSubmit = useMemo(
    () => Boolean(values.nombre && values.apellidos && values.email && privacy),
    [values.nombre, values.apellidos, values.email, privacy],
  );

  function buildMailto(): string {
    const lines = [
      "Solicitud de piloto controlado — Anclora SyncXML",
      "",
      `Nombre: ${values.nombre ?? ""} ${values.apellidos ?? ""}`,
      `Email: ${values.email ?? ""}`,
      `Tipo de alojamiento: ${values.alojamiento ?? ""}`,
      `Nº de inmuebles: ${inmuebles}`,
      `Reservas/mes aprox.: ${reservas}`,
      `Trabaja con Excel/XLSX: ${excelUse}`,
      "",
      `Principal problema operativo: ${problema}`,
      `Alternativa actual: ${alternativa}`,
      `Tiempo invertido hoy (por reserva/semana): ${tiempo}`,
      `Puede usar muestra sintética/anonimizada: ${muestraSintetica ? "Sí" : "No indicado"}`,
      "",
      `Interés en piloto de pago: ${pay}`,
      `Modelo preferido: ${model}`,
      `Rango/presupuesto orientativo: ${presupuesto}`,
      "",
      `Mensaje: ${mensaje}`,
    ];
    return `mailto:${PILOT_EMAIL}?subject=${encodeURIComponent(
      "Solicitud de piloto controlado — Anclora SyncXML",
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    track("submit_pilot_request");
    window.location.href = buildMailto();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="l-card l-card-gold p-7 text-center">
        <span className="l-icon-tile mx-auto" aria-hidden="true">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <h2 className="l-h2 mt-4 text-2xl">Solicitud preparada</h2>
        <p className="l-text mx-auto mt-3 max-w-md text-sm">
          Solicitud recibida. Revisaremos el encaje del piloto antes de conceder
          acceso. No subas datos reales de huéspedes hasta que el piloto esté
          aprobado y configurado.
        </p>
        <p className="l-text mx-auto mt-3 max-w-md text-xs">
          Si tu cliente de correo no se ha abierto, escríbenos a{" "}
          <a className="l-gold" href={`mailto:${PILOT_EMAIL}`}>
            {PILOT_EMAIL}
          </a>
          .
        </p>
        <Link href="/" className="l-btn l-btn-ghost mt-6">
          Volver a la landing
        </Link>
      </div>
    );
  }

  return (
    <form className="l-card p-6 md:p-8" onSubmit={onSubmit} noValidate>
      <Link href="/" className="l-nav-link mb-5 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a la landing
      </Link>

      <fieldset className="border-0 p-0">
        <legend className="l-eyebrow">Tus datos</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {IDENTITY.map((field) => (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="l-text text-sm">
                {field.label}
                {field.required ? <span className="l-gold"> *</span> : null}
              </span>
              <input
                className="l-input"
                type={field.type ?? "text"}
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
        <legend className="l-eyebrow">Tu operativa</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Choice label="Nº de inmuebles" options={ACCOMMODATION_OPTIONS} value={inmuebles} onChange={setInmuebles} name="inmuebles" />
          <Choice label="Reservas al mes (aprox.)" options={RESERVAS_OPTIONS} value={reservas} onChange={setReservas} name="reservas" />
        </div>
        <div className="mt-4 grid gap-4">
          <Choice label="¿Trabajas con Excel/XLSX?" options={["Sí", "A veces", "No"]} value={excelUse} onChange={setExcelUse} name="excel" inline />
          <Text label="Principal problema operativo" value={problema} onChange={setProblema} placeholder="¿Qué te cuesta más al revisar datos de huéspedes?" />
          <Text label="Alternativa actual" value={alternativa} onChange={setAlternativa} placeholder="PMS, hoja de cálculo, gestoría, manual…" />
          <Text label="¿Cuánto tiempo te lleva hoy? (por reserva o por semana)" value={tiempo} onChange={setTiempo} />
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" checked={muestraSintetica} onChange={(event) => setMuestraSintetica(event.target.checked)} />
            <span className="l-text text-sm">Puedo aportar una muestra sintética o anonimizada (sin datos reales de huéspedes).</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-7 border-0 p-0">
        <legend className="l-eyebrow">Disposición de pago</legend>
        <div className="mt-4 grid gap-5">
          <Choice label="¿Te interesa un piloto de pago?" options={PAY_OPTIONS} value={pay} onChange={setPay} name="pay" />
          <Choice label="Modelo que preferirías" options={MODEL_OPTIONS} value={model} onChange={setModel} name="model" />
          <Text label="Rango orientativo o presupuesto (opcional)" value={presupuesto} onChange={setPresupuesto} />
          <Text label="Mensaje (opcional)" value={mensaje} onChange={setMensaje} multiline />
        </div>
      </fieldset>

      <label className="mt-6 flex items-start gap-3">
        <input type="checkbox" className="mt-1" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} required aria-required />
        <span className="l-text text-sm">
          He leído y acepto la{" "}
          <Link href={PRIVACY_HREF} className="l-gold">privacidad</Link> y los{" "}
          <Link href={TERMS_HREF} className="l-gold">términos</Link>. No incluiré
          datos reales de huéspedes en esta solicitud. <span className="l-gold">*</span>
        </span>
      </label>

      <button type="submit" className="l-btn l-btn-primary mt-6 w-full" disabled={!canSubmit}>
        <Send className="h-4 w-4" aria-hidden="true" />
        Enviar solicitud de piloto
      </button>
      <p className="l-text mt-3 text-xs">
        Enviar no concede acceso automático: revisamos el encaje antes de habilitar
        la aplicación. La solicitud se gestiona de forma manual por email.
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
