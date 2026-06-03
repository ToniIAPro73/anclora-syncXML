# Prompt maestro end-to-end — Anclora SyncXML v0.2 Pilot Candidate

## Rol del agente

Actúa como un **agente senior full-stack, DevSecOps y QA**, especializado en aplicaciones SaaS B2B con datos sensibles, integraciones entre repositorios, validación de flujos end-to-end, seguridad, RGPD, automatización CI/CD y producto digital premium.

Tu misión es implementar, revisar, endurecer y validar la versión **v0.2 Pilot Candidate** de **Anclora SyncXML**, coordinando los tres repos afectados:

1. `anclora-syncXML`
2. `anclora-nexus`
3. `anclora-content-generator-ai`

Debes trabajar de forma incremental, segura y verificable. No hagas cambios cosméticos sin impacto. Prioriza la seguridad, la trazabilidad, la privacidad, la estabilidad del flujo de piloto controlado y la reducción de riesgos antes de cualquier mejora visual.

---

## Contexto del producto

**Anclora SyncXML** es una herramienta ligera para pequeños alojamientos y gestores que trabajan con Excel/XLSX y necesitan revisar datos de huéspedes, detectar errores operativos y preparar un XML revisable orientado al flujo **SES.HOSPEDAJES**, con privacidad por defecto y revisión humana.

La aplicación **no debe prometer cumplimiento legal garantizado**, ni integración oficial con SES, ni envío automático al Ministerio, ni aceptación garantizada del XML.

El estado objetivo de este trabajo no es un SaaS abierto. El objetivo es dejar el sistema como:

> **MVP candidato a piloto controlado**, apto para pruebas con datos sintéticos o anonimizados, con flujo real end-to-end entre SyncXML, Nexus y Hermes, pendiente todavía de uso con datos reales hasta cerrar RGPD/DPA, XSD oficial, SES preproducción y hardening final.

---

## Principio rector

La prioridad absoluta es:

> **Seguridad y validación de datos antes que velocidad o apariencia.**

No debes habilitar, sugerir ni dejar accesible un flujo de uso con datos reales de huéspedes si no están cerrados todos los checks de seguridad, privacidad, retención, borrado, XSD y legal.

---

## Repos implicados

### 1. `anclora-syncXML`

Rol:

- Landing pública.
- Solicitud de piloto controlado.
- Login de usuarios piloto.
- App principal.
- Importación Excel/XLSX.
- Vista previa.
- Validación.
- Generación XML revisable.
- Endpoint interno para provisioning de usuarios piloto desde Nexus.

Estado esperado:

- Landing orientada a piloto controlado.
- Login protegido.
- Modelo `PilotUser`.
- Migración Prisma aplicada.
- Hashing seguro de contraseñas.
- Endpoint `POST /api/internal/pilot-users`.
- Variables de entorno completas y documentadas.
- No uso de datos reales sin autorización expresa.
- QA visual pendiente de completar.

---

### 2. `anclora-nexus`

Rol:

- Backoffice operativo.
- Recepción de webhook desde SyncXML.
- Persistencia de solicitudes.
- Llamada a Hermes para scoring.
- Creación de tareas internas `syncxml_pilot_review`.
- Revisión humana.
- Aprobación, rechazo o solicitud de más información.
- Provisioning de usuario piloto en SyncXML.
- Envío de email de aceptación o solicitud de más información.

Estado esperado:

- Webhook interno endurecido con `SYNCXML_WEBHOOK_SECRET`.
- Validación estricta de payload.
- Lógica determinista de decisión.
- Rutas protegidas para revisión.
- Panel UI para tareas SyncXML.
- Smoke dry-run existente.
- Pendiente prueba real con Supabase, email, reviewer y SyncXML.

---

### 3. `anclora-content-generator-ai`

Rol:

- Worker Hermes.
- Validación estructurada de solicitudes de piloto.
- Endpoint `/api/syncxml/pilot/validate`.
- Respuesta machine-readable: `approve`, `reject`, `manual_review`.
- Fallback seguro a revisión manual si OpenRouter falla.

Estado esperado:

- Schemas estrictos.
- Prompt OpenRouter controlado.
- Salvaguardas deterministas.
- Tests de aprobación segura y revisión manual.
- No decisión automática final.
- Pendiente smoke real con OpenRouter.

---

## Objetivo principal de implementación

Debes cerrar el flujo real de piloto controlado en staging:

```text
Usuario solicita piloto en SyncXML
        ↓
SyncXML envía webhook interno a Nexus
        ↓
Nexus valida payload y persiste access_request
        ↓
Nexus consulta Hermes para scoring estructurado
        ↓
Nexus crea tarea syncxml_pilot_review
        ↓
Revisor humano aprueba / rechaza / pide más información
        ↓
Si aprueba, Nexus llama a SyncXML /api/internal/pilot-users
        ↓
SyncXML crea o rota PilotUser y devuelve password temporal
        ↓
Nexus envía email de aceptación
        ↓
Usuario inicia sesión en SyncXML
        ↓
Uso de demo/piloto controlado con datos sintéticos o anonimizados
        ↓
Feedback y decisión comercial
```

---

## Resultado final esperado

Al terminar, debes entregar:

1. Código implementado en los tres repos afectados.
2. Variables de entorno documentadas y alineadas.
3. Migraciones aplicadas o scripts preparados.
4. Scripts smoke reales y dry-run.
5. Tests unitarios/integración actualizados.
6. QA E2E básico.
7. QA visual mínimo.
8. Documentación de despliegue.
9. Checklist Go/No-Go.
10. Informe final de cambios, riesgos pendientes y comandos ejecutados.

---

# Fase 0 — Preparación obligatoria

## 0.1. Antes de modificar código

Ejecuta en cada repo:

```bash
git status
git branch --show-current
git pull --rebase origin main || git pull --rebase
```

Si existe una rama activa de trabajo, documenta su nombre.

Crea una rama de trabajo por repo:

```bash
git checkout -b codex/syncxml-v02-pilot-candidate-hardening
```

Si la rama ya existe:

```bash
git checkout codex/syncxml-v02-pilot-candidate-hardening
git pull --rebase
```

---

## 0.2. Detectar estructura real

En cada repo, identifica:

```bash
pwd
ls
find . -maxdepth 3 -type f \( -name "package.json" -o -name "pyproject.toml" -o -name "requirements.txt" -o -name "prisma.schema" -o -name ".env.example" \)
```

No asumas framework ni rutas. Verifica antes.

---

## 0.3. Inventario de endpoints existentes

Busca referencias a SyncXML, Nexus y Hermes:

```bash
grep -R "syncxml" -n . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git || true
grep -R "pilot" -n . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git || true
grep -R "HERMES" -n . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git || true
grep -R "WEBHOOK" -n . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git || true
```

Entrega un resumen breve antes de tocar código.

---

# Fase 1 — Matriz única de variables de entorno

## Objetivo

Evitar que el sistema falle por secretos desalineados entre SyncXML, Nexus y Hermes.

## 1.1. Crear o actualizar documentación de variables

En cada repo, actualiza `.env.example` y crea si no existe:

```text
docs/env-syncxml-pilot.md
```

Debe contener:

- nombre de variable;
- repo donde se usa;
- si es obligatoria;
- entorno: local, staging, production;
- ejemplo seguro ficticio;
- descripción;
- cómo generar el valor;
- dependencias cruzadas.

---

## 1.2. Variables mínimas por repo

### `anclora-syncXML`

Obligatorias para staging:

```env
DATABASE_URL=
SYNCXML_INTERNAL_API_SECRET=
NEXUS_SYNCXML_WEBHOOK_URL=
NEXUS_SYNCXML_WEBHOOK_SECRET=
SYNCXML_APP_URL=
SYNCXML_LOGIN_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
SYNCXML_ALLOWED_EMAIL_DOMAINS=
SYNCXML_ENABLE_PERSISTENT_STORAGE=false
```

Si existen nombres ya definidos en el repo, respétalos y documenta alias o migración. No dupliques variables innecesariamente.

---

### `anclora-nexus`

Obligatorias para staging:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_CTA_ORG_ID=
LEGACY_SINGLE_TENANT_ORG_ID=
SYNCXML_WEBHOOK_SECRET=
SYNCXML_INTERNAL_API_URL=
SYNCXML_INTERNAL_API_SECRET=
SYNCXML_APP_URL=
SYNCXML_LOGIN_URL=
HERMES_WORKER_URL=
HERMES_WORKER_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Regla:

- `PUBLIC_CTA_ORG_ID` debe ser preferente.
- `LEGACY_SINGLE_TENANT_ORG_ID` solo fallback documentado.

---

### `anclora-content-generator-ai`

Obligatorias para staging:

```env
WORKER_API_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
HERMES_SYNCXML_VALIDATION_ENABLED=true
```

Opcionales:

```env
OPENROUTER_BASE_URL=
HERMES_LOG_LEVEL=
HERMES_TIMEOUT_MS=
```

---

## 1.3. Script de validación de entorno

Crea un script por repo:

```text
scripts/check-env-syncxml-pilot.*
```

Debe validar:

- variables obligatorias presentes;
- secretos no vacíos;
- URLs válidas;
- no uso de placeholders tipo `changeme`, `todo`, `example`, `123456`;
- longitud mínima de secretos compartidos;
- coherencia entre URLs internas.

Debe poder ejecutarse así:

```bash
npm run check:env
```

o equivalente si el repo no usa Node.

---

# Fase 2 — Cierre operativo de `anclora-syncXML`

## Objetivo

Dejar SyncXML listo para recibir solicitudes, crear usuarios piloto mediante llamada interna segura y permitir login controlado.

---

## 2.1. Revisar modelo `PilotUser`

Verifica que exista un modelo equivalente a:

```prisma
model PilotUser {
  id                 String   @id @default(cuid())
  email              String   @unique
  name               String?
  company            String?
  passwordHash       String
  temporaryPassword  Boolean  @default(true)
  status             String   @default("active")
  sourceRequestId    String?
  lastLoginAt        DateTime?
  passwordRotatedAt  DateTime?
  expiresAt          DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

Adapta al schema real si ya existe. No rompas datos existentes.

---

## 2.2. Endpoint interno de provisioning

Verifica o implementa:

```http
POST /api/internal/pilot-users
```

### Requisitos

Debe:

- exigir `Authorization: Bearer ${SYNCXML_INTERNAL_API_SECRET}`;
- rechazar secretos ausentes o incorrectos;
- validar payload estrictamente;
- crear usuario piloto si no existe;
- reactivar usuario si existe y está inactivo, si procede;
- rotar contraseña si se solicita explícitamente;
- devolver contraseña temporal solo cuando se emite o rota;
- no loguear contraseña temporal;
- no loguear PII innecesaria;
- devolver errores claros pero no filtradores;
- usar hashing seguro.

### Payload esperado

```json
{
  "requestId": "string",
  "email": "cliente@example.com",
  "name": "Nombre Cliente",
  "company": "Villa Kentia",
  "rotatePassword": false,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

### Respuesta esperada

```json
{
  "ok": true,
  "userId": "string",
  "email": "cliente@example.com",
  "created": true,
  "reactivated": false,
  "rotatedPassword": false,
  "temporaryPassword": "solo_si_corresponde"
}
```

---

## 2.3. Login de usuario piloto

Verifica:

- login por email/password;
- fallback admin solo si ya existía y está justificado;
- bloqueo de usuarios inactivos;
- sesión segura;
- cookie `httpOnly`, `secure` en producción, `sameSite=lax` o más restrictiva;
- expiración razonable;
- mensaje claro si usuario no autorizado;
- no revelar si el email existe.

---

## 2.4. Cambio obligatorio de contraseña temporal

Implementa o deja preparado:

- flag `temporaryPassword=true`;
- tras primer login, redirigir a pantalla de cambio de contraseña;
- no permitir uso completo de la app hasta cambiarla;
- validación de contraseña mínima;
- actualización de `temporaryPassword=false`.

Si no puede implementarse completo en esta fase, crea issue/todo técnico visible y bloqueo parcial en UI.

---

## 2.5. Solicitud de piloto

Verifica formulario público:

- ruta `/piloto` o equivalente;
- payload estructurado;
- validación cliente y servidor;
- consentimiento claro;
- prohibición de enviar datos reales de huéspedes;
- webhook a Nexus;
- fallback si Nexus no responde;
- mensaje de confirmación sin prometer aceptación.

---

## 2.6. Import Excel y XML revisable

Mantén la funcionalidad existente pero endurece:

- no permitir sobrescribir registros existentes sin confirmación explícita;
- mostrar tabla previa de datos;
- detectar duplicados;
- detectar columnas incompatibles;
- solicitar revisión de mapeo si no hay correspondencia clara;
- validar datos antes de generar XML;
- mostrar XML en vista visual tipo tarjetas/árbol y vista XML;
- resaltar registros nuevos;
- resumen:
  - registros existentes;
  - registros nuevos;
  - duplicados;
  - total consolidado.

No implementar envío real a SES en esta fase.

---

# Fase 3 — Cierre operativo de `anclora-nexus`

## Objetivo

Dejar Nexus como centro de revisión humana y orquestación del piloto.

---

## 3.1. Webhook interno SyncXML → Nexus

Verifica o implementa endpoint interno receptor.

Requisitos:

- secreto `SYNCXML_WEBHOOK_SECRET`;
- validación estricta de payload;
- rate limiting o mitigación básica;
- idempotencia por email/requestId;
- persistencia en Supabase;
- creación de `access_request`;
- llamada a Hermes;
- creación de tarea `syncxml_pilot_review`.

---

## 3.2. Payload mínimo de solicitud

Debe aceptar algo equivalente a:

```json
{
  "requestId": "string",
  "source": "syncxml",
  "product": "anclora-syncxml",
  "name": "Nombre",
  "email": "cliente@example.com",
  "company": "Villa Kentia",
  "role": "propietario/gestor",
  "propertyCount": 1,
  "currentWorkflow": "Excel/XLSX manual",
  "usesRealGuestData": false,
  "needsSesAutomaticSubmission": false,
  "message": "Texto libre",
  "locale": "es",
  "submittedAt": "ISO datetime"
}
```

Si el payload real difiere, documenta mapping y compatibilidad.

---

## 3.3. Lógica de decisión

Hermes solo recomienda. La decisión final es humana.

Reglas mínimas:

- Si `usesRealGuestData=true` → `manual_review`.
- Si pide envío automático SES → `manual_review` o `reject`, según texto.
- Si faltan datos esenciales → `manual_review`.
- Si hay señales de uso productivo inmediato → `manual_review`.
- Si encaja como piloto controlado con datos sintéticos/anonimizados → puede recomendar `approve`, pero Nexus no debe aprobar automáticamente salvo que exista una regla explícita y segura.

---

## 3.4. Tareas SyncXML en Nexus

Verifica UI `/tasks` o equivalente.

Debe mostrar:

- origen: SyncXML;
- producto;
- nombre/email/empresa;
- score Hermes;
- recomendación Hermes;
- flags;
- estado;
- fecha;
- acciones:
  - aprobar;
  - rechazar;
  - pedir más información;
- estado de provisioning;
- estado de email.

La tarea debe ser visible para usuarios con capability:

```text
access_request_reviewer
```

---

## 3.5. Rutas de acción

Implementa o verifica:

```http
POST /api/syncxml-pilot/{request_id}/approve
POST /api/syncxml-pilot/{request_id}/reject
POST /api/syncxml-pilot/{request_id}/request-more-info
```

Requisitos:

- autenticación obligatoria;
- autorización por capability;
- logs de auditoría;
- idempotencia;
- control de estados;
- errores claros;
- no enviar credenciales si provisioning falla;
- no aprobar si faltan datos críticos.

---

## 3.6. Provisioning hacia SyncXML

Al aprobar:

- Nexus llama a `SYNCXML_INTERNAL_API_URL/api/internal/pilot-users`;
- usa `SYNCXML_INTERNAL_API_SECRET`;
- crea o actualiza usuario;
- recibe password temporal si procede;
- envía email de aceptación;
- marca tarea como `approved`;
- registra resultado.

Si falla:

- no marcar aprobado final;
- mostrar error operativo;
- permitir reintento seguro.

---

## 3.7. Emails

Templates mínimos:

1. aceptación;
2. rechazo;
3. solicitud de más información;
4. error interno para admin, si aplica.

Reglas:

- no prometer cumplimiento;
- no pedir datos reales;
- indicar piloto con datos sintéticos o anonimizados;
- incluir URL login;
- incluir contraseña temporal solo si se acaba de emitir;
- recomendar cambio de contraseña;
- no incluir datos sensibles.

---

# Fase 4 — Cierre operativo de Hermes Worker

## Objetivo

Validar solicitudes de piloto de forma estructurada, segura y no vinculante.

---

## 4.1. Endpoint

Verifica:

```http
POST /api/syncxml/pilot/validate
```

Debe exigir:

```http
Authorization: Bearer ${WORKER_API_KEY}
```

o mecanismo equivalente ya existente.

---

## 4.2. Request schema

Debe aceptar un objeto con datos normalizados de solicitud.

Ejemplo:

```json
{
  "type": "syncxml_pilot_validation",
  "request": {
    "name": "Nombre",
    "email": "cliente@example.com",
    "company": "Villa Kentia",
    "propertyCount": 1,
    "currentWorkflow": "Excel/XLSX manual",
    "usesRealGuestData": false,
    "needsSesAutomaticSubmission": false,
    "message": "Quiero probar con datos anonimizados",
    "locale": "es"
  }
}
```

---

## 4.3. Response schema

Debe devolver siempre JSON parseable:

```json
{
  "decision": "approve | reject | manual_review",
  "score": 0,
  "reason": "string",
  "flags": ["string"],
  "recommendedNextAction": "string",
  "safeForPilot": true
}
```

---

## 4.4. Reglas deterministas obligatorias

Antes o después del LLM, aplica salvaguardas deterministas:

- Si pide usar datos reales de huéspedes → `manual_review`.
- Si pide producción inmediata → `manual_review`.
- Si pide envío automático SES → `manual_review`.
- Si el texto parece buscar garantía legal → `manual_review`.
- Si faltan email o contexto → `manual_review`.
- Si OpenRouter falla → `manual_review`.
- Si JSON inválido → `manual_review`.
- Si score < umbral definido → `manual_review` o `reject`.

Umbral recomendado:

```text
approve >= 85
manual_review 50-84
reject < 50
```

Pero nunca apruebes automáticamente en Nexus sin revisión humana salvo que el producto lo permita explícitamente.

---

## 4.5. Prompt interno de Hermes

El prompt debe evaluar:

- encaje con piloto controlado;
- si el usuario trabaja con Excel/XLSX;
- si acepta datos sintéticos o anonimizados;
- si entiende limitaciones;
- si pide producción o cumplimiento garantizado;
- si hay riesgo legal;
- si el caso puede generar aprendizaje útil.

No debe generar copy comercial genérico. Debe devolver evaluación estructurada.

---

# Fase 5 — Seguridad, privacidad y hardening

## Objetivo

Reducir riesgos antes de cualquier piloto con datos sensibles.

---

## 5.1. Auditoría de dependencias

En cada repo ejecuta lo que corresponda:

```bash
npm audit
npm audit fix
npm run lint
npm run typecheck
npm test
```

Si `npm audit fix` rompe dependencias, no fuerces cambios destructivos. Documenta vulnerabilidades restantes y mitigación.

---

## 5.2. PII y logs

Busca logs peligrosos:

```bash
grep -R "console.log" -n . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git || true
grep -R "logger" -n . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git || true
```

Elimina o anonimiza logs que puedan incluir:

- email;
- teléfono;
- documento;
- dirección;
- huéspedes;
- contraseñas;
- XML completo;
- payload completo de reservas.

---

## 5.3. Retención y borrado

Si existe almacenamiento persistente:

- documentar política de retención;
- permitir borrado de solicitudes piloto;
- permitir desactivar usuarios piloto;
- evitar guardar Excel/XML sensibles por defecto;
- si se guardan ficheros, cifrado o justificación;
- bandera `SYNCXML_ENABLE_PERSISTENT_STORAGE=false` por defecto.

---

## 5.4. Bloqueo de datos reales

En UI y backend:

- mostrar aviso: no usar datos reales en piloto inicial;
- bloquear subida si el usuario declara datos reales, salvo modo autorizado;
- incluir confirmación explícita si hay muestras anonimizadas;
- no procesar documentos identificativos reales en modo demo.

---

## 5.5. Claims prohibidos

Revisa textos de landing, emails, UI y docs.

Elimina o reemplaza:

- “cumplimiento garantizado”;
- “evita sanciones”;
- “integración oficial con SES”;
- “envío automático al Ministerio”;
- “XML aceptado por SES”;
- “sustituye tu PMS”;
- “solución legal completa”.

Sustituir por:

- “XML revisable orientado al flujo SES.HOSPEDAJES”;
- “validación operativa previa”;
- “piloto controlado”;
- “datos sintéticos o anonimizados”;
- “revisión humana”;
- “no sustituye asesoría legal ni PMS”.

---

# Fase 6 — XSD y SES preproducción

## Objetivo

Preparar el sistema para diferenciar claramente entre XML generado, XML revisado, XML validado localmente, XML validado por XSD y XML probado en preproducción.

En esta fase no actives envío productivo.

---

## 6.1. Estados del XML

Implementa o documenta estados:

```text
generated
locally_reviewed
xsd_validated
ses_preprod_tested
production_sent_disabled
```

La UI no debe mostrar “validado SES” si solo se ha generado XML.

---

## 6.2. XSD

Si el repo ya contiene XSD oficial, úsalo.

Si no está disponible:

- crea interfaz para integrarlo;
- no inventes XSD;
- documenta pendiente;
- deja tests con fixtures sintéticos.

---

## 6.3. Fixtures sintéticos

Crear fixtures para:

- huésped español;
- huésped UE;
- huésped no UE;
- familia;
- grupo grande;
- estancia una noche;
- pago efectivo;
- pago plataforma;
- pago tarjeta con datos mínimos no reales.

---

## 6.4. XML plantilla

Respeta estructura base equivalente a:

```xml
<ns2:peticion xmlns:ns2="http://www.neg.hospedajes.mir.es/altaParteHospedaje">
  <solicitud>
    <codigoEstablecimiento>...</codigoEstablecimiento>
    <comunicacion>
      <contrato>
        <referencia>...</referencia>
        <fechaContrato>...</fechaContrato>
        <fechaEntrada>...</fechaEntrada>
        <fechaSalida>...</fechaSalida>
        <numPersonas>...</numPersonas>
        <numHabitaciones>...</numHabitaciones>
        <internet>...</internet>
        <pago>...</pago>
      </contrato>
      <persona>...</persona>
    </comunicacion>
  </solicitud>
</ns2:peticion>
```

No sobrescribas estructura original sin tests.

---

# Fase 7 — QA E2E real de staging

## Objetivo

Probar el flujo completo con datos ficticios.

---

## 7.1. Casos obligatorios

Crear o actualizar scripts smoke:

### Caso A — Solicitud elegible

- trabaja con Excel;
- pequeño alojamiento;
- acepta datos anonimizados;
- no pide envío SES automático.

Resultado esperado:

- Hermes recomienda approve;
- Nexus crea tarea;
- revisor aprueba;
- SyncXML crea usuario;
- email enviado;
- login correcto.

---

### Caso B — Solicitud dudosa

- quiere probar pero menciona datos reales.

Resultado esperado:

- Hermes manual_review;
- Nexus crea tarea;
- no autoaprueba;
- revisor pide más información.

---

### Caso C — Solicitud no apta

- pide cumplimiento garantizado;
- pide envío automático al Ministerio;
- quiere producción inmediata.

Resultado esperado:

- Hermes reject o manual_review;
- Nexus no provisiona usuario;
- email de rechazo o revisión.

---

## 7.2. Comandos smoke sugeridos

En SyncXML:

```bash
npm run check:env
npm run test
npm run build
npm run smoke:pilot-request
```

En Nexus:

```bash
npm run check:env
npm run test
npm run build
npm run smoke:syncxml-task
```

En Hermes:

```bash
npm run check:env
npm run test
npm run build
npm run smoke:syncxml-pilot-validation
```

Adapta a los scripts reales de cada repo.

---

# Fase 8 — QA visual y responsive

## Objetivo

Garantizar que las pantallas críticas sean legibles, premium y funcionales.

---

## 8.1. Pantallas mínimas

En SyncXML:

- landing;
- `/piloto`;
- `/login`;
- app import Excel;
- vista previa;
- vista XML visual;
- cookies;
- legal;
- privacy;
- terms.

En Nexus:

- login si aplica;
- `/tasks`;
- detalle tarea SyncXML;
- acciones aprobar/rechazar/pedir más info.

---

## 8.2. Breakpoints

Probar:

```text
mobile: 390x844
tablet: 768x1024
desktop: 1440x900
desktop large: 1920x1080
```

---

## 8.3. Tema e idiomas

SyncXML debe mantener:

- español por defecto;
- landing ES/EN/DE;
- dark por defecto si así está definido;
- legibilidad en claro y oscuro;
- no textos cortados;
- botones visibles;
- contraste suficiente.

---

# Fase 9 — Documentación final

## Objetivo

Dejar el sistema operable por otro desarrollador/agente.

Crear o actualizar:

```text
docs/syncxml-pilot-flow.md
docs/env-syncxml-pilot.md
docs/security-privacy-notes.md
docs/go-no-go-syncxml-v02.md
docs/smoke-tests.md
```

---

## 9.1. `docs/syncxml-pilot-flow.md`

Debe incluir:

- diagrama textual;
- endpoints;
- payloads;
- estados;
- errores esperados;
- recuperación ante fallo;
- quién decide cada paso.

---

## 9.2. `docs/security-privacy-notes.md`

Debe incluir:

- datos permitidos;
- datos prohibidos;
- política de logs;
- retención;
- borrado;
- contraseña temporal;
- RGPD/DPA pendiente;
- uso de datos sintéticos/anonimizados.

---

## 9.3. `docs/go-no-go-syncxml-v02.md`

Debe incluir checklist:

```markdown
# Go / No-Go — Anclora SyncXML v0.2 Pilot Candidate

## GO para piloto controlado

- [ ] E2E real completado.
- [ ] Email real validado.
- [ ] Supabase/Nexus operativo.
- [ ] Provisioning SyncXML operativo.
- [ ] Hermes real con OpenRouter probado.
- [ ] Fallback manual review validado.
- [ ] QA visual completada.
- [ ] `npm audit` sin vulnerabilidades altas.
- [ ] DPA/textos legales revisados o limitación estricta a datos sintéticos.
- [ ] Retención/borrado aprobados.
- [ ] XSD integrado o estado claramente marcado como pendiente.
- [ ] SES preproducción no prometido si no está probado.

## NO-GO para comercialización abierta

- [ ] Sin DPA.
- [ ] Sin XSD.
- [ ] Sin SES preproducción.
- [ ] Sin QA visual.
- [ ] Sin smoke real de Supabase/email/OpenRouter.
- [ ] Sin política de retención/borrado.
```

---

# Fase 10 — Criterios de aceptación globales

El trabajo solo puede considerarse terminado si se cumple:

## Funcional

- [ ] Solicitud de piloto desde SyncXML funciona.
- [ ] Webhook llega a Nexus.
- [ ] Nexus persiste solicitud.
- [ ] Nexus llama a Hermes.
- [ ] Hermes devuelve JSON estructurado.
- [ ] Nexus crea tarea visible.
- [ ] Revisor puede aprobar/rechazar/pedir más información.
- [ ] Aprobación provisiona usuario en SyncXML.
- [ ] Email de aceptación se envía.
- [ ] Login de usuario piloto funciona.
- [ ] Usuario con contraseña temporal tiene flujo de cambio o bloqueo documentado.

## Seguridad

- [ ] Secretos obligatorios validados.
- [ ] No hay placeholders en staging.
- [ ] No se loguean contraseñas.
- [ ] No se loguea XML completo con PII.
- [ ] No se aceptan datos reales en piloto inicial sin confirmación.
- [ ] No hay claims peligrosos.
- [ ] No hay vulnerabilidades altas sin documentar.

## Producto

- [ ] La landing comunica piloto controlado.
- [ ] El usuario entiende limitaciones.
- [ ] La UI permite revisar antes de consolidar.
- [ ] XML visual y XML raw están diferenciados.
- [ ] Los estados del XML no exageran validación.
- [ ] La app mantiene estética premium y legible.

## QA

- [ ] Tests unitarios pasan.
- [ ] Typecheck pasa.
- [ ] Lint pasa.
- [ ] Build pasa.
- [ ] Smoke dry-run pasa.
- [ ] Smoke real de staging documentado.
- [ ] QA visual mínima completada.

---

# Fase 11 — Entrega final obligatoria

Al finalizar, entrega un informe en Markdown con esta estructura:

```markdown
# Informe final — Anclora SyncXML v0.2 Pilot Candidate

## 1. Resumen ejecutivo

## 2. Repos modificados

| Repo | Rama | Commits | Estado |
|---|---|---|---|

## 3. Cambios implementados por repo

### anclora-syncXML
### anclora-nexus
### anclora-content-generator-ai

## 4. Variables de entorno requeridas

## 5. Endpoints validados

## 6. Flujo E2E probado

## 7. Tests y comandos ejecutados

| Repo | Comando | Resultado |
|---|---|---|

## 8. Riesgos resueltos

## 9. Riesgos pendientes

## 10. Go / No-Go

## 11. Próximos pasos recomendados
```

---

# Restricciones críticas

No hagas lo siguiente:

1. No actives envío productivo a SES.
2. No prometas cumplimiento legal.
3. No elimines revisión humana.
4. No autoapruebes solicitudes sensibles.
5. No guardes contraseñas en logs.
6. No loguees payloads completos con PII.
7. No sobrescribas registros existentes sin confirmación.
8. No cambies nombres de marca sin necesidad.
9. No rompas compatibilidad con flujos existentes.
10. No ocultes errores de configuración.
11. No marques XML como “validado SES” si no lo está.
12. No uses datos reales en tests.
13. No dejes secretos reales en código.
14. No hagas refactors amplios sin necesidad.

---

# Reglas de comunicación durante la ejecución

Cada vez que termines una fase, informa con:

```markdown
## Fase X completada

### Hecho
- ...

### Pruebas
- ...

### Riesgos detectados
- ...

### Siguiente fase
- ...
```

Si encuentras un bloqueo:

```markdown
## Bloqueo detectado

### Qué ocurre
...

### Impacto
...

### Opciones seguras
1. ...
2. ...

### Recomendación
...
```

No continúes con cambios destructivos sin explicar el impacto.

---

# Prioridad final

La secuencia correcta es:

1. Variables y secretos.
2. E2E de piloto.
3. Seguridad/logs/PII.
4. Email real.
5. Supabase real.
6. Hermes real.
7. QA visual.
8. XSD.
9. SES preproducción.
10. Comercialización limitada.

No inviertas el orden. Una UI premium sin flujo seguro no sirve para este producto.

---

# Mensaje final esperado del agente

Cuando acabes, tu conclusión debe indicar claramente uno de estos estados:

```text
GO — Piloto controlado con datos sintéticos/anonimizados
GO CONDICIONADO — faltan checks concretos
NO-GO — no apto todavía ni para piloto controlado
```

Nunca declares “MVP comercial abierto” si no se han cerrado XSD, SES preproducción, DPA/RGPD, retención/borrado, QA y evidencias reales.
