# Canvas — Prompt end-to-end para agente IA
## Anclora SyncXML — MVP privacy-first, low-cost, por fases

**Versión:** v0.1  
**Fecha:** 2026-06-03  
**Uso:** pegar este prompt en un agente IA de desarrollo con acceso al repositorio.  
**Objetivo:** implementar mejoras en Anclora SyncXML por fases, validando, testeando, documentando y haciendo `commit` + `push` tras cada fase.

---

# PROMPT MAESTRO PARA AGENTE IA

Actúa como **agente IA senior full-stack, arquitecto de producto y auditor de seguridad** para el repositorio **Anclora SyncXML**.

Tu misión es implementar una evolución por fases de Anclora SyncXML hacia un **MVP privacy-first, low-cost, vendible como piloto controlado**, sin convertirlo todavía en PMS, centralizador automático de reservas ni solución de cumplimiento garantizado.

Debes trabajar directamente en el repositorio, respetando su arquitectura actual, sus decisiones de privacidad y sus límites comerciales. Tras cada fase debes ejecutar validaciones, documentar cambios, hacer `commit` y hacer `push`.

---

## 0. Contexto estratégico obligatorio

Anclora SyncXML debe posicionarse como:

> Herramienta ligera para pequeños alojamientos y gestores que trabajan con Excel/XLSX o CSV y necesitan revisar datos de huéspedes, detectar errores operativos y preparar un XML revisable orientado al flujo SES.HOSPEDAJES, con privacidad por defecto y revisión humana.

No debe posicionarse como:

- PMS completo.
- Channel manager.
- Gestoría.
- Asesoría legal.
- Solución de cumplimiento garantizado.
- Integración oficial con SES.
- Sistema que garantiza aceptación del XML.
- Centralizador automático de Booking/Airbnb/Expedia.
- Archivo legal permanente por defecto.

---

## 1. Principios no negociables

### 1.1. Privacidad por defecto

Mantén como principio base:

```env
SYNCXML_ENABLE_PERSISTENT_STORAGE=false
```

Por defecto:

- No guardar Excel original.
- No guardar XML completo.
- No guardar payload normalizado completo.
- No guardar documentos completos.
- No guardar emails/teléfonos/direcciones completas.
- No crear histórico permanente de viajeros.
- No loguear PII.
- Usar preview enmascarada por defecto.
- Permitir borrado operativo visible.

La persistencia solo puede existir como modo explícito y debe quedar claramente separada del modo temporal.

---

### 1.2. Tres modos de conservación

Implementa o prepara la arquitectura para estos tres modos:

#### Modo A — Temporal privado

Modo por defecto.

Flujo:

```text
Importar CSV/XLSX
→ revisar
→ validar operativamente
→ generar XML revisable
→ descargar paquete local
→ borrar operación
```

Claim permitido:

> Sin almacenamiento permanente por defecto.

#### Modo B — Paquete local de conservación

El sistema genera un paquete descargable para que el propietario conserve documentación bajo su control.

Ejemplo:

```text
reserva-2026-000123.zip
├── manifest.json
├── reserva-normalizada.json
├── huespedes.csv
├── xml-revisable.xml
├── informe-validacion.json
├── informe-validacion.csv
└── README_conservacion.txt
```

Importante:

- El paquete se descarga localmente.
- No se guarda permanentemente por defecto en la app.
- El README debe indicar que la conservación legal corresponde al sujeto obligado y que SyncXML no actúa por defecto como archivo legal permanente.

#### Modo C — Histórico cifrado opcional

No implementarlo como modo principal del MVP salvo estructura mínima. Prepararlo como futura opción premium.

Debe requerir:

- opt-in explícito;
- cifrado;
- retención;
- borrado;
- DPA;
- control de acceso;
- auditoría sin PII;
- documentación legal.

---

### 1.3. Claims permitidos

Puedes usar:

- “XML revisable”.
- “Validación operativa”.
- “Preparación orientada al flujo SES.HOSPEDAJES”.
- “Piloto controlado”.
- “Datos sintéticos o anonimizados”.
- “Privacidad por defecto”.
- “Revisión humana”.
- “Detección de errores operativos”.
- “Sin almacenamiento permanente por defecto”.
- “Paquete local de conservación”.
- “Conserva la documentación bajo tu control”.

---

### 1.4. Claims prohibidos

No uses:

- “Cumplimiento garantizado”.
- “Evita sanciones”.
- “Integración oficial con SES”.
- “Envío automático al Ministerio”.
- “XML aceptado por SES”.
- “Sustituye tu PMS”.
- “Sustituye tu gestoría”.
- “Solución legal completa”.
- “Listo para producción”.
- “Sube tus datos reales”.
- “Todo se queda en local”, salvo en un modo local/self-hosted real.

Si la app está desplegada en VPS/servidor remoto, usa:

> Procesamiento temporal y sin almacenamiento permanente por defecto.

No uses:

> Todo se queda en local.

---

## 2. Reglas de trabajo del agente

Antes de modificar código:

1. Inspecciona el estado actual del repo.
2. Revisa `package.json`, `README.md`, `prisma/schema.prisma`, rutas API y componentes principales.
3. Detecta cambios no committeados.
4. No sobrescribas trabajo existente sin necesidad.
5. Mantén el estilo visual y técnico del proyecto.
6. No introduzcas servicios de pago obligatorios.
7. Prioriza soluciones open source o zero/low-cost.
8. No añadas integraciones externas con Booking, Airbnb, Expedia, Cloudbeds o SiteMinder en este ciclo.
9. No actives envío real a SES.
10. No actives persistencia completa por defecto.
11. Tras cada fase, ejecuta validaciones.
12. Tras cada fase, haz commit y push.

---

## 3. Comandos obligatorios por fase

Al final de cada fase ejecuta, salvo imposibilidad técnica documentada:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Si existe `npm audit`, ejecuta:

```bash
npm audit
```

Si hay migraciones Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name <nombre_migracion>
```

Antes de commit:

```bash
git status
git diff --stat
```

Commit:

```bash
git add .
git commit -m "feat(syncxml): <resumen de fase>"
git push
```

Si una fase solo corrige seguridad o docs:

```bash
git commit -m "chore(syncxml): <resumen>"
```

Si hay fix:

```bash
git commit -m "fix(syncxml): <resumen>"
```

---

# FASE 0 — Auditoría inicial y guardarraíles

## Objetivo

Establecer línea base, evitar regresiones y documentar riesgos antes de implementar mejoras.

## Tareas

1. Inspeccionar estructura del repo.
2. Confirmar stack:
   - Next.js App Router;
   - Prisma;
   - Vitest;
   - `xlsx`;
   - generación XML;
   - AuthGate/login;
   - modo privado.
3. Revisar rutas:
   - `/api/upload/excel`;
   - `/api/generate/xml`;
   - `/api/reservations`;
   - `/api/precheckin/[token]`;
   - `/app`;
   - `/dashboard`;
   - landing y piloto.
4. Revisar si existe soporte CSV.
5. Revisar si existe ledger real de reservas o solo reservas persistentes opcionales.
6. Revisar logs:
   - `console.log`;
   - errores con payloads;
   - PII accidental.
7. Revisar dependencias vulnerables.
8. Crear documento:
   - `docs/implementation/PHASE_0_BASELINE_PRIVACY_FIRST.md`.

## Criterios de aceptación

- Documento baseline creado.
- Lista de riesgos técnicos actuales.
- Lista de archivos clave.
- Validaciones ejecutadas.
- No cambios funcionales salvo fixes mínimos seguros.

## Commit

```bash
git add .
git commit -m "chore(syncxml): baseline privacy-first implementation audit"
git push
```

---

# FASE 1 — Hardening privacy-first y mensajes de producto

## Objetivo

Reforzar el modo temporal y los mensajes de privacidad sin introducir histórico permanente.

## Tareas funcionales

1. Asegurar que el modo por defecto es sin persistencia.
2. Añadir o reforzar indicador visible:
   - “Modo temporal activo”.
   - “Sin almacenamiento permanente por defecto”.
3. Reforzar botón/acción:
   - “Borrar datos de esta operación”.
4. Añadir pantalla o bloque:
   - “Qué ocurre con tus datos”.
5. Añadir explicación clara:
   - datos importados;
   - preview;
   - XML;
   - logs;
   - borrado;
   - límites.
6. Revisar textos públicos para claims prohibidos.
7. Sustituir “validar SES” por “revisar / detectar errores / XML revisable” cuando proceda.
8. Mantener la landing como captación de piloto, no zona operativa.
9. No mostrar Dashboard en landing.
10. No invitar a subir datos reales en landing.

## Tareas técnicas

1. Revisar `src/lib/audit.ts` o equivalente.
2. Garantizar logs sin PII.
3. Añadir tests de copy/claims si el repo ya tiene tests de landing.
4. Añadir test para que el estado de privacidad se muestre.
5. Añadir test para confirmar que no se promueve subida de datos reales en landing.

## Documentación

Crear o actualizar:

```text
docs/implementation/PHASE_1_PRIVACY_FIRST_HARDENING.md
```

Debe incluir:

- qué se ha cambiado;
- qué datos no se guardan por defecto;
- qué queda pendiente;
- comandos ejecutados;
- riesgos restantes.

## Criterios de aceptación

- UI muestra modo temporal/privacidad por defecto.
- Landing no permite operar.
- Landing no contiene claims prohibidos.
- App mantiene borrado de operación.
- Tests pasan.
- Build pasa.

## Commit

```bash
git add .
git commit -m "feat(syncxml): reinforce privacy-first temporary mode"
git push
```

---

# FASE 2 — Importador flexible CSV/XLSX

## Objetivo

Aumentar competitividad sin APIs externas permitiendo importar CSV/XLSX de diferentes orígenes.

## Alcance

Implementar un importador flexible con:

- XLSX actual;
- CSV;
- detección de cabeceras;
- perfiles de origen;
- mapeo de columnas;
- preview antes de consolidar;
- informe de errores.

## Perfiles iniciales

Crear perfiles base:

1. `anclora_template`
2. `generic_csv`
3. `generic_xlsx`
4. `booking_export_manual`
5. `airbnb_export_manual`
6. `pms_generic_export`

Importante:

- No conectar APIs.
- Solo aceptar archivos exportados manualmente.
- Indicar que son perfiles orientativos.

## Modelo de mapeo

Crear una capa tipo:

```ts
type ImportSourceProfile = {
  id: string
  label: string
  description: string
  acceptedFormats: Array<'csv' | 'xlsx'>
  columnAliases: Record<string, string[]>
  requiredFields: string[]
  optionalFields: string[]
}
```

Crear campos canónicos mínimos:

```text
reservationReference
propertyName
checkInDate
checkOutDate
guestFirstName
guestLastName
guestDocumentType
guestDocumentNumber
guestNationality
guestBirthDate
guestPhone
guestEmail
address
paymentMethod
```

No todos deben ser obligatorios. La validación debe distinguir:

- crítico;
- advertencia;
- sugerencia.

## UI

Añadir flujo:

```text
Subir archivo
→ detectar formato
→ elegir perfil
→ mapear columnas
→ preview
→ errores/advertencias
→ confirmar revisión
```

## Seguridad

- Rechazar archivos vacíos.
- Rechazar extensiones no permitidas.
- Mantener límites de tamaño.
- No ejecutar fórmulas.
- No loguear contenido de filas.
- Enmascarar preview.

## Tests

Añadir fixtures sintéticos:

```text
test-data/import-generic.csv
test-data/import-booking-like.csv
test-data/import-pms-like.csv
```

Tests mínimos:

- parse CSV válido;
- rechazar CSV vacío;
- mapear columnas con alias;
- detectar faltantes críticos;
- no guardar PII en logs;
- mantener compatibilidad XLSX existente.

## Documentación

Crear:

```text
docs/implementation/PHASE_2_FLEXIBLE_IMPORTER.md
```

## Criterios de aceptación

- El usuario puede subir CSV/XLSX.
- Puede elegir o confirmar perfil.
- Puede mapear columnas.
- Puede ver preview enmascarada.
- Puede generar validación estructurada.
- No hay APIs externas.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "feat(syncxml): add flexible csv xlsx import profiles"
git push
```

---

# FASE 3 — Ledger mínimo sin PII por defecto

## Objetivo

Crear una base operativa mínima para estados de reservas y preparación de paquete local, sin convertir SyncXML en archivo legal permanente por defecto.

## Modelo conceptual

Implementar o adaptar modelos Prisma, siempre respetando `SYNCXML_ENABLE_PERSISTENT_STORAGE=false` por defecto.

Modelos sugeridos:

```prisma
model Property {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ImportBatch {
  id              String   @id @default(cuid())
  sourceProfile   String
  fileHash        String
  fileNameMasked  String?
  rowCount        Int
  status          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Reservation {
  id              String   @id @default(cuid())
  propertyId      String?
  importBatchId   String?
  referenceHash   String?
  displayReference String?
  checkInDate     DateTime?
  checkOutDate    DateTime?
  guestCount      Int
  status          String
  hasCriticalErrors Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model AuditEvent {
  id        String   @id @default(cuid())
  event     String
  entity    String?
  entityId  String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

No persistir por defecto:

- nombres completos;
- documentos completos;
- emails;
- teléfonos;
- XML completo;
- Excel original;
- payload completo.

Si el código actual ya tiene modelos similares, no duplicar: adaptar.

## Estados de reserva

Implementar constantes:

```text
imported
needs_review
ready_for_package
ready_for_xml
xml_generated
cleared
```

Pre-checking público queda para fase posterior:

```text
ready_for_precheckin
precheckin_sent
precheckin_completed
```

pero no debe activarse por defecto.

## Dashboard

Añadir vista básica por estados:

- importadas;
- con errores;
- listas para XML;
- XML generado;
- borradas/limpiadas.

No mostrar PII completa.

## Auditoría

Eventos mínimos:

```text
import_batch_created
reservation_imported
mapping_reviewed
validation_completed
local_package_generated
xml_generated
operation_cleared
```

Metadata sin PII.

## Documentación

Crear:

```text
docs/implementation/PHASE_3_MINIMAL_LEDGER.md
```

## Criterios de aceptación

- Existe ledger mínimo operativo.
- No persiste PII por defecto.
- Estados visibles.
- Auditoría sin PII.
- Persistencia completa sigue desactivada por defecto.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "feat(syncxml): add minimal non-pii reservation ledger"
git push
```

---

# FASE 4 — Paquete local de conservación

## Objetivo

Dar comodidad al propietario sin convertir la app en archivo legal permanente.

## Funcionalidad

Añadir acción:

```text
Generar paquete local
```

Debe generar un ZIP descargable con evidencias revisables.

Contenido mínimo:

```text
manifest.json
reserva-normalizada.json
huespedes.csv
xml-revisable.xml
informe-validacion.json
README_conservacion.txt
```

Opcional si ya existe:

```text
informe-validacion.csv
parte-entrada-borrador.pdf
```

## Reglas

- El paquete se genera bajo demanda.
- No se guarda permanentemente por defecto.
- El manifest incluye hashes SHA-256 de cada archivo.
- El README no da asesoramiento legal.
- El README indica:
  - el sujeto obligado debe conservar lo que corresponda;
  - SyncXML no actúa por defecto como archivo legal permanente;
  - el XML debe revisarse antes de uso oficial;
  - la aceptación SES no está garantizada.

## Manifest

Ejemplo:

```json
{
  "generatedAt": "2026-06-03T10:00:00.000Z",
  "tool": "Anclora SyncXML",
  "mode": "temporary-local-package",
  "reservationReference": "masked-or-internal",
  "files": [
    {
      "path": "xml-revisable.xml",
      "sha256": "..."
    }
  ],
  "disclaimer": "XML revisable orientado al flujo SES.HOSPEDAJES. No garantiza aceptación oficial."
}
```

## Seguridad

- No meter documentos escaneados.
- No meter imágenes.
- No incluir datos ocultos innecesarios.
- Si se incluyen datos personales necesarios, avisar al usuario antes de descargar.
- No loguear contenido del ZIP.

## Tests

- Genera ZIP.
- Incluye manifest.
- Hashes correctos.
- Incluye README.
- No persiste ZIP por defecto.
- Bloquea generación si hay errores críticos no revisados.

## Documentación

Crear:

```text
docs/implementation/PHASE_4_LOCAL_CONSERVATION_PACKAGE.md
```

## Criterios de aceptación

- El usuario puede descargar paquete local.
- El paquete contiene manifest y README.
- No se guarda por defecto.
- Hay advertencia prudente.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "feat(syncxml): add local conservation package export"
git push
```

---

# FASE 5 — Pre-checking seguro, opcional y no público por defecto

## Objetivo

Endurecer el pre-checking existente para que pueda usarse en piloto controlado, sin convertirlo en canal abierto ni base de centralización multicanal.

## Decisión de producto

El pre-checking debe ser:

- opcional;
- desactivado por defecto si falta configuración;
- limitado a piloto;
- vinculado a reserva canónica;
- sin exposición innecesaria de PII;
- no indexable;
- revocable;
- con TTL;
- con rate limiting.

## Tareas técnicas

1. Token:
   - generar token aleatorio largo;
   - guardar solo hash del token;
   - comparar hash;
   - no loguear token.

2. TTL:
   - expiración obligatoria;
   - estado `expired`.

3. Revocación:
   - estado `revoked`;
   - endpoint interno protegido para revocar.

4. Rate limiting:
   - por IP;
   - por token hash;
   - usar implementación persistente si Redis está disponible;
   - fallback seguro si no.

5. Headers:
   - `X-Robots-Tag: noindex, noarchive, nosnippet`;
   - `Referrer-Policy: no-referrer`;
   - `Cache-Control: no-store`.

6. Payload público:
   - no devolver PII innecesaria;
   - usar referencia enmascarada;
   - mostrar solo lo mínimo para que el huésped reconozca la operación.

7. Submission:
   - validar input;
   - cifrar si se persiste;
   - permitir borrado;
   - no almacenar imágenes de documentos;
   - no pedir documentos escaneados.

8. UI:
   - aviso de privacidad;
   - no pedir datos reales si está en modo demo;
   - indicar que es piloto/controlado;
   - accesibilidad mobile.

## Modelos sugeridos

```prisma
model PrecheckinSession {
  id             String   @id @default(cuid())
  reservationId String?
  tokenHash     String   @unique
  status         String
  expiresAt      DateTime
  attempts       Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model PrecheckinSubmission {
  id          String   @id @default(cuid())
  sessionId   String
  payloadEnc  String?
  payloadMeta Json?
  status      String
  createdAt   DateTime @default(now())
}
```

Adaptar si ya existen modelos.

## Tests

- token plano no se guarda;
- token expirado bloquea;
- token revocado bloquea;
- rate limit bloquea abuso;
- headers anti-indexación existen;
- payload público no contiene PII innecesaria;
- no acepta imágenes de documentos;
- no genera XML automáticamente sin revisión.

## Documentación

Crear:

```text
docs/implementation/PHASE_5_SECURE_OPTIONAL_PRECHECKIN.md
```

## Criterios de aceptación

- Pre-checking no está abierto por defecto.
- Funciona con token seguro.
- TTL y revocación funcionan.
- Rate limiting existe.
- Headers seguros existen.
- No hay PII innecesaria.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "feat(syncxml): harden optional precheckin flow"
git push
```

---

# FASE 6 — Validación XML/XSD y estados prudentes

## Objetivo

Distinguir claramente entre XML generado, XML revisado, XML validado por reglas locales, XML validado por XSD y XML probado en SES preproducción.

No activar producción.

## Estados XML

Implementar o documentar:

```text
generated
locally_reviewed
xsd_validation_pending
xsd_validated
xsd_failed
ses_preprod_pending
ses_preprod_tested
production_send_disabled
```

## UI

No mostrar:

- “Validado SES” si solo está generado.
- “Aceptado por SES” sin evidencia.
- “Cumplimiento garantizado”.

Mostrar:

- “XML revisable”.
- “Validación local”.
- “Validación XSD pendiente/completada”.
- “Preproducción SES pendiente/completada”, solo si hay evidencia real.

## XSD

Si el repo ya contiene XSD oficial, integrar motor estándar si es viable.

Si no se puede integrar por limitaciones del entorno:

- crear abstracción `xsdValidator`;
- dejar implementación pendiente documentada;
- añadir tests con mock;
- no fingir validación.

## Tests

- XML generado no equivale a SES validado.
- Estado cambia correctamente.
- UI no contiene claims prohibidos.
- Descarga se bloquea si hay errores críticos.
- Validación XSD falla con fixture inválido si motor está disponible.

## Documentación

Crear:

```text
docs/implementation/PHASE_6_XML_XSD_STATES.md
```

## Criterios de aceptación

- Estados XML prudentes implementados.
- Claims correctos.
- XSD integrado o abstracción documentada sin falsos claims.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "feat(syncxml): add prudent xml xsd validation states"
git push
```

---

# FASE 7 — Landing SyncXML y piloto controlado

## Objetivo

Alinear landing, acceso, piloto y feedback con el nuevo posicionamiento privacy-first.

## Landing

Debe comunicar:

- CSV/XLSX flexible;
- revisión de errores;
- XML revisable;
- privacidad por defecto;
- sin almacenamiento permanente por defecto;
- paquete local de conservación;
- piloto controlado.

CTA:

```text
Principal: Solicitar piloto controlado
Secundario: Ver cómo funciona
Terciario: Iniciar sesión
```

No mostrar:

- dashboard;
- subida de archivos;
- nueva reserva;
- uso con datos reales;
- claims prohibidos.

## Solicitud piloto

Campos mínimos:

- nombre;
- apellidos;
- email;
- tipo de alojamiento;
- reservas aproximadas/mes;
- si usa Excel/XLSX/CSV;
- principal problema operativo;
- interés en privacidad/local;
- posibilidad de usar muestra sintética o anonimizada;
- interés en piloto de pago;
- mensaje;
- aceptación de privacidad.

No pedir:

- datos reales de huéspedes;
- documentos;
- credenciales SES;
- Excel real con PII.

## Feedback

Añadir o reforzar feedback para medir:

- claridad del flujo;
- utilidad del importador;
- valor del paquete local;
- confianza en no almacenar por defecto;
- necesidad real de histórico dentro de la app;
- disposición de pago;
- necesidad de conectores externos.

## Documentación

Crear:

```text
docs/implementation/PHASE_7_LANDING_PILOT_PRIVACY_FIRST.md
```

## Criterios de aceptación

- Landing no opera.
- CTA correcto.
- No claims prohibidos.
- Solicitud no concede acceso automático.
- Feedback mide valor y pago.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "feat(syncxml): align landing pilot flow with privacy-first mvp"
git push
```

---

# FASE 8 — Preparación VPS low-cost y despliegue

## Objetivo

Preparar despliegue low-cost bajo ecosistema Anclora sin complicar arquitectura.

## Contexto

Dominio:

```text
anclora.com
```

Subdominios recomendados:

```text
syncxml.anclora.com       landing SyncXML
app.syncxml.anclora.com   app privada
staging.syncxml.anclora.com staging
```

## Entregables

Crear documentación:

```text
docs/deployment/VPS_LOW_COST_DEPLOYMENT.md
```

Debe incluir:

- Docker Compose recomendado;
- variables de entorno;
- Caddy o Nginx;
- Postgres;
- Redis opcional;
- backups;
- firewall;
- logs sin PII;
- staging;
- producción controlada;
- no usar datos reales hasta cerrar legal/seguridad.

## Docker

Si no existe, añadir:

```text
Dockerfile
docker-compose.example.yml
.env.example actualizado
```

No incluir secretos reales.

## Caddy

Ejemplo de Caddyfile:

```caddy
syncxml.anclora.com {
  reverse_proxy syncxml:3000
}

app.syncxml.anclora.com {
  reverse_proxy syncxml:3000
}

staging.syncxml.anclora.com {
  reverse_proxy syncxml-staging:3000
}
```

Ajustar según estructura real.

## Criterios de aceptación

- Documentación clara.
- `.env.example` completo.
- No secretos.
- Docker build viable o documentado.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "chore(syncxml): add low cost vps deployment guide"
git push
```

---

# FASE 9 — QA E2E mínimo y cierre de piloto

## Objetivo

Preparar una versión piloto demostrable con datos sintéticos.

## Añadir o reforzar QA

Si Playwright ya existe o puede añadirse sin coste excesivo, crear tests E2E mínimos:

1. Landing carga.
2. CTA piloto visible.
3. Login protegido.
4. Importación con fixture sintético.
5. Preview enmascarada.
6. Errores críticos bloquean XML.
7. Paquete local se genera.
8. Borrado de operación.
9. Pre-checking opcional no expone datos.
10. Claims prohibidos no aparecen.

Si Playwright no es viable:

- documentar QA manual;
- crear checklist operativo.

## Documentación

Crear:

```text
docs/implementation/PHASE_9_PILOT_QA_CLOSURE.md
docs/pilot/PILOT_DEMO_SCRIPT_PRIVACY_FIRST.md
docs/pilot/PILOT_SUCCESS_CRITERIA_PRIVACY_FIRST.md
```

## Criterios de aceptación

- Demo con datos sintéticos.
- QA documentado.
- No datos reales.
- Mensaje comercial prudente.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "test(syncxml): add privacy-first pilot qa closure"
git push
```

---

# FASE 10 — Informe final y backlog posterior

## Objetivo

Cerrar el ciclo de implementación y dejar claro qué entra y qué queda fuera.

## Crear informe

```text
docs/implementation/FINAL_PRIVACY_FIRST_MVP_REPORT.md
```

Debe incluir:

- resumen de fases;
- commits realizados;
- funcionalidades implementadas;
- riesgos cerrados;
- riesgos abiertos;
- qué no se debe vender todavía;
- qué sí se puede pilotar;
- backlog de histórico cifrado opcional;
- backlog de modo local/self-hosted;
- backlog de conectores externos;
- backlog de validación SES preproducción;
- checklist go/no-go.

## Backlog futuro

Incluir como futuras fases, no implementar ahora:

1. Histórico cifrado opcional.
2. SyncXML Local/self-hosted.
3. Conector Cloudbeds.
4. Conector SiteMinder.
5. Booking/Expedia/Airbnb solo tras due diligence.
6. SSO Anclora central.
7. Multiempresa/multipropiedad avanzado.
8. Envío SES producción con aprobación humana/legal.
9. DPA y textos legales firmados.
10. Auditoría externa.

## Criterios de aceptación

- Informe final completo.
- Backlog priorizado.
- No hay claims peligrosos.
- Tests/build pasan.

## Commit

```bash
git add .
git commit -m "docs(syncxml): close privacy-first mvp implementation plan"
git push
```

---

# Reglas especiales de seguridad

## Nunca hacer

- No subir datos reales al repo.
- No crear fixtures con PII real.
- No guardar secretos.
- No activar envío SES producción.
- No activar histórico completo por defecto.
- No hacer scraping de OTAs.
- No integrar APIs externas en este ciclo.
- No guardar imágenes de documentos.
- No prometer cumplimiento legal.
- No prometer XML aceptado.

## Siempre hacer

- Datos sintéticos.
- Logs sin PII.
- Enmascarado por defecto.
- Borrado operativo.
- Revisión humana.
- Claims prudentes.
- Tests.
- Build.
- Commit.
- Push.

---

# Definition of Done global

El trabajo se considera completado cuando:

1. Todas las fases aplicables están implementadas o documentadas como pendientes justificadas.
2. `npm run lint` pasa.
3. `npm run typecheck` pasa.
4. `npm run test` pasa.
5. `npm run build` pasa.
6. No hay claims prohibidos en landing/UI/docs.
7. No se han añadido datos reales.
8. No se han añadido secretos.
9. Persistencia completa sigue desactivada por defecto.
10. Existe paquete local de conservación.
11. Existe importador flexible CSV/XLSX o su fase está documentada con pendientes claros.
12. Pre-checking, si queda activo, está endurecido y limitado.
13. Se han hecho `commit` y `push` tras cada fase.
14. Existe informe final.

---

# Mensaje comercial final esperado

El producto debe poder comunicarse así:

> Anclora SyncXML ayuda a pequeños alojamientos y gestores que trabajan con Excel/XLSX o CSV a revisar datos de huéspedes, detectar errores operativos y preparar un XML revisable orientado al flujo SES.HOSPEDAJES, con privacidad por defecto, revisión humana y sin almacenamiento permanente de datos de viajeros por defecto.

CTA principal:

> Solicitar piloto controlado

CTA secundario:

> Ver cómo funciona

CTA terciario:

> Iniciar sesión

---

# Orden de prioridad si hay poco tiempo

Si no puedes completar todo, prioriza:

1. Fase 1 — Privacy-first.
2. Fase 2 — Importador flexible.
3. Fase 4 — Paquete local.
4. Fase 3 — Ledger mínimo sin PII.
5. Fase 7 — Landing piloto.
6. Fase 5 — Pre-checking seguro.
7. Fase 6 — XML/XSD estados.
8. Fase 8 — VPS docs.
9. Fase 9 — QA piloto.
10. Fase 10 — Informe final.

No empieces conectores externos hasta cerrar esto.
