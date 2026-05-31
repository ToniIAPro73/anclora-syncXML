# Controlled Admin Access Mode

## Purpose

Let an authorized operator (Toni) open the internal SyncXML app with a normal
`admin` session **without** typing credentials, by visiting a secret URL guarded
by a strong token.

This is **not** an open auto-login. There is no public admin bypass: the mode is
disabled by default, always requires a strong token, and is blocked in
production unless a second explicit opt-in flag is set.

```
GET /api/internal/admin-access?token=<SYNCXML_ADMIN_ACCESS_TOKEN>
```

The public landing keeps opening normally at `/`. No admin link is ever rendered
on the landing.

## Environment variables

| Variable | Default | Meaning |
| --- | --- | --- |
| `SYNCXML_ADMIN_ACCESS_ENABLED` | `false` | Master switch. Endpoint is inert when false. |
| `SYNCXML_ADMIN_ACCESS_TOKEN` | _(empty)_ | Strong secret token required in the URL. |
| `SYNCXML_ADMIN_EMAIL` | `antonio@anclora.com` | Email stamped on the created admin session. |
| `SYNCXML_ADMIN_ACCESS_ALLOWED_ENV` | `preview,development` | Non-production environments where it may work. |
| `SYNCXML_ADMIN_ACCESS_REDIRECT` | `/app` | Internal route to redirect to after success. |
| `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION` | `false` | Second opt-in required to allow it in production. |

The endpoint also needs `SESSION_SECRET` configured (same secret used by the
normal login) so it can issue a signed session cookie.

## Rules per environment

The deployment environment is detected from `VERCEL_ENV` (falling back to
`NODE_ENV`).

- **development / preview** — works when:
  - `SYNCXML_ADMIN_ACCESS_ENABLED=true`
  - `SYNCXML_ADMIN_ACCESS_TOKEN` is set
  - the environment is included in `SYNCXML_ADMIN_ACCESS_ALLOWED_ENV`
- **production** — requires a double opt-in:
  - `SYNCXML_ADMIN_ACCESS_ENABLED=true`
  - `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=true`
  - `SYNCXML_ADMIN_ACCESS_TOKEN` is set

By default, production is blocked.

## Behaviour

The endpoint:

1. Verifies the mode is enabled.
2. Verifies the environment is permitted (production needs the double opt-in).
3. Verifies the token with a constant-time comparison.
4. Creates a normal admin session (`role: "admin"`, `email: SYNCXML_ADMIN_EMAIL`).
5. Sets an `httpOnly` cookie, `secure` in production, `sameSite=lax`.
6. Redirects to `SYNCXML_ADMIN_ACCESS_REDIRECT`.
7. Logs an audit line **without** the token.
8. Rejects every invalid attempt with a generic `404` (no reason leaked).

## How to configure on Vercel (Preview)

1. Project → Settings → Environment Variables.
2. Scope the variables to **Preview** (and **Development** if desired):
   - `SYNCXML_ADMIN_ACCESS_ENABLED = true`
   - `SYNCXML_ADMIN_ACCESS_TOKEN = <generated token>`
   - (optional) `SYNCXML_ADMIN_ACCESS_REDIRECT = /app`
3. Ensure `SESSION_SECRET` is set for the same scope.
4. Redeploy the Preview.
5. Open `https://<preview-url>/api/internal/admin-access?token=<token>`.

Leave Production **without** these variables (or with
`SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false`).

## Generating a token

```bash
openssl rand -base64 48
```

or

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Do **not** commit real tokens.

## Using the URL

```
https://<preview-url>/api/internal/admin-access?token=<SYNCXML_ADMIN_ACCESS_TOKEN>
```

On success you are redirected to `/app` with an active admin session.

## Rotating the token

1. Generate a new token (see above).
2. Update `SYNCXML_ADMIN_ACCESS_TOKEN` in Vercel.
3. Redeploy. The previous token stops working immediately.

## Disabling

Set `SYNCXML_ADMIN_ACCESS_ENABLED=false` (or remove the variable) and redeploy.
The endpoint becomes inert and returns `404` for every request.

## Risks

- Anyone with the token URL can open an admin session. Treat the token like a
  password: share it over a secure channel, rotate it regularly, and never log
  or commit it.
- Keep the mode **off in production** unless there is a concrete, temporary need;
  re-disable it afterwards.
- The token travels in the query string. Prefer Preview/Development URLs over
  HTTPS and avoid pasting the full URL into shared logs or tickets.

## Why production is blocked by default

A controlled pilot must not expose a credential-less admin entry on the public
production domain. Requiring an explicit, separate
`SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=true` makes enabling it in production a
deliberate, auditable decision rather than an accident of configuration.
