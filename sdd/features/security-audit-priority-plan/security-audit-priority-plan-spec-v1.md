# Security Audit Priority Plan Spec v1

## Status

Draft for implementation on branch `fix/codex-security-audit-priority-plan`.

## Context

The July 20, 2026 technical review identified four priority areas before expanding the
controlled SyncXML pilot:

- Role-based access control for administrative, INE and SES operations.
- Reservation ownership and production persistence behavior.
- Global security headers and public error hardening.
- Dependency and verification baseline, especially around XLSX parsing risk.

## Goals

- Ensure pilot users can only operate their own pilot workflow.
- Ensure admin-only and SES production actions fail closed unless explicitly authorized.
- Ensure persisted reservations are scoped to the authenticated user, with no cross-user
  list, read, download or delete access.
- Ensure production does not report successful persistence when database storage is not
  configured.
- Apply a viable security header baseline without breaking the App Router UI.
- Avoid exposing internal exception messages in public or sensitive API responses.
- Reduce XLSX parsing blast radius with explicit structural limits and documented audit
  exceptions for unresolved advisories.

## Non-Goals

- Do not activate real SES submissions.
- Do not copy or modify production provider secrets.
- Do not migrate real production data manually.
- Do not replace the authentication provider.
- Do not perform a full legal compliance review or penetration test.

## Acceptance Criteria

- Unauthenticated users receive `401` on protected admin/SES/reservation routes.
- Authenticated `pilot_user` sessions receive `403` on admin-only, INE and SES production
  operations.
- Admin sessions can reach admin-only routes, subject to existing business validation.
- User A cannot list, read, download or delete User B reservations.
- Reservation creation records the owner from the authenticated session, never from client
  payload.
- In production, reservation creation fails explicitly when persistent storage is required
  but unavailable.
- Memory persistence remains allowed only in development/test or explicit local demo mode.
- HTML and API responses include the configured security headers where applicable.
- Sensitive route failures return stable public error codes/messages while server logs keep
  operational detail.
- XLSX parsing rejects workbooks over configured sheet, row and column budgets.
- Final verification runs lint, typecheck, test, build and high-severity production audit.

