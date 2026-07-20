# Manual Refresh and Repository Cleanup Spec v1

## Goal

Update the SyncXML user manuals after the latest application changes and make the manual publication structure professional without physically deleting legacy files.

## Scope

- Treat `public/manuals/` as the canonical folder for latest published manuals.
- Keep `docs/manual/*.md` as editable manual sources.
- Generate both latest HTML previews and PDFs into `public/manuals/`.
- Leave old files in `tmp/manual-pdf/` untouched, but make clear they are temporary/non-canonical.
- Update ES, EN and DE manuals with current controlled-pilot, authentication, RBAC, reservation isolation, SES, feedback, pre-check-in and privacy/security controls.
- Add lightweight repository cleanup guardrails for local runtime artifacts.
- Refresh `README.md` so the public repository entry point has a premium, professional structure aligned with the current controlled-pilot product.

## Acceptance Criteria

- The three manuals identify their version/date as July 2026.
- The manuals avoid absolute legal/SES production claims and state controlled-pilot limits.
- The manuals document user login, temporary-password change, app logout, pilot feedback, owner-scoped reservation history, SES pre-production controls and admin-only SES submission.
- `public/manuals/` contains the latest PDF and HTML versions for ES, EN and DE.
- The generator writes latest HTML previews to `public/manuals/`.
- Local Memanto/runtime database artifacts are ignored without deleting existing files.
- `README.md` clearly explains product value, scope, controls, architecture, manuals, setup and contribution paths without overstating legal or SES production readiness.
- Standard checks are run and reported.

## Out of Scope

- No application behavior change.
- No production deployment.
- No deletion of legacy temporary manual files.
