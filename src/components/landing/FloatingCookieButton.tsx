"use client";

import { Cookie } from "lucide-react";
import { openCookiePreferences } from "@/lib/cookies/consent";
import { useLandingI18n } from "@/lib/i18n/landing";

export function FloatingCookieButton() {
  const { copy } = useLandingI18n();
  return (
    <button
      type="button"
      className="l-floating-cookie"
      onClick={() => openCookiePreferences()}
      aria-label={copy.aria.cookieButton}
    >
      <Cookie className="h-4 w-4" aria-hidden="true" />
      <span>{copy.common.cookies}</span>
    </button>
  );
}
