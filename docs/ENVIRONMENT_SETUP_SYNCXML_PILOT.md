# Environment setup — SyncXML controlled pilot

Configure these variables in Vercel and in local `.env` when running the full pilot flow.

```env
DATABASE_URL=
SESSION_SECRET=
RESEND_API_KEY=
RESEND_FROM=
ADMIN_EMAILS=antonio@anclora.com
NEXUS_SYNCXML_WEBHOOK_URL=
NEXUS_SYNCXML_WEBHOOK_SECRET=
SYNCXML_APP_URL=
SYNCXML_LOGIN_URL=
SYNCXML_INTERNAL_API_SECRET=
SYNCXML_ADMIN_EMAIL=antonio@anclora.com
SYNCXML_ADMIN_INITIAL_PASSWORD=
```

Notes:

- `SYNCXML_INTERNAL_API_SECRET` must match Nexus `SYNCXML_INTERNAL_API_SECRET`.
- `NEXUS_SYNCXML_WEBHOOK_SECRET` must match Nexus `SYNCXML_WEBHOOK_SECRET`.
- `DATABASE_URL` is required for individual `PilotUser` credentials.
- Do not use real guest data in this pilot.

Smoke test:

```bash
DRY_RUN=true node scripts/smoke-resend-pilot-email.mjs
SMOKE_EMAIL_TO=toni@example.com DRY_RUN=false node scripts/smoke-resend-pilot-email.mjs
```

The real send refuses to run unless `SMOKE_EMAIL_TO` is set.
