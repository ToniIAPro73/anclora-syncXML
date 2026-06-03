# PHASE 1 — Hardening Privacy-First y Mensajes de Producto

## 1. Cambios Funcionales Implementados
*   **Aseguramiento del Modo Temporal**: Validado en `src/components/SyncXmlWorkflow.tsx` y en el backend (vía `SYNCXML_ENABLE_PERSISTENT_STORAGE=false`).
*   **Indicador Visible de Privacidad**: Añadido texto explícito *"Modo Temporal Activo"* y *"Sin almacenamiento permanente por defecto"* en el componente `PrivacyModeCard`.
*   **Botón de Borrado**: Se ha resaltado el botón *"Borrar datos de esta operación"* asignándole clase de alerta (`btn-danger`).
*   **Bloque "Qué ocurre con tus datos"**: Agregado listado en `PrivacyModeCard` detallando que:
    *   Los datos importados se procesan en memoria.
    *   La vista previa enmascara los datos personales.
    *   El XML generado es revisable y se descarga al cliente.
    *   Los logs técnicos no registran PII.
    *   Se puede destruir la operación en cualquier momento.
    *   No hay envío automático a SES ni se actúa como archivo legal.

## 2. Textos Públicos y Landing
*   **Sustitución de claims**: Verificado en `landingData.ts`. La landing funciona como un embudo para captar usuarios del piloto y no permite operar ni promete validaciones reales ni pide subir datos de huéspedes reales. Se informa claramente sobre las limitaciones legales (ej. *"El XML generado es revisable, no oficialmente aceptado..."*).

## 3. Estado de la Auditoría Técnica (PII)
*   **Revisión en `audit.ts`**: El sistema usa UUID, timestamp, eventType, pseudonymousSessionId, y hashes para trazas operativas, sin inyección de PII.

## 4. Riesgos Restantes Pendientes
*   No se ha introducido todavía el paquete local (ZIP descargable), que forma parte de la **Fase 4**.
*   El manejo en el servidor del precheck-in deberá endurecerse en la **Fase 5**.

## 5. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
