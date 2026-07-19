"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AncloraAuthCard } from "@/components/auth/AncloraAuthCard";
import { usePreferences } from "./AppPreferencesProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { dictionary: t } = usePreferences();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setAuthenticated(Boolean(data.authenticated));
        setTemporaryPassword(Boolean(data.user?.temporaryPassword));
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
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setError(
          response.status === 503
            ? process.env.NODE_ENV === "development"
              ? "Configura SYNCXML_ADMIN_PASSWORD y SESSION_SECRET para probar el login, o usa SYNCXML_LOCAL_DEMO=true para demo local sin datos reales."
              : "La configuración de acceso no está disponible. Contacta con el administrador."
            : t.accessDenied,
        );
        return;
      }
      const data = await response.json();
      setAuthenticated(true);
      setTemporaryPassword(Boolean(data.temporaryPassword));
      window.dispatchEvent(new CustomEvent("syncxml:auth-changed"));
    } catch {
      setError(t.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "No se pudo cambiar la contraseña.");
        return;
      }
      setTemporaryPassword(false);
      setSuccessMsg("Contraseña actualizada con éxito.");
    } catch {
      setError(t.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return <div className="process-message is-working">{t.processing}</div>;
  }

  if (authenticated && !temporaryPassword) return <>{children}</>;

  if (authenticated && temporaryPassword) {
    return (
      <div className="auth-gate-screen">
        <AncloraAuthCard
          mode="gate"
          title="Cambio de contraseña"
          badge="ACCIÓN REQUERIDA"
          description="Por motivos de seguridad, debes cambiar tu contraseña temporal antes de acceder a la aplicación."
        >
          <form className="flex flex-col gap-3" onSubmit={changePassword}>
            <label className="auth-card-field-label">
              Contraseña actual
              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                aria-required="true"
              />
            </label>
            <label className="auth-card-field-label">
              Nueva contraseña
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                aria-required="true"
              />
            </label>
            {error && <p className="auth-card-error" role="alert">{error}</p>}
            {successMsg && <p className="auth-card-note" role="status">{successMsg}</p>}
            <button
              className="btn-primary auth-card-action"
              type="submit"
              disabled={busy || !password || newPassword.length < 8}
            >
              {busy ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Actualizando...
                </>
              ) : (
                "Guardar nueva contraseña"
              )}
            </button>
          </form>
        </AncloraAuthCard>
      </div>
    );
  }

  return (
    <div className="auth-gate-screen">
      <AncloraAuthCard
        mode="gate"
        title="Iniciar sesión"
        badge="VALIDACIÓN CONTROLADA"
        description="Acceso reservado a participantes aprobados del piloto controlado. La participación se revisa manualmente antes de habilitar la aplicación."
        footer={
          <p>
            Al acceder aceptas los <Link href="/terms">Términos</Link> y la{" "}
            <Link href="/privacy">Política de Privacidad</Link>.
          </p>
        }
      >
        <form className="flex flex-col gap-3" onSubmit={login}>
          <label className="auth-card-field-label">
            Email autorizado
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              aria-required="true"
            />
          </label>
          <label className="auth-card-field-label">
            Contraseña
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-required="true"
            />
            <span className="auth-card-help">
              Recibirás tus credenciales individuales por correo una vez aprobada tu solicitud.
            </span>
          </label>
          {error && <p className="auth-card-error" role="alert">{error}</p>}
          <button
            className="btn-primary auth-card-action"
            type="submit"
            disabled={busy || !email || !password}
          >
            {busy ? (
              <>
                <span className="spinner" aria-hidden="true" />
                {t.processing}
              </>
            ) : (
              "Entrar a la aplicación"
            )}
          </button>
        </form>
      </AncloraAuthCard>
    </div>
  );
}
