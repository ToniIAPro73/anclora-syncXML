# Anclora SyncXML

Anclora SyncXML es una herramienta Premium de Anclora Group para preparar, validar, revisar y exportar XML a partir de datos de reservas y huespedes importados desde Excel/XLSX.

Estado actual: **pre-MVP / validacion controlada**. No debe presentarse como garantia legal ni como integracion oficial automatizada con plataformas externas si dicha integracion no existe tecnicamente.

## Alcance

- Importacion controlada de XLSX.
- Validacion de datos de reserva, establecimiento, huespedes y pago.
- Vista previa con datos sensibles enmascarados por defecto.
- Deteccion y resolucion manual de duplicados.
- Generacion y descarga de XML revisable.
- Modo privado sin almacenamiento permanente por defecto.
- Auditoria operacional sin PII.
- UI en espanol, ingles y aleman.
- Tema dark por defecto con soporte light.

## Limites legales

Anclora SyncXML no presta asesoramiento legal y no garantiza por si sola el cumplimiento normativo. El usuario debe tener autorizacion para tratar los datos importados y revisar el XML antes de cualquier uso oficial o comunicacion a terceros.

## Privacidad por defecto

El modo por defecto es **sin persistencia**. Los datos importados, previews, validaciones y XML generados viven en memoria/sesion de operacion y pueden borrarse con la accion "Borrar datos de esta operacion".

La persistencia en base de datos solo debe habilitarse explicitamente con:

```bash
SYNCXML_ENABLE_PERSISTENT_STORAGE="true"
```

Si se habilita, el despliegue debe aplicar cifrado, retencion, control de acceso y borrado operativo antes de usar datos reales.

## Arquitectura general

- Next.js App Router para UI y API routes.
- Prisma como capa opcional de base de datos.
- Vitest para tests unitarios.
- `xlsx` para lectura defensiva de hojas Excel.
- `fast-xml-parser` para parseo/generacion XML con bloqueo de estructuras peligrosas.
- i18n local en `src/lib/i18n.ts`.

## Variables de entorno

Variables criticas en produccion:

- `SYNCXML_ADMIN_PASSWORD`
- `SYNCXML_ENCRYPTION_KEY`
- `SESSION_SECRET`
- `DATABASE_URL`
- `NODE_ENV=production`

Variables operativas:

- `SYNCXML_ENABLE_PERSISTENT_STORAGE=false` por defecto.
- `SYNCXML_LOCAL_DEMO=true` solo en desarrollo local sin datos reales.
- `RESEND_API_KEY` para enviar solicitudes de piloto por Resend.
- `RESEND_FROM_EMAIL` remitente verificado en Resend, por ejemplo
  `Anclora SyncXML <piloto@tu-dominio.com>`.
- `SYNCXML_PILOT_REQUEST_TO` buzón que recibe las solicitudes del piloto.
- `BLOB_READ_WRITE_TOKEN` si se incorpora almacenamiento externo.

En produccion, si faltan secretos criticos, el acceso falla de forma segura.

## Instalacion y ejecucion local

```bash
npm install
npm run dev
```

Para desarrollo local sin datos reales:

```bash
SYNCXML_LOCAL_DEMO=true npm run dev
```

Para probar el acceso real por clave compartida en local o staging:

```env
SYNCXML_ADMIN_PASSWORD="clave-del-piloto"
SESSION_SECRET="secreto-largo"
SYNCXML_LOCAL_DEMO="false"
SYNCXML_DISABLE_AUTH="false"
```

No uses datos reales en la fase pre-MVP / validacion controlada. No uses
`SYNCXML_DISABLE_AUTH=true` en produccion.

## Tests y build

```bash
npm run lint
npm run test
npm run build
```

## Seguridad

- No loguear nombres, documentos, telefonos, emails, direcciones, pagos, XML completo ni Excel completo.
- Rechazar extensiones no permitidas, archivos vacios, tamano excesivo, MIME inesperado y archivos corruptos.
- Bloquear XML mal formado, DOCTYPE y ENTITY.
- Enmascarar documentos, emails, telefonos, direcciones y pagos por defecto.
- Bloquear consolidacion con errores criticos o duplicados sin resolver.

## Modelo de acceso

El acceso a `/app` y `/dashboard` esta protegido por AuthGate con una
**contraseña unica compartida** (`SYNCXML_ADMIN_PASSWORD`). **No hay cuentas por
usuario ni tabla de leads**: la solicitud de piloto (`/piloto`) se gestiona por
email transaccional con Resend y los estados `pending/approved/invited/rejected`
del modelo v0.2 son hoy un **proceso manual**. Detalles y pendientes en
[`docs/ACCESS_MODEL.md`](docs/ACCESS_MODEL.md).

El `/login` y el estado no autenticado de AuthGate siguen el contrato visual
`ANCLORA_AUTH_LOGIN_SCREEN_CONTRACT` v1.3.0 de la Boveda Anclora, adaptado al
modelo actual de clave compartida de piloto: un unico campo de clave, sin
registro publico, sin OAuth y sin recuperacion de contraseña personal.

## i18n y tema

El idioma por defecto es espanol. La aplicacion (`/app`, `/dashboard`, `/privacy`, `/terms`) esta disponible en ES/CA/EN/DE/FR/IT/PT con toggle de idioma visible. El tema por defecto es dark, con toggle dark/light/system dentro de la app.

### Landing publica (decision de localizacion)

La landing publica (`/`, `/login`, `/piloto`) esta redactada **solo en espanol** durante la fase pre-MVP y **no muestra selector de idioma**. Es una decision deliberada alineada con `LOCALIZATION_CONTRACT`: no se expone un selector que aparente una traduccion que no existe, evitando deuda de traduccion y mezcla de idiomas. El footer informa de que la aplicacion si es multi-idioma.

Pendiente documentado: si se decide internacionalizar la landing, mover el copy a la capa i18n y traducir con calidad (cobertura sugerida ES/EN/DE) antes de reactivar un selector en la landing.

## Flujo funcional

1. Dashboard o nueva operacion.
2. Estado de privacidad visible.
3. Consentimiento informado obligatorio.
4. Importacion XLSX.
5. Analisis y validacion.
6. Preview enmascarada.
7. Revision de mapeo y vista previa.
8. Revision de errores y duplicados.
9. Preview XML.
10. Confirmacion y consolidacion.
11. Descarga XML.
12. Limpieza de datos temporales.

## Checklist antes de produccion

- Auditoria legal y de privacidad completada.
- Persistencia desactivada o cifrado/retencion/borrado auditados.
- Secretos configurados en entorno seguro.
- Pruebas visuales dark/light/mobile revisadas.
- Tests y build pasando.
- Contacto legal real definido en politicas.
- No usar datos reales hasta completar auditoria de seguridad y privacidad.
## Global Preferences Toggle

Esta app sigue el contrato global de preferencias de Anclora Group.

Incluye:
- idioma

El Theme Toggle se gestiona por separado y solo aparece en grupos Premium, Internal y Portfolio.
