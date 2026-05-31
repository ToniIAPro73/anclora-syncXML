# Landing section inventory

Audit performed before touching the header. Source of truth:
`src/components/landing/navigation.ts`.

| sectionId | label ES | label EN | label DE | visible in landing | linked from header | group proposed | action needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| hero | Inicio | Home | Start | yes | no (logo/home) | — | none (top section) |
| problema | El problema | The problem | Das Problem | yes | yes | Producto | none |
| producto | La solución | The solution | Die Lösung | yes | yes | Producto | none |
| como-funciona | Cómo funciona | How it works | So funktioniert es | yes | yes | Proceso | none |
| ventajas | Ventajas actuales | Current advantages | Aktuelle Vorteile | yes | yes | Proceso | **id added** |
| estado | Estado y evolución | Status and roadmap | Status und Roadmap | yes | yes | Proceso | **id added** |
| para-quien-es | Para quién es | Who it is for | Für wen | yes | yes | Producto | none |
| acceso-piloto | Acceso piloto | Pilot access | Pilotzugang | yes | yes | Piloto | none |
| app-disponible | App disponible | App available | App verfügbar | yes | yes | Piloto | **id added** |
| seguridad | Seguridad y privacidad | Security and privacy | Sicherheit und Datenschutz | yes | yes | Confianza | none |
| limites-mvp | Límites del MVP | MVP limits | MVP-Grenzen | yes | yes | Confianza | **id added** |
| piloto | Solicitar piloto | Request pilot | Pilot anfragen | yes | yes | Piloto | none |
| legal-footer | Aviso legal | Legal notice | Impressum | yes | yes | Recursos | none |

## Findings (before)

- **Sections without a stable id (4):** AdvantagesSection, StatusSection,
  AppAvailableSection, NoPromiseSection → ids added (`ventajas`, `estado`,
  `app-disponible`, `limites-mvp`).
- **Old header (5 flat links):** Producto, Cómo funciona, Para quién es,
  Acceso piloto, Seguridad y límites. It left `problema`, `ventajas`, `estado`,
  `app-disponible`, `limites-mvp`, `piloto` and `legal-footer` without direct
  header access.
- **Broken links:** none detected (all old header links pointed to existing ids).
- **Orphan sections (no header access), before:** problema, ventajas, estado,
  app-disponible, limites-mvp, piloto, legal-footer.

## Result (after)

- Every visible section except `hero` (the top, reached via the logo) is now
  reachable from a header group.
- Header reduced to **5 grouped options** (down from 5 flat links that covered
  fewer sections).
- ids are stable and semantic; no existing id was renamed.
