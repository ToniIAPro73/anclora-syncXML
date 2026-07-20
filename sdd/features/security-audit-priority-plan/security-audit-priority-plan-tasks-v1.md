# Security Audit Priority Plan Tasks v1

## Tasks

1. RBAC and SES production guard
   - Add role-aware auth helpers.
   - Protect admin, INE and SES operations.
   - Add unauthenticated, pilot and admin authorization tests.

2. Reservation ownership and persistence
   - Add owner fields to Prisma reservation model and migration.
   - Propagate session owner into reservation creation.
   - Scope list/get/delete/download by owner.
   - Add cross-user isolation tests.
   - Make production persistence fail closed.

3. Security headers and safe errors
   - Add global security headers.
   - Add public error response helper.
   - Replace internal message exposure in SES/cron/INE routes.
   - Add header and safe-error tests.

4. Dependency and verification baseline
   - Add XLSX structural parser limits.
   - Add tests for parser budget rejection.
   - Document `xlsx` audit exception and mitigations.
   - Address or document Next workspace root warning.
   - Add practical verification baseline without oversized new infrastructure.

5. Closeout
   - Run required checks.
   - Run `git diff --check HEAD`.
   - Store Memanto closeout.
   - Commit and push branch when checks pass.

