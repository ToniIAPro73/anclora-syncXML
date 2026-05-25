# Phase Reentry Status

## Metadata

- Date: 2026-05-24
- Branch: `feat/syncxml-phased-hardening`
- Basis: `Artefacto_2_Plan_de_Mejoras_por_Fases_Anclora_SyncXML.md` plus existing `docs/audit/` reports.

## Current Position

The repository is past the original Fase 4 report. The report marked the correction editor as deferred, but current code now includes a guided correction workspace in `SyncXmlWorkflow`.

After this reentry pass, Fase 4 is closed for the controlled pre-MVP scope.

## Verified Today

- The active branch is `feat/syncxml-phased-hardening`.
- Fase 1 remains complete for repository-verifiable facts.
- Fase 2 remains complete for repository-local hardening.
- Fase 3 remains partial: SES schema/service groundwork exists, but full XSD engine validation and live SES evidence remain pending.
- Fase 4 is closer to closure than the existing report states:
  - Guided workflow exists.
  - Visual XML review exists.
  - Per-guest validation semaphores exist.
  - Manual correction workspace exists for SES-blocking fields.
  - Duplicate resolution gates exist.
  - Session resume exists.
  - Durable history/governance remains constrained by retention decisions.

## Fix Applied During Reentry

The traceability panel component existed but was no longer rendered after later layout restructuring. It has been restored below the process rail, preserving the Fase 4 traceability deliverable.

## Validation Results

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 10 files / 57 tests.

## Closure Decision

Fase 4 is closed with these boundaries:

- The product supports guided review, manual correction, validation, visual XML review, traceability and CSV validation report export.
- The dashboard supports searchable operational history and XML redownload in the configured storage mode.
- Production durable retention is not considered approved by this closure.

## Recommended Next Step

Fase 5 remains blocked by the unresolved inputs listed in `PHASE_5_PRECHECKIN_SES_ASSISTANT_REPORT.md`.

## Fase 5 Unblock Notes

Updated on 2026-05-24 after controller clarification:

- Product role: decided. SyncXML will not be the legal system of record. SES remains the authoritative source for submitted reservations and later consultation.
- Local retention posture: reduced. SyncXML should only keep the operational metadata required to call SES consultation services correctly, not a complete legal registry.
- Document-image policy: decided. DNI/passport images will not be stored.
- Retention policy: still required, but its scope is now narrower and should define metadata-only retention, deletion and audit boundaries.
- DPA / processor terms: still required if Anclora or any deployed service processes personal data on behalf of the accommodation/controller.
- Guest-facing privacy notice and legal basis: still required before adding external pre-check-in collection.
- Signature or consent requirements: still unresolved and must be confirmed against the SES workflow and controller/legal instructions.
- SES credentials: received on 2026-05-25 for the test environment and configured only in the local ignored `.env` file.
- SES accepted/rejected procedure: pending until pre-production credentials and real response samples are available.
- SES accepted XML/receipt evidence: pending until test submissions can be performed.

## Fase 5 Test-Mode Implementation

Implemented on 2026-05-24:

- Controlled pre-check-in test session generation from the XML review step.
- Temporary guest-facing route `/precheckin/[token]`.
- Guest form for completing traveller fields before SES review.
- Explicit privacy acknowledgement.
- Hard block for document-image payloads.
- Metadata-only operational retention model.
- Submission hash instead of storing a legal registry record.

This is a test-mode implementation only. Production rollout remains blocked until accepted/rejected SES response evidence and approved privacy/DPA copy are available.
