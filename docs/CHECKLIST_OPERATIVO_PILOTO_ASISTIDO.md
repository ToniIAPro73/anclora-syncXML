# Checklist Operativo: Primer Piloto Asistido (Propuesta)

Este checklist es una propuesta para estructurar la primera prueba real de Anclora SyncXML con usuarios invitados. No implica cambios técnicos actuales.

## 1. Configuración de Entorno (Vercel/Render)
*   [ ] `SYNCXML_PILOT_AUTO_APPROVE=false` (Asegurado).
*   [ ] `SYNCXML_ENABLE_PERSISTENT_STORAGE=false` (Asegurado, para garantizar modo memoria).
*   [ ] Secretos cruzados validados (Webhook, Internal API).
*   [ ] `RESEND_API_KEY` y `RESEND_FROM_EMAIL` configurados para dominio oficial.
*   [ ] `SYNCXML_PILOT_REQUEST_TO` configurado con la cuenta del administrador que revisará.

## 2. Definición del Piloto
*   [ ] **Perfil del Usuario:** "Friends & Family" o Partner de confianza con volumen bajo de reservas.
*   [ ] **Datos Permitidos:** Excel con datos *sintéticos* o *rigurosamente anonimizados* (nombres ficticios, DNI alterados).

## 3. Comunicaciones y Assets
*   [ ] **Email de Invitación:** Template en Resend que incluya:
    *   Enlace de acceso.
    *   Credenciales temporales.
    *   Aviso en rojo: *"Uso exclusivo para validación técnica. Prohibido subir datos reales de huéspedes."*
*   [ ] **Guion de Demo (Asistida):**
    1.  Contexto: "Es un borrador funcional para validar la conversión Excel -> XML".
    2.  Paso 1: Login.
    3.  Paso 2: Carga del Excel de prueba.
    4.  Paso 3: Subsanación de un error provocado (ej. fecha de caducidad DNI).
    5.  Paso 4: Descarga del XML.
*   [ ] **Formulario de Feedback (Typeform / Typeform alternativo):**
    *   ¿Fue intuitiva la carga del Excel?
    *   ¿Entendiste por qué se marcaron ciertos campos como error?
    *   ¿Qué falta para que confíes en esta herramienta en tu día a día?

## 4. Criterios de Éxito
*   [ ] El usuario logra subir el Excel sin asistencia técnica en el momento.
*   [ ] El usuario resuelve al menos 1 error de validación en la UI.
*   [ ] El XML final se descarga correctamente y pasa validación estructural (bien formado).
*   [ ] Sin caídas críticas de la aplicación (500s) ni fugas de memoria.

## 5. Límites Legales y de Datos
*   [ ] **Cero Integración SES:** No se enviará el archivo a las autoridades.
*   [ ] **Cero Garantía de Cumplimiento:** El XML es una propuesta ("Draft"), no un documento oficial certificado.
*   [ ] **Cero Retención:** Al cerrar la pestaña o recargar, los datos de la sesión se destruyen.

## 6. Procedimiento de Rollback (Si algo falla)
*   [ ] Si el XML sale malformado de forma consistente: Pausar prueba, recoger log del error en cliente, finalizar sesión.
*   [ ] Si el AuthGate falla: El admin revoca manualmente el acceso cambiando el `PilotUserStatus` a `revoked` vía base de datos (Supabase) o rotando la clave temporal.
*   [ ] Si se suben datos reales accidentalmente: Forzar cierre de sesión (borra estado in-memory). Si la persistencia estuviera activa por error, ejecutar borrado manual del registro en BD y vaciar logs de Vercel.
