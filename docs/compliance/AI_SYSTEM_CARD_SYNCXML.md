# AI System Card - Anclora SyncXML

## Identificacion

- Producto: Anclora SyncXML
- Feature IA / sistema: baseline del sistema y de capacidades IA previstas o auxiliares
- Owner: Toni / Anclora Group
- Estado: `review`
- Ultima revision: 2026-06-08

## Estado y alcance

Anclora SyncXML debe tratarse como producto en `piloto controlado / pre-MVP`. Esta card es una baseline interna de preparacion y control. No constituye asesoramiento juridico, no garantiza cumplimiento del AI Act y no acredita integracion oficial plena con SES.HOSPEDAJES.

## Finalidad

Preparar, validar, revisar y exportar XML revisable a partir de datos de reservas y huespedes importados desde Excel/XLSX, con foco en privacidad por defecto, reduccion de errores operativos y revision humana antes de cualquier uso sensible.

## Usuarios previstos

- gestores de alojamientos;
- pequenos operadores hospitality;
- equipo interno de Anclora en piloto controlado;
- participantes aprobados manualmente para validacion del flujo.

## Usuarios no previstos

- publico general sin aprobacion de piloto;
- operadores que necesiten envio oficial automatico a SES desde el primer dia;
- casos de uso que requieran sistema de registro legal definitivo;
- uso con datos reales sin cerrar seguridad, privacidad, retencion y validacion tecnica.

## Funciones principales

- importacion controlada de XLSX;
- revision de reservas y huespedes;
- validacion y deteccion de incidencias;
- generacion de XML revisable;
- exportacion y descarga con supervision humana;
- soporte de piloto controlado y provisionado de acceso aprobado.

## Funciones con IA actuales o previstas

- validacion asistida de calidad de datos;
- clasificacion o priorizacion asistida de solicitudes de piloto en Nexus/Hermes;
- recomendaciones operativas futuras para corregir incidencias;
- parsing documental asistido para PDFs o documentos auxiliares, si aporta valor real y queda detras de flag.

## Que no hace

- no sustituye PMS, gestorias ni asesoramiento legal;
- no decide por si mismo cumplimiento legal;
- no debe enviar automaticamente a sistemas oficiales sin revision humana;
- no puntua ni rechaza personas de forma automatizada dentro de SyncXML;
- no debe tratarse como sistema de record legal por defecto.

## Datos tratados

- Entradas: Excel/XLSX de reservas y huespedes, configuracion operativa, formularios de piloto, credenciales tecnicas cuando proceda, posibles documentos auxiliares no core.
- Salidas: incidencias de validacion, preview enmascarada, XML revisable, resumentes operativos, emails internos de piloto y trazas tecnicas minimizadas.
- Datos personales: nombres, documentos, emails, telefonos, fechas de estancia y otros datos operativos de huespedes si se usan datos reales.
- Datos sensibles o de alto impacto: documentos identificativos, datos de contacto, historico de reservas, potencial material de pre-check-in.
- Retencion: por defecto no persistente; persistencia solo opt-in y pendiente de politica formal de retencion.

## Dependencias externas

- Next.js App Router
- Prisma y PostgreSQL opcional
- Resend para notificaciones de piloto
- Nexus para orquestacion del flujo de solicitud
- Hermes como validador o recomendador auxiliar si se usa
- SES.HOSPEDAJES para validacion operativa y pruebas de integracion
- MinerU u otro parser documental solo como capacidad auxiliar no core

## Integracion SES.HOSPEDAJES

SyncXML prepara y revisa XML orientado al flujo SES.HOSPEDAJES. La app mantiene el envio de produccion bloqueado por defecto. La evidencia de aceptacion en preproduccion y la validacion operativa completa siguen siendo requisitos previos para cualquier claim fuerte.

## Integracion Hermes

Hermes puede participar como componente auxiliar de evaluacion o curacion de solicitudes/copy, pero no debe aprobar automaticamente accesos ni modificar claims sensibles sin revision humana.

## Integracion MinerU o parsers

No forma parte del flujo core de huespedes. Solo tiene sentido para documentacion, manuales o casos puntuales de parsing documental en entorno controlado. Cualquier uso sobre documentos reales requiere minimizacion, flag explicito y control humano.

## Riesgo preliminar

- Nivel: limitado en AI Act / relevante en privacidad y operativa.
- Justificacion: el mayor riesgo no es una decision automatizada de alto impacto, sino tratamiento de PII, confusion sobre claims de cumplimiento y uso sobre sistemas oficiales.
- Revision legal requerida: `pendiente`

## Riesgos conocidos

- error operativo en datos usados para XML;
- confusion entre asistencia y cumplimiento legal;
- retencion indebida de PII;
- exposicion accidental de identificadores en logs o respuestas;
- activacion prematura de flujos SES o parsing documental con datos reales.

## Mitigaciones

- supervision humana obligatoria;
- copy prudente en landing, login, emails y docs;
- no persistencia por defecto;
- respuestas SES resumidas;
- bloqueo de produccion por defecto;
- datos sinteticos o anonimizados durante piloto;
- trazabilidad tecnica sin PII innecesaria.

## Supervision humana

- Punto de revision: antes de exportar, enviar, provisionar accesos sensibles o reutilizar resultados asistidos.
- Confirmacion explicita: obligatoria para usos oficiales o externos.
- Evidencia/log: evento tecnico minimizado, entorno, accion, estado y version de reglas cuando proceda.

## Limites de uso

- uso solo en piloto controlado;
- no usar con datos reales si faltan controles de privacidad o governance;
- no afirmar cumplimiento AI Act;
- no afirmar aceptacion SES si no existe evidencia verificable;
- no usar como sustituto de revision profesional.

## Declaraciones prohibidas

- "cumple automaticamente AI Act"
- "garantiza cumplimiento legal"
- "integracion oficial SES validada" sin evidencia archivada
- "sustituye revision humana o profesional"

## Evidencias de validacion

- `tests/ses-hospedajes.test.ts`
- `tests/precheckin.test.ts`
- `tests/privacy-encryption.test.ts`
- `tests/privacy-first-pilot.test.ts`
- `docs/audit/*`
- `docs/ses/SYNCXML_SES_PREPRODUCTION_EVIDENCE.md`

## Estado de madurez

Sistema serio de validacion controlada con base tecnica suficiente para piloto, pero no listo para presentarse como producto de cumplimiento automatico ni como integracion SES plenamente demostrada en produccion.
