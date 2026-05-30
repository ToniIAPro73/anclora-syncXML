"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  ANCLORA_LOCALE_META,
  PREMIUM_LOCALES,
  type ActiveAncloraLocale,
} from "@/lib/anclora-language-toggle";
import { usePreferences } from "@/components/AppPreferencesProvider";

/**
 * Compact language selector for the public landing.
 *
 * Reuses the global preferences context (the same system as the app) so the
 * chosen language persists and carries into /app. It lists the same languages
 * the app exposes; languages still marked as "pending" are shown but disabled,
 * mirroring the in-app LanguageToggle.
 *
 * NOTE: the landing copy itself is authored in Spanish. Switching language sets
 * the app-wide preference (used by /app, /privacy, /terms) without introducing
 * partial/inconsistent landing translations.
 */
export function LandingLanguageToggle({ align = "right" }: { align?: "left" | "right" }) {
  const { language, setLanguage } = usePreferences();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = ANCLORA_LOCALE_META[language];

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="l-lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${selected.nativeName}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase">{language}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ul
          className={`l-lang-menu ${align === "left" ? "left-0" : "right-0"}`}
          role="listbox"
          aria-label="Seleccionar idioma"
        >
          {PREMIUM_LOCALES.map((code) => {
            const meta = ANCLORA_LOCALE_META[code];
            const active = meta.status === "active";
            const isSelected = language === code;
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={!active}
                  className={`l-lang-option${isSelected ? " is-active" : ""}`}
                  onClick={() => {
                    if (!active) return;
                    setLanguage(code as ActiveAncloraLocale);
                    setOpen(false);
                  }}
                >
                  <span>
                    {meta.nativeName}
                    {active ? "" : " · próximamente"}
                  </span>
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
