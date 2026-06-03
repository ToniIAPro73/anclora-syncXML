# Variables de Entorno - Anclora SyncXML Pilot

Este documento detalla las variables de entorno necesarias para el flujo del piloto controlado.

## anclora-syncXML

| Variable | Obligatoria | Entorno | Ejemplo | Descripción |
|----------|-------------|---------|---------|-------------|
| `DATABASE_URL` | Sí | Staging, Prod | `postgresql://...` | URL de la base de datos (Neon/Postgres). |
| `SYNCXML_INTERNAL_API_SECRET` | Sí | Staging, Prod | `super-secret-local` | Secreto para el endpoint interno de provisión de usuarios. |
| `NEXUS_SYNCXML_WEBHOOK_URL` | Sí | Staging, Prod | `https://nexus.test/api/internal/webhooks/syncxml-pilot` | URL del webhook de Nexus. |
| `NEXUS_SYNCXML_WEBHOOK_SECRET` | Sí | Staging, Prod | `secret-webhook` | Secreto para firmar el webhook enviado a Nexus. |
| `SYNCXML_APP_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app` | URL pública de la app. |
| `SYNCXML_LOGIN_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app/login` | URL de login enviada en correos. |
| `RESEND_API_KEY` | Sí | Staging, Prod | `re_123456` | API Key para correos transaccionales. |
| `RESEND_FROM_EMAIL` | Sí | Staging, Prod | `Piloto <piloto@anclora.com>` | Email remitente. |
| `SYNCXML_ALLOWED_EMAIL_DOMAINS` | No | Todos | `anclora.com,example.com` | Dominios permitidos. |
| `SYNCXML_ENABLE_PERSISTENT_STORAGE` | Sí | Todos | `false` | Determina si se persiste en BD de forma permanente (por defecto false). |