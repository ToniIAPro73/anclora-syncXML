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
      title={copy.aria.cookieButton}
    >
      <Cookie className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
    </button>
  );
}
