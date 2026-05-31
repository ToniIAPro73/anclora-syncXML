"use client";

import { openCookiePreferences } from "@/lib/cookies/consent";
import { useLandingI18n } from "@/lib/i18n/landing";

/**
 * Footer control to reopen the cookie preferences panel at any time
 * (COOKIES_CONSENT_CONTRACT requires a semantic <button>, reopenable).
 */
export function CookiePreferencesButton({ className }: { className?: string }) {
  const { copy } = useLandingI18n();
  return (
    <button
      type="button"
      className={className ?? "l-nav-link"}
      onClick={() => openCookiePreferences()}
    >
      {copy.common.cookies}
    </button>
  );
}
