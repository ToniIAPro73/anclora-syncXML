# SyncXML controlled pilot implementation report

Date: 2026-05-31

## Changes

- Reoriented the public landing to controlled pilot access.
- Removed visible public login CTAs from header, hero and app availability blocks.
- Replaced diagnostic/plan CTAs with `Solicitar piloto controlado` and a discreet waitlist CTA.
- Added left floating cookie button that reopens the existing cookie preferences panel.
- Added right-side section up/down navigation with accessible labels.
- Added `/legal` and `/cookies` routes.
- Updated pilot request payload to structured controlled-pilot fields.
- Added `PilotUser` Prisma model and migration for individual email/password access.
- Added PBKDF2 password hashing helper.
- Updated `/api/auth/login` and `/api/auth/session` to support individual pilot users and roles, preserving admin fallback.
- Updated `.env.example`.

## Files touched

- `src/app/page.tsx`
- `src/app/api/pilot/request/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/legal/page.tsx`
- `src/app/cookies/page.tsx`
- `src/components/landing/*`
- `src/lib/auth.ts`
- `src/lib/password.ts`
- `src/lib/security/env.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260531000000_add_pilot_users/migration.sql`
- `.env.example`
- `tests/landing-access-model.test.ts`

## Validation

- `npm run prisma:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run test -- tests/cookie-consent.test.ts tests/landing-access-model.test.ts`: passed, 18 tests.
- `npm run build`: passed.

## Risks pending

- Real credential issuance from Nexus into SyncXML needs an operational endpoint or DB access pattern to be validated.
- Real Resend/SMTP delivery was not exercised because no secrets were used.
- Visual QA with browser screenshots was not executed in this pass.
