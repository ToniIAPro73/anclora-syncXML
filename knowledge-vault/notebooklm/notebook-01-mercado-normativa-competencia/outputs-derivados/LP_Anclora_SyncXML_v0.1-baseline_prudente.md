## Veredicto

**Prudente con ajustes.**

La landing es usable como base comercial, pero conviene suavizar varias frases para reducir riesgos de interpretación sobre **SES.HOSPEDAJES, XML, validación, RGPD y preparación para uso oficial**. No contiene claims claramente prohibidos como “cumplimiento garantizado”, “evita sanciones”, “integración oficial” o “envío automático”, pero algunas expresiones podrían leerse como una madurez técnica o legal mayor de la documentada.

---

# 1. Evaluación crítica general

| Criterio                       | Evaluación                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Claims sobre SES.HOSPEDAJES    | En general prudentes, pero “orientado al flujo SES.HOSPEDAJES” debe acompañarse siempre de “sin integración oficial ni aceptación demostrada”. |
| Ministerio del Interior        | Correcto: no se promete conexión ni cumplimiento automático.                                                                                   |
| Cumplimiento legal / sanciones | Correcto: evita prometer cumplimiento o evitar sanciones.                                                                                      |
| RGPD / privacidad              | Bastante prudente, aunque “privacidad por defecto” debe mantenerse ligado a “según el modelo documentado y salvo persistencia activada”.       |
| XML                            | Correcto, pero “validar” y “generar XML” deben matizarse: XML revisable, no necesariamente aceptado por SES.                                   |
| Integración automática         | Correcto: se niega expresamente.                                                                                                               |
| Diferencia actual/futuro       | Correcta, aunque algunas mejoras futuras deberían quedar más claramente como “pendientes”.                                                     |
| Estado pre-MVP                 | Muy claro.                                                                                                                                     |
| Claridad para no técnicos      | Buena, aunque algunas secciones son largas.                                                                                                    |
| Atractivo comercial            | Suficiente, pero puede reforzarse con mensajes de dolor/beneficio sin subir riesgo.                                                            |

---

# 2. Tabla de frases problemáticas

| Frase de la landing                                                  | Riesgo                                                                                 | Clasificación              | Versión más segura                                                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| “preparar tus comunicaciones de huéspedes”                           | Puede sugerir que la herramienta cubre la comunicación oficial completa.               | Prudente con matices       | “preparar y revisar los datos de huéspedes antes de cualquier comunicación oficial”.                                  |
| “XML orientado al flujo SES.HOSPEDAJES”                              | Correcta, pero si aparece sola puede parecer compatibilidad demostrada.                | Prudente con matices       | “XML revisable orientado al flujo SES.HOSPEDAJES, pendiente de validación externa antes de claims de compatibilidad”. |
| “validar y preparar datos antes de generar XML”                      | “Validar” puede confundirse con validación XSD/SES completa.                           | Prudente con matices       | “detectar errores y revisar datos antes de generar un XML revisable”.                                                 |
| “presión operativa relacionada con SES.HOSPEDAJES”                   | Es comprensible, pero algo comercialmente emocional.                                   | Segura                     | “necesidad operativa de preparar datos relacionados con SES.HOSPEDAJES”.                                              |
| “preparar mejor los datos antes de generar un archivo XML revisable” | Correcta, pero faltaba insistir en que no garantiza aceptación.                        | Segura con matiz           | “preparar mejor los datos antes de generar un XML revisable, sin garantizar aceptación oficial”.                      |
| “puedes generar un XML revisable”                                    | Correcta si está implementado, pero debe mantenerse como XML revisable, no aceptado.   | Segura                     | Mantener, añadiendo cerca: “la aceptación oficial no está garantizada”.                                               |
| “La herramienta exige revisión de datos”                             | “Exige” podría ser demasiado fuerte si no todos los controles están cerrados.          | Prudente con matices       | “La herramienta está diseñada para incorporar revisión de datos”.                                                     |
| “auditoría sin PII”                                                  | Defendible documentalmente, pero conviene especificar “auditoría técnica/operacional”. | Segura                     | “auditoría técnica/operacional sin PII”.                                                                              |
| “pruebas con datos sintéticos”                                       | Puede sonar a que ya existe una cobertura completa.                                    | Prudente con matices       | “uso recomendado de datos sintéticos para pruebas y validación controlada”.                                           |
| “analizar mi Excel actual”                                           | Puede implicar datos reales.                                                           | Arriesgada si no se matiza | “analizar una muestra anonimizada o sintética de mi Excel”.                                                           |
| “solicitar piloto controlado”                                        | Correcto, pero debe exigir no usar datos reales hasta cierre de bloqueos.              | Segura con matiz           | “solicitar piloto controlado con datos sintéticos o anonimizados”.                                                    |

---

# 3. Recomendaciones de mejora

1. **Sustituir “validar” por “detectar errores y revisar” cuando se hable al público general**, salvo en secciones técnicas donde se aclare que la validación XSD estándar está pendiente.

2. **Evitar CTAs que sugieran subir un Excel real.** Mejor usar “Excel anonimizado”, “muestra sintética” o “plantilla de ejemplo”.

3. **Añadir un aviso junto al Hero**, no solo al final, indicando que el XML generado no implica aceptación por SES.

4. **Separar mejor “actual” y “futuro” con etiquetas visuales:**
   “Disponible en validación controlada” frente a “Previsto / pendiente de validación”.

5. **Matizar “privacidad por defecto”:** es defendible porque el README y Privacy Model documentan no persistencia por defecto, pero debe aclararse que el uso con datos reales requiere cierre de seguridad, RGPD y retención.  

6. **No usar “uso oficial” sin matiz.** Mejor: “antes de cualquier uso oficial por parte del responsable”.

7. **Añadir un bloque breve de “Estado del producto”** con tres columnas: disponible, pendiente, no incluido.

8. **Reforzar que Anclora SyncXML no es sistema de registro legal.** Esto está alineado con el diagnóstico refinado: SES será la fuente de verdad y SyncXML retendrá solo metadatos, pendiente de implementación legal/operativa. 

---

# 4. Versión corregida final de la landing

## 1. Hero principal

# Revisa datos de huéspedes desde Excel antes de generar un XML revisable

## Anclora SyncXML ayuda a pequeños alojamientos, viviendas turísticas y gestores a revisar datos de reservas y huéspedes procedentes de Excel/XLSX, detectar errores operativos y preparar un XML revisable orientado al flujo SES.HOSPEDAJES.

Una herramienta ligera para trabajar con datos de huéspedes sin adoptar un PMS completo, con privacidad por defecto, datos enmascarados y revisión humana antes de cualquier uso oficial por parte del responsable.

**CTA principal:**
**Solicitar piloto controlado**

**CTA secundario:**
**Analizar una muestra anonimizada de mi Excel**

**Microcopy de prudencia:**
Actualmente en fase **pre-MVP / validación controlada**. Anclora SyncXML no es asesoría legal, no garantiza cumplimiento normativo, no acredita aceptación oficial del XML por SES.HOSPEDAJES y no debe presentarse como integración oficial ni envío automático al Ministerio del Interior.

---

## 2. El problema

# Cuando el flujo depende de Excel, revisar datos de huéspedes puede volverse lento y delicado

Muchos pequeños alojamientos y gestores trabajan con hojas Excel o exportaciones XLSX para organizar reservas y datos de huéspedes.

Ese flujo puede generar problemas habituales:

* datos incompletos o mal escritos;
* campos críticos difíciles de revisar manualmente;
* duplicados entre huéspedes o reservas;
* errores en documentos, fechas, nacionalidades, teléfonos, direcciones o datos de estancia;
* dificultad para comprobar si la información está lista para preparar un XML;
* complejidad técnica al trabajar con estructuras XML;
* necesidad operativa de preparar datos relacionados con SES.HOSPEDAJES;
* exposición de datos personales sensibles durante la revisión.

Anclora SyncXML nace para reducir esa fricción operativa: no sustituye el criterio humano, pero ayuda a ordenar el proceso.

---

## 3. La solución

# Una capa ligera entre tu Excel y un XML revisable

Anclora SyncXML está pensada para este flujo:

## Excel/XLSX → revisión → detección de errores → XML revisable

La herramienta ayuda a preparar datos antes de generar un archivo XML revisable orientado al flujo SES.HOSPEDAJES, sin afirmar integración oficial ni aceptación automática.

Con Anclora SyncXML puedes:

* importar datos desde Excel/XLSX;
* revisar información de reserva, establecimiento y huéspedes;
* detectar errores operativos y duplicados;
* trabajar con datos sensibles enmascarados;
* generar un XML revisable;
* mantener una revisión humana antes de cualquier uso oficial.

No es un PMS completo. No es una gestoría. No es asesoramiento legal. Es una capa especializada para preparar y revisar datos.

---

## 4. Cómo funciona

# De una hoja Excel a un XML revisable en cinco pasos

## 1. Importa tu Excel/XLSX

Carga una hoja Excel o XLSX con datos de reservas y huéspedes. En pilotos, se recomienda usar datos sintéticos, anonimizados o muestras controladas.

## 2. Revisa datos de reserva y huéspedes

Consulta la información detectada antes de generar cualquier XML. El flujo está orientado a revisar datos de reserva, establecimiento, huéspedes y pago.

## 3. Detecta errores o duplicados

Anclora SyncXML ayuda a identificar incidencias operativas: campos incompletos, datos que requieren revisión, duplicados pendientes o errores que conviene resolver antes de continuar.

## 4. Genera un XML revisable

Cuando la información está preparada, puedes generar un XML revisable. Este XML no debe interpretarse por sí solo como aceptación oficial ni como garantía de cumplimiento.

## 5. Exporta o prepara el archivo con revisión humana

El archivo puede descargarse o prepararse para el siguiente paso operativo, siempre bajo revisión humana y responsabilidad del usuario o responsable del tratamiento.

---

## 5. Ventajas actuales

# Más control sobre tus datos antes de preparar el XML

## Ligera frente a un PMS completo

Anclora SyncXML no intenta reemplazar un sistema hotelero completo. Está diseñada como una herramienta específica para quienes ya trabajan con Excel/XLSX y necesitan revisar mejor sus datos.

## Revisión previa

El flujo permite revisar datos antes de generar un XML, evitando tratar el archivo como una caja negra.

## Detección de errores operativos

Ayuda a identificar campos incompletos, datos dudosos o duplicados que conviene resolver antes de preparar el XML.

## Revisión humana

La herramienta está diseñada para incorporar revisión humana antes de exportar o usar el XML.

## Privacidad por defecto

El modelo documentado parte de un modo sin persistencia permanente por defecto. Los datos se tratan de forma temporal durante la operación, salvo que se active persistencia explícita con las garantías necesarias. 

## Datos sensibles enmascarados

La interfaz contempla vistas con datos sensibles enmascarados por defecto, reduciendo exposición innecesaria durante la revisión. 

## Auditoría técnica sin PII

El modelo de privacidad contempla eventos técnicos sin registrar datos personales identificables, como conteos, estados de validación, sesión pseudonimizada o hash técnico. 

## Pensada para pequeños alojamientos

El enfoque está orientado a pequeños alojamientos, viviendas turísticas y gestores que trabajan con Excel y no necesitan adoptar un PMS completo.

---

## 6. Qué no promete

# Alcance claro para evitar falsas expectativas

Anclora SyncXML no promete:

* cumplimiento legal garantizado;
* evitar sanciones;
* aceptación automática por SES.HOSPEDAJES;
* integración oficial con SES.HOSPEDAJES;
* envío automático al Ministerio del Interior;
* sustitución de un PMS;
* sustitución de una gestoría o asesoría legal;
* tratamiento de datos reales sin cerrar seguridad, privacidad, RGPD, retención y validación técnica;
* funcionamiento como sistema de registro legal.

El producto está en fase **pre-MVP / validación controlada**. Su función actual debe entenderse como preparación, revisión y generación de XML revisable, no como garantía legal ni automatización oficial.

---

## 7. Para quién es

# Para alojamientos que necesitan orden sin adoptar una plataforma compleja

Anclora SyncXML puede encajar con:

* pequeños alojamientos;
* viviendas turísticas;
* gestores con pocos inmuebles;
* propietarios que trabajan con Excel/XLSX;
* equipos que quieren revisar datos antes de generar XML;
* negocios que buscan una herramienta ligera, específica y progresiva;
* usuarios que aceptan trabajar inicialmente en modo piloto o validación controlada.

Especialmente útil cuando ya existe un flujo con Excel y se necesita una capa de revisión antes de preparar el XML.

---

## 8. Para quién no es

# No está diseñado para todos los casos

Anclora SyncXML no es la opción adecuada para:

* cadenas hoteleras complejas;
* operadores que necesitan PMS integral;
* empresas que requieren channel manager, facturación, reservas, CRM o multipropiedad avanzada desde el primer día;
* clientes que exigen automatización SES completa desde el inicio;
* negocios que no pueden trabajar en modo piloto, con datos sintéticos o con muestras anonimizadas;
* organizaciones que buscan una solución jurídica cerrada o asesoramiento legal incluido.

---

## 9. Estado actual y evolución prevista

# Disponible ahora en validación controlada

## Documentado como disponible en validación controlada

* Importación controlada de XLSX.
* Validaciones operativas documentadas sobre datos de reserva, establecimiento, huéspedes y pago.
* Vista previa con datos sensibles enmascarados.
* Detección y resolución manual de duplicados.
* Generación y descarga de XML revisable.
* Modo privado sin almacenamiento permanente por defecto.
* Auditoría operacional sin PII.
* UI en español, inglés y alemán.
* Tema dark/light. 

## Pendiente antes de claims comerciales fuertes

* Validación XSD estándar.
* Evidencia de aceptación en preproducción SES.
* Revisión legal de textos.
* DPA.
* Política formal de retención y borrado.
* QA E2E.
* Procedimiento de rotación de claves.
* Cierre de riesgos de seguridad antes de datos reales.

Estos puntos aparecen en los documentos internos como bloqueos o prioridades antes de vender o usar datos reales.  

## Evolución futura

* Mapeador visual de columnas para distintos formatos Excel/CSV.
* Pre-check-in, solo cuando existan base legal y gobernanza suficientes.
* Mayor trazabilidad operativa.
* Asistencia relacionada con SES.HOSPEDAJES, sin prometer integración oficial automática.
* RGPD reforzado.
* Multipropiedad, roles, API y B2B en fases posteriores.

---

## 10. Bloque de confianza

# Prudencia operativa desde el diseño

## Minimización

El modelo de privacidad documenta tratamiento temporal de datos durante la operación y sin conservación permanente por defecto. La retención persistente queda pendiente de política formal previa a producción. 

## Enmascarado

Los datos sensibles se muestran enmascarados por defecto para reducir exposición durante la revisión.

## Revisión humana

La herramienta está pensada para que el usuario revise datos, incidencias y XML antes de cualquier uso oficial.

## Auditoría técnica sin PII

Se priorizan eventos técnicos y trazabilidad operativa sin registrar datos personales identificables.

## Datos sintéticos o anonimizados en piloto

Para pilotos y demos, se recomienda trabajar con datos sintéticos, anonimizados o muestras controladas, no con datos reales de huéspedes hasta cerrar las condiciones necesarias.

## Límites legales claros

Anclora SyncXML no presta asesoramiento legal. El usuario debe contar con autorización para tratar los datos y revisar cualquier XML antes de usarlo oficialmente.

---

## 11. CTA final

# ¿Tu alojamiento trabaja con Excel y necesitas revisar mejor los datos de huéspedes?

Podemos analizar tu flujo actual y comprobar si Anclora SyncXML encaja como herramienta ligera de revisión y preparación.

**CTA principal:**
**Solicitar piloto controlado**

**CTA secundario:**
**Preparar una demo con datos sintéticos**

**CTA alternativo:**
**Revisar una muestra anonimizada de mi Excel**

Antes de cualquier uso con datos reales, se revisarán alcance, privacidad, responsabilidades, validación técnica y condiciones legales aplicables.

---

## 12. Disclaimer final

Anclora SyncXML está en fase **pre-MVP / validación controlada**. Ayuda a revisar datos operativos y preparar XML revisable, pero no constituye asesoramiento legal, no garantiza cumplimiento normativo, no acredita por sí sola aceptación por SES.HOSPEDAJES y no debe presentarse como integración oficial ni envío automático al Ministerio del Interior.

El uso con datos reales requiere cerrar previamente seguridad, privacidad, RGPD, retención, validación técnica, pruebas, responsabilidad y aprobaciones correspondientes.

---

# 5. Resumen de mejora frente a la versión anterior

| Cambio aplicado                                                | Por qué mejora la seguridad del mensaje                     |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| “Analizar mi Excel actual” → “muestra anonimizada de mi Excel” | Evita inducir a compartir datos reales.                     |
| “validar” → “detectar errores y revisar” en zonas comerciales  | Reduce riesgo de parecer validación legal/XSD/SES completa. |
| “XML orientado a SES” acompañado de disclaimers                | Evita sugerir compatibilidad oficial demostrada.            |
| Añadido “no acredita aceptación por SES”                       | Cierra riesgo de claim técnico excesivo.                    |
| Añadido “no funciona como sistema de registro legal”           | Refuerza alcance real del producto.                         |
| Separación “actual / pendiente / futuro”                       | Evita mezclar roadmap con funcionalidades disponibles.      |
| CTA de piloto con datos sintéticos o anonimizados              | Alinea la landing con los bloqueos de datos reales.         |
| Disclaimer más fuerte en hero y cierre                         | Reduce ambigüedad legal y comercial.                        |
