# Phase 5 Pre-check-in and SES Assistant Report

## Metadata

- Date: 2026-05-24
- Branch: `feat/syncxml-phased-hardening`
- Status: Implemented for controlled test mode; blocked for production use until SES test credentials and governance copy are available.

## Gate Decision

Fase 5 is blocked for production because it would introduce new external collection of personal guest data and external SES operations. The controller has clarified that SyncXML should not become the legal system of record: SES will be the authoritative source for submitted reservations and later consultation.

This decision reduces the retention scope, but does not remove all governance requirements. The remaining blockers are:

- Metadata-only retention policy for the minimum data needed to call SES consultation services correctly.
- DPA / data processing agreement if Anclora or any deployed service processes personal data on behalf of the accommodation/controller.
- External privacy notice and legal basis for guest-facing pre-check-in forms.
- Operational procedure for deletion, access requests and incident handling for any data held outside SES.
- Confirmation of required fields and signature/consent requirements.
- SES test credentials and pre-production response evidence.

## What Was Not Implemented

No production guest-facing pre-check-in flow was added.

No production external data collection links were added.

No document image upload was added. Controller instruction now confirms DNI/passport images must not be stored.

No automated SES submission was added.

These omissions are intentional because adding them before governance closure would increase legal and security risk.

## Implemented For Test Mode

- Added a controlled pre-check-in test session generator from the XML review step.
- Added a temporary guest-facing route under `/precheckin/[token]`.
- Added a public test form for completing traveller fields required before SES review.
- Added explicit privacy acknowledgement in the test form.
- Added validation that blocks document-image payloads.
- Added metadata-only session policy:
  - temporary token.
  - reservation reference.
  - operational status.
  - submission hash.
  - creation, expiry and submission timestamps.
- Added no legal-registry posture: SES remains the authoritative source once official submission/consultation is available.
- Added tests for metadata-only session creation, image blocking and complete test submission.

## Safe Preparatory Scope

Future work may safely start with non-production design artifacts:

- Data flow diagram.
- Threat model.
- Consent copy.
- Expiring token design.
- No-document-image policy.
- Manual SES upload assistant requirements.

The current implementation now covers the practical test-mode subset of this scope.

## Required Inputs to Unblock

1. Approved privacy notice for guest-facing collection.
2. DPA / processor terms, if Anclora or deployed infrastructure acts as processor.
3. Metadata-only retention decision: fields, purpose, duration, deletion and audit limits.
4. Required legal basis and controller instructions for direct guest collection.
5. Confirmation of whether signatures, explicit acceptance or other consent evidence are legally/operationally required.
6. SES test credentials.
7. SES official submission and consultation process evidence.
8. Accepted/rejected SES response samples and operational handling rules.

## Residual Risk

Implementing pre-check-in without these inputs would turn SyncXML from an internal transformation tool into a personal-data collection system without sufficient governance and without verified SES operational behavior.
