import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LANDING_LOCALES, getLandingDictionary } from "@/lib/i18n/landing";
import { LANDING_SECTION_IDS, NAV_GROUPS } from "@/components/landing/navigation";

const root = fileURLToPath(new URL("..", import.meta.url));
const landingDir = `${root}/src/components/landing`;

function landingSource(): string {
  return readdirSync(landingDir)
    .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
    .map((file) => readFileSync(`${landingDir}/${file}`, "utf8"))
    .join("\n");
}

const source = landingSource();

/** Hash anchors the header points to (excludes route links like /privacy). */
const headerHashTargets = NAV_GROUPS.flatMap((group) =>
  group.items.filter((item) => item.href.startsWith("#")).map((item) => item.href.slice(1)),
);

describe("landing navigation — section coverage", () => {
  it("1. every visible section has a stable, rendered id", () => {
    for (const id of LANDING_SECTION_IDS) {
      expect(source, `missing id="${id}"`).toContain(`id="${id}"`);
    }
  });

  it("2. every visible section (except hero) is reachable from the header", () => {
    for (const id of LANDING_SECTION_IDS) {
      if (id === "hero") continue; // hero is the top, reached via the logo/home link
      expect(headerHashTargets, `section "${id}" has no header entry`).toContain(id);
    }
  });

  it("6. has no header links pointing to non-existent section ids", () => {
    const ids = new Set<string>(LANDING_SECTION_IDS);
    for (const target of headerHashTargets) {
      expect(ids.has(target), `header links to missing #${target}`).toBe(true);
    }
  });
});

describe("landing navigation — header structure", () => {
  it("3. shows at most 5 main groups (excluding logo, language toggle and CTA)", () => {
    expect(NAV_GROUPS.length).toBeLessThanOrEqual(5);
    expect(NAV_GROUPS.length).toBeGreaterThanOrEqual(4);
  });

  it("4. groups contain the expected sections", () => {
    const byKey = Object.fromEntries(NAV_GROUPS.map((g) => [g.key, g.items.map((i) => i.href)]));
    expect(byKey.product).toEqual(["#problema", "#producto", "#para-quien-es"]);
    expect(byKey.process).toEqual(["#como-funciona", "#ventajas", "#estado"]);
    expect(byKey.pilot).toEqual(["#acceso-piloto", "#app-disponible", "#piloto"]);
    expect(byKey.trust).toEqual(["#seguridad", "#limites-mvp"]);
    expect(byKey.resources).toEqual(["#legal-footer", "/privacy", "/cookies"]);
  });

  it("7. keeps the primary pilot CTA visible in the header", () => {
    const header = readFileSync(`${landingDir}/LandingHeader.tsx`, "utf8");
    expect(header).toContain("copy.common.pilotCta");
    expect(header).toContain("click_solicitar_piloto_controlado");
  });

  it("8. exposes the full grouped navigation in the mobile menu too", () => {
    const header = readFileSync(`${landingDir}/LandingHeader.tsx`, "utf8");
    // The mobile drawer iterates the same NAV_GROUPS map.
    const navGroupOccurrences = header.match(/NAV_GROUPS\.map/g) || [];
    expect(navGroupOccurrences.length).toBeGreaterThanOrEqual(2);
  });

  it("uses accessible dropdowns (aria-expanded / aria-controls / Escape)", () => {
    const header = readFileSync(`${landingDir}/LandingHeader.tsx`, "utf8");
    expect(header).toContain("aria-expanded");
    expect(header).toContain("aria-controls");
    expect(header).toContain('event.key === "Escape"');
  });
});

describe("landing navigation — i18n labels", () => {
  it("9. provides every group and item label in ES, EN and DE", () => {
    const groupKeys = NAV_GROUPS.map((g) => g.key);
    const itemKeys = [...new Set(NAV_GROUPS.flatMap((g) => g.items.map((i) => i.key)))];

    for (const locale of LANDING_LOCALES) {
      const menu = getLandingDictionary(locale).navMenu;
      for (const key of groupKeys) {
        expect(menu.groups[key as keyof typeof menu.groups], `group ${key} @ ${locale}`).toBeTruthy();
      }
      for (const key of itemKeys) {
        expect(menu.items[key as keyof typeof menu.items], `item ${key} @ ${locale}`).toBeTruthy();
      }
    }
  });
});

describe("section navigator — bottom-right placement", () => {
  const css = readFileSync(`${root}/src/app/globals.css`, "utf8");
  const block = css.slice(css.indexOf(".l-section-nav {"), css.indexOf(".l-section-nav button"));

  it("4/5. anchors the up/down controls to the bottom-right corner, not the center", () => {
    expect(block).toContain("position: fixed");
    expect(block).toContain("bottom:");
    expect(block).toContain("right:");
    // No vertical centering => not in the reserved central-right rail.
    expect(block).not.toContain("top: 50%");
    expect(block).not.toContain("translateY(-50%)");
  });

  it("documents the reserved central-right social rail", () => {
    const navigator = readFileSync(`${landingDir}/SectionNavigator.tsx`, "utf8");
    expect((navigator + css).toLowerCase()).toContain("social rail");
  });
});
