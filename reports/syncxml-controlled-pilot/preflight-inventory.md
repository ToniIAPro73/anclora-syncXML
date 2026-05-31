# SyncXML controlled pilot preflight inventory

Date: 2026-05-31

## Repositories and branches

- `anclora-syncXML`: `codex/syncxml-controlled-pilot-flow`
- `anclora-nexus`: `codex/syncxml-controlled-pilot-flow`
- `anclora-content-generator-ai`: `codex/syncxml-controlled-pilot-flow`

Existing user changes detected before implementation:

- `anclora-syncXML/docs/prompt_maestro_syncxml_piloto_controlado_nexus_hermes.md`
- `anclora-syncXML/docs/anexo_prompt_syncxml_boton_cookies_visible.md`

They were left untouched.

## Files detected

SyncXML landing and auth:

- `src/app/page.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/LandingHeader.tsx`
- `src/components/landing/PilotRequestForm.tsx`
- `src/components/landing/CookieConsent.tsx`
- `src/components/landing/CookiePreferencesButton.tsx`
- `src/components/landing/LandingFooter.tsx`
- `src/app/api/pilot/request/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/lib/auth.ts`
- `prisma/schema.prisma`

Nexus intake:

- `backend/api/internal_webhooks.py`
- `backend/services/syncxml_pilot_service.py`
- `backend/models/access_requests.py`
- `backend/config.py`
- `frontend/src/lib/access-requests-api.ts`

Hermes worker:

- `workers/hermes-content-worker/src/app.ts`
- `workers/hermes-content-worker/src/schema.ts`
- `workers/hermes-content-worker/src/openrouter.ts`
- `workers/hermes-content-worker/src/app.test.ts`

## Current endpoints

- SyncXML `POST /api/pilot/request`
- SyncXML `POST /api/auth/login`
- SyncXML `POST /api/auth/logout`
- SyncXML `GET /api/auth/session`
- Nexus `POST /api/internal/webhooks/syncxml-pilot`
- Hermes `POST /api/syncxml/pilot/validate`

## Environment variables

SyncXML:

- `NEXUS_SYNCXML_WEBHOOK_URL`
- `NEXUS_SYNCXML_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `ADMIN_EMAILS`
- `SYNCXML_APP_URL`
- `SYNCXML_LOGIN_URL`
- `SYNCXML_ADMIN_EMAIL`
- `SYNCXML_ADMIN_INITIAL_PASSWORD`
- `SESSION_SECRET`

Nexus:

- `SYNCXML_WEBHOOK_SECRET`
- `HERMES_WORKER_URL`
- `HERMES_WORKER_API_KEY`
- `SYNCXML_APP_URL`
- `SYNCXML_LOGIN_URL`
- `ADMIN_EMAILS`

Hermes:

- `WORKER_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `HERMES_WORKER_MODEL`
- `HERMES_WORKER_FALLBACK_MODEL`

## Contract context checked

The Boveda path was found at:

- `/mnt/c/Users/antonio.ballesterosa/Desktop/Proyectos/Boveda-Anclora`

Contracts/playbooks inspected in this pass:

- `README.md`
- `contracts/core/ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `contracts/core/ANCLORA_PREMIUM_APP_CONTRACT.md`
- `contracts/core/ANCLORA_INTERNAL_APP_CONTRACT.md`
- `contracts/components/ANCLORA_AUTH_LOGIN_SCREEN_CONTRACT.md`
- `contracts/logic/COOKIES_CONSENT_CONTRACT.md`
- `contracts/logic/LOCALIZATION_CONTRACT.md`
- `contracts/governance/CONTRACT_COMPLIANCE_MATRIX.md`
- `playbooks/ANCLORA_AUTH_LOGIN_SCREEN_PLAYBOOK.md`
- `playbooks/ANCLORA_LANGUAGE_TOGGLE_PLAYBOOK.md`
- `playbooks/ANCLORA_GLOBAL_PREFERENCES_TOGGLE_PLAYBOOK.md`

The login contract normally includes forgot password, registration and social access surfaces. The user prompt explicitly forbids those for SyncXML pre-MVP, so the implementation keeps the contract's core visual structure but applies the product-specific restriction.

## Gaps found

- SyncXML has a broader app i18n dictionary, but the landing remains mostly ES-only; the prompt requested localization where supported. This remains a gap for a later copy pass.
- SyncXML used a shared pilot password model; a `PilotUser` model and individual email/password auth path were added while preserving admin fallback.
- Nexus had a SyncXML service, but it auto-approved/rejected too aggressively and used the old Hermes lead endpoint.
- Hermes had a generic lead validator but no strict SyncXML pilot validation schema.
- Nexus `pytest` could not run because `pytest` is not installed in the current Python environment.

## Implementation decision

Implement a conservative vertical slice:

- SyncXML remains capture/login frontend and does not decide access.
- Nexus remains source of truth for intake, AI review metadata and manual review tasks.
- Hermes only returns structured recommendations.
- Ambiguous or risky cases go to manual review.
- Emails and credential creation still require operational validation with real SMTP/Resend and deployment variables.
