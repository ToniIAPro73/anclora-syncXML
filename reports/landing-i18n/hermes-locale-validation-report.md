# Hermes locale validation report

Date: 2026-05-31

## Scope

Surface: Anclora SyncXML public landing and related public pages.

Active locales:

- `es`
- `en`
- `de`

Primary file reviewed:

- `src/lib/i18n/landing.tsx`

## Commands executed

From `/home/toni/projects/anclora-content-generator-ai`:

```bash
npm run hermes:copy-curator -- --repo ../anclora-syncXML --path ../anclora-syncXML/src/lib/i18n/landing.tsx --mode file
npm run anclora:copy-audit -- --path ../anclora-syncXML/src --mode audit
```

## Results

- Hermes Copy Curator completed in `file` mode and reported no individual findings.
- Anclora Locale Copy Guardian completed in `audit` mode with active locales `es`, `en`, `de`.
- Findings: 0.

## Claims reviewed

The EN and DE copy preserves the required pilot limits:

- controlled pilot only;
- synthetic or anonymized data;
- no automatic submission to `SES.HOSPEDAJES`;
- no definitive legal compliance guarantee;
- limited, revocable and reviewable access.

## Placeholder and UI checks

- Form labels, placeholders and option lists are localized.
- CTA intent is preserved in ES/EN/DE.
- No CA/FR/IT/PT options are exposed in the public landing toggle.
- German copy was included in visual QA to check expansion risk.

## Recommendations applied

- Kept language selector compact and separate from theme controls.
- Kept wording legally prudent in EN/DE.
- Used single-URL client preference for MVP instead of adding localized routes.

## Recommendations not applied

- `hreflang` and `/es` `/en` `/de` routes were not added. Reason: MVP scope prioritizes a simple controlled-pilot landing over SEO complexity.

## Final status

Validated for controlled-pilot landing use.
