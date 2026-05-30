"use client";

import { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { usePreferences } from "./AppPreferencesProvider";
import { getFeedbackCopy } from "@/lib/feedback/feedbackCopy";
import { track } from "@/components/landing/analytics";
import { PILOT_EMAIL } from "@/components/landing/landingData";

/**
 * In-app pilot feedback (FASE 9.2 during use / 9.3 at close).
 *
 * Discreet and non-blocking. Never asks for guest data; on submit it composes a
 * mailto so feedback is handled manually (no backend, no PII storage). Analytics
 * events go through the consent-gated track() shim.
 */
export function PilotFeedback({ variant }: { variant: "during" | "close" }) {
  const { language } = usePreferences();
  const c = getFeedbackCopy(language);

  if (variant === "during") return <DuringFeedback copy={c} />;
  return <CloseFeedback copy={c} />;
}

type Copy = ReturnType<typeof getFeedbackCopy>;

function DuringFeedback({ copy: c }: { copy: Copy }) {
  const [answered, setAnswered] = useState<string | null>(null);

  function answer(value: string) {
    setAnswered(value);
    track("feedback_during_use");
  }

  return (
    <section className="panel p-4" aria-label={c.duringTitle}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-sm text-secondary">{answered ? c.thanks : c.duringQuestion}</p>
        </div>
        {!answered && (
          <div className="flex flex-wrap gap-2">
            {[c.optClear, c.optPartly, c.optUnclear].map((option) => (
              <button key={option} type="button" className="tab" onClick={() => answer(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CloseFeedback({ copy: c }: { copy: Copy }) {
  const [open, setOpen] = useState(false);
  const [solved, setSolved] = useState("");
  const [value, setValue] = useState("");
  const [doubts, setDoubts] = useState("");
  const [trust, setTrust] = useState("");
  const [pay, setPay] = useState("");
  const [model, setModel] = useState("");
  const [recommend, setRecommend] = useState("");

  function buildMailto() {
    const lines = [
      c.closeTitle,
      "",
      `${c.qSolved} ${solved}`,
      `${c.qValue} ${value}`,
      `${c.qDoubts} ${doubts}`,
      `${c.qTrust} ${trust}`,
      `${c.qPay} ${pay}`,
      `${c.qModel} ${model}`,
      `${c.qRecommend} ${recommend}`,
    ];
    return `mailto:${PILOT_EMAIL}?subject=${encodeURIComponent(c.closeTitle)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    track("feedback_close_submit");
    window.location.href = buildMailto();
    setOpen(false);
  }

  if (!open) {
    return (
      <section className="panel p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-sm text-secondary">{c.closeIntro}</p>
          </div>
          <button type="button" className="btn-secondary shrink-0" onClick={() => { track("feedback_close_open"); setOpen(true); }}>
            {c.open}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel p-6" aria-label={c.closeTitle}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-heading text-xl font-black">{c.closeTitle}</h2>
        <button type="button" className="rounded-full p-1.5 text-premium hover:bg-[var(--surface-elevated)]" onClick={() => setOpen(false)} aria-label={c.dismiss}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <form className="mt-4 grid gap-4" onSubmit={submit}>
        <Field label={c.qSolved}><textarea className="input" rows={2} value={solved} onChange={(e) => setSolved(e.target.value)} /></Field>
        <Field label={c.qValue}><textarea className="input" rows={2} value={value} onChange={(e) => setValue(e.target.value)} /></Field>
        <Field label={c.qDoubts}><textarea className="input" rows={2} value={doubts} onChange={(e) => setDoubts(e.target.value)} /></Field>
        <Field label={c.qTrust}><textarea className="input" rows={2} value={trust} onChange={(e) => setTrust(e.target.value)} /></Field>

        <Field label={c.qPay}>
          <div className="flex flex-wrap gap-2">
            {[c.payYes, c.payMaybe, c.payNo].map((option) => (
              <button key={option} type="button" className={`tab ${pay === option ? "is-active" : ""}`} onClick={() => setPay(option)}>{option}</button>
            ))}
          </div>
        </Field>

        <Field label={c.qModel}>
          <div className="flex flex-wrap gap-2">
            {[c.modelOneOff, c.modelMonthly, c.modelSetup, c.modelPerBooking, c.modelTailored].map((option) => (
              <button key={option} type="button" className={`tab ${model === option ? "is-active" : ""}`} onClick={() => setModel(option)}>{option}</button>
            ))}
          </div>
        </Field>

        <Field label={c.qRecommend}>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, n) => String(n)).map((n) => (
              <button key={n} type="button" className={`tab ${recommend === n ? "is-active" : ""}`} aria-label={n} onClick={() => setRecommend(n)}>{n}</button>
            ))}
          </div>
        </Field>

        <button type="submit" className="btn-primary justify-center">
          <Send className="h-4 w-4" />{c.send}
        </button>
        <p className="text-xs text-muted">{c.privacyNote}</p>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-black uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
