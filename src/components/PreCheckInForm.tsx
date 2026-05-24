"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { PrecheckinGuestSubmission, PublicPrecheckinSession } from "@/lib/precheckin";

type GuestFormState = PrecheckinGuestSubmission;

export function PreCheckInForm({ token }: { token: string }) {
  const [session, setSession] = useState<PublicPrecheckinSession | null>(null);
  const [guests, setGuests] = useState<GuestFormState[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch(`/api/precheckin/${token}`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setSession(data.session ?? null);
        setGuests((data.session?.guests ?? []).map((guest: PublicPrecheckinSession["guests"][number]) => ({
          sourceRow: guest.sourceRow,
          firstName: guest.firstName ?? "",
          surname1: guest.surname1 ?? "",
          surname2: guest.surname2 ?? "",
          documentType: "NIF",
          countryIso3: "ESP",
          nationalityIso3: "ESP",
          sex: "H",
          relationship: "TI",
        })));
      })
      .catch(() => setMessage("No se pudo cargar el pre-check-in."));
    return () => {
      active = false;
    };
  }, [token]);

  const disabled = useMemo(() => busy || !session || session.status === "EXPIRED" || session.status === "SUBMITTED_FOR_REVIEW", [busy, session]);

  function updateGuest(index: number, patch: Partial<GuestFormState>) {
    setGuests((current) => current.map((guest, itemIndex) => (itemIndex === index ? { ...guest, ...patch } : guest)));
  }

  async function submit() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/precheckin/${token}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ privacyAccepted, guests }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const issues = data.result?.issues ?? [];
        setMessage(issues.length ? issues.map((issue: { message: string }) => issue.message).join(" · ") : "No se pudo enviar el formulario.");
        return;
      }
      setSession((current) => current ? { ...current, status: data.result.status, submittedAt: new Date().toISOString() } : current);
      setMessage("Datos enviados para revision. No se han almacenado imagenes ni registro legal completo.");
    } catch {
      setMessage("No se pudo enviar el formulario.");
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
        <section className="panel w-full p-6">
          <h1 className="font-heading text-2xl font-black">Pre-check-in de prueba</h1>
          <p className="mt-2 text-sm text-muted">{message ?? "Cargando..."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-black">Pre-check-in de prueba</h1>
            <p className="mt-2 text-sm text-muted">{session.propertyName ?? "Establecimiento"} · Reserva {session.reservationReference ?? "-"}</p>
            <p className="mt-1 text-sm text-muted">{session.checkInDate ?? "-"} - {session.checkOutDate ?? "-"}</p>
          </div>
          <span className={`status-pill ${session.status === "SUBMITTED_FOR_REVIEW" ? "is-valid" : session.status === "EXPIRED" ? "is-error" : "is-warning"}`}>{session.status}</span>
        </div>
        <div className="mt-4 rounded-lg border border-app bg-surface-elevated p-4 text-sm leading-6 text-secondary">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-accent" />
            <p>Los datos se usan solo para preparar la revision y comunicacion SES. SES sera la fuente oficial. No se almacenan imagenes de documentos ni un registro legal completo en SyncXML.</p>
          </div>
        </div>
      </section>

      <section className="mt-5 space-y-4">
        {guests.map((guest, index) => (
          <article key={`${guest.sourceRow}-${index}`} className="panel p-5">
            <h2 className="font-heading text-lg font-bold">Viajero {index + 1}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Input label="Nombre" value={guest.firstName} disabled={disabled} onChange={(value) => updateGuest(index, { firstName: value })} />
              <Input label="Primer apellido" value={guest.surname1} disabled={disabled} onChange={(value) => updateGuest(index, { surname1: value })} />
              <Input label="Segundo apellido" value={guest.surname2} disabled={disabled} onChange={(value) => updateGuest(index, { surname2: value })} />
              <Select label="Documento" value={guest.documentType} disabled={disabled} options={["NIF", "NIE", "PAS", "OTRO"]} onChange={(value) => updateGuest(index, { documentType: value })} />
              <Input label="Numero documento" value={guest.documentNumber} disabled={disabled} onChange={(value) => updateGuest(index, { documentNumber: value })} />
              <Input label="Soporte documento" value={guest.documentSupport} disabled={disabled} onChange={(value) => updateGuest(index, { documentSupport: value })} />
              <Input label="Nacimiento" type="date" value={guest.birthDate} disabled={disabled} onChange={(value) => updateGuest(index, { birthDate: value })} />
              <Input label="Nacionalidad ISO3" value={guest.nationalityIso3} disabled={disabled} onChange={(value) => updateGuest(index, { nationalityIso3: value.toUpperCase() })} />
              <Select label="Sexo" value={guest.sex} disabled={disabled} options={["H", "M", "O"]} onChange={(value) => updateGuest(index, { sex: value })} />
              <Input label="Direccion" value={guest.address} disabled={disabled} onChange={(value) => updateGuest(index, { address: value })} />
              <Input label="Municipio" value={guest.municipality} disabled={disabled} onChange={(value) => updateGuest(index, { municipality: value })} />
              <Input label="Codigo municipio INE" value={guest.municipalityCode} disabled={disabled} onChange={(value) => updateGuest(index, { municipalityCode: value })} />
              <Input label="Codigo postal" value={guest.postalCode} disabled={disabled} onChange={(value) => updateGuest(index, { postalCode: value })} />
              <Input label="Pais ISO3" value={guest.countryIso3} disabled={disabled} onChange={(value) => updateGuest(index, { countryIso3: value.toUpperCase() })} />
              <Select label="Parentesco" value={guest.relationship} disabled={disabled} options={["TI", "TU", "OT"]} onChange={(value) => updateGuest(index, { relationship: value })} />
              <Input label="Telefono" value={guest.phone} disabled={disabled} onChange={(value) => updateGuest(index, { phone: value })} />
              <Input label="Email" type="email" value={guest.email} disabled={disabled} onChange={(value) => updateGuest(index, { email: value })} />
            </div>
          </article>
        ))}
      </section>

      <section className="panel mt-5 p-5">
        <label className="checkbox-row">
          <input type="checkbox" checked={privacyAccepted} disabled={disabled} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
          Acepto el aviso de privacidad de prueba y confirmo que no subire imagenes de documentos.
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary" disabled={disabled} onClick={submit}>
            {busy ? "Enviando..." : <><CheckCircle2 className="h-4 w-4" />Enviar para revision</>}
          </button>
          {message && <p className="text-sm text-secondary">{message}</p>}
        </div>
      </section>
    </main>
  );
}

function Input({ label, value, type = "text", disabled, onChange }: { label: string; value?: string; type?: string; disabled: boolean; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-bold uppercase text-muted">{label}</span>
      <input className="input" type={type} value={value ?? ""} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, disabled, options, onChange }: { label: string; value?: string; disabled: boolean; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-bold uppercase text-muted">{label}</span>
      <select className="input" value={value ?? ""} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">Selecciona</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
