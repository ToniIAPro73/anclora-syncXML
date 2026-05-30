# XML_SES_STATUS_MATRIX_v0.1 — Matriz de estado XML, XSD y SES

## Estado
Borrador inicial / v0.1

## Propósito
Este documento define los niveles de madurez técnica del archivo XML generado para evitar confusiones entre "archivo generado" y "archivo aceptado oficialmente".

## Principio principal
Anclora SyncXML genera **XML revisables de prueba**. La compatibilidad oficial requiere evidencias técnicas externas que aún no deben ser objeto de claim comercial.

## Niveles de madurez técnica

| Nivel | Descripción | Estado Actual | Claim Permitido | Claim Prohibido |
| :--- | :--- | :--- | :--- | :--- |
| 1 | XML generado localmente | **DISPONIBLE** | "XML generado en sesión." | "XML válido." |
| 2 | XML revisado por usuario | **DISPONIBLE** | "Vista previa del XML." | "XML correcto para SES." |
| 3 | Validado por reglas internas | **DISPONIBLE** | "Validación operativa previa." | "Validación oficial." |
| 4 | Validado contra XSD estándar | *En desarrollo* | "Estructura según esquema." | "Compatible con SES." |
| 5 | Probado en pre-prod SES | *Pendiente* | "Probado en entorno test." | "Aceptado por SES." |
| 6 | Aceptado por SES (Evidencia) | *Pendiente* | "Validación técnica superada." | "Integración oficial." |
| 7 | Envío asistido / Manual | *Roadmap* | "Asistente de preparación." | "Envío automático." |
| 8 | Integración automática | *Bloqueado* | N/A | "Conectado a SES." |

## Estado actual (Piloto 01)
- **Generación XML:** Funcional para la estructura de prueba documentada.
- **Validaciones operativas:** Activas (DNI, campos requeridos, tipos de pago).
- **Validación XSD oficial:** No integrada en tiempo real (requiere motor Java/Node externo).
- **Conectividad SES:** No disponible. El piloto es estrictamente "offline".

## Claims permitidos en el Piloto
- "Genera un XML revisable de prueba."
- "Estructura orientada al flujo SES.HOSPEDAJES."
- "Detección previa de errores de formato en el XML."
- "Archivo listo para revisión humana antes del envío."

## Claims NO permitidos
- "Archivo compatible con SES." (Hasta tener nivel 6).
- "Cumplimiento automático de la normativa."
- "Tu XML será aceptado sin problemas."
- "Integración directa con el Ministerio del Interior."

## Evidencias necesarias para el ascenso de nivel (Roadmap)
Para pasar a Nivel 5/6 necesitaremos:
1. Archivo XSD oficial v3.1.3 (o superior) integrado en el motor de validación.
2. Certificado digital de pruebas proporcionado por un colaborador.
3. Logs de respuesta SOAP de SES (anonimizados) que confirmen `RESULTADO: ACEPTADO`.
4. Documento de validación técnica firmado por el responsable de producto.

## Tabla de decisión comercial para el piloto

| Estado Técnico | Qué se puede decir | Qué NO se puede decir | Condición para avanzar |
| :--- | :--- | :--- | :--- |
| Generación Local | "XML de prueba." | "XML listo para enviar." | Integrar motor XSD. |
| Sin respuesta SES | "Orientado a SES." | "Aceptado por SES." | Prueba real en pre-prod. |
| Sin DPA firmado | "Datos sintéticos." | "Tratamos tus datos reales." | Cierre legal/DPA. |

## Disclaimer XML/SES
*"El XML generado es un archivo de prueba basado en la documentación técnica pública de SES.HOSPEDAJES. No se garantiza su aceptación por parte de los servicios oficiales hasta que el cliente realice la validación en sus propios entornos de prueba autorizados."*

## Checklist técnica antes de claim
- [ ] ¿Se ha probado el XML en el validador oficial manual de SES?
- [ ] ¿El XML contiene el código de establecimiento correcto?
- [ ] ¿Se ha advertido que es un "XML revisable de prueba"?
- [ ] ¿Se ha evitado prometer envío automático?
