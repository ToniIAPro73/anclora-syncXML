import type { AppLanguage, AppTheme } from "./domain";

export const DEFAULT_THEME: AppTheme = "dark";
export const DEFAULT_LANGUAGE: AppLanguage = "es";

export const themeModes: AppTheme[] = ["dark", "light", "system"];
export const languages: AppLanguage[] = ["es", "en", "de"];

export const PREFERENCE_COOKIE_NAMES = {
  theme: "anclora-syncxml-theme",
  language: "anclora-syncxml-language",
} as const;

export function normalizeTheme(value: unknown): AppTheme {
  return value === "light" || value === "system" ? value : DEFAULT_THEME;
}

export function normalizeLanguage(value: unknown): AppLanguage {
  return value === "en" || value === "de" ? value : DEFAULT_LANGUAGE;
}
