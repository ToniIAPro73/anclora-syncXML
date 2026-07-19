"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AncloraAuthCard } from "@/components/auth/AncloraAuthCard";
import { useLandingI18n } from "@/lib/i18n/landing";
import { track } from "./analytics";
import { APP_HREF } from "./landingData";

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
  const { copy } = useLandingI18n();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [recoverBusy, setRecoverBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverMessage, setRecoverMessage] = useState<string | null>(null);

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
      setRecoverMessage(null);
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
                ? copy.login.configErrorDev
                : copy.login.configError
              : copy.login.invalid,
          );
          return;
        }
        track("login_success");
        router.push(APP_HREF);
      } catch {
      setError(copy.login.actionError);
      } finally {
        setBusy(false);
      }
    },
    [copy.login.configErrorDev, copy.login.configError, copy.login.invalid, copy.login.actionError, email, password, router],
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
      setError(copy.login.actionError);
    } finally {
      setLogoutBusy(false);
    }
  }, [copy.login.actionError]);

  const recoverPassword = useCallback(async () => {
    if (!email) return;
    setRecoverBusy(true);
    setError(null);
    setRecoverMessage(null);
    try {
      await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setRecoverMessage(copy.login.recoverSuccess);
      track("password_recovery_requested");
    } catch {
      setError(copy.login.actionError);
    } finally {
      setRecoverBusy(false);
    }
  }, [copy.login.actionError, copy.login.recoverSuccess, email]);

  return (
    <main className="auth-screen-bg flex min-h-[100svh] flex-col items-center justify-center px-4 py-3">
      <div className="w-full max-w-[460px]">
        <AncloraAuthCard
          mode={phase === "authenticated" ? "authenticated" : "login"}
          title={copy.login.title}
          badge={copy.login.badge}
          description={copy.login.description}
          footer={
            <p>
              {copy.login.footerPrefix}{" "}
              <Link href="/terms">{copy.common.terms}</Link> {copy.login.footerMiddle}{" "}
              <Link href="/privacy">{copy.trust.privacyCta}</Link>.
            </p>
          }
        >
          {phase === "authenticated" ? (
            <div className="flex flex-col gap-3">
              <div className="auth-card-status" role="status">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <p>{copy.login.active}</p>
              </div>
              <Link
                href={APP_HREF}
                className="btn-primary auth-card-action"
                data-track="click_continue_to_app"
              >
                {copy.login.continue}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn-secondary auth-card-action"
                onClick={logout}
                disabled={logoutBusy}
              >
                {logoutBusy ? copy.login.loggingOut : copy.login.logout}
              </button>
              <Link className="auth-card-note text-center font-bold" href="/">
                {copy.form.back}
              </Link>
            </div>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={login}>
              <label className="auth-card-field-label">
                {copy.login.email}
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={phase === "checking"}
                  aria-required="true"
                />
              </label>
              <label className="auth-card-field-label">
                {copy.login.password}
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
                  {copy.login.credentialHelp}
                </span>
              </label>
              {error ? (
                <p className="auth-card-error" role="alert">
                  {error}
                </p>
              ) : null}
              {recoverMessage ? (
                <p className="auth-card-note" role="status">
                  {recoverMessage}
                </p>
              ) : null}
              <button
                type="submit"
                className="btn-primary auth-card-action"
                disabled={busy || phase === "checking" || !email || !password}
              >
                {busy ? copy.login.checking : copy.login.enter}
              </button>
              <div className="auth-card-pilot-box">
                <p className="auth-card-note">{copy.login.recoverHelp}</p>
                <button
                  type="button"
                  className="btn-secondary auth-card-action mt-3"
                  onClick={recoverPassword}
                  disabled={recoverBusy || phase === "checking" || !email}
                >
                  {recoverBusy ? copy.login.recovering : copy.login.recover}
                </button>
              </div>
            </form>
          )}
        </AncloraAuthCard>
      </div>
    </main>
  );
}
