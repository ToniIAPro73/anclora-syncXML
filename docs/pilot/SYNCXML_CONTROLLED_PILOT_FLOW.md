# SyncXML Controlled Pilot Flow

## Objetivo

Definir el flujo de piloto controlado con responsables, estados, puntos de revision humana y flags relevantes, manteniendo SyncXML como producto de validacion asistida y no de acceso abierto.

## Diagrama textual

1. Usuario externo llega a landing publica.
2. Usuario envia `POST /api/pilot/request` desde `/piloto`.
3. SyncXML valida formato, rate limits y consentimiento de datos sinteticos.
4. SyncXML reenvia la solicitud a Nexus si el webhook esta configurado.
5. Nexus decide el flujo interno:
   - rechazo directo si el caso contradice el piloto;
   - revision manual si hay ambiguedad;
   - aceptacion manual si el caso encaja.
6. Hermes, si participa, solo recomienda; no aprueba automaticamente.
7. Si Toni o el equipo aprueban, se provisiona `PilotUser` con acceso temporal.
8. El usuario aprobado recibe credenciales individuales por email.
9. El usuario entra por `/login` y accede a `/app` o `/dashboard`.
10. Cualquier acceso puede ser revocado o caducar.

## Estados

| Estado | Significado | Responsable |
|---|---|---|
| `requested` | solicitud recibida por SyncXML/Nexus | SyncXML + Nexus |
| `in_review` | evaluacion humana pendiente | equipo Anclora |
| `accepted` | aprobado manualmente para piloto | Toni / equipo |
| `rejected` | no encaja con el alcance actual | Toni / equipo |
| `revoked` | acceso retirado tras haber sido concedido | Toni / equipo |
| `expired` | acceso temporal caducado | sistema + equipo |

Nota: en la base de datos de SyncXML solo viven los estados de acceso del usuario provisionado (`active`, `revoked`, `expired`). Los estados previos a provisionado pertenecen sobre todo al workflow de Nexus.

## Responsables

- SyncXML: capturar la solicitud, aplicar rate limit y no exponer acceso abierto.
- Nexus: recibir webhook, consolidar la solicitud y coordinar la revision.
- Hermes: recomendador auxiliar o validador de copy; nunca aprobador final.
- Toni / equipo: decision final de alta, rechazo, revocacion y pruebas SES sensibles.

## Puntos de revision humana

- alta del solicitante en piloto;
- provisionado de `PilotUser`;
- reemision de credenciales;
- exportacion de XML para uso externo;
- cualquier prueba de preproduccion SES;
- cualquier activacion futura de parsing documental sobre documentos reales.

## Flags y variables relevantes

- `NEXUS_SYNCXML_WEBHOOK_URL`
- `NEXUS_SYNCXML_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `SYNCXML_PILOT_REQUEST_TO`
- `SYNCXML_LOCAL_DEMO`
- `SYNCXML_ADMIN_ACCESS_ENABLED`
- `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION`
- `SYNCXML_SES_ALLOW_PRODUCTION_SEND`

## Criterios de aceptacion

- caso compatible con piloto controlado;
- uso con datos sinteticos o anonimizados;
- necesidad real de validar flujo Excel/XLSX -> XML;
- expectativa alineada con revision humana y no automatizacion oficial;
- capacidad del equipo para acompañar el piloto de forma segura.

## Criterios de rechazo

- expectativa de envio automatico oficial inmediato;
- uso previsto con datos reales sin cerrar governance y seguridad;
- solicitud incompatible con el alcance pre-MVP;
- peticion de sustitucion de asesoria legal, PMS completo o compliance garantizado.

## Riesgos y mitigaciones

- Riesgo: confundir `/login` con acceso publico.
  Mitigacion: acceso solo con credenciales aprobadas manualmente y copy explicita.
- Riesgo: autoaprobacion indirecta por automatismos externos.
  Mitigacion: Hermes solo recomienda; Toni decide.
- Riesgo: fuga de PII en trazas.
  Mitigacion: logs minimizados y pseudonimizados cuando aporte valor.
- Riesgo: uso de SES fuera de control.
  Mitigacion: produccion bloqueada por defecto y panel SES restringido.
