"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { AuthGate } from "./AuthGate";
import { GlobalPreferencesTrigger } from "./GlobalPreferencesTrigger";
import { ThemeToggle } from "./ThemeToggle";
import { usePreferences } from "./AppPreferencesProvider";

type SessionUser = {
  email: string;
  role: "admin" | "pilot_user";
  temporaryPassword?: boolean;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { dictionary: t } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isPublicLegalPage = pathname === "/privacy" || pathname === "/terms" || pathname === "/legal" || pathname === "/cookies";
  const isLandingPage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isAdminLoginPage = pathname === "/admin/login";
  const isPilotPage = pathname === "/piloto";

  function startNewReservation() {
    sessionStorage.removeItem("syncxml-session");
    if (pathname === "/app") {
      window.dispatchEvent(new CustomEvent("syncxml:new"));
    } else {
      router.push("/app");
    }
  }

  const refreshSession = useCallback(async () => {
    const response = await fetch("/api/auth/session").catch(() => null);
    if (!response?.ok) {
      setUser(null);
      return;
    }
    const data = await response.json().catch(() => null);
    setUser(data?.authenticated ? data.user : null);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    setUserMenuOpen(false);
    window.dispatchEvent(new CustomEvent("syncxml:auth-changed"));
    router.push(user?.role === "admin" ? "/admin/login" : "/login");
  }

  useEffect(() => {
    refreshSession();
    window.addEventListener("syncxml:auth-changed", refreshSession);
    return () => window.removeEventListener("syncxml:auth-changed", refreshSession);
  }, [refreshSession]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setUserMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [userMenuOpen]);

  // Public, self-rendering pages must not be wrapped in the authenticated
  // application shell.
  if (isLandingPage || isLoginPage || isAdminLoginPage || isPilotPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-app text-premium">
      <header className="glass sticky top-0 z-40 border-b border-app">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <button type="button" className="cursor-pointer" onClick={startNewReservation}><AppLogo /></button>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="nav-link" onClick={startNewReservation}>{t.newBooking}</button>
            <Link className="nav-link" href="/dashboard">{t.dashboard}</Link>
            <ThemeToggle />
            <GlobalPreferencesTrigger />
            {user ? (
              <div ref={userMenuRef} className="app-user-menu">
                <button
                  type="button"
                  className="app-user-trigger"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((value) => !value)}
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-[13rem] truncate">{user.email}</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
                {userMenuOpen ? (
                  <div className="app-user-popover" role="menu">
                    <p className="app-user-meta">{user.role === "admin" ? "Administrador" : "Piloto"}</p>
                    <button type="button" className="app-user-action" role="menuitem" onClick={logout}>
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Cerrar aplicación
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {isPublicLegalPage ? children : <AuthGate>{children}</AuthGate>}
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-app px-4 py-6 text-sm text-muted">
        <span>{t.appName} · {t.privateModeTitle}</span>
        <span className="flex flex-wrap gap-3"><Link href="/privacy">{t.privacy}</Link><Link href="/terms">{t.terms}</Link><Link href="/" aria-label="Web pública">Web pública</Link></span>
      </footer>
    </div>
  );
}
