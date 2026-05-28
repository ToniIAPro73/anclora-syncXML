export type AncloraLocale = "es" | "ca" | "en" | "de" | "fr" | "it" | "pt";
export type ActiveAncloraLocale = "es" | "ca" | "en" | "de" | "fr" | "it" | "pt";
export type LanguageToggleMode = "segmented" | "modal-popover";

export type AncloraLocaleMeta = {
  code: AncloraLocale;
  short: string;
  nativeName: string;
  englishName: string;
  status: "active" | "pending-copy";
};

export const PREMIUM_LOCALES: AncloraLocale[] = ["es", "ca", "en", "de", "fr", "it", "pt"];
export const ACTIVE_APP_LOCALES: ActiveAncloraLocale[] = ["es", "ca", "en", "de", "fr", "it", "pt"];
export const DEFAULT_APP_LOCALE: ActiveAncloraLocale = "es";

export const ANCLORA_LOCALE_META: Record<AncloraLocale, AncloraLocaleMeta> = {
  es: { code: "es", short: "ES", nativeName: "Español", englishName: "Spanish", status: "active" },
  ca: { code: "ca", short: "CA", nativeName: "Català", englishName: "Catalan", status: "active" },
  en: { code: "en", short: "EN", nativeName: "English", englishName: "English", status: "active" },
  de: { code: "de", short: "DE", nativeName: "Deutsch", englishName: "German", status: "active" },
  fr: { code: "fr", short: "FR", nativeName: "Français", englishName: "French", status: "active" },
  it: { code: "it", short: "IT", nativeName: "Italiano", englishName: "Italian", status: "active" },
  pt: { code: "pt", short: "PT", nativeName: "Português", englishName: "Portuguese", status: "active" },
};

export function isPremiumLocale(value: unknown): value is AncloraLocale {
  return typeof value === "string" && (PREMIUM_LOCALES as string[]).includes(normalizeLocaleCode(value));
}

export function isActiveAppLocale(value: unknown): value is ActiveAncloraLocale {
  return typeof value === "string" && (ACTIVE_APP_LOCALES as string[]).includes(normalizeLocaleCode(value));
}

export function normalizeLocaleCode(value: string): string {
  return value.trim().toLowerCase().split(/[-_]/)[0] || "";
}

export function normalizeActiveLocale(value: unknown): ActiveAncloraLocale {
  if (typeof value !== "string") return DEFAULT_APP_LOCALE;
  const base = normalizeLocaleCode(value);
  return isActiveAppLocale(base) ? base : DEFAULT_APP_LOCALE;
}

export function resolveInitialLocale(input: {
  urlLocale?: string | null;
  persistedLocale?: string | null;
  browserLocales?: readonly string[];
}): ActiveAncloraLocale {
  const urlLocale = typeof input.urlLocale === "string" ? normalizeLocaleCode(input.urlLocale) : null;
  if (urlLocale && isActiveAppLocale(urlLocale)) return urlLocale;

  const persistedLocale = typeof input.persistedLocale === "string" ? normalizeLocaleCode(input.persistedLocale) : null;
  if (persistedLocale && isActiveAppLocale(persistedLocale)) return persistedLocale;

  for (const browserLocale of input.browserLocales || []) {
    const locale = normalizeLocaleCode(browserLocale);
    if (isActiveAppLocale(locale)) return locale;
  }

  return DEFAULT_APP_LOCALE;
}

export function getLanguageToggleMode(): LanguageToggleMode {
  return "modal-popover";
}
