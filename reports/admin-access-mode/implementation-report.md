# Controlled admin access — implementation report

Branch: `claude/optimistic-fermi-zeWA0`

## Scope delivered (Part A)

A controlled admin-access mode: secret URL + strong token + environment guard +
normal admin session. No public admin bypass; disabled by default; production
blocked unless a second explicit opt-in is set.

## Files changed / added

- `src/lib/security/adminAccess.ts` — **new.** Pure, testable decision logic:
  `evaluateAdminAccess`, `safeTokenEquals` (constant-time), `parseAllowedEnvs`,
  `resolveDeploymentEnv`, `readAdminAccessConfig`.
- `src/app/api/internal/admin-access/route.ts` — **new.** `GET` endpoint that
  evaluates the guards, creates an admin session via `setSessionCookie`, and
  redirects to `SYNCXML_ADMIN_ACCESS_REDIRECT` (default `/app`). Generic `404`
  on any failure. Token never logged.
- `.env.example` — added the 6 variables (all safe defaults; no real token).
- `docs/ADMIN_ACCESS_MODE.md` — operational guide.
- `tests/admin-access.test.ts` — **new.**

## Endpoint

```
GET /api/internal/admin-access?token=<SYNCXML_ADMIN_ACCESS_TOKEN>
```

The internal app route `/app` exists, so the default redirect is valid.

## Environment variables (new)

| Variable | Default |
| --- | --- |
| `SYNCXML_ADMIN_ACCESS_ENABLED` | `false` |
| `SYNCXML_ADMIN_ACCESS_TOKEN` | _(empty)_ |
| `SYNCXML_ADMIN_ACCESS_ALLOWED_ENV` | `preview,development` |
| `SYNCXML_ADMIN_ACCESS_REDIRECT` | `/app` |
| `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION` | `false` |
| `SYNCXML_ADMIN_EMAIL` | `antonio@anclora.com` (already existed) |

## Behaviour guarantees

1. Inert when disabled → `404`.
2. Missing token → `404`.
3. Wrong token → `404` (constant-time comparison).
4. Correct token in development/preview → admin session + redirect.
5. Production without double opt-in → `404`.
6. Production with double opt-in + correct token → admin session + redirect.
7. Session payload carries `role: "admin"` and the admin email.
8. No admin link or token appears in the landing source.
9. The token is never logged or echoed (audit lines exclude it; failures are
   generic).

## Tests

`tests/admin-access.test.ts` covers the decision logic (cases 1–6 + extra
guards), the helpers, the HTTP route (404 when disabled; 302 + admin cookie on
success, asserting the decoded payload role/email), and the safety guarantees
(no landing exposure, no token logging).

## Validation

- `npm run typecheck` → pass
- `npm run lint` → pass
- `npm run test` → 161 tests pass (incl. admin-access)
- `npm run build` → route `/api/internal/admin-access` builds as dynamic

## Steps for Toni (Vercel Preview)

1. Generate a token: `openssl rand -base64 48`.
2. In Vercel (Preview scope) set `SYNCXML_ADMIN_ACCESS_ENABLED=true`,
   `SYNCXML_ADMIN_ACCESS_TOKEN=<token>`, ensure `SESSION_SECRET` is set.
3. Redeploy Preview.
4. Visit `https://<preview-url>/api/internal/admin-access?token=<token>`.
5. Leave Production unset / `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false`.

## Risks

- Token in URL — treat as a secret, rotate regularly, never commit/log.
- Keep the mode off in production unless deliberately enabled (double opt-in),
  then re-disable.
