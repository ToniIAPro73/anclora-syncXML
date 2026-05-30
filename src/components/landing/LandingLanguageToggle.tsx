"use client";

import { Globe, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ANCLORA_LOCALE_META, PREMIUM_LOCALES, type ActiveAncloraLocale } from "@/lib/anclora-language-toggle";
import { usePreferences } from "../AppPreferencesProvider";

export function LandingLanguageToggle() {
  const { language, setLanguage, dictionary: t } = usePreferences();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selected = ANCLORA_LOCALE_META[language];

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        className="l-btn l-btn-ghost flex h-9 items-center gap-1.5 px-3 text-sm font-semibold"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t.language}
      >
        <Globe className="h-4 w-4 text-[color:var(--l-muted)]" aria-hidden="true" />
        <span className="text-[color:var(--l-muted)] uppercase tracking-wider text-xs">{selected.nativeName.substring(0, 3)}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 p-3 l-card"
          role="dialog"
          aria-label={t.language}
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <h2 className="text-sm font-bold text-white">{t.language}</h2>
            <button type="button" className="text-[color:var(--l-muted)] hover:text-white" onClick={() => setOpen(false)} aria-label={t.closePreferences}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {PREMIUM_LOCALES.map((locale) => {
              const meta = ANCLORA_LOCALE_META[locale];
              const active = meta.status === "active";
              const isSelected = locale === language;
              return (
                <button
                  key={locale}
                  disabled={!active}
                  onClick={() => {
                    setLanguage(locale as ActiveAncloraLocale);
                    setOpen(false);
                  }}
                  className={`text-left rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isSelected
                      ? "bg-[color:var(--l-accent)] text-black"
                      : "text-[color:var(--l-muted)] hover:bg-[color:var(--l-surface-2)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {meta.nativeName} {active ? "" : `(${t.pendingLabel})`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
