# Responsibility hardening

## Riesgos identificados

- Tratamiento de datos personales de huespedes, documentos, contacto, estancia y pago.
- Persistencia previa de payloads completos cuando existia base de datos.
- Bypass de login si faltaba password administrativa.
- Previews con documentos, emails y telefonos completos.
- Falta de consentimiento granular antes de importar.

## Decisiones tomadas

- Modo privado sin almacenamiento permanente por defecto.
- Persistencia solo con `SYNCXML_ENABLE_PERSISTENT_STORAGE=true`.
- Consentimiento informado con cinco confirmaciones obligatorias.
- Consolidacion bloqueada por errores criticos, duplicados pendientes, preview no revisada o mapeo no revisado.
- Enmascarado visual por defecto y toggle local no persistente.
- Auditoria tecnica sin PII.

## Datos tratados

Datos de reserva, huespedes, documentos, fechas, nacionalidad, direccion, telefono, email, estancia, pago limitado y metadatos contractuales.

## Datos no almacenados por defecto

No se guarda permanentemente el Excel original, XML completo, documentos, emails, telefonos, direcciones ni payload normalizado salvo opt-in explicito de persistencia.

## Medidas de minimizacion y seguridad

- Procesamiento temporal en memoria.
- Persistencia desactivada por defecto; si se activa, los campos personales de huesped se cifran y el payload completo no se guarda.
- Nombres de archivo sanitizados.
- Hash tecnico SHA-256 de archivo para auditoria.
- Logs sin PII.
- Bloqueo de XML con DOCTYPE/ENTITY.
- Rechazo de archivos invalidos, vacios o excesivos.

## Limites legales

La app no ofrece asesoramiento legal ni garantiza cumplimiento normativo. El usuario debe disponer de autorizacion y revisar los datos antes de exportar o usar oficialmente el XML.

## Eventos de auditoria

`file_import_started`, `file_import_validated`, `file_import_failed`, `mapping_reviewed`, `duplicates_detected`, `consolidation_preview_generated`, `consolidation_confirmed`, `xml_exported`, `session_cleared`, `privacy_mode_enabled`, `privacy_mode_changed`, `validation_error_detected`.

## Tests añadidos

Se cubren enmascarado, seguridad de archivos, auth/config, duplicados, persistencia privada y XML peligroso.

## Pendientes antes de produccion

- Revisar cifrado de campos si se habilita persistencia.
- Definir contacto legal real.
- Ejecutar auditoria externa con datos sinteticos.
- Revisar retencion y borrado si se conecta almacenamiento externo.

## Checklist de revision humana

- Confirmaciones aceptadas.
- Datos minimizados.
- Preview revisada.
- Mapeo revisado.
- Incidencias criticas resueltas.
- Duplicados resueltos.
- XML descargado revisado antes de uso oficial.

## Evidencias i18n, dark/light y responsive

La UI nueva usa `src/lib/i18n.ts`, tema mediante variables CSS y layouts con grids responsivos, scroll horizontal controlado en tablas y footer legal visible.
