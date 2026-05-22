import { describe, expect, it } from "vitest";
import { DEFAULT_LANGUAGE, DEFAULT_THEME, normalizeLanguage, normalizeTheme } from "@/lib/preferences";
import { dictionaries } from "@/lib/i18n";

describe("preferences and i18n", () => {
  it("uses required defaults", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(DEFAULT_LANGUAGE).toBe("es");
    expect(normalizeTheme("bad")).toBe("dark");
    expect(normalizeLanguage("bad")).toBe("es");
  });

  it("keeps dictionary keys aligned", () => {
    expect(Object.keys(dictionaries.en)).toEqual(Object.keys(dictionaries.es));
    expect(Object.keys(dictionaries.de)).toEqual(Object.keys(dictionaries.es));
  });
});
