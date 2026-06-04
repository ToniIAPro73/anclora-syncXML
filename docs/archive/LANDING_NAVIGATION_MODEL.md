# Landing Navigation Model

## Section inventory

Every visible landing section, in document order, now has a stable, semantic
`id`. Source of truth: `src/components/landing/navigation.ts`
(`LANDING_SECTION_IDS`).

| # | Section id | Component | Header group |
| --- | --- | --- | --- |
| 1 | `hero` | `HeroSection` | — (top, reached via logo/home) |
| 2 | `problema` | `ProblemSection` | Producto |
| 3 | `producto` | `SolutionSection` | Producto |
| 4 | `como-funciona` | `WorkflowSection` | Proceso |
| 5 | `ventajas` | `AdvantagesSection` | Proceso |
| 6 | `estado` | `StatusSection` | Proceso |
| 7 | `para-quien-es` | `AudienceSection` | Producto |
| 8 | `acceso-piloto` | `AccessSection` | Piloto |
| 9 | `app-disponible` | `AppAvailableSection` | Piloto |
| 10 | `seguridad` | `PrivacyTrustSection` | Confianza |
| 11 | `limites-mvp` | `NoPromiseSection` | Confianza |
| 12 | `piloto` | `FinalCTA` | Piloto (Solicitar piloto) |
| 13 | `legal-footer` | `LandingFooter` | Recursos |

`ventajas`, `estado`, `app-disponible` and `limites-mvp` are the four ids added
by this change. Pre-existing ids were not renamed (they are referenced by the
section navigator, anchors and tests).

## Header grouping (final)

Maximum **5** main groups, each a click/keyboard accessible dropdown. Logo,
language toggle and the primary CTA are **not** counted as nav options.

```
Logo | Producto | Proceso | Piloto | Confianza | Recursos | [🌐 ES] | CTA Solicitar piloto controlado
```

| Group | Reason | Items → anchors |
| --- | --- | --- |
| **Producto** | What it is / who it serves | El problema `#problema`, La solución `#producto`, Para quién es `#para-quien-es` |
| **Proceso** | How it works end-to-end | Cómo funciona `#como-funciona`, Ventajas actuales `#ventajas`, Estado y evolución `#estado` |
| **Piloto** | Entry point to the controlled pilot | Acceso piloto `#acceso-piloto`, App disponible `#app-disponible`, Solicitar piloto `#piloto` |
| **Confianza** | Trust, security and honest limits | Seguridad y privacidad `#seguridad`, Límites del MVP `#limites-mvp` |
| **Recursos** | Legal / utility (no FAQ section exists yet) | Aviso legal `#legal-footer`, Privacidad `/privacy`, Cookies `/cookies` |

There is no dedicated FAQ section, so the fifth slot is **Recursos** (per the
spec's fallback), grouping legal/cookies/contact-style links.

## ids used

See the table above. Ids are kebab-case and semantic. They are consumed by:

- the header dropdowns (`NAV_GROUPS` in `navigation.ts`),
- the bottom-right section navigator (`LANDING_SECTION_IDS`),
- anchor scrolling with `scroll-margin-top` (sticky-header compensation).

## Sticky header & scroll

The header is sticky (`.l-header`). To keep section titles from hiding under it,
`globals.css` applies:

```css
section[id],
footer[id] { scroll-margin-top: calc(var(--l-header-h) + 1rem); }
```

## Mobile behaviour

- One clean top line: logo + language toggle + hamburger.
- The hamburger opens a compact, scrollable drawer that lists **every** group
  with its items (same `NAV_GROUPS` map as desktop), plus the primary CTA.
- The language toggle stays separate from the nav groups.
- The drawer does not overlap the bottom-left cookie button or the bottom-right
  up/down controls.

## Relationship with the up/down navigator

The up/down section controls (`SectionNavigator`) traverse the full
`LANDING_SECTION_IDS` list in order:

- on Hero: only **down**;
- intermediate sections: **up** and **down**;
- last section (`legal-footer`): only **up**.

They were moved from the **center-right** to the **bottom-right** corner
(`.l-section-nav`), with safe-area insets on mobile.

## Reserved central-right rail (future social rail)

> The central-right rail is intentionally left empty and reserved for a future
> social rail. The section up/down controls are placed at the bottom-right to
> avoid a visual conflict with it. The social rail is **not implemented yet** —
> no social icons are added.

## Languages supported in navigation

All navigation labels (group titles, dropdown items, aria-labels) exist in
**ES / EN / DE** under `navMenu` in `src/lib/i18n/landing.tsx`. The public toggle
remains ES/EN/DE only (no CA/FR/IT/PT). Changing the language updates the header,
dropdowns and the section navigator aria-labels.

```
ES: Producto / Proceso / Piloto / Confianza / Recursos
EN: Product  / Process / Pilot  / Trust     / Resources
DE: Produkt  / Ablauf  / Pilot  / Vertrauen / Ressourcen
```
