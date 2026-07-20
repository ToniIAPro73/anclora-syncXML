# Plan 003 — Headers de seguridad y errores públicos controlados

Base: `3475638`  
Prioridad: P1  
Esfuerzo: S/M

## Objetivo

Aplicar una política homogénea de seguridad HTTP y evitar que las respuestas API expongan mensajes técnicos innecesarios.

## Cambios

1. Añadir headers globales en `next.config.ts` o middleware compatible con App Router: CSP ajustada a las fuentes reales, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` mínima y protección de framing mediante `frame-ancestors`/`X-Frame-Options` según compatibilidad.
2. Revisar los scripts inline estáticos de `src/app/layout.tsx:26-63` y usar nonce/hash si la CSP lo requiere; no interpolar datos del usuario.
3. Crear un mapper de errores públicos con correlación interna. En rutas SES, cron e INE devolver códigos estables y mensajes genéricos; registrar el detalle solo en servidor sin secretos, PII ni credenciales.
4. Añadir tests que verifiquen headers en una ruta HTML, una API autenticada y una ruta pública de pre-check-in.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Esperado: todas las respuestas HTML sensibles incluyen la política definida y las respuestas 5xx no contienen `error.message` de librerías o red.

## Fuera de alcance

No hacer un pentest ni prometer cumplimiento legal; validar la política con el entorno real antes de desplegar.
