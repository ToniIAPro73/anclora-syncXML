# PHASE 3 — Ledger Mínimo sin PII por defecto

## 1. Implementación del Ledger
*   **Modelo de Datos**: Se utiliza el esquema de Prisma existente que ya incluye `Reservation`, `Property`, `Guest` y `AuditEvent`. Se ha adaptado para cumplir con el principio de no persistencia de PII por defecto.
*   **Modo Memoria**: Por defecto (`SYNCXML_ENABLE_PERSISTENT_STORAGE=false`), las reservas se almacenan en un `memoryStore` volátil gestionado en `src/lib/db/reservations.ts`.
*   **Protección de PII**: 
    *   Si se activa la persistencia en base de datos, los campos sensibles (`firstName`, `documentNumber`, `email`, `phone`, `address`) se cifran automáticamente mediante `encryptString`.
    *   El payload normalizado (`normalizedPayloadJson`) se minimiza para no almacenar el Excel original ni el XML completo de forma redundante.
*   **Estados de Reserva**: Se han mapeado los estados operativos a las constantes de `ReservationStatus` (`DRAFT`, `IMPORTED`, `VALIDATED`, `XML_GENERATED`, `CONSOLIDATED`, `DOWNLOADED`, `DELETED`).

## 2. Dashboard y Visualización
*   **Enmascaramiento**: La vista del dashboard (`src/components/ReservationDashboard.tsx`) utiliza funciones de masking para documentos, emails y teléfonos, garantizando que no se muestre PII completa al usuario.
*   **Vista por Estados**: El dashboard permite listar y filtrar por el estado actual de la reserva.

## 3. Auditoría Reforzada
Se han añadido los eventos de auditoría requeridos para la trazabilidad operativa sin PII en `src/lib/audit.ts`:
*   `import_batch_created`
*   `reservation_imported`
*   `mapping_reviewed`
*   `validation_completed`
*   `local_package_generated`
*   `xml_generated`
*   `operation_cleared`

## 4. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
