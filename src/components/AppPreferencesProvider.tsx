"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppLanguage, AppTheme } from "@/lib/domain";
import { dictionaries, type Dictionary } from "@/lib/i18n";
import { resolveInitialLocale } from "@/lib/anclora-language-toggle";
import { DEFAULT_LANGUAGE, DEFAULT_THEME, normalizeLanguage, normalizeTheme, PREFERENCE_COOKIE_NAMES } from "@/lib/preferences";

type PreferencesContextValue = {
  theme: AppTheme;
  language: AppLanguage;
  dictionary: Dictionary;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (language: AppLanguage) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function applyTheme(theme: AppTheme) {
  const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("light", resolved === "light");
  document.documentElement.classList.toggle("dark", resolved !== "light");
}

function persist(name: string, value: string) {
  localStorage.setItem(name, value);
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(DEFAULT_THEME);
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const storedTheme = normalizeTheme(localStorage.getItem(PREFERENCE_COOKIE_NAMES.theme));
    const publicLandingPaths = ["/", "/login", "/admin/login", "/piloto", "/cookies", "/privacy", "/terms", "/legal"];
    const landingLanguage = publicLandingPaths.includes(window.location.pathname)
      ? localStorage.getItem("anclora-syncxml-landing-locale")
      : null;
    const storedLanguage = resolveInitialLocale({
      urlLocale: searchParams.get("lang") || searchParams.get("locale"),
      persistedLocale: landingLanguage || localStorage.getItem(PREFERENCE_COOKIE_NAMES.language),
      browserLocales: navigator.languages?.length ? navigator.languages : [navigator.language],
    });
    setThemeState(storedTheme);
    setLanguageState(storedLanguage);
    document.documentElement.lang = storedLanguage;
    applyTheme(storedTheme);
  }, []);

  return (
    <PreferencesContext.Provider
      value={useMemo(() => ({
        theme,
        language,
        dictionary: dictionaries[language],
        setTheme(next) {
          const value = normalizeTheme(next);
          setThemeState(value);
          persist(PREFERENCE_COOKIE_NAMES.theme, value);
          applyTheme(value);
        },
        setLanguage(next) {
          const value = normalizeLanguage(next);
          setLanguageState(value);
          persist(PREFERENCE_COOKIE_NAMES.language, value);
          document.documentElement.lang = value;
        },
      }), [theme, language])}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used within AppPreferencesProvider");
  return context;
}
