# Revisión técnica de Anclora SyncXML

Fecha: 2026-07-20  
Commit auditado: `3475638`  
Rama: `development`  
Alcance: revisión estática de aplicación Next.js, API routes, autenticación, persistencia, privacidad, SES, tests, configuración y dependencias.

## Resumen ejecutivo

La base ha mejorado de forma clara: los cambios recientes incorporan autenticación de piloto persistida, validación Zod en payloads críticos, rate limiting, cifrado AES-GCM para PII persistida, control explícito del envío SES de producción y una batería de tests útil.

El bloqueo principal antes de ampliar el piloto es de autorización, no de compilación: `requireAuth()` solo comprueba que exista una sesión y no distingue `admin` de `pilot_user`. Por tanto, un usuario piloto autenticado puede invocar rutas administrativas y rutas SES, incluyendo operaciones reales si el entorno y `dryRun` lo permiten. A la vez, las reservas no tienen propietario o tenant y las rutas permiten consultar, descargar y borrar cualquier reserva conocida por ID.

## Puntos fuertes

- Calidad verificable: `npm run lint`, `npm run typecheck`, `npm test` (29 archivos, 161 tests) y `npm run build` terminan correctamente.
- Autenticación firmada con HMAC, cookie `HttpOnly`, `SameSite=Lax`, expiración de 8 horas y comparación constante de firmas en `src/lib/auth.ts:14-27,63-73`.
- La autenticación persistida del piloto verifica estado, caducidad, hash de contraseña y confirmación posterior a la escritura en `src/app/api/auth/login/route.ts:31-46` y `src/app/api/internal/pilot-users/route.ts:108-138`.
- Los payloads críticos ya tienen contratos Zod, por ejemplo `src/app/api/generate/xml/route.ts:5-16` y `src/app/api/feedback/route.ts:18-20,65-67`.
- La PII sensible se cifra con AES-256-GCM y IV aleatorio antes de persistirse en `src/lib/privacy/encryption.ts:3-41`; además, el JSON normalizado minimiza campos personales en `src/lib/db/reservations.ts:76-88`.
- El envío SES de producción exige una bandera explícita y el TLS inseguro queda limitado a preproducción en `src/lib/ses/config.ts:21-35,52-63`.
- El pre-check-in evita exponer el hash del token y aplica `no-store`, `no-referrer` y rate limit en `src/app/api/precheckin/[token]/route.ts:5-21`.
- Hay documentación operativa, fixtures sintéticas y checks de repositorio que ayudan a mantener el foco de privacidad.

## Debilidades y mejoras por prioridad

| # | Prioridad | Hallazgo | Impacto | Esfuerzo | Evidencia |
|---|---|---|---|---:|---|
| 1 | P0 | No hay autorización por rol | Un `pilot_user` autenticado puede alcanzar operaciones administrativas y SES. Las rutas SES aceptan `environment: "prod"` y `dryRun: false`; el guard existente solo comprueba autenticación. | M | `src/lib/auth.ts:53-60`; `src/app/api/ses/communicate/route.ts:33-44`; rutas SES y admin usan `requireAuth()` |
| 2 | P1 | No existe aislamiento de reservas por usuario/tenant | Cualquier sesión puede listar todas las reservas y operar por ID sobre datos de otros pilotos; también puede descargar XML y borrar reservas. | L | `src/app/api/reservations/route.ts:12-18`; `src/app/api/reservations/[id]/route.ts:5-19`; `src/lib/db/reservations.ts:134-180`; `prisma/schema.prisma` no relaciona `Reservation` con `PilotUser` |
| 3 | P1 | La persistencia puede degradar silenciosamente a memoria | Con `SYNCXML_ENABLE_PERSISTENT_STORAGE=false`, la consolidación responde como correcta pero los datos viven en memoria del proceso. En serverless se pierden con reinicios o cambio de instancia. | M | `src/lib/db/reservations.ts:43-45,128-130`; `.env.example:4-7`; `src/lib/security/env.ts:10-12,45-49` |
| 4 | P1 | Dependencia `xlsx` con alerta alta sin parche disponible | El parser de hojas está en la ruta de subida de ficheros; el advisory afecta a una dependencia de runtime y no tiene fix automático. | M/L | `package.json:20`; `src/app/api/upload/excel/route.ts:41-52`; `npm audit --omit=dev --audit-level=high` |
| 5 | P1 | No hay headers globales de seguridad | No se observa CSP, `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy` ni `Referrer-Policy` global para las superficies autenticadas. | S/M | `next.config.ts:1-11`; búsqueda global sin resultados salvo headers específicos del pre-check-in |
| 6 | P2 | Errores internos se exponen en varias respuestas | Rutas SES, cron y sincronización devuelven `error.message` o detalles de red al cliente; pueden revelar topología, endpoint o comportamiento interno. | S | `src/app/api/ses/communicate/route.ts:184-187`; `src/app/api/ses/lote/route.ts:79-80`; `src/app/api/cron/sync-municipios/route.ts:23-28` |
| 7 | P2 | El build depende de una raíz ambigua | Next detecta `/home/toni/projects/package-lock.json` como raíz y advierte de múltiples lockfiles. Puede generar builds inconsistentes en CI o Vercel. | S | salida de `npm run build`; `next.config.ts` no define `turbopack.root` |
| 8 | P2 | No existe umbral de cobertura ni smoke E2E | Los tests unitarios pasan, pero no hay `coverage` ni evidencia automatizada de login → upload → validación → consolidación → descarga/SES en navegador. | M | `package.json:5-15`; `vitest.config.ts`; `tests/` contiene 29 suites unitarias/integración ligeras |

## Dirección de producto y arquitectura

1. Convertir la identidad del piloto en límite de datos: cada reserva, archivo y envío SES debería estar asociado al `PilotUser` o a una entidad de organización. Esto habilita revocación, trazabilidad y borrado selectivo.
2. Separar explícitamente capacidades de piloto y administrador: el piloto debería operar importación, validación y revisión; el administrador debería operar provisioning, sincronización INE, configuración SES, cancelaciones y acciones de producción.
3. Mantener un modo demo local, pero hacerlo inequívoco: en producción el sistema debe fallar cerrado si no hay persistencia configurada, y el fallback en memoria debe limitarse a desarrollo/demo.

## Verificación ejecutada

- `npm run lint` — OK.
- `npm run typecheck` — OK.
- `npm test` — OK: 29 archivos, 161 tests.
- `npm run build` — OK: compilación, TypeScript, 36 páginas estáticas/dinámicas generadas.
- `npm audit --omit=dev --audit-level=high` — 1 advisory high en `xlsx`; además 2 moderate en `postcss` transitivo de Next.
- `git diff --check HEAD` — OK.

## Límites de esta auditoría

No se ejecutaron pruebas contra Vercel, base de datos real, Nexus, Hermes, Resend ni SES; tampoco se hizo una revisión visual de navegador, prueba de carga, pentest, auditoría legal ni verificación de secretos en proveedores externos. El `.codex/` no rastreado existente se dejó intacto.

## Siguiente paso recomendado

Implementar el plan 001 antes de conceder a pilotos acceso a funciones SES o a datos persistidos. Después, implementar 002 antes de almacenar reservas de más de un piloto en el mismo entorno.
