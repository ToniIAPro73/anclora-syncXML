# Flujo de Email: Aceptación de Piloto

**Documento:** Instrucciones para integración de template de aceptación con anclora-nexus  
**Versión:** 1.0  
**Fecha:** 2026-06-05

---

## Visión general

Cuando un usuario solicita acceso al piloto controlado de Anclora SyncXML:

1. **Recibe confirmación automática** de solicitud recibida (enviada vía anclora-nexus)
2. **Espera revisión manual** por responsable técnico (Toni) en anclora-nexus
3. **Si es aceptado**, anclora-nexus envía email de aceptación con:
   - Enlace de acceso a la aplicación
   - Dataset sintético adjunto/enlazado
   - Guía rápida de prueba
   - Disclaimers legales
   - Instrucciones de feedback

---

## Template de Email

La plantilla está en: `src/lib/email-templates/pilot-acceptance.tsx`

**Propiedades:**

```typescript
interface PilotAcceptanceEmailProps {
  recipientName: string;              // Nombre del usuario
  pilotAccessUrl: string;              // URL de acceso a /app
  demoExcelFile: string;               // Nombre del archivo Excel
  quickStartGuideUrl: string;           // URL al guía rápida
  feedbackEmail: string;                // Email de contacto para feedback
  language?: "es" | "en" | "de";       // Idioma (default: español)
}
```

**Idiomas soportados:** Español, Inglés, Alemán

---

## Cómo usar la plantilla

### 1. En una ruta API (Recomendado)

Si hay endpoint que acepte pilotos manualmente:

```typescript
import { generatePilotAcceptanceEmail } from "@/lib/email-templates/pilot-acceptance";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailContent = generatePilotAcceptanceEmail({
  recipientName: "Juan García",
  pilotAccessUrl: "https://anclora-syncxml.vercel.app/app",
  demoExcelFile: "pilot-demo-stable.xlsx",
  quickStartGuideUrl: "https://docs.anclora.com/pilot/quick-start-es",
  feedbackEmail: "feedback@anclora.com",
  language: "es",
});

await resend.emails.send({
  from: "noreply@anclora.com",
  to: "user@example.com",
  subject: emailContent.subject,
  html: emailContent.html,
});
```

### 2. En línea de comandos (Manual)

Para testing local o envíos puntuales:

```bash
node -e "
const template = require('./src/lib/email-templates/pilot-acceptance');
const email = template.generatePilotAcceptanceEmail({
  recipientName: 'Test User',
  pilotAccessUrl: 'https://localhost:3000/app',
  demoExcelFile: 'pilot-demo-stable.xlsx',
  quickStartGuideUrl: 'http://localhost:3000/docs/pilot/quick-start-en',
  feedbackEmail: 'feedback@anclora.com',
  language: 'en'
});
console.log(email.html);
"
```

### 3. Con Resend (Producción)

```bash
# Require: RESEND_API_KEY set

node -e "
const { Resend } = require('resend');
const template = require('./src/lib/email-templates/pilot-acceptance');

const resend = new Resend(process.env.RESEND_API_KEY);
const emailContent = template.generatePilotAcceptanceEmail({...});

resend.emails.send({
  from: 'noreply@anclora.com',
  to: 'user@example.com',
  subject: emailContent.subject,
  html: emailContent.html
});
"
```

---

## Contenido incluido en el email

### Por idioma

#### 🇪🇸 Español
- Saludo personalizado
- Confirmación de aceptación
- Qué se puede probar (✓/✗)
- Enlace de acceso
- Instrucciones de descarga
- Primeros pasos
- Cómo enviar feedback
- **Disclaimer SES obligatorio** (no envíos automáticos)

#### 🇬🇧 Inglés
- Same as above, translated

#### 🇩🇪 Alemán
- Same as above, translated

---

## Assets referenciados

### Excel sintético

**Archivo:** `test-data/pilot-demo-stable.xlsx`

**Cómo incluirlo en el email:**

Opción A (adjunto directo):
```typescript
// Si Resend soporta adjuntos
await resend.emails.send({
  ...,
  attachments: [{
    filename: 'pilot-demo-stable.xlsx',
    path: './test-data/pilot-demo-stable.xlsx'
  }]
});
```

Opción B (enlace de descarga):
```typescript
const demoExcelFile = "pilot-demo-stable.xlsx";
const downloadUrl = `https://anclora-syncxml.vercel.app/pilot-assets/pilot-demo-stable.xlsx`;
```

Opción C (en el email como texto):
```
Descarga: https://github.com/ToniIAPro73/anclora-syncXML/raw/main/test-data/pilot-demo-stable.xlsx
```

### Guía rápida

**Archivos:**
- `docs/pilot/PILOT_QUICK_START_ES.md`
- `docs/pilot/PILOT_QUICK_START_EN.md`
- `docs/pilot/PILOT_QUICK_START_DE.md`

**Cómo incluirlo:**

Opción A (URL a repo GitHub):
```
https://github.com/ToniIAPro73/anclora-syncXML/blob/main/docs/pilot/PILOT_QUICK_START_ES.md
```

Opción B (URL a sitio interno):
```
https://anclora-syncxml.vercel.app/docs/pilot/quick-start-es
```

Opción C (adjunto como PDF):
```
// Convertir MD a PDF y adjuntar
```

---

## Disclaimers obligatorios

El email DEBE incluir este disclaimer en el idioma del usuario:

### Español
```
Durante esta fase, el piloto no realiza envíos oficiales ni envíos autónomos al entorno SES.HOSPEDAJES. Cualquier prueba técnica contra preproducción SES, si procede, será ejecutada únicamente por el responsable técnico de Anclora SyncXML con datos sintéticos o anonimizados.
```

### Inglés
```
During this phase, the pilot does not perform official submissions or autonomous submissions to the SES.HOSPEDAJES environment. Any technical test against SES pre-production, if applicable, will be executed only by the technical owner of Anclora SyncXML using synthetic or anonymized data.
```

### Alemán
```
In dieser Phase führt der Pilot keine offiziellen oder eigenständigen Übermittlungen an die SES.HOSPEDAJES-Umgebung durch. Technische Tests gegen die SES-Vorproduktionsumgebung werden, falls erforderlich, ausschließlich vom technischen Verantwortlichen von Anclora SyncXML mit synthetischen oder anonymisierten Daten durchgeführt.
```

---

## Flujo manual (Hasta que haya endpoint de aceptación)

Mientras se implementa endpoint de aceptación automática:

1. Toni revisa solicitud en `/app/pilot/requests` (si existe)
2. Marca usuario como `approved: true` en DB
3. Obtiene email del usuario piloto
4. Ejecuta script que genera y envía email (o usa Resend manually)
5. Usuario recibe email con instrucciones y assets

---

## Ejemplo real

```typescript
// src/app/api/pilot/accept/route.ts (futuro)

import { NextRequest, NextResponse } from "next/server";
import { generatePilotAcceptanceEmail } from "@/lib/email-templates/pilot-acceptance";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  // Solo admin
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { pilotUserId, language = "es" } = await req.json();
  
  // Get pilot user from DB
  const pilot = await db.pilotUser.findUnique({ where: { id: pilotUserId } });
  if (!pilot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate email
  const email = generatePilotAcceptanceEmail({
    recipientName: pilot.name,
    pilotAccessUrl: process.env.NEXT_PUBLIC_APP_URL + "/app",
    demoExcelFile: "pilot-demo-stable.xlsx",
    quickStartGuideUrl: process.env.NEXT_PUBLIC_APP_URL + `/docs/pilot/quick-start-${language}`,
    feedbackEmail: "feedback@anclora.com",
    language: language as "es" | "en" | "de",
  });

  // Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "noreply@anclora.com",
    to: pilot.email,
    subject: email.subject,
    html: email.html,
  });

  // Mark as approved in DB
  await db.pilotUser.update({
    where: { id: pilotUserId },
    data: { 
      approved: true, 
      approvedAt: new Date(),
      approvedBy: req.user.id 
    },
  });

  return NextResponse.json({ success: true });
}
```

---

## Checklist para implementación

- [ ] Template está en `src/lib/email-templates/pilot-acceptance.tsx`
- [ ] Soporta 3 idiomas (ES, EN, DE)
- [ ] Incluye disclaimer SES obligatorio
- [ ] References Excel sintético
- [ ] References guía rápida
- [ ] Email generado sin secretos
- [ ] Resend API configurado
- [ ] Test de generación de email
- [ ] Endpoint de aceptación implementado (si aplica)

---

## Notas

- **No almacenar secretos:** El email generado no contiene tokens, keys ni información sensible
- **URLs públicas:** Todos los enlaces deben ser públicamente accesibles
- **Idioma:** Detectar idioma preferido del usuario si es posible
- **Feedback:** El email debe dejar clara la vía de feedback

---

*Anclora SyncXML — Guía de Email de Aceptación*  
*v1.0 — 2026-06-05*
