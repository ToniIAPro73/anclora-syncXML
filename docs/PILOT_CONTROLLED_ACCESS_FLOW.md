# Pilot controlled access flow

Anclora SyncXML captures controlled pilot requests and authenticates approved pilot users. It does not decide access.

Flow:

1. Public landing asks for `Solicitar piloto controlado`.
2. `POST /api/pilot/request` validates the request and forwards it to Nexus with `NEXUS_SYNCXML_WEBHOOK_SECRET`.
3. If Nexus is unavailable, SyncXML falls back to an internal Resend notification when configured.
4. Nexus persists the request, requests Hermes scoring and decides only clear low-risk cases.
5. Ambiguous, risky or failed automation cases become `syncxml_pilot_review` tasks in Nexus.
6. Approved users receive individual temporary credentials for `/login`.
7. SyncXML validates email/password against `PilotUser.passwordHash` and stores a signed httpOnly session cookie with role.

Limits:

- Pilot only.
- Synthetic or anonymized data only.
- No automatic SES.HOSPEDAJES submission.
- No legal compliance guarantee.
- Access is limited, revocable and reviewable.

Required deployment variables are documented in `.env.example`.
