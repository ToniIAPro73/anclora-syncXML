# Landing navigation — implementation report

Branch: `claude/optimistic-fermi-zeWA0`

## Scope delivered

- **Part B — Full header navigation** with grouped dropdowns (max 5 groups).
- **Part C — Up/down controls** moved to the bottom-right; central-right rail
  reserved for a future social rail (not implemented).
- **Part D — i18n** ES/EN/DE for all new navigation labels.

## Files changed

- `src/components/landing/navigation.ts` — **new.** `NAV_GROUPS` +
  `LANDING_SECTION_IDS` (single source of truth).
- `src/components/landing/LandingHeader.tsx` — rewritten as 5 accessible
  dropdown groups (click/keyboard, Escape, outside-click, `aria-expanded`,
  `aria-controls`) + full grouped mobile drawer.
- `src/components/landing/SectionNavigator.tsx` — traverses all sections via
  `LANDING_SECTION_IDS`; documents the reserved central-right rail.
- `src/components/landing/AdvantagesSection.tsx` → `id="ventajas"`.
- `src/components/landing/StatusSection.tsx` → `id="estado"`.
- `src/components/landing/AppAvailableSection.tsx` → `id="app-disponible"`.
- `src/components/landing/NoPromiseSection.tsx` → `id="limites-mvp"`.
- `src/lib/i18n/landing.tsx` — `navMenu` (groups + items) in ES/EN/DE + type.
- `src/app/globals.css` — header dropdown styles, `scroll-margin-top` for
  `section[id]`/`footer[id]`, `.l-section-nav` repositioned to bottom-right.
- `tests/landing-navigation.test.ts` — **new.**

## Header grouping

| Group | Items |
| --- | --- |
| Producto | El problema, La solución, Para quién es |
| Proceso | Cómo funciona, Ventajas actuales, Estado y evolución |
| Piloto | Acceso piloto, App disponible, Solicitar piloto |
| Confianza | Seguridad y privacidad, Límites del MVP |
| Recursos | Aviso legal, Privacidad, Cookies |

Main options: **5**. Logo, language toggle and the primary CTA
(`Solicitar piloto controlado`) are independent and not counted.

## Up/down navigator

- Old: `position: fixed; right; top: 50%; translateY(-50%)` (center-right).
- New: `position: fixed; right: clamp(...); bottom: calc(1.5rem + safe-area)`
  (bottom-right), mobile offset honoring `env(safe-area-inset-bottom)`.
- Behaviour preserved: only-down on hero, up+down intermediate, only-up on last.

## Validation

- `npm run typecheck` → pass
- `npm run lint` → pass
- `npm run test` → 22 files / 161 tests pass (incl. new navigation tests)
- `npm run build` → compiled successfully

## Notes / risks

- `hero` has no dedicated header entry by design (top section, reached via the
  logo/home link). All other 12 sections are reachable from the header.
- The social rail is reserved only; no icons added.
