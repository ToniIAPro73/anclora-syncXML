"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { usePreferences } from "./AppPreferencesProvider";
import { PILOT_HREF } from "./landing/landingData";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { dictionary: t } = usePreferences();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(t.accessDenied);
        return;
      }
      setAuthenticated(true);
    } catch {
      setError(t.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return <div className="process-message is-working">{t.processing}</div>;
  }

  if (authenticated) return <>{children}</>;

  return (
    <section className="mx-auto max-w-xl panel p-6">
      <div className="flex items-start gap-4">
        <div className="icon-tile"><LockKeyhole className="h-5 w-5" /></div>
        <div>
          <h1 className="font-heading text-2xl font-black">{t.accessTitle}</h1>
          <p className="mt-2 text-sm text-muted">{t.accessCopy}</p>
        </div>
      </div>
      <form className="mt-6 space-y-4" onSubmit={login}>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t.password}
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <button className="btn-primary w-full justify-center" type="submit" disabled={busy || !password}>
          {busy ? <><span className="spinner" aria-hidden="true" />{t.processing}</> : t.accessAction}
        </button>
      </form>
      <div className="mt-6 border-t border-app pt-5">
        <p className="text-sm text-muted">
          El acceso a Anclora SyncXML se concede tras aprobar la solicitud de
          piloto controlado. No subas datos reales de huéspedes.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="btn-secondary" href={PILOT_HREF}>Solicitar piloto controlado</Link>
          <Link className="btn-secondary" href="/">Volver a la landing</Link>
        </div>
      </div>
    </section>
  );
}
