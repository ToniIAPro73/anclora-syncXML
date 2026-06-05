# Control de Acceso: Restricciones SES en Piloto Controlado

**Versión:** 1.0  
**Fecha:** 2026-06-05  
**Objetivo:** Asegurar que usuarios piloto no envíen automáticamente a SES.HOSPEDAJES

---

## Principios

Durante la fase de piloto controlado:

✅ **Permitido para TODOS:**
- Importar Excel
- Revisar y validar datos
- Generar XML localmente
- Descargar XML

❌ **PROHIBIDO para usuarios piloto:**
- Enviar XML a SES automáticamente
- Acceder a endpoints `/api/ses/*`
- Ejecutar operaciones SES sin superviso técnico

✅ **Permitido SOLO para responsable técnico (admin):**
- Enviar a preproducción SES (`environment: "pre"`)
- Pruebas técnicas con datos sintéticos
- Solo si `SYNCXML_ADMIN_ACCESS_ENABLED=true`

❌ **NUNCA permitido (incluso para admin):**
- Enviar a producción SES sin `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=true`
- Usar credenciales SES de producción en Preview
- Enviar datos reales

---

## Implementación

### 1. Variables de entorno requeridas

```env
# Control de admin access
SYNCXML_ADMIN_ACCESS_ENABLED=true|false
SYNCXML_ADMIN_ACCESS_TOKEN=<token-largo-seguro>
SYNCXML_ADMIN_ACCESS_ALLOWED_ENV=development,preview
SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false

# NO copiar a Preview sin confirmación:
SYNCXML_SES_ENDPOINT=https://...
SYNCXML_SES_USERNAME=...
SYNCXML_SES_PASSWORD=...
SYNCXML_SES_LANDLORD_CODE=...
SYNCXML_SES_ALLOW_PRODUCTION_SEND=false
```

### 2. Estructura de rutas SES

```
src/app/api/ses/
  ├── catalogo/          # SES catalog query
  ├── lote/              # Batch query
  ├── envio/             # SUBMIT (restringido)
  ├── anulacion/         # CANCEL (restringido)
  ├── anulacion-lote/    # BATCH CANCEL (restringido)
  └── estado/            # Status query
```

**Rutas que envían/modifican en SES:** `envio`, `anulacion`, `anulacion-lote`

### 3. Guards en cada ruta

#### Para rutas SES críticas (POST/PATCH/DELETE):

```typescript
// src/app/api/ses/envio/route.ts

import { restrictSESSubmissionForPilot } from "@/lib/security/adminAccess";
import { isAdminAccessAllowedInEnv } from "@/lib/security/adminAccess";

export async function POST(request: NextRequest) {
  // Check: ¿Es usuario piloto?
  const isPilot = await getCurrentUserRole(request) === "pilot";
  if (isPilot) {
    return restrictSESSubmissionForPilot(true);
  }

  // Check: ¿Está habilitado admin en este env?
  if (!isAdminAccessAllowedInEnv()) {
    return NextResponse.json(
      { error: "SES operations disabled in this environment" },
      { status: 403 }
    );
  }

  // Check: ¿Production y no permitida?
  if (process.env.NODE_ENV === "production" && 
      process.env.SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION !== "true") {
    return NextResponse.json(
      { error: "Production SES access disabled" },
      { status: 403 }
    );
  }

  // Proceed with SES operation
  // ...
}
```

#### Para rutas SES lectura (GET):

```typescript
// src/app/api/ses/catalogo/route.ts

// Estas pueden ser más permisivas (solo require auth)
// No necesitan check de admin/pilot

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  // Proceed with read operation
  // ...
}
```

### 4. Hidenti botones UI en frontend

```typescript
// Ejemplo: ocultar botón "Enviar a SES" para pilotos

function SESSubmitButton() {
  const { user } = useAuth();
  const isPilot = user?.role === "pilot";

  if (isPilot) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-sm">
          El envío a SES no está disponible en esta fase de piloto.
          Puedes generar y descargar XML para revisión local.
        </p>
      </div>
    );
  }

  return (
    <button onClick={submitToSES}>
      Enviar a SES Preproducción
    </button>
  );
}
```

---

## Checklist de implementación

- [ ] `adminAccess.ts` creado en `src/lib/security/`
- [ ] Funciones `restrictSESSubmissionForPilot()` y `isAdminAccessAllowedInEnv()` importadas en rutas SES críticas
- [ ] Todas las rutas `/api/ses/envio`, `/api/ses/anulacion/*` verifican role
- [ ] Tests de acceso denegado para pilotos
- [ ] UI ocul

ta submit buttons para pilotos
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Production: `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=false` por defecto
- [ ] Preview: `SYNCXML_ADMIN_ACCESS_ENABLED=true` (opcional)

---

## Error responses

### Para usuario piloto intentando enviar a SES:

```json
{
  "error": "Pilot users cannot submit to SES",
  "message": "El envío a SES no está disponible para usuarios piloto. En esta fase puedes generar y descargar XML revisable.",
  "phase": "controlled-pilot",
  "status": 403
}
```

### Para admin en production sin permisos:

```json
{
  "error": "SES submission denied",
  "message": "Production SES access disabled. Set SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION=true to enable.",
  "phase": "controlled-pilot",
  "status": 403
}
```

---

## Seguridad

### DO's ✅
- Verificar role en CADA ruta SES crítica
- Usar server-side checks, no solo UI
- Documentar por qué está restringido
- Fail-closed: denegar por defecto en Production
- Loguear intentos de acceso denegado

### DON'Ts ❌
- No confiar solo en UI (usuario podría hacer POST directo)
- No copiar credenciales SES a Preview sin revisión
- No permitir production sends sin flag explícito
- No guardar tokens en repo
- No loguear credenciales completas

---

## Testing

### Teste caso: Pilot intenta POST a /api/ses/envio

```bash
curl -X POST http://localhost:3000/api/ses/envio \
  -H "Authorization: Bearer <pilot-token>" \
  -H "Content-Type: application/json" \
  -d '{ "batch_code": "..." }'

# Esperado: 403 Forbidden
# { "error": "Pilot users cannot submit to SES", ... }
```

### Test caso: Admin en preview intenta POST

```bash
curl -X POST https://preview-url.vercel.app/api/ses/envio \
  -H "Authorization: Bearer <admin-token>" \
  -H "x-admin-token: <SYNCXML_ADMIN_ACCESS_TOKEN>" \
  -d '{ "batch_code": "...", "environment": "pre" }'

# Esperado: 200 OK (si credenciales preproducción configuradas)
# o 503 SES Service Unavailable
```

---

## Referencias

- Utilidades: `src/lib/security/adminAccess.ts`
- Auth base: `src/lib/auth.ts` (requireAuth)
- Variables: `.env.example`
- Rutas SES: `src/app/api/ses/*/route.ts`

---

*Anclora SyncXML — Control de Acceso SES*  
*v1.0 — 2026-06-05*
