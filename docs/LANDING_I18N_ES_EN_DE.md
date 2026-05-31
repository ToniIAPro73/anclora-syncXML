# Landing i18n ES/EN/DE

Date: 2026-05-31

## Decision

The public SyncXML landing exposes only:

- `es` — Spanish, default
- `en` — English
- `de` — German

Internal app language support remains separate and can keep additional locales. The public landing must not expose `ca`, `fr`, `it` or `pt` in this phase.

## UX Pattern

The landing uses a compact Global Preferences / Language trigger:

- globe icon first;
- active short code: `ES`, `EN`, `DE`;
- compact popover with native language names;
- no theme, currency or unit controls mixed into this selector;
- visible in the landing header and independent from the app theme toggle.

## Locale Resolution

Initial locale resolution:

1. Manual landing preference in `localStorage` under `anclora-syncxml-landing-locale`.
2. Optional URL locale if explicitly supplied to the resolver.
3. Browser `navigator.languages` fallback.
4. Spanish default.

No precise geolocation is used.

## Public Surfaces Covered

- Landing header, hero, sections, footer.
- Controlled pilot request page and form.
- Cookie banner, preferences panel and floating cookie button.
- Section up/down navigator aria labels.
- Login screen copy.
- Public legal/cookies copy used from the landing namespace.

## SEO Note

The MVP uses one URL with client-side language preference. This keeps the implementation smaller and avoids premature `/es`, `/en`, `/de` routing. SEO-specific `hreflang` routes are intentionally deferred.

## Validation

Hermes Copy Curator and Anclora Locale Copy Guardian were executed against the landing i18n file/source. Both returned no findings for the active locales.
