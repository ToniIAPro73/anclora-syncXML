# SyncXML controlled pilot operational closure

Date: 2026-05-31

## 1. Initial state

The public SyncXML landing had been reoriented to controlled pilot acquisition, but the final operational handoff still needed individual pilot user provisioning, smoke scripts, environment documentation and closure evidence.

## 2. Changes applied

- Added `POST /api/internal/pilot-users` for Nexus-driven pilot user provisioning.
- Added one-time temporary password generation and hashing support.
- Added dry-run Resend smoke script for pilot acceptance email content.
- Added environment setup and local smoke documentation.
- Added endpoint-level unit coverage for pilot password generation/verification.

## 3. Resolved items

- Nexus can request creation/reactivation/rotation of a SyncXML `PilotUser` through a shared internal secret.
- The internal endpoint returns a temporary password only when credentials are newly issued or rotated.
- The endpoint rejects unauthorized calls and requires DB availability.
- Email smoke can validate recipient, login URL and credential payload without sending real email.

## 4. Still requiring secrets or external access

- `DATABASE_URL` and applied Prisma migration in the target environment.
- `SYNCXML_INTERNAL_API_SECRET` shared only with Nexus.
- `RESEND_API_KEY`, sender domain and destination allowlist for real acceptance emails.
- Production URL confirmation for `SYNCXML_APP_URL` and `SYNCXML_LOGIN_URL`.

## 5. Required variables

- `SYNCXML_INTERNAL_API_SECRET`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM` or `RESEND_FROM_EMAIL`
- `ADMIN_EMAILS`
- `SYNCXML_APP_URL`
- `SYNCXML_LOGIN_URL`

## 6. Tests executed

- `npm run lint`
- `npm run test -- tests/pilot-user-auth.test.ts tests/cookie-consent.test.ts tests/landing-access-model.test.ts`
- `npm run build`

## 7. Test results

- Lint: passed.
- Targeted Vitest suite: passed, 3 files / 20 tests.
- Production build: passed.

## 8. Smoke tests

- `scripts/smoke-resend-pilot-email.mjs` passed in dry-run mode with local URLs and admin recipient.
- Real Resend send was not executed because production secrets and a deliberate `SMOKE_EMAIL_TO` were not supplied.

## 9. Visual QA

- Static/build validation covers `/`, `/login`, `/legal`, `/cookies`, `/privacy`, `/terms` and `/piloto`.
- Browser screenshot QA procedure is documented in `visual-qa-playwright.md`.
- Full Playwright screenshot capture remains pending in a browser-configured environment.

## 10. Manual testing

- Recommended manual flow: submit pilot form, verify Nexus lead/task, approve in Nexus, confirm SyncXML user creation, log in with temporary password, confirm access role.
- Real end-to-end manual testing was not executed because it requires production/staging secrets across SyncXML, Nexus, Supabase and email.

## 11. Risks

- Password delivery depends on email transport reliability.
- Temporary password rotation policy should be reviewed before broadening the pilot.
- DB migration must be applied before enabling the Nexus approval action in production.

## 12. Commit and PR recommendation

Create one scoped PR for SyncXML with landing/access-flow work plus the operational closure endpoint and docs. Keep secrets out of the PR and configure them only in deployment environments.
