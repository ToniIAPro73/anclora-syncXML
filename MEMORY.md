# Memory — anclora-syncxml

> Generated: 2026-07-20 09:11:06  
> Total memories: **45**  
> Breakdown: instruction: 1, fact: 3, decision: 5, context: 1, event: 22, learning: 2, observation: 4, artifact: 1, error: 6

---

## Instructions

*Standing rules, constraints, and guidelines to always follow.*

### En Anclora SyncXML se debe evitar prometer cumplim...

En Anclora SyncXML se debe evitar prometer cumplimiento legal absoluto o produccion SES sin validacion real; usar claims prudentes y verificables.

*Confidence: 1 | Status: active | Created: 2026-06-04T21:19:06*

---

## Facts

*Verified information, project status, and established truths.*

### After deploying SyncXML deliverability fix, user c...

After deploying SyncXML deliverability fix, user confirmed email now arrives in the inbox instead of spam.

*Confidence: 1 | Status: active | Created: 2026-07-19T21:12:56*

### Verified new SyncXML email original after delivera...

Verified new SyncXML email original after deliverability fix: SPF, DKIM, DMARC all pass; Reply-To is antonio@anclora.com; previous X-Spam: Yes marker is absent.

*Confidence: 1 | Status: active | Created: 2026-07-19T21:13:17*

### User confirmed anclora.com appears Verified in Res...

User confirmed anclora.com appears Verified in Resend dashboard while troubleshooting Gmail spam placement for SyncXML emails.

*Confidence: 1 | Status: active | Created: 2026-07-19T20:37:08*

---

## Decisions

*Architectural choices, approach selections, and their rationale.*

### Fix operativo: Windows Terminal para Ubuntu ahora ...

Fix operativo: Windows Terminal para Ubuntu ahora invoca ~/.local/bin/wsl-terminal-startup.sh, que fuerza DEBUG=false y levanta Memanto antes de abrir la shell.

*Confidence: 0.95 | Status: active | Created: 2026-06-08T13:10:28*

### Fix operativo: el wrapper local ~/.local/bin/meman...

Fix operativo: el wrapper local ~/.local/bin/memanto ahora autoarranca el backend REST en localhost:8000 cuando un comando lo necesita y el servicio está caído.

*Confidence: 0.95 | Status: active | Created: 2026-06-08T12:47:13*

### Fix operativo: en este WSL sin systemd, Memanto qu...

Fix operativo: en este WSL sin systemd, Memanto queda persistente mediante autoarranque en ~/.bashrc y wrapper local con autorrecuperacion del backend REST.

*Confidence: 0.95 | Status: active | Created: 2026-06-08T12:59:46*

### Decision tecnica: para este WSL sin systemd ni sud...

Decision tecnica: para este WSL sin systemd ni sudo util, el autoarranque persistente de Memanto se implementa con ~/.bashrc/~/.profile y, si procede, con Windows Terminal settings para el perfil Ubuntu.

*Confidence: 0.95 | Status: active | Created: 2026-06-08T13:08:22*

### Decision: .codex/hooks.json is local Codex/Memanto...

Decision: .codex/hooks.json is local Codex/Memanto startup configuration, not product code; added .codex/ to .gitignore instead of committing it.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T00:22:39*

---

## Goals

*Objectives, targets, and milestones to track progress.*

*No memories of this type.*

---

## Commitments

*Promises, obligations, and TODOs that need follow-through.*

*No memories of this type.*

---

## Preferences

*User and entity preferences for personalization.*

*No memories of this type.*

---

## Relationships

*Entity connections, team context, and collaboration patterns.*

*No memories of this type.*

---

## Context

*Session summaries, status updates, and conversation state.*

### Anclora SyncXML se orienta a generar XML SES.HOSPE...

Anclora SyncXML se orienta a generar XML SES.HOSPEDAJES con foco en privacidad local, validacion previa, pilotos controlados, pre-checkin y reduccion de riesgo operativo para alojamientos.

*Confidence: 1 | Status: active | Created: 2026-06-04T21:19:04*

---

## Events

*Important conversations, milestones, and temporal occurrences.*

### Cierre: se actualizaron manuales premium ES/EN/DE ...

Cierre: se actualizaron manuales premium ES/EN/DE SyncXML a version 1.1, se consolido public/manuals como carpeta canonica con PDF+HTML, se documento limpieza repo sin borrar archivos y se ignoro data/state_store.db. Rama: chore/codex-manuals-repo-cleanup-review. Commit: f0006ae. Checks: check:public-docs, lint, typecheck, test, build, npm audit omit dev high, PDF text/render smoke.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T07:06:32 | Tags: `manuals`, `repo-cleanup`, `syncxml`*

### Committed SyncXML deliverability fix 9f18df0 and p...

Committed SyncXML deliverability fix 9f18df0 and promoted through staging 6cecbde, production b20049e, and main 7b38626; working tree left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T21:05:08*

### Fixed SyncXML header user missing after login from...

Fixed SyncXML header user missing after login from public /login: AuthGate now dispatches syncxml:auth-changed when it detects an existing authenticated session on /app mount, covering the transition from landing login to app. Commit 18dc71c promoted to staging 5df0098, production da7a976, main 1905def; repo left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T21:57:04*

### Fixed SyncXML header user missing after temporary ...

Fixed SyncXML header user missing after temporary password change: AuthGate now dispatches syncxml:auth-changed after /api/auth/change-password succeeds so AppShell refreshes /api/auth/session and shows the connected user dropdown. Commit 9940cfe promoted to staging 2913ec2, production 8e7880d, main 268e262; repo left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T21:37:08*

### Cierre promocion: chore/codex-hardening-quality-ga...

Cierre promocion: chore/codex-hardening-quality-gates se fusiono y promovio development -> staging -> production -> main en anclora-syncXML. Checks de scripts pasaron en development/staging/production y main: lint, typecheck, test, build. Ramas remotas sin diff de contenido. Rama temporal local y remota eliminada.

*Confidence: 0.95 | Status: active | Created: 2026-07-19T17:01:26*

### Cierre: se completo la ejecucion del plan priorita...

Cierre: se completo la ejecucion del plan prioritario de seguridad/auditoria SyncXML. Rama: fix/codex-security-audit-priority-plan. Commit: 7feb89c. Checks verdes: check:public-docs, lint, typecheck, test, build, npm audit --omit=dev --audit-level=high y npm audit. Pendiente: Toni debe integrar/promocionar la rama; .codex/hooks.json queda local sin commitear.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T00:19:40*

### Cierre promocion completa SyncXML: rama fix/codex-...

Cierre promocion completa SyncXML: rama fix/codex-security-audit-priority-plan integrada en development y promovida a staging, production y main. Heads remotos: development 5f7f747, staging 241d46b, production 31590a4, main b7237f1. Contenido sin diff entre permanentes. Rama temporal local y remota eliminada. Workspace dejado en development.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T00:30:44*

### Added SyncXML admin/user login access from landing...

Added SyncXML admin/user login access from landing header, email+password login in /app AuthGate, and authenticated header user dropdown with Cerrar aplicación/logout.

*Confidence: 0.95 | Status: active | Created: 2026-07-19T19:19:06*

### Cierre final: plan prioritario seguridad/auditoria...

Cierre final: plan prioritario seguridad/auditoria SyncXML commiteado y pusheado. Rama: fix/codex-security-audit-priority-plan. Commit final: 1175f5d. Checks verdes: check:public-docs, lint, typecheck, test, build, npm audit --omit=dev --audit-level=high y npm audit. Pendiente: integrar la rama segun flujo Git; .codex/hooks.json queda local sin commitear.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T00:20:22*

### Cierre adicional: README.md se actualizo con prese...

Cierre adicional: README.md se actualizo con presentacion premium GitHub, logo ligero, badges, navegacion, controles de piloto, arquitectura vigente, enlaces a manuales canonicos y comandos de calidad. Rama: chore/codex-manuals-repo-cleanup-review. Commit: 004fe13. Checks verdes: check:public-docs, lint, typecheck, test, build, npm audit omit dev high.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T07:10:55 | Tags: `readme`, `repo-cleanup`, `syncxml`*

### Cierre: se completo hardening de auth piloto, vali...

Cierre: se completo hardening de auth piloto, validacion Zod de payloads criticos, .env.example, rate limit best-effort documentado, workflow typecheck y audit fix seguro en anclora-syncXML. Rama: chore/codex-hardening-quality-gates. Commit: 304ead5. Pendiente: npm audit conserva xlsx sin fix y Next/PostCSS con fix forzado inviable.

*Confidence: 0.95 | Status: active | Created: 2026-07-19T16:53:31*

### Cierre: se completo la ejecucion del plan priorita...

Cierre: se completo la ejecucion del plan prioritario de seguridad/auditoria SyncXML. Rama: fix/codex-security-audit-priority-plan. Checks verdes: check:public-docs, lint, typecheck, test, build, npm audit --omit=dev --audit-level=high y npm audit. Cambios clave: RBAC admin/SES/INE, ownerId reservas, persistencia fail-closed, headers seguridad, errores publicos genericos, migracion parser xlsx a exceljs y overrides audit. Pendiente: commit/push.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T00:18:50*

### Committed Nexus fix 913a466 on development and pro...

Committed Nexus fix 913a466 on development and promoted development directly to main via merge commit 42500b0; pushed origin/development and origin/main. Change surfaces SyncXML pilot provisioning failures instead of showing false approval success.

*Confidence: 1 | Status: active | Created: 2026-07-19T18:40:47*

### Implemented optional synthetic sample flow for Syn...

Implemented optional synthetic sample flow for SyncXML pilot requests on 2026-07-20: SyncXML commit 12a63dc allows pilot requests without checking the synthetic sample box and forwards acceptsSyntheticOrAnonymizedData=false plus needsSyntheticSampleAttachments to Nexus; promoted to staging 9729518, production 004247d, main 77b501c. Nexus commit 8be8379 adds two generated XLSX attachments to SyncXML acceptance emails when applicant lacks a sample, with Resend/SMTP attachment support; promoted to staging/production/main fb87761. Both repos left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T22:18:19*

### Committed hidden SyncXML admin application login a...

Committed hidden SyncXML admin application login as 00dad93 and promoted development through staging 71a18c3, production 92eec25, and main 13ed9a2; working tree left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T19:34:52*

### Promoted Anclora SyncXML commit 80fe04e from devel...

Promoted Anclora SyncXML commit 80fe04e from development through staging, production, and main. Resulting branch heads: staging 1600cb7, production c2a0924, main 920ca63; working tree left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T19:23:05*

### Deployed fix for duplicate SyncXML pilot approval:...

Deployed fix for duplicate SyncXML pilot approval: Nexus commit 6c73355 retries provisioning with rotatePassword=true when SyncXML reports active loginReady user without temporaryPassword; promoted to staging/production/main at merge 6ac01fa and repo left on development. SyncXML commit cdef5b7 exposes pilotUserId alias alongside userId in internal pilot provisioning response; promoted to staging 513587a, production 9f372fe, main 30072c3 and repo left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T21:25:17*

### User is diagnosing Anclora Nexus approval flow: Sy...

User is diagnosing Anclora Nexus approval flow: SyncXML pilot request appears pending after approve click; Supabase logs provided at /home/toni/projects/anclora-nexus/supabase_logs.json and PDF at /home/toni/projects/anclora-syncXML/solicitud-piloto.pdf

*Confidence: 1 | Status: active | Created: 2026-07-19T18:31:39*

### Adjusted Anclora SyncXML pilot login/change-passwo...

Adjusted Anclora SyncXML pilot login/change-password viewport behavior and in-app feedback delivery: removed landing/pilot CTA from approved-user auth screens, made auth cards compact/scrollable, added /api/feedback Resend email route to send pilot feedback to configured inbox/default antonio@anclora.com.

*Confidence: 0.95 | Status: active | Created: 2026-07-19T19:14:17*

### Created hidden SyncXML admin application login at ...

Created hidden SyncXML admin application login at /admin/login with admin-only API /api/auth/admin-login. /login remains controlled-pilot login; admin logout returns to /admin/login.

*Confidence: 0.95 | Status: active | Created: 2026-07-19T19:33:19*

### Promoted Anclora Nexus main commit 42500b0 to stag...

Promoted Anclora Nexus main commit 42500b0 to staging and then production; pushed origin/staging and origin/production, then left working tree checked out on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T18:50:10*

### User configured RESEND_FROM as 'Anclora SyncXML <p...

User configured RESEND_FROM as 'Anclora SyncXML <piloto@anclora.com>' and added SYNCXML_FEEDBACK_TO in Resend/hosting env while diagnosing email spam placement.

*Confidence: 1 | Status: active | Created: 2026-07-19T20:33:14*

---

## Learnings

*Knowledge acquired from experience, corrections, and insights.*

### Validated: SyncXML reservation owner migration wor...

Validated: SyncXML reservation owner migration worked when run against the Neon database connected to Vercel/SyncXML, confirming the earlier Supabase Nexus failure was wrong database/project selection rather than invalid schema intent.

*Confidence: 1 | Status: active | Created: 2026-07-20T00:08:19*

### Learning: Supabase reported manual execution of Sy...

Learning: Supabase reported manual execution of SyncXML migration 20260720000000_add_reservation_owner failed because relation "Reservation" did not exist; migration was made IF EXISTS/IF NOT EXISTS tolerant, but operational guidance remains to apply the full Prisma migration chain with prisma migrate deploy.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T00:03:22*

---

## Observations

*Patterns noticed, behavioral notes, and recurring themes.*

### Prueba tecnica: backend local de Memanto restaurad...

Prueba tecnica: backend local de Memanto restaurado en localhost:8000 para validar recall/remember en 2026-06-08.

*Confidence: 0.95 | Status: active | Created: 2026-06-08T12:45:50*

### Observation: User attempted SyncXML Reservation ow...

Observation: User attempted SyncXML Reservation owner migration in Supabase Cloud while dashboard showed Anclora Nexus project; relation Reservation was absent because it was not the SyncXML database/schema. Guidance: run Prisma migrate deploy against SyncXML DATABASE_URL, not Nexus Supabase.

*Confidence: 0.95 | Status: active | Created: 2026-07-20T00:06:04*

### Gmail/Hostinger original header for SyncXML pilot ...

Gmail/Hostinger original header for SyncXML pilot request showed SPF=pass, DKIM=pass, DMARC=pass, X-Spam=Yes. Suspicious signal: Reply-To was external applicant Gmail while From was piloto@anclora.com; patched internal emails to use internal RESEND_REPLY_TO/ADMIN_EMAILS instead.

*Confidence: 1 | Status: active | Created: 2026-07-19T20:46:45*

### SyncXML emails to antonio@anclora.com were landing...

SyncXML emails to antonio@anclora.com were landing in spam; likely deliverability cause is sender domain authentication. Updated env/docs to require verified Resend sender domain, SPF/DKIM/DMARC, and avoid example.com/resend.dev senders.

*Confidence: 0.9 | Status: active | Created: 2026-07-19T20:01:04*

---

## Artifacts

*Tool outputs, files, reports, and external references.*

### Artefacto: auditoria tecnica SyncXML generada en p...

Artefacto: auditoria tecnica SyncXML generada en plans/syncxml-review-2026-07-20.md sobre commit 3475638. Hallazgos prioritarios: falta RBAC por rol para rutas SES/admin y falta aislamiento de reservas por usuario; checks lint, typecheck, 161 tests y build pasaron; npm audit detecta advisory high en xlsx.

*Confidence: 0.95 | Status: active | Created: 2026-07-19T23:47:33 | Tags: `audit`, `security`, `rbac`, `syncxml`*

---

## Errors

*Failure records, bugs, and lessons learned from mistakes.*

### Fixed SyncXML pilot request submit success masking...

Fixed SyncXML pilot request submit success masking Nexus persistence failure: previous route sent Resend email then queued Nexus webhook with after(), so email could arrive while Nexus row was missing. Commit 3475638 now awaits Nexus forwarding and returns 502 if Nexus does not confirm persistence; promoted to staging 9d369bb, production e5bedb4, main d685db1; repo left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T22:32:26*

### Fixed Nexus-generated SyncXML sample workbooks on ...

Fixed Nexus-generated SyncXML sample workbooks on 2026-07-20: correct sample previously produced 7 SyncXML validation errors and fixable sample 9 due to static guestCount=3, invalid zero IBAN, and long relationship labels Titular/Acompañante. Nexus commit 5bd8c5e sets guestCount per workbook, valid sample IBAN ES9121000418450200051332, and MIR relationship codes TI/OT. Cross-validated with SyncXML parseExcelBuffer + smartValidateParsedExcel: correct workbook VALID with 0 errors; fixable workbook ERROR with exactly 1 intended documentSupport.required error. Promoted to staging 1845bd8, production bdfcc5f with tag v2026.07.20-syncxml-sample-workbooks, and main 1a1a93f; repo left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T23:11:30*

### Root cause for Anclora Nexus SyncXML pilot approva...

Root cause for Anclora Nexus SyncXML pilot approval issue on 2026-07-19: access_requests row for tonitonib.2018@gmail.com remained pending with metadata final_decision=failed_credentials, credential_status=failed; SyncXML internal pilot-users endpoint returned 503 SYNCXML_PILOT_AUTH_CONFIG_INCOMPLETE because persistent pilot authentication is not ready.

*Confidence: 1 | Status: active | Created: 2026-07-19T18:34:54*

### Fixed Nexus /access-requests filter overflow on 20...

Fixed Nexus /access-requests filter overflow on 2026-07-20: the queue filter row used fixed grid columns that exceeded the available card width beside the detail panel. Commit 4ceb920 changed filters to responsive 1/2/4-column layout and min-w-0 controls so they stay inside the card. Promoted to staging e89d1e9, production 390915b with tag v2026.07.20-access-request-filter-layout, and main ee88fe5; repo left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T23:27:44*

### Fixed Nexus SyncXML pilot request handling on 2026...

Fixed Nexus SyncXML pilot request handling on 2026-07-20: the optional sample checkbox was incorrectly treated as acceptance of synthetic/anonymized pilot conditions, causing valid requests without their own sample to be auto-rejected. Nexus commit 5d356d8 now keeps those requests pending, stores GDPR consent from acceptsPilotConditions, marks sample attachment need in metadata, and makes the webhook fail if persistence is blocked or no request id is returned. Promoted to staging 19aec17, production 7274640 with tag v2026.07.20-syncxml-reviewable-requests, and main c483da2; local repo left on development.

*Confidence: 1 | Status: active | Created: 2026-07-19T22:52:42*

### Observed root cause for Nexus approval error on du...

Observed root cause for Nexus approval error on duplicate SyncXML pilot email: approving a new access request for an email that already has an active SyncXML PilotUser returns loginReady=true but temporaryPassword=null unless rotatePassword is requested. Nexus must retry with rotatePassword=true before approval email can be sent.

*Confidence: 1 | Status: active | Created: 2026-07-19T21:22:56*

---

*End of memory export.*
