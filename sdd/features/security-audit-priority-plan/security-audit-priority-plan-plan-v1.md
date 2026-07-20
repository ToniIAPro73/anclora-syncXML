# Security Audit Priority Plan Implementation Plan v1

## Approach

Implement the review plans in small, testable layers:

1. Extend existing session helpers with role-aware authorization.
2. Apply role guards to admin, INE and SES routes.
3. Add reservation owner fields and propagate the authenticated user through repository
   calls.
4. Change production persistence behavior to fail closed.
5. Configure HTTP security headers and a shared public error helper.
6. Add XLSX parser budgets and dependency/audit documentation.
7. Run the full verification suite and push the feature branch only if checks pass.

## Data Model

Reservation ownership should use the stable authenticated session identifier, not email.
Admin global access is explicit and should not be inferred by omission of an owner filter.

## Authorization Policy

- `pilot_user`: may access the application workflow for their own data.
- `admin`: may access admin-only endpoints and operational SES routes.
- Missing/invalid session: `401`.
- Valid session without required role: `403`.
- Cross-owner resource access: `404`.

## Persistence Policy

- Production requires configured persistent storage for reservation creation.
- Development/test may keep memory fallback.
- Explicit local demo mode may keep memory fallback if it already exists in the repo.

## Error Policy

Public API responses use stable codes and generic messages. Internal details stay in
server-side logs and must not include secrets or personal data.

## Verification Plan

- Targeted tests after each layer.
- Full required commands at the end:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `npm audit --omit=dev --audit-level=high`

