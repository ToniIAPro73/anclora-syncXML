# PHASE 0 — Auditoría Inicial y Línea Base Privacy-First

## Objetivo
Establecer línea base, evitar regresiones y documentar riesgos antes de implementar mejoras del MVP privacy-first.

## 1. Estado de la Arquitectura
*   **Framework**: Next.js App Router.
*   **Base de datos**: Prisma (PostgreSQL), actualmente con esquema robusto para `Property`, `Reservation`, `Guest`, `StoredFile`, `SesSubmission`, y `PilotUser`.
*   **QA**: Vitest configurado con 161 tests pasando sin errores.
*   **Manejo de archivos**: `xlsx` (usado actualmente en `src/lib/excel/parseExcel.ts`) y `fast-xml-parser`.

## 2. Inspección de Rutas
Rutas detectadas en `src/app/api`:
*   `/api/upload`
*   `/api/generate`
*   `/api/reservations`
*   `/api/precheckin`
*   `/api/ses`
*   `/api/admin`, `/api/auth`, `/api/pilot`, `/api/internal`, `/api/cron`

## 3. Estado Funcional Actual vs Requisitos Prompt
*   **Soporte CSV**: No detectado en `parseExcel.ts`. La integración flexible está pendiente (Fase 2).
*   **Persistencia (Ledger real)**: Existe en Prisma pero está controlado bajo la variable de entorno `SYNCXML_ENABLE_PERSISTENT_STORAGE` (por defecto false).
*   **Logs**: Inspeccionados logs en scripts y terminal; no se hallaron fugas de PII en logs básicos por `console.log`.
*   **Seguridad y Dependencias**:
    *   `npm audit` reporta: `postcss` (moderate), `next` (moderate), `xlsx` (high - ReDoS / Prototype Pollution). Se requiere precaución con el procesamiento de archivos grandes / maliciosos. No hay parches directos disponibles sin breaking changes, se asume riesgo mitigable con control de tamaño y entornos sin estado.

## 4. Riesgos Técnicos Detectados
1.  Vulnerabilidades en paquete `xlsx` sin corrección simple.
2.  Presencia de infraestructura SES real (`SesSubmission` en BD y `/api/ses`). Hay que asegurar que NO se usa para envíos a producción en el MVP.

## 5. Validaciones Ejecutadas
*   `npm run lint`: ✅ (Pasa)
*   `npm run typecheck`: ✅ (Pasa)
*   `npm run test`: ✅ (Pasa - 161 tests, 22 files)
*   `npm run build`: Pendiente (se ejecutará al final del script global).

## Conclusión Fase 0
Línea base robusta. Se confirma que el principio de modo privado está implementado como bandera de entorno, pero se fortalecerá en la Fase 1 la visibilidad del "modo temporal" y que NO hay almacenamiento permanente por defecto.
