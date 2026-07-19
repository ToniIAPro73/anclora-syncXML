# Vercel Preview Setup: Anclora SyncXML

**Versión:** 1.0  
**Fecha:** 2026-06-05  
**Objetivo:** Guía de configuración segura para environments Preview y Production

---

## Visión general

Anclora SyncXML se despliega en Vercel con tres environments:

| Environment | URL | Uso | Deploy |
|---|---|---|---|
| **Production** | `anclora-syncxml.vercel.app` | Pública | Main branch |
| **Preview** | `anclora-syncxml-<branch>.vercel.app` | Branch/PR testing | Any branch |
| **Development** | Local (`localhost:3000`) | Local dev | CLI dev server |

---

## Política de variables de entorno

### ❌ NUNCA copiar a Preview/Prod sin revisión:

```env
# SES credentials (pueden ser reales del responsable técnico)
SYNCXML_SES_ENDPOINT=https://...
SYNCXML_SES_USERNAME=...
SYNCXML_SES_PASSWORD=...
SYNCXML_SES_LANDLORD_CODE=...

# Database (Production debería ser real, Preview no)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# APIs and Keys
RESEND_API_KEY=...
OPENAI_API_KEY=...

# Storage
BLOB_READ_WRITE_TOKEN=...
```

### ✅ SEGURO para Preview (sin valores sensibles):

```env
# Session & Auth
SESSION_SECRET=<valor-seguro>

# Admin Access (Preview OK, Production muy restrictivo)
SYNCXML_ADMIN_ACCESS_ENABLED=true|false
SYNCXML_ADMIN_ACCESS_TOKEN=<token-seguro>
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV=development,preview
SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false

# Feature Flags
SYNCXML_ENABLE_SES_TESTING=true|false
SYNCXML_ENABLE_ADMIN_PANEL=true|false

# URLs
NEXT_PUBLIC_APP_URL=https://<preview-url>
AUTH_URL=https://<preview-url>
AUTH_TRUST_HOST=true

# Logging
LOG_LEVEL=debug|info|warn

# Feature
NEXT_PUBLIC_ENABLE_SYNTHETIC_DATA=true
```

---

## Setup por environment

### Development (Local)

```bash
# Copiar template
cp .env.example .env.local

# Editar valores locales
vim .env.local
```

**Variables críticas:**
```env
DATABASE_URL=postgresql://localhost/syncxml_dev
SESSION_SECRET=dev-secret-random-string-change-in-prod
NEXT_PUBLIC_APP_URL=http://localhost:3000
SYNCXML_ADMIN_ACCESS_ENABLED=true
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV=development,preview
```

### Preview (Vercel)

**URL:** `https://anclora-syncxml-<branch>.vercel.app`

#### 1. Deploy automático

- Cada PR y branch despliega automáticamente
- Usa variables de "Preview" environment en Vercel

#### 2. Configurar variables Preview en Vercel

En `Project Settings → Environment Variables`:

**Crear/actualizar estas variables con scope "Preview":**

```env
SESSION_SECRET=<generar-valor-seguro>
SYNCXML_ADMIN_ACCESS_ENABLED=true
SYNCXML_ADMIN_ACCESS_TOKEN=<generar-valor-seguro>
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV=preview,development
SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false
NEXT_PUBLIC_APP_URL=https://<preview-url>
AUTH_URL=https://<preview-url>
AUTH_TRUST_HOST=true
NEXT_PUBLIC_ENABLE_SYNTHETIC_DATA=true
LOG_LEVEL=debug
```

**NO copiar a Preview (dejar vacío o usar stub):**
```env
# Dejar en blanco o usar valores stub para Preview:
SYNCXML_SES_ENDPOINT=
SYNCXML_SES_USERNAME=
SYNCXML_SES_PASSWORD=
SYNCXML_SES_LANDLORD_CODE=

# Usar DB Preview si existe, no Production
DATABASE_URL=<preview-db-url>
DIRECT_URL=<preview-db-url>

# Keys opcionales (no necesarias para piloto)
RESEND_API_KEY=
OPENAI_API_KEY=
BLOB_READ_WRITE_TOKEN=
```

#### 3. Redeploy Preview

Después de actualizar variables:

1. Go to `Deployments`
2. Find latest Preview deployment
3. Click `...` → `Redeploy`
4. Wait for build to complete

#### 4. Acceso admin en Preview

Si necesitas acceso admin local dentro de Preview:

```
https://<preview-url>/api/internal/admin-access?token=<SYNCXML_ADMIN_ACCESS_TOKEN>
```

Este enlace:
- Verifica token con `SYNCXML_ADMIN_ACCESS_TOKEN`
- Crea sesión admin temporal
- Redirige a `/app` con acceso admin
- **Solo funciona en Preview/Dev**, no en Production (por defecto)

### Production (Vercel main)

**URL:** `https://anclora-syncxml.vercel.app`

#### 1. Variables Production

En `Project Settings → Environment Variables`, scope "Production":

**Requeridas (sin valores sensibles, excepto necesario):**
```env
SESSION_SECRET=<valor-muy-seguro-production>
SYNCXML_ADMIN_ACCESS_ENABLED=false
SYNCXML_ADMIN_ACCESS_TOKEN=<no-usar-en-prod-o-muy-seguro>
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV=development
SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false
NEXT_PUBLIC_APP_URL=https://anclora-syncxml.vercel.app
AUTH_URL=https://anclora-syncxml.vercel.app
AUTH_TRUST_HOST=true
NEXT_PUBLIC_ENABLE_SYNTHETIC_DATA=false
LOG_LEVEL=warn
```

**Opcionales (si se necesitan):**
```env
# SES Preproducción (si responsable técnico necesita)
SYNCXML_SES_ENDPOINT=https://ses-api-preprod.com
SYNCXML_SES_USERNAME=<username-preprod>
SYNCXML_SES_PASSWORD=<password-preprod>
SYNCXML_SES_LANDLORD_CODE=<code>
SYNCXML_SES_ALLOW_PRODUCTION_SEND=false

# Resend (si se activa email)
RESEND_API_KEY=<key>
RESEND_FROM="Anclora SyncXML <piloto@syncxml.anclora.com>"
RESEND_REPLY_TO=antonio@anclora.com
SYNCXML_FEEDBACK_TO=antonio@anclora.com
```

Antes de probar con destinatarios Gmail/Yahoo, el dominio de `RESEND_FROM`
debe estar verificado en Resend y tener SPF, DKIM y DMARC publicados. Si el
remitente usa `example.com`, `resend.dev` o un dominio sin DMARC, los correos
pueden llegar a spam aunque Resend los marque como entregados.

#### 2. Admin access en Production

**Por defecto:** BLOQUEADO
- `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false`
- El endpoint `/api/internal/admin-access` retorna 404

**Para habilitar (emergencia técnica):**
1. Toni revisa la necesidad
2. Edita variable: `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=true`
3. Redeploy
4. Usa enlace admin
5. **Inmediatamente después**, volver a `false` y redeploy
6. Documentar en audit log

---

## Scripts helper

### Generar secretos seguros

```bash
node scripts/generate-vercel-preview-secrets.mjs
```

Output:

```
SESSION_SECRET=<valor-aleatorio-32-chars>
SYNCXML_ADMIN_ACCESS_TOKEN=<valor-aleatorio-64-chars>
```

Copiar a Vercel Settings → Environment Variables

### Validar configuración Preview

```bash
npm run validate:preview
```

Checks:
- ¿DATABASE_URL apunta a preview DB?
- ¿SES credentials están vacías?
- ¿SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false?
- ¿SESSION_SECRET es seguro?

### Deploy a Preview manualmente

```bash
vercel deploy --prebuilt
```

---

## Troubleshooting

### Preview deployment fails

1. Check build logs: `Deployments → <branch> → Build logs`
2. Look for:
   - `DATABASE_URL is required` → Add DATABASE_URL
   - `Missing environment variable` → Check variable name/scope
   - `Build error in src/...` → Check code

### Admin access returns 404

1. Check `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION` value
2. In Preview: should be `false` or not set (Preview is allowed)
3. In Production: must be explicitly `true`
4. If `true` but still 404: redeploy to pick up change

### SES operations fail

1. Check if you're in Preview (SES should fail gracefully)
2. Check `SYNCXML_SES_ENDPOINT` is configured
3. Check token/credentials are valid
4. Check environment is `pre` (preproduction), not `prod`

### Database connection timeout

1. Check `DATABASE_URL` is correct
2. Test connection: `psql $DATABASE_URL`
3. Check firewall/IP allowlist if using cloud DB
4. For Neon: may be sleeping (free tier), wake it up

---

## Security checklist

- [ ] Production: `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false`
- [ ] Preview: SES credentials empty or stub
- [ ] Preview: Using preview DB, not production
- [ ] Preview: `SYNCXML_ADMIN_ACCESS_ALLOWED_ENV` does not include prod
- [ ] All: `SESSION_SECRET` is cryptographically random (not hardcoded)
- [ ] All: No tokens/keys in `.env.example` (template only)
- [ ] CI/CD: No secrets leaking in logs
- [ ] Vercel: Secrets marked as "Sensitive"

---

## Variables quick reference

| Variable | Purpose | Development | Preview | Production |
|----------|---------|-------------|---------|------------|
| `SESSION_SECRET` | Session encryption | Random | Random | Random (different) |
| `DATABASE_URL` | DB connection | Local/test | Preview DB | Production DB |
| `SYNCXML_ADMIN_ACCESS_ENABLED` | Enable admin routes | `true` | `true` | `false` |
| `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION` | Allow production admin | `false` | `false` | `false` |
| `SYNCXML_SES_ENDPOINT` | SES API endpoint | Empty | Empty | Preprod URL |
| `SYNCXML_SES_USERNAME` | SES username | Empty | Empty | Preprod user |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` | Preview URL | Production URL |
| `AUTH_URL` | Auth callback URL | `http://localhost:3000` | Preview URL | Production URL |
| `LOG_LEVEL` | Logging level | `debug` | `debug` | `warn` |

---

## References

- Vercel Docs: https://vercel.com/docs/environment-variables
- Vercel Deployments: https://vercel.com/docs/deployments/overview
- Security Best Practices: https://vercel.com/docs/security/edge-network

---

*Anclora SyncXML — Vercel Preview Setup*  
*v1.0 — 2026-06-05*
