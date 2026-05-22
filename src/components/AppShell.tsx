"use client";

import Link from "next/link";
import { AppLogo } from "./AppLogo";
import { AuthGate } from "./AuthGate";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { usePreferences } from "./AppPreferencesProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { dictionary: t } = usePreferences();
  return (
    <div className="min-h-screen bg-app text-premium">
      <header className="glass sticky top-0 z-40 border-b border-app">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/"><AppLogo /></Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="nav-link" href="/">{t.newBooking}</Link>
            <Link className="nav-link" href="/dashboard">{t.dashboard}</Link>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <AuthGate>{children}</AuthGate>
      </main>
    </div>
  );
}
