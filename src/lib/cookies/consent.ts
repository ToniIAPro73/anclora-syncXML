/**
 * Cookie consent store (COOKIES_CONSENT_CONTRACT).
 *
 * Dependency-free, no backend. Only real categories are modelled:
 * - necessary: session/security/language-as-session — always on, no toggle.
 * - preferences: theme/language persisted between sessions — optional.
 * - analytics: gated event layer (no tool loaded until opted in) — optional.
 *
 * Marketing is intentionally omitted: the app uses no marketing cookies, and
 * the contract forbids showing fictional categories.
 */

export type ConsentCategory = "preferences" | "analytics";

export type CookieConsent = {
  preferences: boolean;
  analytics: boolean;
  /** ISO timestamp of the decision; absent means no decision yet. */
  decidedAt?: string;
};

export const CONSENT_STORAGE_KEY = "anclora-syncxml-cookie-consent";
export const CONSENT_REOPEN_EVENT = "anclora:cookie-preferences";

export const DEFAULT_CONSENT: CookieConsent = { preferences: false, analytics: false };

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    return {
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function hasDecided(): boolean {
  return readConsent()?.decidedAt != null;
}

export function writeConsent(consent: Omit<CookieConsent, "decidedAt">): CookieConsent {
  const value: CookieConsent = { ...consent, decidedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* storage unavailable — consent simply won't persist */
    }
  }
  return value;
}

export function acceptAll(): CookieConsent {
  return writeConsent({ preferences: true, analytics: true });
}

export function rejectOptional(): CookieConsent {
  return writeConsent({ preferences: false, analytics: false });
}

/** True only when the user has explicitly opted into analytics. */
export function analyticsAllowed(): boolean {
  return readConsent()?.analytics === true;
}

/** Request the preferences panel to open (used by the footer button). */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_REOPEN_EVENT));
  }
}
