# Phase 1 Verification Gate

## Gate Status

Fase 1 is complete for repository-verifiable facts. It does not authorize Fase 3, Fase 5 or Fase 7 implementation because required external evidence is missing.

Allowed to advance:

- Fase 2 hardening of repository-local defects.
- Documentation/stub architecture for later XSD validation.

Blocked:

- Real XSD validation against SES.HOSPEDAJES until official XSD is provided.
- Any claim of SES acceptance until an accepted XML response/evidence is archived.
- Pre-check-in collection flows until governance/DPA/retention decisions are confirmed.
- Multiproperty/B2B scale implementation until phases 2-6 are closed.

## Confirmed Stack

| Element | Verified Result |
|---|---|
| React/Vite | React is used, Vite files exist, but Vite is not the active app runtime. |
| Next.js | Yes, App Router and API routes. |
| Prisma | Yes. |
| PostgreSQL/Neon | Supported through `DATABASE_URL`, not mandatory in default private mode. |
| Vercel Blob | Helper exists; not active in reservation creation. |
| Local/in-memory storage | Yes, default if DB absent or persistence disabled. |
| API routes | Yes. |
| Separate backend | No. |
| Frontend-only | No. |

## Current Excel to XML Flow

```text
User uploads XLSX
  -> POST /api/upload/excel
  -> validate file extension/MIME/size
  -> parseExcelBuffer()
  -> detect guest header
  -> parse rows after header into guests or metadata
  -> validateParsedExcel()
  -> UI review and optional smartValidateParsedExcel()
  -> POST /api/generate/xml
  -> read docs/xml-plantilla.xml
  -> generateHospitalityXml()
  -> XML preview
  -> POST /api/reservations
  -> createReservation()
  -> memory store by default, Prisma only if explicitly enabled
  -> GET /api/reservations/[id]/download/xml
```

## Villa Kentia Excel Audit

Evidence command:

```bash
node - <<'NODE'
const XLSX=require('xlsx');
const wb=XLSX.readFile('docs/registro_huespedes.xlsx',{cellDates:true});
...
NODE
```

Result:

- Sheet: `Sheet1`
- Total rows: 25
- Header row: 1
- Guest rows detected: 2-8
- Valid guest count: 7

Existing tests also assert:

- `parsed.guests.length === 7`
- establishment code `0000044116`
- reference `5992657522`
- check-in `2026-04-30`
- check-out `2026-05-03`
- guest count `7`
- payment type `PLATF`

## XML Template Audit

`docs/xml-plantilla.xml` contains placeholders and examples:

- `texto`
- `00000000T`
- `00000`
- `999999999`
- `correo@correo.es`
- `2026-04-09+02:00`
- `2026-04-09T11:26:27.782+02:00`
- `medioPago=texto`
- `titular=texto`

The generator replaces the primary contract and guest structures, but the placeholder detector still uses an over-broad date regex for `2026-04-09`.

## Contradictions Resolved

- The active framework is Next.js, not Vite, despite Vite files/dependencies remaining.
- Villa Kentia Excel must not be treated as a flat 24-row guest table; evidence shows 7 guests and lower metadata.
- Default operation is a transformation/session tool with private no-storage behavior, not a durable system of record.
- Persistent DB mode is optional and currently not sufficient for production download of XML without schema/code changes.

## Uncertainty Table

| Element | Type | Source of truth | State | Action of closure | Blocks phase |
|---|---|---|---|---|---|
| Stack real | Technical | Code, package scripts | RESOLVED | Next.js App Router documented. | No |
| Villa Kentia data flow | Technical | `docs/registro_huespedes.xlsx`, parser tests | RESOLVED | 7 guests confirmed. | No |
| Origin of Excel | External | Villa Kentia/property owner | NO BLOQUEANTE | Ask source/export workflow. | No |
| Lodgify as central source | Product/external | Owner/PMS evidence | HIPOTESIS | Ask whether Lodgify is source of truth. | Yes for importer roadmap |
| Accepted SES XML | External/technical | SES acceptance receipt/XML | BLOQUEANTE | Request accepted XML sample or rejection report. | Yes for official compliance claims |
| Official XSD | External/technical | SES.HOSPEDAJES official schema | BLOQUEANTE | Request/archive official XSD. | Yes for Fase 3 real validation |
| Sanction amount | Legal | Official regulation/legal advice | HIPOTESIS | Verify with legal source. | Yes for legal copy |
| Annual booking volume | Business | Villa Kentia owner | NO BLOQUEANTE | Ask annual reservation volume. | No |
| Desired storage policy | Governance | Controller decision | BLOQUEANTE for persistence | Ask transformation-only vs record system. | Yes for persistent production |
| Product role | Governance/product | Anclora/Villa Kentia decision | NO BLOQUEANTE for Fase 2, BLOQUEANTE for Fase 6 | Decide transformation layer vs system of record. | Yes for governance scale |

## Questions for Villa Kentia

1. Is `registro_huespedes.xlsx` exported manually, from Lodgify, from another PMS, or assembled by hand?
2. Is Lodgify the source of truth for bookings and guest data?
3. Do you have an XML file accepted by SES.HOSPEDAJES for Villa Kentia?
4. Do you have the official XSD/schema currently required by SES.HOSPEDAJES?
5. Should Anclora SyncXML be only a temporary transformation/review tool, or a system of record with legal retention?
6. If retention is required, what retention policy has the controller approved?
7. What is the approximate annual reservation volume?
8. Which fields are commonly missing from the Excel export and must be corrected before submission?

## Phase Decision

- Fase 2 may proceed because all required repository-local facts are sufficiently resolved.
- Fase 3 is blocked for real XSD validation. Only interfaces/stubs may be prepared.
- Fase 4 may proceed only after Fase 2 backend hardening stabilizes.
- Fase 5 is blocked by privacy/DPA/retention governance.
- Fase 6 can proceed as documentation/governance preparation, but operational retention decisions require controller input.
- Fase 7 is blocked until phases 1-6 are closed or explicitly scoped as roadmap only.

