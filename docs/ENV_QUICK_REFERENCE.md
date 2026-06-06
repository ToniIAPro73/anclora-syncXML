# Quick Reference: Variables por Entorno

## 📋 Copiar/Pegar Exacto

### 🔧 Development (.env.local)

```env
# === DATABASE (LOCAL) ===
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/anclora_syncxml_dev"
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/anclora_syncxml_dev"

# === NEXT.JS / AUTH ===
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# === SESSION ===
SESSION_SECRET="dev-secret-change-in-prod"

# === SYNCXML CORE ===
SYNCXML_APP_URL="http://localhost:3000"
SYNCXML_LOGIN_URL="http://localhost:3000/login"
SYNCXML_ADMIN_EMAIL="antonio@anclora.com"
SYNCXML_DISABLE_AUTH="false"
SYNCXML_LOCAL_DEMO="false"

# === ADMIN ACCESS (DEV) ===
SYNCXML_ADMIN_ACCESS_ENABLED="true"
SYNCXML_ADMIN_ACCESS_TOKEN="dev-token"
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV="development,preview"
SYNCXML_ADMIN_ACCESS_REDIRECT="/app"
SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION="false"

# === SES (DEJAR VACÍO EN DEV) ===
SYNCXML_SES_ENV="pre"
SYNCXML_SES_ENDPOINT=""
SYNCXML_SES_USERNAME=""
SYNCXML_SES_PASSWORD=""
SYNCXML_SES_LANDLORD_CODE=""
SYNCXML_SES_APPLICATION="Anclora SyncXML"
SYNCXML_SES_ALLOW_PRODUCTION_SEND="false"
SYNCXML_SES_ALLOW_INSECURE_TLS="false"

# === SHARED ===
NODE_OPTIONS="--use-system-ca"
```

---

### 🔵 Preview (Vercel — Scope: Preview)

**GENERADOR:** SESSION_SECRET y ADMIN_TOKEN necesitan valores nuevos

```env
# === SESSION (GENERAR NUEVO) ===
SESSION_SECRET=<openssl rand -base64 32>
SYNCXML_ADMIN_ACCESS_TOKEN=<openssl rand -hex 32>

# === URLS PREVIEW ===
NEXT_PUBLIC_APP_URL=https://<branch>-anclora-syncxml.vercel.app
AUTH_URL=https://<branch>-anclora-syncxml.vercel.app
SYNCXML_APP_URL=https://<branch>-anclora-syncxml.vercel.app
SYNCXML_LOGIN_URL=https://<branch>-anclora-syncxml.vercel.app/login

# === DATABASE (PREVIEW) ===
DATABASE_URL=<PREVIEW-DB-CONNECTION-STRING>
DIRECT_URL=<PREVIEW-DB-CONNECTION-STRING>

# === ADMIN ACCESS (PREVIEW) ===
SYNCXML_ADMIN_ACCESS_ENABLED="true"
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV="preview,development"
SYNCXML_ADMIN_ACCESS_REDIRECT="/app"
SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION="false"

# === SES (VACÍO - NO COPIAR) ===
SYNCXML_SES_ENV="pre"
SYNCXML_SES_ENDPOINT=""
SYNCXML_SES_USERNAME=""
SYNCXML_SES_PASSWORD=""
SYNCXML_SES_LANDLORD_CODE=""
SYNCXML_SES_APPLICATION="Anclora SyncXML"
SYNCXML_SES_ALLOW_PRODUCTION_SEND="false"
SYNCXML_SES_ALLOW_INSECURE_TLS="false"

# === SHARED ===
AUTH_TRUST_HOST="true"
SYNCXML_ADMIN_EMAIL="antonio@anclora.com"
NODE_OPTIONS="--use-system-ca"
```

---

### 🔴 Production (Vercel — Scope: Production)

**GENERADOR:** SESSION_SECRET necesita valor nuevo (diferente a Preview)

```env
# === SESSION (GENERAR NUEVO - DIFERENTE A PREVIEW) ===
SESSION_SECRET=<openssl rand -base64 32>

# === URLS PRODUCTION ===
NEXT_PUBLIC_APP_URL="https://anclora-syncxml.vercel.app"
AUTH_URL="https://anclora-syncxml.vercel.app"
SYNCXML_APP_URL="https://anclora-syncxml.vercel.app"
SYNCXML_LOGIN_URL="https://anclora-syncxml.vercel.app/login"

# === DATABASE (PRODUCTION) ===
DATABASE_URL=<PRODUCTION-DB-CONNECTION-STRING>
DIRECT_URL=<PRODUCTION-DB-CONNECTION-STRING>

# === ADMIN ACCESS (PRODUCTION - DISABLED) ===
SYNCXML_ADMIN_ACCESS_ENABLED="false"
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV="development"
SYNCXML_ADMIN_ACCESS_REDIRECT="/app"
SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION="false"

# === SES (PREPROD - SI NECESARIO) ===
SYNCXML_SES_ENV="pre"
SYNCXML_SES_ENDPOINT="https://ses-api-preprod.xxx.com"
SYNCXML_SES_USERNAME="preprod-user"
SYNCXML_SES_PASSWORD="preprod-pass"
SYNCXML_SES_LANDLORD_CODE="landlord-code"
SYNCXML_SES_APPLICATION="Anclora SyncXML"
SYNCXML_SES_ALLOW_PRODUCTION_SEND="false"
SYNCXML_SES_ALLOW_INSECURE_TLS="false"

# === SHARED ===
AUTH_TRUST_HOST="true"
SYNCXML_ADMIN_EMAIL="antonio@anclora.com"
NODE_OPTIONS="--use-system-ca"
```

---

## 📊 Diferencias Clave

| Aspecto | Development | Preview | Production |
|---------|-------------|---------|------------|
| **DATABASE_URL** | Local | Preview DB | Production DB |
| **URLs** | localhost:3000 | preview-url | anclora-syncxml.vercel.app |
| **SESSION_SECRET** | dev-value | unique | unique (different) |
| **ADMIN_ACCESS_ENABLED** | true | true | **false** |
| **SES_ENDPOINT** | (vacío) | (vacío) | preprod-url |
| **SES_CREDENTIALS** | (vacío) | (vacío) | preprod-creds |

---

## 🎯 Qué cambiar en cada variable entre entornos

```text
DATABASE_URL
├─ Dev: postgresql://localhost:5432/dev
├─ Preview: postgresql://neon-preview.db/preview
└─ Prod: postgresql://neon-prod.db/prod

NEXT_PUBLIC_APP_URL
├─ Dev: http://localhost:3000
├─ Preview: https://branch-anclora-syncxml.vercel.app
└─ Prod: https://anclora-syncxml.vercel.app

SESSION_SECRET
├─ Dev: dev-secret (cualquier valor)
├─ Preview: <generado> (único)
└─ Prod: <generado> (único, diferente a Preview)

SYNCXML_ADMIN_ACCESS_ENABLED
├─ Dev: true (testing)
├─ Preview: true (admin testing)
└─ Prod: false (disabled by default)

SYNCXML_SES_ENDPOINT
├─ Dev: (vacío)
├─ Preview: (vacío) ⚠️ NUNCA copiar
└─ Prod: https://ses-preprod.xxx.com

SYNCXML_ADMIN_ACCESS_ALLOWED_ENV
├─ Dev: "development,preview"
├─ Preview: "preview,development"
└─ Prod: "development"
```

---

## ✅ Verificación rápida

**Antes de pushear a Preview:**

```text
☑️ SESSION_SECRET generado nuevo
☑️ ADMIN_ACCESS_TOKEN generado nuevo
☑️ URLs actualizadas a preview-url
☑️ DATABASE_URL apunta a preview DB
☑️ SES credenciales VACÍAS
☑️ ADMIN_ACCESS_ENABLED="true"
```

**Antes de pushear a Production:**

```text
☑️ SESSION_SECRET generado nuevo (diferente a Preview)
☑️ URLs actualizadas a anclora-syncxml.vercel.app
☑️ DATABASE_URL apunta a production DB
☑️ ADMIN_ACCESS_ENABLED="false"
☑️ ALLOW_ADMIN_ACCESS_IN_PRODUCTION="false"
☑️ SES apunta a PREPROD (no prod real)
```

---

*Anclora SyncXML — Quick Reference*
