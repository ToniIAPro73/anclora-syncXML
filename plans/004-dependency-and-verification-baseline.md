# Plan 004 — Dependencia de hojas y baseline de verificación

Base: `3475638`  
Prioridad: P1  
Esfuerzo: M

## Objetivo

Reducir el riesgo de la dependencia `xlsx` y convertir la calidad actual en una señal reproducible de CI.

## Cambios

1. Evaluar una alternativa mantenida para lectura XLSX o aislar `xlsx` detrás de un parser defensivo. Documentar la decisión si se mantiene temporalmente.
2. Añadir límites explícitos de filas, columnas, hojas y tiempo de parseo; rechazar ficheros con estructura que exceda el presupuesto antes de construir el payload completo.
3. Ejecutar `npm audit --omit=dev --audit-level=high` en CI y registrar una excepción temporal para `xlsx` solo si no existe sustituto aceptable; incluir fecha de revisión y responsable.
4. Añadir script de cobertura con umbral inicial realista y subirlo gradualmente hasta el estándar del repositorio.
5. Añadir un smoke E2E en entorno local con datos sintéticos para login, subida, validación, consolidación y descarga. No usar Nexus, Resend o SES reales.
6. Resolver la advertencia de raíz de workspace configurando `turbopack.root` o eliminando lockfiles superpuestos fuera del proyecto, sin borrar archivos de terceros sin confirmación.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

Esperado: límites de parser cubiertos por tests, CI falla ante nuevos advisories high/critical no documentados y el smoke local usa exclusivamente fixtures sintéticas.

## Fuera de alcance

No ejecutar `npm audit fix --force` automáticamente: el resultado propuesto fuerza un downgrade mayor de Next y puede romper la aplicación.
