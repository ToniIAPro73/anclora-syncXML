"use client";

import { openCookiePreferences } from "@/lib/cookies/consent";

/**
 * Footer control to reopen the cookie preferences panel at any time
 * (COOKIES_CONSENT_CONTRACT requires a semantic <button>, reopenable).
 */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className ?? "l-nav-link"}
      onClick={() => openCookiePreferences()}
    >
      Cookies
    </button>
  );
}
