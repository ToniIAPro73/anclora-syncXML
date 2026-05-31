# Local E2E smoke — SyncXML pilot

This is the local dry-run path for the controlled pilot flow.

1. Start Hermes worker in mock mode:

```bash
cd /home/toni/projects/anclora-content-generator-ai/workers/hermes-content-worker
WORKER_MOCK=true WORKER_API_KEY=local-hermes npm run dev
```

2. Start Nexus backend with local secrets:

```bash
cd /home/toni/projects/anclora-nexus
SYNCXML_WEBHOOK_SECRET=local-webhook \
HERMES_WORKER_URL=http://localhost:8787 \
HERMES_WORKER_API_KEY=local-hermes \
SYNCXML_INTERNAL_API_URL=http://localhost:3000/api/internal/pilot-users \
SYNCXML_INTERNAL_API_SECRET=local-syncxml \
python3 -m uvicorn backend.api.main:app --reload --port 8000
```

3. Start SyncXML:

```bash
cd /home/toni/projects/anclora-syncXML
NEXUS_SYNCXML_WEBHOOK_URL=http://localhost:8000/api/internal/webhooks/syncxml-pilot \
NEXUS_SYNCXML_WEBHOOK_SECRET=local-webhook \
SYNCXML_INTERNAL_API_SECRET=local-syncxml \
npm run dev
```

4. Submit a pilot request from `/piloto`.

5. In Nexus, open `/tasks`, find the `SyncXML · Piloto controlado` card and approve.

6. Confirm `/login` accepts the email and temporary password.

External dependencies still required for full real validation:

- Supabase tables available to Nexus.
- SyncXML `DATABASE_URL`.
- SMTP or Resend credentials.
