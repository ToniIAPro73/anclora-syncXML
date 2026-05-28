"use client";

import { ChevronDown, Globe, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ANCLORA_LOCALE_META, PREMIUM_LOCALES, type ActiveAncloraLocale } from "@/lib/anclora-language-toggle";
import { usePreferences } from "./AppPreferencesProvider";

export function LanguageToggle() {
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
        className="premium-toggle min-h-[40px] px-2 text-xs font-black"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Global preferences"
      >
        <Globe className="h-4 w-4 text-muted" aria-hidden="true" />
        <span>{selected.nativeName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-app bg-[var(--surface)] p-3 shadow-2xl"
          role="dialog"
          aria-label="Global preferences settings"
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Settings</p>
              <h2 className="text-sm font-black text-premium">{t.language}</h2>
            </div>
            <button type="button" className="rounded-full p-1.5 text-premium hover:bg-[var(--surface-elevated)]" onClick={() => setOpen(false)} aria-label="Close preferences">
              <X className="h-4 w-4" />
            </button>
          </div>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as ActiveAncloraLocale)}
            className="w-full rounded-xl border border-app bg-[var(--surface-elevated)] px-3 py-2 text-sm font-black text-premium"
            aria-label={t.language}
          >
            {PREMIUM_LOCALES.map((locale) => {
              const meta = ANCLORA_LOCALE_META[locale];
              const active = meta.status === "active";
              return (
                <option
                  key={locale}
                  disabled={!active}
                  value={locale}
                >
                  {meta.nativeName} - {meta.englishName}{active ? "" : " - Pending"}
                </option>
              );
            })}
          </select>
          <button type="button" className="mt-3 w-full rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-black text-black" onClick={() => setOpen(false)}>
            Save and close
          </button>
        </div>
      )}
    </div>
  );
}
