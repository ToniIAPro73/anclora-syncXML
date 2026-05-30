"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { AncloraAuthCard } from "@/components/auth/AncloraAuthCard";
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
  const [logoutBusy, setLogoutBusy] = useState(false);
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
          setError(
            response.status === 503
              ? process.env.NODE_ENV === "development"
                ? "Configura SYNCXML_ADMIN_PASSWORD y SESSION_SECRET para probar el login, o usa SYNCXML_LOCAL_DEMO=true para demo local sin datos reales."
                : "La configuración de acceso no está disponible. Contacta con el administrador."
              : "Acceso no aprobado o credenciales no válidas.",
          );
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

  const logout = useCallback(async () => {
    setLogoutBusy(true);
    setError(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setPassword("");
      setPhase("form");
      track("logout_success");
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setLogoutBusy(false);
    }
  }, []);

  return (
    <main className="auth-screen-bg flex min-h-[100svh] flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-[460px]">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 rounded-full px-1 text-sm font-bold text-muted hover:text-premium"
          aria-label="Volver a la landing"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a la landing
        </Link>

        <AncloraAuthCard
          mode={phase === "authenticated" ? "authenticated" : "login"}
          title="Iniciar sesión"
          badge="PILOTO CONTROLADO"
          description="Acceso reservado a participantes aprobados del piloto controlado. Iniciar sesión no concede acceso por sí mismo: la participación se revisa manualmente antes de habilitar la aplicación."
          footer={
            <p>
              Al acceder aceptas los{" "}
              <Link href="/terms">Términos</Link> y la{" "}
              <Link href="/privacy">Política de Privacidad</Link>.
            </p>
          }
        >
          {phase === "authenticated" ? (
            <div className="flex flex-col gap-3">
              <div className="auth-card-status" role="status">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <p>Tu sesión está activa.</p>
              </div>
              <Link
                href={APP_HREF}
                className="btn-primary auth-card-action"
                data-track="click_continue_to_app"
              >
                Continuar a la aplicación
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn-secondary auth-card-action"
                onClick={logout}
                disabled={logoutBusy}
              >
                {logoutBusy ? "Cerrando sesión…" : "Cerrar sesión"}
              </button>
              <Link className="auth-card-note text-center font-bold" href="/">
                Volver a la landing
              </Link>
            </div>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={login}>
              <label className="auth-card-field-label">
                Clave de acceso al piloto
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={phase === "checking"}
                  aria-required="true"
                />
                <span className="auth-card-help">
                  Recibirás la clave de acceso al piloto por correo una vez
                  aprobada tu solicitud. Es una clave compartida del piloto, no
                  una cuenta personal.
                </span>
              </label>
              {error ? (
                <p className="auth-card-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="btn-primary auth-card-action"
                disabled={busy || phase === "checking" || !password}
              >
                {busy ? "Comprobando…" : "Entrar a la aplicación"}
              </button>
            </form>
          )}

          <div className="auth-card-pilot-box">
            <p className="text-sm font-bold text-premium">
              ¿Todavía no participas en el piloto?
            </p>
            <Link
              href={PILOT_HREF}
              className="btn-secondary auth-card-action mt-3"
              data-track="click_solicitar_piloto_controlado"
            >
              Solicitar piloto controlado
            </Link>
            <p className="auth-card-note mt-3">
              No subas datos reales de huéspedes. La validación se realiza con
              datos sintéticos o anonimizados.
            </p>
          </div>
        </AncloraAuthCard>
      </div>
    </main>
  );
}
