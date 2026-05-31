"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2, X } from "lucide-react";
import { LANDING_LOCALE_META, LANDING_LOCALES, type LandingLocale, useLandingI18n } from "@/lib/i18n/landing";

/**
 * Language selector following the Anclora vault contract
 * (LanguageTrigger + LanguagePopover + LanguageOptionList + SaveAndClose):
 *  - compact trigger showing the current language (globe + native name + chevron),
 *  - a dialog popover with eyebrow ("Ajustes") + title ("Idioma") + close,
 *  - a language selector,
 *  - a "Guardar y cerrar" action.
 * Selection applies immediately; Save just closes. Closes on Escape / outside click.
 */
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

  return (
    <div ref={rootRef} className="l-language-toggle">
      <button
        type="button"
        className="l-language-trigger"
        aria-label={`${copy.aria.languageTrigger}. ${copy.aria.currentLanguage}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 className="h-4 w-4" aria-hidden="true" />
        <span>{active.nativeName}</span>
        <ChevronDown className="l-language-caret h-3.5 w-3.5" data-open={open} aria-hidden="true" />
      </button>

      {open ? (
        <div className="l-language-popover" role="dialog" aria-label={copy.aria.languageExpanded}>
          <div className="l-language-head">
            <div>
              <p className="l-language-eyebrow">{copy.langToggle.eyebrow}</p>
              <h2 className="l-language-title">{copy.langToggle.title}</h2>
            </div>
            <button
              type="button"
              className="l-language-close"
              onClick={() => setOpen(false)}
              aria-label={copy.aria.close}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <select
            className="l-language-select"
            value={locale}
            onChange={(event) => setLocale(event.target.value as LandingLocale)}
            aria-label={copy.langToggle.title}
          >
            {LANDING_LOCALES.map((option) => {
              const meta = LANDING_LOCALE_META[option];
              return (
                <option key={option} value={option}>
                  {meta.nativeName} - {meta.englishName}
                </option>
              );
            })}
          </select>

          <button
            type="button"
            className="l-btn l-btn-primary l-language-save"
            onClick={() => setOpen(false)}
          >
            {copy.langToggle.save}
          </button>
        </div>
      ) : null}
    </div>
  );
}
