"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import {
  acceptAll,
  CONSENT_REOPEN_EVENT,
  DEFAULT_CONSENT,
  hasDecided,
  readConsent,
  rejectOptional,
  writeConsent,
  type CookieConsent as Consent,
} from "@/lib/cookies/consent";
import { PRIVACY_HREF } from "./landingData";
import { useLandingI18n } from "@/lib/i18n/landing";

/**
 * Cookie consent banner + preferences panel (COOKIES_CONSENT_CONTRACT).
 *
 * - Banner shows on first load when no decision is stored.
 * - "Aceptar todas" and "Rechazar opcionales" have equal prominence.
 * - "Configurar" opens a panel with per-category toggles; necessary cookies are
 *   shown as always-on without an interactive toggle.
 * - Reopenable any time via the footer button (CONSENT_REOPEN_EVENT).
 * - Only real categories are shown (necessary, preferences, analytics).
 */
export function CookieConsent() {
  const { copy } = useLandingI18n();
  const [mounted, setMounted] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<Consent>(DEFAULT_CONSENT);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    setBannerOpen(!hasDecided());
    setDraft(readConsent() ?? DEFAULT_CONSENT);

    function reopen() {
      setDraft(readConsent() ?? DEFAULT_CONSENT);
      setPanelOpen(true);
    }
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPanelOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panelOpen]);

  const onAcceptAll = useCallback(() => {
    acceptAll();
    setBannerOpen(false);
    setPanelOpen(false);
  }, []);

  const onRejectOptional = useCallback(() => {
    rejectOptional();
    setBannerOpen(false);
    setPanelOpen(false);
  }, []);

  const onSavePanel = useCallback(() => {
    writeConsent({ preferences: draft.preferences, analytics: draft.analytics });
    setBannerOpen(false);
    setPanelOpen(false);
  }, [draft]);

  if (!mounted) return null;

  return (
    <>
      {bannerOpen && !panelOpen ? (
        <div className="l-cookie-banner" role="dialog" aria-label={copy.cookies.bannerLabel} aria-live="polite">
          <div className="l-cookie-banner-inner">
            <div className="flex items-start gap-3">
              <span className="l-icon-tile hidden shrink-0 sm:inline-flex" aria-hidden="true">
                <Cookie className="h-5 w-5" />
              </span>
              <p className="l-text text-sm">
                {copy.cookies.bannerText}{" "}
                <Link href={PRIVACY_HREF} className="l-gold">{copy.cookies.privacyLink}</Link>.
              </p>
            </div>
            <div className="l-cookie-actions">
              <button type="button" className="l-btn l-btn-ghost" onClick={() => setPanelOpen(true)}>
                {copy.cookies.configure}
              </button>
              <button type="button" className="l-btn l-btn-secondary" onClick={onRejectOptional}>
                {copy.cookies.reject}
              </button>
              <button type="button" className="l-btn l-btn-primary" onClick={onAcceptAll}>
                {copy.cookies.accept}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {panelOpen ? (
        <div
          className="l-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPanelOpen(false);
          }}
        >
          <div className="l-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-panel-title">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="l-icon-tile" aria-hidden="true">
                  <Cookie className="h-5 w-5" />
                </span>
                <h2 id="cookie-panel-title" className="l-h3">{copy.cookies.panelTitle}</h2>
              </div>
              <button ref={closeRef} type="button" className="l-modal-close" onClick={() => setPanelOpen(false)} aria-label={copy.aria.close}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <CategoryRow
                title={copy.cookies.necessary}
                description={copy.cookies.necessaryDesc}
                alwaysOnLabel={copy.cookies.alwaysOn}
                checked
                locked
              />
              <CategoryRow
                title={copy.cookies.preferences}
                description={copy.cookies.preferencesDesc}
                alwaysOnLabel={copy.cookies.alwaysOn}
                checked={draft.preferences}
                onChange={(value) => setDraft((d) => ({ ...d, preferences: value }))}
              />
              <CategoryRow
                title={copy.cookies.analytics}
                description={copy.cookies.analyticsDesc}
                alwaysOnLabel={copy.cookies.alwaysOn}
                checked={draft.analytics}
                onChange={(value) => setDraft((d) => ({ ...d, analytics: value }))}
              />
            </div>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row-reverse sm:items-center sm:justify-between">
              <button type="button" className="l-btn l-btn-primary w-full sm:w-auto" onClick={onSavePanel}>
                {copy.cookies.save}
              </button>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button type="button" className="l-btn l-btn-secondary w-full sm:w-auto" onClick={onRejectOptional}>
                  {copy.cookies.reject}
                </button>
                <button type="button" className="l-btn l-btn-ghost w-full sm:w-auto" onClick={onAcceptAll}>
                  {copy.cookies.accept}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  onChange,
  locked = false,
  alwaysOnLabel,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  locked?: boolean;
  alwaysOnLabel: string;
}) {
  return (
    <div className="l-card flex items-start justify-between gap-4 p-4">
      <div>
        <h3 className="l-h3 text-base">{title}</h3>
        <p className="l-text mt-1 text-sm">{description}</p>
      </div>
      {locked ? (
        <span className="l-badge shrink-0" aria-label={alwaysOnLabel}>{alwaysOnLabel}</span>
      ) : (
        <label className="l-switch shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange?.(event.target.checked)}
            aria-label={title}
          />
          <span className="l-switch-track" aria-hidden="true" />
        </label>
      )}
    </div>
  );
}
