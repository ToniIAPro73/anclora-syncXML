# Plan 002 — Propiedad de reservas y persistencia fail-closed

Base: `3475638`  
Prioridad: P1  
Esfuerzo: L

## Objetivo

Asociar cada reserva y envío operativo con el usuario/organización que lo creó y evitar que producción confirme operaciones cuando solo existe almacenamiento en memoria.

## Cambios

1. Añadir la relación de propietario en Prisma (`Reservation` y entidades derivadas necesarias) con migración SDD/Prisma. Usar el identificador estable de la sesión, no un email como clave primaria.
2. Propagar el usuario autenticado desde las rutas de creación a `createReservation`; no aceptar el propietario desde el payload.
3. Añadir filtros de propietario a `listReservations`, `getReservation`, `deleteReservation` y descarga XML. Devolver 404 para recursos de otro propietario para no filtrar existencia.
4. Definir una política explícita para administradores: acceso global auditado o acceso por organización, nunca implícito.
5. Cambiar `createReservation` para fallar con 503 en producción si `SYNCXML_ENABLE_PERSISTENT_STORAGE` o la base de datos no están disponibles. Conservar el fallback en memoria solo detrás de `isExplicitLocalDemoMode()` fuera de producción.
6. Añadir pruebas de aislamiento entre dos usuarios y prueba de configuración de producción sin persistencia.

## Verificación

```bash
npm run prisma:generate
npm run lint
npm run typecheck
npm test
npm run build
```

Esperado: un usuario nunca lista, descarga ni elimina reservas de otro; una consolidación sin persistencia en producción no devuelve éxito.

## Fuera de alcance

No almacenar Excel reales en fixtures, no modificar datos de producción y no copiar variables entre entornos.
