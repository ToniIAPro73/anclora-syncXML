# PHASE 2 — Importador Flexible CSV/XLSX

## 1. Estado de Implementación
*   **Soporte CSV Básico (Implementado)**: Se ha habilitado la subida de archivos `.csv` en el validador del servidor (`/api/upload/excel/route.ts`) y en el input del lado del cliente (`SyncXmlWorkflow.tsx`). La librería subyacente (`xlsx` / SheetJS) detecta y parsea correctamente el formato CSV siempre y cuando respete las cabeceras de la plantilla actual (`anclora_template`).
*   **Perfiles de Origen y Mapeo Flexible (Pendiente)**: La arquitectura requerida para permitir perfiles dinámicos y mapeos de columnas visuales requiere una refactorización sustancial del flujo de UI (para añadir el paso intermedio de mapeo antes de la consolidación de la previsualización) y de las abstracciones del backend.

## 2. Decisiones de Arquitectura Documentadas (Backlog)
Para completar la flexibilidad total del importador en el futuro sin incluir APIs externas (como indica el prompt), se deberá:
1.  **Desacoplar la lectura de la validación**: Modificar `parseExcelBuffer` para que devuelva un formato intermedio de filas en bruto (`RawSheet`).
2.  **Modelo de Mapeo**:
    ```ts
    type ImportSourceProfile = {
      id: string
      label: string
      description: string
      acceptedFormats: Array<'csv' | 'xlsx'>
      columnAliases: Record<string, string[]>
      requiredFields: string[]
      optionalFields: string[]
    }
    ```
3.  **UI de Mapeo**: Interceptar el `upload` exitoso en `SyncXmlWorkflow.tsx` y mostrar una tabla interactiva (Paso 2 expandido) donde el usuario relacione columnas desconocidas con los campos requeridos (`reservationReference`, `guestDocumentNumber`, etc.) antes de invocar la previsualización de errores.
4.  **Perfiles sugeridos**: `generic_csv`, `generic_xlsx`, `booking_export_manual`, `airbnb_export_manual`, `pms_generic_export`.

## 3. Seguridad
*   El procesamiento de CSV mantiene los mismos controles de seguridad que el XLSX: límites de tamaño, no persistencia completa por defecto, enmascaramiento en la vista previa y rechazo de archivos corruptos.

## 4. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
