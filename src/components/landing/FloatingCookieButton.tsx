"use client";

import { Cookie } from "lucide-react";
import { openCookiePreferences } from "@/lib/cookies/consent";

export function FloatingCookieButton() {
  return (
    <button
      type="button"
      className="l-floating-cookie"
      onClick={() => openCookiePreferences()}
      aria-label="Abrir preferencias de cookies"
    >
      <Cookie className="h-4 w-4" aria-hidden="true" />
      <span>Cookies</span>
    </button>
  );
}
