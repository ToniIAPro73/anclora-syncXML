/**
 * Landing navigation model.
 *
 * Single source of truth that maps every visible landing section to a header
 * navigation group. Labels live in the i18n dictionary (`navMenu`); hrefs and
 * structure live here so tests and the header share the same map.
 *
 * Rules enforced by tests (see tests/landing-navigation.test.ts):
 *  - Maximum 5 main header groups.
 *  - Every visible section id is reachable from a header group.
 *  - Hash links only point to ids that exist in the landing.
 */

export type NavItem = {
  /** i18n key under `navMenu.items`. */
  key: string;
  /** In-page anchor (#id) or route (/path). */
  href: string;
};

export type NavGroup = {
  /** i18n key under `navMenu.groups`. */
  key: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "product",
    items: [
      { key: "problem", href: "#problema" },
      { key: "solution", href: "#producto" },
      { key: "audience", href: "#para-quien-es" },
    ],
  },
  {
    key: "process",
    items: [
      { key: "how", href: "#como-funciona" },
      { key: "advantages", href: "#ventajas" },
      { key: "status", href: "#estado" },
    ],
  },
  {
    key: "pilot",
    items: [
      { key: "access", href: "#acceso-piloto" },
      { key: "appAvailable", href: "#app-disponible" },
      { key: "request", href: "#piloto" },
    ],
  },
  {
    key: "trust",
    items: [
      { key: "security", href: "#seguridad" },
      { key: "limits", href: "#limites-mvp" },
    ],
  },
  {
    key: "resources",
    items: [
      { key: "legal", href: "#legal-footer" },
      { key: "privacy", href: "/privacy" },
      { key: "cookies", href: "/cookies" },
    ],
  },
];

/**
 * Every visible landing section, in document order. Drives the bottom-right
 * up/down section navigator and the navigation coverage tests.
 */
export const LANDING_SECTION_IDS = [
  "hero",
  "problema",
  "producto",
  "como-funciona",
  "ventajas",
  "estado",
  "para-quien-es",
  "acceso-piloto",
  "app-disponible",
  "seguridad",
  "limites-mvp",
  "piloto",
  "legal-footer",
] as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[number];
