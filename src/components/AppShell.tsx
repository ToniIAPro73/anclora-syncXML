"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "./AppLogo";
import { AuthGate } from "./AuthGate";
import { GlobalPreferencesTrigger } from "./GlobalPreferencesTrigger";
import { ThemeToggle } from "./ThemeToggle";
import { usePreferences } from "./AppPreferencesProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { dictionary: t } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicLegalPage = pathname === "/privacy" || pathname === "/terms";

  function startNewReservation() {
    sessionStorage.removeItem("syncxml-session");
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("syncxml:new"));
    } else {
      router.push("/");
    }
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
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {isPublicLegalPage ? children : <AuthGate>{children}</AuthGate>}
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-app px-4 py-6 text-sm text-muted">
        <span>{t.appName} · {t.privateModeTitle}</span>
        <span className="flex flex-wrap gap-3"><Link href="/privacy">{t.privacy}</Link><Link href="/terms">{t.terms}</Link></span>
      </footer>
    </div>
  );
}
