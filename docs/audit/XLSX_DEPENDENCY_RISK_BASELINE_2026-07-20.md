# Spreadsheet Dependency Risk Baseline — 2026-07-20

## Decision

SyncXML no longer depends on `xlsx@0.18.5`. The importer now uses `exceljs` behind the
existing `parseExcelBuffer` boundary, removing the unresolved high-severity `xlsx`
advisories from the production dependency tree.

## Mitigations

- Uploads are restricted before parsing by the existing file validation layer.
- Upload size remains bounded before workbook loading.
- Workbook parsing uses explicit structural budgets:
  - maximum 8 sheets,
  - maximum 500 rows per sheet,
  - maximum 80 columns per row.
- Parser budget violations throw `ExcelParseLimitError` and are returned to users as a
  generic corrupt/invalid file response.
- Test fixtures use synthetic data only.

## Audit Baseline

`npm audit --omit=dev --audit-level=high` is expected to pass after the `xlsx` removal.
The Next.js transitive `postcss` advisory is handled with an npm `overrides.postcss`
entry instead of `npm audit fix --force`, because npm's force path proposes downgrading
Next.js to an incompatible major version.

The `exceljs` transitive `uuid` advisory is handled with an npm `overrides.uuid` entry.
The spreadsheet importer and generator tests cover the affected read path after the
override.

## Follow-Up

Owner: Toni / SyncXML maintainers.

Review by: 2026-08-20, or earlier if parser parity issues appear in pilot fixtures.
