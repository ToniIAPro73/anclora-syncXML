# Plan 001 — RBAC y bloqueo seguro de SES de producción

Base: `3475638`  
Prioridad: P0  
Esfuerzo: M

## Objetivo

Impedir que una sesión `pilot_user` invoque endpoints administrativos o cualquier operación SES real. Mantener el modo dry-run disponible según la política del producto, pero exigir autorización explícita para producción.

## Estado actual

`requireAuth()` devuelve éxito para cualquier sesión válida en `src/lib/auth.ts:53-60`. Las rutas SES (`src/app/api/ses/*.ts`) y las rutas administrativas de INE usan ese guard. `src/app/api/ses/communicate/route.ts:44` acepta `environment` y `dryRun` desde el cliente; el cliente SES bloquea producción solo por configuración, no por rol.

## Cambios

1. Añadir un helper tipado `requireRole(role)` o `requireAdmin()` en `src/lib/auth.ts`, reutilizando `getSessionUser()` y devolviendo 403 para sesiones autenticadas sin el rol requerido.
2. Aplicar `requireAdmin()` a provisioning interno si también se expone desde la app, sincronización INE, rutas SES mutantes (`communicate`, `anulacion-lote`) y consultas/configuración SES. Mantener `requireAuth()` solo para funciones de piloto.
3. En las rutas SES, no confiar en `environment` o `dryRun` como control de seguridad. Para `prod` y `dryRun: false`, exigir rol admin y una configuración de producción válida; considerar exigir además una confirmación operativa separada en el servidor.
4. Añadir tests de ruta con sesión `pilot_user` y `admin` para cada familia protegida. Cubrir específicamente `environment: "prod", dryRun: false`.

## Verificación

Ejecutar:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Esperado: todos los comandos pasan y las rutas protegidas devuelven 403 para `pilot_user`, 401 sin sesión y 200/4xx funcional según configuración para `admin`.

## Fuera de alcance

No cambiar el proveedor de identidad, no rotar secretos en Vercel y no activar SES real.
