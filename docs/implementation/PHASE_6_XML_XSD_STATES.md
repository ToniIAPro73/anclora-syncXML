# PHASE 6 — Validación XML/XSD y Estados Prudentes

## 1. Gestión de Estados del XML
Se han introducido estados granulares para el ciclo de vida del XML generado, evitando afirmaciones de cumplimiento garantizado:
*   `generated`: XML recién generado, pendiente de revisión.
*   `locally_reviewed`: El usuario ha confirmado la revisión visual.
*   `xsd_validation_pending`: Pendiente de validación contra esquema XSD oficial.
*   `xsd_validated`: Validado con éxito contra el esquema XSD.
*   `xsd_failed`: Fallo técnico en la validación de estructura XSD.
*   `ses_preprod_tested`: El XML ha sido aceptado por el entorno de preproducción de SES.HOSPEDAJES.
*   `production_send_disabled`: Recordatorio de que el envío a producción no está habilitado en esta versión.

## 2. Abstracción XSD
*   Se ha creado `src/lib/xml/xsd.ts` como una capa de abstracción para futuras integraciones con motores de validación XSD estándar.
*   En esta fase, devuelve un estado `xsd_validation_pending` por defecto, indicando honestamente al usuario que la validación estructural estricta está en proceso de integración.

## 3. Interfaz de Usuario Prudente
*   **Sustitución de Claims**: Se han eliminado términos como *"Validado SES"* o *"Cumplimiento Garantizado"*.
*   **Nuevos Indicadores**: El visor de XML (`XmlViewer`) ahora muestra etiquetas de estado claras como *"XML Generado (Revisión pendiente)"* y un aviso persistente de *"Solo Piloto"*.
*   **Bloqueo de Descarga**: Se mantiene el bloqueo de descarga si el sistema detecta errores críticos de validación local.

## 4. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
