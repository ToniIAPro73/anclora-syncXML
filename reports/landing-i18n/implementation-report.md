# Landing i18n ES/EN/DE implementation report

Date: 2026-05-31

## Contracts read

- `/mnt/c/Users/antonio.ballesterosa/Desktop/Proyectos/Boveda-Anclora/README.md`
- `contracts/components/ANCLORA_GLOBAL_PREFERENCES_TOGGLE_CONTRACT.md`
- `contracts/components/ANCLORA_LANGUAGE_TOGGLE_CONTRACT.md`
- `contracts/logic/LOCALIZATION_CONTRACT.md`
- `playbooks/ANCLORA_GLOBAL_PREFERENCES_TOGGLE_PLAYBOOK.md`
- `playbooks/ANCLORA_LANGUAGE_TOGGLE_PLAYBOOK.md`
- `playbooks/ANCLORA_LOCALE_COPY_GUARDIAN_PLAYBOOK.md`
- `.agent/skills/anclora-global-preferences-toggle-guardian/SKILL.md`
- `.agent/skills/anclora-language-toggle-guardian/SKILL.md`

`.agent/skills/anclora-locale-copy-guardian/SKILL.md` was requested by the prompt but does not exist in the Bóveda path. The equivalent governing source used was `playbooks/ANCLORA_LOCALE_COPY_GUARDIAN_PLAYBOOK.md`.

## Pattern applied

- Compact language/global preference trigger with globe icon.
- Popover with only active public landing locales.
- Theme remains separate in the internal app shell.
- No currency or unit controls were added because the landing does not expose monetary values or measurement systems.

## Active locales

- `es`
- `en`
- `de`

Not exposed in landing: `ca`, `fr`, `it`, `pt`.

## Files modified

- `src/lib/i18n/landing.tsx`
- `src/components/landing/LanguageToggle.tsx`
- `src/components/landing/LandingExperience.tsx`
- `src/components/landing/*`
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/piloto/page.tsx`
- `src/app/cookies/page.tsx`
- `src/components/LegalPage.tsx`
- `src/components/AppPreferencesProvider.tsx`
- `src/components/AppShell.tsx`
- `src/app/globals.css`
- `tests/landing-i18n.test.ts`
- `tests/landing-access-model.test.ts`

## Persistence and initial resolution

Manual user choice is stored in `localStorage` as `anclora-syncxml-landing-locale` and wins over browser fallback. Browser language is used only when no manual landing preference exists. Spanish remains the default.

## Hermes / Locale Guardian

- `npm run hermes:copy-curator -- --repo ../anclora-syncXML --path ../anclora-syncXML/src/lib/i18n/landing.tsx --mode file`
- `npm run anclora:copy-audit -- --path ../anclora-syncXML/src --mode audit`

Both commands completed. Findings: 0.

## Tests

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run test -- tests/landing-i18n.test.ts tests/landing-access-model.test.ts tests/cookie-consent.test.ts`: passed, 27 tests.
- `npm run test`: passed, 20 files / 136 tests.
- `npm run build`: passed.

## QA visual

Automated Playwright screenshots were captured for:

- 375px
- 768px
- 1024px
- 1440px

Across:

- ES
- EN
- DE

Result: 12 checks passed, 0 failures. Artifacts are in `reports/landing-i18n/screenshots/`.

## Pending risks

- SEO remains single-URL/client-side for MVP; localized routes and `hreflang` are deferred.
- Legal copy is suitable for controlled validation but should still receive formal legal review before production with real guest data.
- Full app internal i18n remains separate and was not reduced to ES/EN/DE.
