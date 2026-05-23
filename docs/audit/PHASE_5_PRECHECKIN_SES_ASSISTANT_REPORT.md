# Phase 5 Pre-check-in and SES Assistant Report

## Metadata

- Date: 2026-05-23
- Branch: `feat/syncxml-phased-hardening`
- Status: Blocked for production implementation.

## Gate Decision

Fase 5 is blocked for production because it would introduce new external collection of personal guest data. The repository does not yet include enough approved governance evidence for that expansion:

- Controller-approved retention policy.
- DPA / data processing agreement.
- Explicit product role decision: transformation layer vs system of record.
- External privacy notice for guest-facing forms.
- Operational procedure for deletion, access requests and incident handling.
- Confirmation of required fields and signature requirements.

## What Was Not Implemented

No guest-facing pre-check-in form was added.

No external data collection links were added.

No document image upload was added.

No automated SES submission was added.

These omissions are intentional because adding them before governance closure would increase legal and security risk.

## Safe Preparatory Scope

Future work may safely start with non-production design artifacts:

- Data flow diagram.
- Threat model.
- Consent copy.
- Expiring token design.
- No-document-image policy.
- Manual SES upload assistant requirements.

## Required Inputs to Unblock

1. Approved Privacy Policy for guest-facing collection.
2. DPA / processor terms.
3. Retention decision.
4. Required legal basis and controller instructions.
5. Confirmation of whether signatures are legally required.
6. Confirmation that no DNI/passport images should be stored.
7. SES official submission process evidence.

## Residual Risk

Implementing pre-check-in without these inputs would turn SyncXML from an internal transformation tool into a personal-data collection system without sufficient governance.
