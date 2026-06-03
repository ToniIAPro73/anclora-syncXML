# PHASE 7 — Landing SyncXML y Piloto Controlado

## 1. Alineación de la Landing Page
La página de aterrizaje se ha consolidado como una herramienta de captación para el piloto controlado, eliminando cualquier funcionalidad operativa directa (dashboard, subida de archivos) para usuarios no autenticados.
*   **Mensaje Central**: Enfoque en *"Privacidad por Defecto"*, *"Procesamiento en Memoria"* y *"XML Revisable para SES.HOSPEDAJES"*.
*   **CTAs Actualizados**:
    1.  **Principal**: *"Solicitar piloto controlado"* (redirige al formulario de inscripción).
    2.  **Secundario**: *"Ver cómo funciona"* (navegación interna a la sección de workflow).
    3.  **Terciario**: *"Iniciar sesión"* (añadido en la cabecera para usuarios ya registrados en el piloto).

## 2. Formulario de Solicitud de Piloto
Se ha verificado y reforzado el formulario de `src/components/landing/PilotRequestForm.tsx`:
*   **Captura de Señal Comercial**: Se recogen datos sobre el tipo de alojamiento, volumen de reservas, flujo de trabajo actual (Excel/XLSX/CSV) y principales problemas operativos.
*   **Compromiso de Privacidad**: Incluye un checkbox obligatorio de *"Uso de datos sintéticos o anonimizados"*, asegurando que el participante entiende que no debe subir PII real durante el piloto inicial.
*   **Willingness to Pay**: Se pregunta explícitamente sobre el interés en un piloto de pago y el presupuesto estimado.

## 3. Seguridad y Acceso
*   La landing no permite el acceso al dashboard operativo sin una sesión válida de `PilotUser`.
*   Se han mantenido los avisos de límites legales y no garantía de cumplimiento oficial.

## 4. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
