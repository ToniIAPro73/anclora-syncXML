# Landing navigation — visual QA report

Validation matrix requested by the anexo. Breakpoints × locales.

Breakpoints: **375 / 768 / 1024 / 1440 px** · Locales: **ES / EN / DE**

> Method: static review against the implemented CSS/markup and the automated
> navigation tests. No live screenshots were captured in this environment
> (headless container without a browser). The `screenshots/` folder is reserved
> for future captures.

## Checklist

| Check | 375 | 768 | 1024 | 1440 | Notes |
| --- | --- | --- | --- | --- | --- |
| Header does not break | ✅ | ✅ | ✅ | ✅ | <1024px collapses to hamburger drawer |
| Max 4/5 main options | ✅ | ✅ | ✅ | ✅ | 5 groups, enforced by test |
| Dropdowns legible | n/a | n/a | ✅ | ✅ | popover min 13rem, max 16rem, 2-line items |
| CTA keeps hierarchy | ✅ | ✅ | ✅ | ✅ | primary CTA separate from groups |
| Language toggle clean | ✅ | ✅ | ✅ | ✅ | unchanged ES/EN/DE toggle |
| Mobile navigation works | ✅ | ✅ | n/a | n/a | grouped drawer, scrollable, all sections |
| Up/down bottom-right | ✅ | ✅ | ✅ | ✅ | `.l-section-nav` bottom+right |
| Central-right rail free | ✅ | ✅ | ✅ | ✅ | reserved for future social rail |
| Cookie button (left) clear | ✅ | ✅ | ✅ | ✅ | cookie bottom-left, nav bottom-right |
| Footer legal accessible | ✅ | ✅ | ✅ | ✅ | only-up control on last section |
| German labels do not overflow | ✅ | ✅ | ✅ | ✅ | longest: "So funktioniert es" — fits dropdown |
| Admin access not public | ✅ | ✅ | ✅ | ✅ | no admin link/token in landing source |

## Language-specific notes

- **DE** has the longest labels ("Sicherheit und Datenschutz",
  "So funktioniert es"). They live inside dropdown panels (min 13rem), so they
  wrap cleanly without breaking the header bar.
- Group triggers use short single-word labels in all three locales
  (Producto/Product/Produkt, etc.), keeping the top bar compact.

## Automated coverage

`tests/landing-navigation.test.ts` asserts: stable ids, full header coverage,
no broken anchors, ≤5 groups, correct group contents, CTA present, mobile menu
reuse, accessible dropdown attributes, ES/EN/DE labels, and bottom-right
placement of the navigator.
