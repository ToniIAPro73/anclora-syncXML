"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AncloraAuthCard } from "@/components/auth/AncloraAuthCard";

export function AdminLoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setAuthenticated(Boolean(data.authenticated && data.user?.role === "admin"));
      })
      .catch(() => active && setAuthenticated(false))
      .finally(() => active && setChecking(false));
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
        const response = await fetch("/api/auth/admin-login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          setError(response.status === 503
            ? "La configuración de acceso administrador no está disponible."
            : "Credenciales de administrador no válidas.");
          return;
        }
        window.dispatchEvent(new CustomEvent("syncxml:auth-changed"));
        router.push("/app");
      } catch {
        setError("No se pudo completar el acceso. Inténtalo de nuevo.");
      } finally {
        setBusy(false);
      }
    },
    [email, password, router],
  );

  return (
    <main className="auth-screen-bg flex min-h-[100svh] flex-col items-center justify-center px-4 py-3">
      <div className="w-full max-w-[460px]">
        <AncloraAuthCard
          mode="admin"
          title="Acceso a la aplicación"
          badge="ADMINISTRADOR"
          description="Entrada privada para administrar Anclora SyncXML y continuar pruebas internas."
          footer={
            <p>
              URL no publicada en la landing. Usa únicamente credenciales internas autorizadas.
            </p>
          }
        >
          {authenticated ? (
            <div className="flex flex-col gap-3">
              <div className="auth-card-status" role="status">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <p>Sesión de administrador activa.</p>
              </div>
              <button type="button" className="btn-primary auth-card-action" onClick={() => router.push("/app")}>
                Continuar a la aplicación
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={login}>
              <label className="auth-card-field-label">
                Email administrador
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="antonio@anclora.com"
                  autoComplete="username"
                  disabled={checking}
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
                  disabled={checking}
                  aria-required="true"
                />
              </label>
              {error ? <p className="auth-card-error" role="alert">{error}</p> : null}
              <button
                type="submit"
                className="btn-primary auth-card-action"
                disabled={busy || checking || !email || !password}
              >
                {busy ? "Validando..." : "Entrar como administrador"}
              </button>
            </form>
          )}
        </AncloraAuthCard>
      </div>
    </main>
  );
}
