"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe2 } from "lucide-react";
import { LANDING_LOCALE_META, LANDING_LOCALES, type LandingLocale, useLandingI18n } from "@/lib/i18n/landing";

export function LanguageToggle() {
  const { locale, setLocale, copy } = useLandingI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = LANDING_LOCALE_META[locale];

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function select(nextLocale: LandingLocale) {
    setLocale(nextLocale);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="l-language-toggle">
      <button
        type="button"
        className="l-language-trigger"
        aria-label={`${copy.aria.languageTrigger}. ${copy.aria.currentLanguage}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 className="h-4 w-4" aria-hidden="true" />
        <span>{active.short}</span>
      </button>

      {open ? (
        <div className="l-language-popover" role="listbox" aria-label={copy.aria.languageExpanded}>
          {LANDING_LOCALES.map((option) => {
            const meta = LANDING_LOCALE_META[option];
            const selected = option === locale;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={copy.aria.selectLanguage[option]}
                className={`l-language-option${selected ? " is-active" : ""}`}
                onClick={() => select(option)}
              >
                <span className="font-bold">{meta.short}</span>
                <span>{meta.nativeName}</span>
                {selected ? <Check className="ml-auto h-4 w-4" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
