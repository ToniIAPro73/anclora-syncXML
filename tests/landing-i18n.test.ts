import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LANDING_LOCALE,
  LANDING_LOCALE_STORAGE_KEY,
  LANDING_LOCALES,
  getLandingDictionary,
  normalizeLandingLocale,
  resolveInitialLandingLocale,
} from "@/lib/i18n/landing";

const root = fileURLToPath(new URL("..", import.meta.url));

function landingSources(): string {
  const landingDir = `${root}/src/components/landing`;
  return [
    ...readdirSync(landingDir)
      .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
      .map((file) => readFileSync(`${landingDir}/${file}`, "utf8")),
    readFileSync(`${root}/src/lib/i18n/landing.tsx`, "utf8"),
  ].join("\n");
}

describe("landing i18n ES/EN/DE", () => {
  it("uses Spanish as default landing locale", () => {
    expect(DEFAULT_LANDING_LOCALE).toBe("es");
    expect(resolveInitialLandingLocale({})).toBe("es");
  });

  it("exposes only ES, EN and DE in the public landing toggle", () => {
    expect(LANDING_LOCALES).toEqual(["es", "en", "de"]);
    expect(normalizeLandingLocale("ca")).toBeNull();
    expect(normalizeLandingLocale("fr")).toBeNull();
    expect(normalizeLandingLocale("it")).toBeNull();
    expect(normalizeLandingLocale("pt")).toBeNull();
  });

  it("manual persisted preference wins over browser fallback", () => {
    expect(resolveInitialLandingLocale({
      persistedLocale: "de",
      browserLocales: ["en-US", "es-ES"],
    })).toBe("de");
  });

  it("browser language is only a fallback when no manual preference exists", () => {
    expect(resolveInitialLandingLocale({
      persistedLocale: null,
      browserLocales: ["de-DE", "en-US"],
    })).toBe("de");
  });

  it("keeps controlled-pilot CTA intent in every locale", () => {
    expect(getLandingDictionary("es").common.pilotCta).toBe("Solicitar piloto controlado");
    expect(getLandingDictionary("en").common.pilotCta).toBe("Request controlled pilot");
    expect(getLandingDictionary("de").common.pilotCta).toBe("Kontrollierten Pilot anfragen");
  });

  it("localizes form, footer, cookies and section navigator labels", () => {
    for (const locale of LANDING_LOCALES) {
      const copy = getLandingDictionary(locale);
      expect(copy.form.fields.email.label).toBeTruthy();
      expect(copy.footer.languageNote).toContain(locale === "de" ? "Spanisch" : locale === "en" ? "Spanish" : "español");
      expect(copy.cookies.panelTitle).toBeTruthy();
      expect(copy.aria.cookieButton).toBeTruthy();
      expect(copy.aria.previousSection).toBeTruthy();
      expect(copy.aria.nextSection).toBeTruthy();
    }
  });

  it("does not use geolocation APIs in the landing locale resolver", () => {
    const source = readFileSync(`${root}/src/lib/i18n/landing.tsx`, "utf8");
    expect(source).not.toContain("navigator.geolocation");
    expect(source).not.toContain("geolocation");
    expect(source).toContain(LANDING_LOCALE_STORAGE_KEY);
  });

  it("keeps active public locale list out of CA/FR/IT/PT", () => {
    const source = landingSources();
    expect(source).toContain("LANDING_LOCALES");
    expect(source).not.toContain('LANDING_LOCALES = ["es", "ca"');
    expect(source).not.toContain('LANDING_LOCALES = ["es", "en", "de", "fr"');
  });

  it("keeps critical pilot limits in EN and DE", () => {
    const en = getLandingDictionary("en");
    const de = getLandingDictionary("de");
    expect(en.hero.lead).toContain("synthetic or anonymized data");
    expect(en.hero.lead).toContain("No automatic submission to SES.HOSPEDAJES");
    expect(en.hero.lead).toContain("no promise of definitive legal compliance");
    expect(de.hero.lead).toContain("synthetischen oder anonymisierten Daten");
    expect(de.hero.lead).toContain("Keine automatische Übermittlung an SES.HOSPEDAJES");
    expect(de.hero.lead).toContain("keine Zusage endgültiger Rechtssicherheit");
  });
});
