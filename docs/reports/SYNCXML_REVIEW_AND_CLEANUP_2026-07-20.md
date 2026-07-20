# SyncXML Review and Cleanup Report - 2026-07-20

## Scope

Review performed on branch `chore/codex-manuals-repo-cleanup-review` after the latest application changes on `development`.

## Applied in this branch

- Updated ES, EN and DE user manuals to version 1.1 with controlled-pilot, auth, SES, dashboard, feedback and privacy controls.
- Consolidated latest published manual outputs in `public/manuals/` by generating both PDF and HTML previews there.
- Documented `public/manuals/` as the canonical manual publication folder.
- Kept legacy files in `tmp/manual-pdf/` physically untouched and marked the folder as non-canonical.
- Added ignore rules for local runtime state under `data/state_store.db/`.

## Improvement opportunities identified

| Priority | Area | Recommendation |
| --- | --- | --- |
| P1 | Manual generation | Keep one manual generator. `scripts/generate-manual-pdf.mjs` and `scripts/generate-syncxml-manual-pdf.mjs` overlap; choose one canonical implementation in a follow-up refactor. |
| P1 | Agent workflow docs | `AGENTS.md` references missing files: `docs/devops/TONI_GIT_WORKFLOW_PLAYBOOK.md` and `.anclora/global/*`. Add stubs or update references so onboarding checks do not start with missing files. |
| P1 | Manual publication | Add a CI check that fails when `docs/manual/*.md` changes without regenerated files in `public/manuals/`. |
| P2 | Documentation inventory | Add `docs/INDEX.md` or expand `docs/README.md` with owner, status and canonical/non-canonical classification for audit, implementation, compliance and archive docs. |
| P2 | Runtime state hygiene | Keep local Memanto/runtime databases ignored and document where local state may appear. |
| P2 | Manual QA | Add automated PDF smoke checks for expected version text, language title and minimum page count. |
| P3 | Public docs discoverability | Link the three current PDF manuals from the public landing/footer or support page if user-facing downloads are intended. |

## Notes

- Manual copy intentionally avoids absolute compliance or production SES claims.
- Pilot request wording must continue to distinguish optional sample availability from acceptance of synthetic/anonymized data.
- No files were physically deleted as part of this cleanup.
