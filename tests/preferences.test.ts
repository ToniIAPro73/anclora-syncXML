import { describe, expect, it } from "vitest";
import { DEFAULT_LANGUAGE, DEFAULT_THEME, normalizeLanguage, normalizeTheme } from "@/lib/preferences";
import { dictionaries } from "@/lib/i18n";
import {
  ACTIVE_APP_LOCALES,
  ANCLORA_LOCALE_META,
  getLanguageToggleMode,
  PREMIUM_LOCALES,
  resolveInitialLocale,
} from "@/lib/anclora-language-toggle";

describe("preferences and i18n", () => {
  it("uses required defaults", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(DEFAULT_LANGUAGE).toBe("es");
    expect(normalizeTheme("bad")).toBe("dark");
    expect(normalizeLanguage("bad")).toBe("es");
    expect(normalizeLanguage("en-US")).toBe("en");
    expect(normalizeLanguage("de-CH")).toBe("de");
  });

  it("keeps dictionary keys aligned", () => {
    expect(Object.keys(dictionaries.en)).toEqual(Object.keys(dictionaries.es));
    expect(Object.keys(dictionaries.de)).toEqual(Object.keys(dictionaries.es));
  });

  it("declares Premium locales while only activating complete copy", () => {
    expect(PREMIUM_LOCALES).toEqual(["es", "ca", "en", "de", "fr", "it", "pt"]);
    expect(ACTIVE_APP_LOCALES).toEqual(["es", "en", "de"]);
    expect(ANCLORA_LOCALE_META.ca.status).toBe("pending-copy");
    expect(ANCLORA_LOCALE_META.fr.status).toBe("pending-copy");
  });

  it("resolves initial locale from URL, storage and browser preferences", () => {
    expect(resolveInitialLocale({ browserLocales: ["en-US"] })).toBe("en");
    expect(resolveInitialLocale({ browserLocales: ["de-CH"] })).toBe("de");
    expect(resolveInitialLocale({ persistedLocale: "de", browserLocales: ["en-US"] })).toBe("de");
    expect(resolveInitialLocale({ urlLocale: "en", persistedLocale: "de" })).toBe("en");
    expect(resolveInitialLocale({ urlLocale: "fr-CH", persistedLocale: "ca", browserLocales: ["pt-PT"] })).toBe("es");
  });

  it("requires modal or popover for Premium language governance", () => {
    expect(getLanguageToggleMode()).toBe("modal-popover");
  });
});
