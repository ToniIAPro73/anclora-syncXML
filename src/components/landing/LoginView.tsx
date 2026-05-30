"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { track } from "./analytics";
import { APP_HREF, PILOT_HREF } from "./landingData";

type Phase = "checking" | "form" | "authenticated";

/**
 * Public /login view.
 *
 * Authorised users (those already approved for the controlled pilot and given
 * the access password) can sign in here and continue into /app. Everyone else
 * is steered towards requesting a controlled pilot — sign-in does NOT grant
 * access on its own. The actual credential check reuses the existing auth API
 * (fail-closed) so no parallel auth system is introduced.
 */
export function LoginView() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setPhase(data.authenticated ? "authenticated" : "form");
      })
      .catch(() => active && setPhase("form"));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
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
          setError("Acceso no aprobado o credenciales no válidas.");
          return;
        }
        track("login_success");
        router.push(APP_HREF);
      } catch {
        setError("No se pudo completar la acción. Inténtalo de nuevo.");
      } finally {
        setBusy(false);
      }
    },
    [password, router],
  );

  return (
    <main className="l-container flex min-h-[100svh] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="l-nav-link mb-6 inline-flex items-center gap-2"
          aria-label="Volver a la landing"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a la landing
        </Link>

        <div className="l-card l-card-gold p-7">
          <span className="l-icon-tile" aria-hidden="true">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <h1 className="l-h2 mt-4 text-2xl">Iniciar sesión</h1>
          <p className="l-text mt-3 text-sm">
            Acceso reservado a participantes aprobados del piloto controlado.
            Iniciar sesión no concede acceso por sí mismo: la participación se
            revisa de forma manual antes de habilitar la aplicación.
          </p>

          {phase === "authenticated" ? (
            <div className="mt-6">
              <div className="l-notice" role="status">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <p>Tu sesión está activa. Puedes continuar a la aplicación.</p>
              </div>
              <Link
                href={APP_HREF}
                className="l-btn l-btn-primary mt-4 w-full"
                data-track="click_continue_to_app"
              >
                Continuar a la aplicación
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <form className="mt-6 flex flex-col gap-4" onSubmit={login}>
              <label className="flex flex-col gap-1.5">
                <span className="l-eyebrow">Contraseña de acceso</span>
                <input
                  className="l-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={phase === "checking"}
                />
              </label>
              {error ? (
                <p className="text-sm text-[color:var(--l-amber)]" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="l-btn l-btn-primary w-full"
                disabled={busy || phase === "checking" || !password}
              >
                {busy ? "Comprobando…" : "Iniciar sesión"}
              </button>
            </form>
          )}
        </div>

        <div className="l-card mt-4 p-5 text-center">
          <p className="l-text text-sm">
            ¿Todavía no participas en el piloto?
          </p>
          <Link
            href={PILOT_HREF}
            className="l-btn l-btn-secondary mt-3 w-full"
            data-track="click_solicitar_piloto_controlado"
          >
            Solicitar piloto controlado
          </Link>
          <p className="l-text mt-3 text-xs">
            No subas datos reales de huéspedes. La validación se realiza con
            datos sintéticos o anonimizados.
          </p>
        </div>
      </div>
    </main>
  );
}
