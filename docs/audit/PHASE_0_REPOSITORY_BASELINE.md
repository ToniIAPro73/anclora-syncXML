# Phase 0 Repository Baseline

## Metadata

- Date: 2026-05-23
- Working directory: `/home/toni/projects/anclora-syncXML-phased-hardening`
- Branch: `feat/syncxml-phased-hardening`
- Base commit: `af931c86e0c6bae2174b4241adec6e70a4762272`
- Base branch detected: `main`
- Remote: `https://github.com/ToniIAPro73/anclora-syncXML.git`

## Repository Inventory

The repository is a Next.js application, not a React/Vite-only app. It still contains Vite-related files and dependencies, but the active runtime is Next.js App Router.

Relevant structure:

- `src/app`: Next.js pages and API routes.
- `src/components`: client UI components.
- `src/lib/excel`: Excel parsing.
- `src/lib/xml`: XML generation, template loading and file naming.
- `src/lib/db`: Prisma/memory reservation storage.
- `src/lib/privacy`: encryption and masking helpers.
- `src/lib/security`: runtime env and upload validation helpers.
- `prisma`: Prisma schema and migration.
- `docs`: XML template, sample Excel, privacy/responsibility documentation.
- `tests`: Vitest regression tests.

## Stack Real

- Framework: Next.js `16.2.2` with App Router.
- UI: React `19.2.6`.
- Styling: Tailwind CSS plus global CSS variables.
- Excel parsing: `xlsx`.
- XML parsing/generation: `fast-xml-parser`.
- DB ORM: Prisma `6.19.0`.
- Database provider: PostgreSQL via `DATABASE_URL`; optional and gated by `SYNCXML_ENABLE_PERSISTENT_STORAGE`.
- Blob storage: `@vercel/blob` helper exists, but no active reservation flow currently stores files through it.
- Tests: Vitest.
- Deployment target: Vercel, based on `vercel.json` and Next.js build scripts.

## Scripts Available

- `npm run dev`
- `npm run build`
- `npm run vercel-build`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run preview`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:deploy`

## Existing Tests

Current test files:

- `tests/date-format.test.ts`
- `tests/excel-parser.test.ts`
- `tests/preferences.test.ts`
- `tests/privacy-encryption.test.ts`
- `tests/responsibility-hardening.test.ts`
- `tests/smart-validation.test.ts`
- `tests/xml-filename.test.ts`
- `tests/xml-generator.test.ts`

## Baseline Command Results

| Command | Result |
|---|---|
| `npm install` | Completed. Reports 6 vulnerabilities: 1 moderate, 5 high. |
| `npm run lint` | Passed. |
| `npm run test` | Passed: 8 files, 24 tests. |
| `npm run typecheck` | Passed. |
| `npm run build` | Passed. |

## Environment Variables

Declared in `.env.example`:

- `DATABASE_URL`
- `DIRECT_URL`
- `BLOB_READ_WRITE_TOKEN`
- `SYNCXML_ENCRYPTION_KEY`
- `SYNCXML_FILE_ENCRYPTION_KEY`
- `SYNCXML_ENABLE_PERSISTENT_STORAGE`
- `SYNCXML_LOCAL_DEMO`
- `NEXT_PUBLIC_APP_URL`
- `SYNCXML_ADMIN_PASSWORD`
- `SESSION_SECRET`
- `AUTH_URL`
- `AUTH_TRUST_HOST`
- `ADMIN_EMAILS`

## Initial Risks Detected

- The expected analysis artifacts are not present in the repository:
  - `Artefacto_1_Analisis_Exhaustivo_Integrado_Anclora_SyncXML.md`
  - `docs/archive/Artefacto_2_Plan_de_Mejoras_por_Fases_Anclora_SyncXML.md`
- No XSD file is present.
- No accepted SES.HOSPEDAJES XML evidence is present.
- Persistent DB mode does not currently have an explicit `generatedXml`/`xml` column in `Reservation`; in-memory storage has XML, but persistent download cannot reliably return the XML.
- `docs/xml-plantilla.xml` contains placeholders and example values.
- Dependency audit reports unresolved vulnerabilities.
- Some validation is still split between parsing, smart validation, XML generation and API route checks; backend hardening should centralize critical validation.

## Differences Versus Prior Analysis

Prior phase documents are not available in the repository, so differences cannot be verified directly. Based on the current code, the product has already received an initial privacy/responsibility hardening pass: private mode, legal pages, masking, safe audit helpers and auth checks exist. The remaining hardening work should focus on persistence correctness, backend validation, rate limiting, timezone correctness and proof-backed XSD/SES validation.
