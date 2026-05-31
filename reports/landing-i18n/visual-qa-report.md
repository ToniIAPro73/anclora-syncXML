# Landing i18n visual QA report

Date: 2026-05-31

## Method

Automated Playwright run against local dev server:

- URL: `http://localhost:3002`
- Browser: Chromium via Playwright from the local Anclora tooling install.
- Locales forced through `localStorage` key `anclora-syncxml-landing-locale`.

## Matrix

Viewports:

- 375px
- 768px
- 1024px
- 1440px

Locales:

- ES
- EN
- DE

## Checks

- Header renders with visible language trigger.
- Popover fits inside viewport.
- `html lang` matches active landing locale.
- Floating cookies button is present.
- Section navigator is present.
- No horizontal overflow detected.
- German copy does not overflow header/footer in the tested viewports.

## Result

12 combinations checked. Failures: 0.

Artifacts:

- `reports/landing-i18n/screenshots/qa-results.json`
- `reports/landing-i18n/screenshots/es-375.png`
- `reports/landing-i18n/screenshots/es-768.png`
- `reports/landing-i18n/screenshots/es-1024.png`
- `reports/landing-i18n/screenshots/es-1440.png`
- `reports/landing-i18n/screenshots/en-375.png`
- `reports/landing-i18n/screenshots/en-768.png`
- `reports/landing-i18n/screenshots/en-1024.png`
- `reports/landing-i18n/screenshots/en-1440.png`
- `reports/landing-i18n/screenshots/de-375.png`
- `reports/landing-i18n/screenshots/de-768.png`
- `reports/landing-i18n/screenshots/de-1024.png`
- `reports/landing-i18n/screenshots/de-1440.png`

## Notes

During QA, two issues were found and fixed:

- `html lang` was being overwritten by the app-level preferences provider.
- A closed mobile `details` menu was still measured outside the viewport.

The final run passed after those fixes.
