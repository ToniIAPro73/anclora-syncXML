# PHASE 4 — Paquete Local de Conservación

## 1. Funcionalidad Implementada
*   **Generación de ZIP**: Se ha integrado la librería `jszip` para generar paquetes de conservación local bajo demanda en el cliente.
*   **Contenido del Paquete**: El archivo ZIP generado (`syncxml-paquete-conservacion-*.zip`) incluye:
    *   `manifest.json`: Metadatos, sello temporal y lista de archivos.
    *   `reserva-normalizada.json`: Estructura JSON con los datos de la reserva, propiedad y pago.
    *   `huespedes.csv`: Listado legible de huéspedes para revisión manual rápida.
    *   `xml-revisable.xml`: El XML generado orientado al flujo SES.HOSPEDAJES.
    *   `informe-validacion.json/csv`: Reportes detallados de las reglas de validación aplicadas.
    *   `README_conservacion.txt`: Documento informativo con avisos legales y de privacidad.

## 2. Reglas de Conservación y Privacidad
*   **Bajo Demanda**: El paquete solo se genera cuando el usuario pulsa el botón *"Generar paquete local"*.
*   **No Persistencia**: No se almacena el ZIP en el servidor por defecto, respetando el modo temporal del MVP.
*   **Transparencia Legal**: El `README` incluido especifica que SyncXML no actúa como archivo legal permanente y que la revisión humana es obligatoria antes del uso oficial.

## 3. UI/UX
*   Se ha añadido el botón de acción en el paso final de consolidación (`SyncXmlWorkflow.tsx`).
*   Se muestra un estado de carga (*"Procesando..."*) durante la generación del ZIP.

## 4. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
