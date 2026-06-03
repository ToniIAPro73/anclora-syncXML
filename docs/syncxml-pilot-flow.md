# Flujo del Piloto Controlado - SyncXML

## Diagrama de Flujo

1. **Usuario** solicita acceso en Landing de SyncXML (\`/piloto\`).
2. **SyncXML** envía Webhook a **Nexus** (\`/api/internal/webhooks/syncxml-pilot\`).
3. **Nexus** registra la solicitud (estado \`pending\`).
4. **Nexus** consulta a **Hermes Worker** para scoring determinista y LLM (\`/api/syncxml/pilot/validate\`).
5. **Hermes** devuelve \`decision\` (approve, reject, manual_review) y \`score\`.
6. **Nexus** crea una tarea para el equipo (\`syncxml_pilot_review\`).
7. **Revisor humano** (Nexus) aprueba la solicitud.
8. **Nexus** llama a SyncXML para provisionar el usuario (\`/api/internal/pilot-users\`).
9. **SyncXML** crea o actualiza \`PilotUser\` y devuelve contraseña temporal.
10. **Nexus** envía correo de bienvenida vía Resend.
11. **Usuario** inicia sesión en SyncXML.
12. **SyncXML** fuerza rotación de contraseña (\`AuthGate\` -> \`/api/auth/change-password\`).
13. **Usuario** accede a la App para revisión de datos sintéticos.

## Endpoints Clave

| Sistema | Endpoint | Función |
|---------|----------|---------|
| SyncXML | \`POST /api/pilot/request\` | Formulario público de solicitud. |
| Nexus | \`POST /api/internal/webhooks/syncxml-pilot\` | Recibe webhook de SyncXML. |
| Hermes | \`POST /api/syncxml/pilot/validate\` | Evalúa la solicitud y sugiere acción. |
| Nexus | \`POST /api/syncxml-pilot/{req_id}/approve\` | Acción manual del equipo. |
| SyncXML | \`POST /api/internal/pilot-users\` | Provisión de usuario y reset de password. |
| SyncXML | \`POST /api/auth/change-password\` | Rotación de credencial temporal. |

## Estados del XML

- \`generated\`: Generado desde Excel.
- \`locally_reviewed\`: Revisión visual en UI completa.
- \`xsd_validated\`: Validado contra \`schemas/ses-hospedajes/v3.1.3/\`.
- \`ses_preprod_tested\`: Probado con éxito en preproducción SES.
- \`production_sent_disabled\`: Envío productivo bloqueado en esta fase pre-MVP.

## Recuperación ante Fallos

- Si falla Hermes: Nexus hace fallback a evaluación local determinista (rechazo por condiciones, revisión manual para el resto).
- Si falla aprovisionamiento en SyncXML: La tarea en Nexus muestra el error y se puede reintentar la acción de aprobar.
- Si falla email: La tarea muestra fallo de email. El revisor puede reintentar.

## Decisiones

- **Hermes**: Nunca aprueba automáticamente en Nexus; solo recomienda. Rechaza determinísticamente si se piden datos reales en este momento o envío oficial a SES.
- **Nexus Revisor**: Decisión humana vinculante.
