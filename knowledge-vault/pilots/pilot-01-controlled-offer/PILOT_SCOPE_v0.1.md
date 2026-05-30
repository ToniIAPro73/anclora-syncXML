# PILOT_SCOPE_v0.1 — Alcance del piloto controlado

## Estado
Borrador inicial / v0.1

## Propósito
Este documento define los límites operativos, técnicos y comerciales del primer piloto controlado de Anclora SyncXML. Su objetivo es asegurar que tanto el equipo de desarrollo como el cliente comprendan que se trata de una validación de flujo y no de un producto en producción.

## Objetivo del piloto
Validar de forma aislada y controlada la viabilidad del flujo de trabajo:
**Excel/XLSX del cliente → Importación y normalización → Detección de errores operativos → Generación de XML revisable de prueba.**

## Cliente objetivo
Pequeños alojamientos, Viviendas de Uso Turístico (VFT) y gestores independientes con un volumen reducido de inmuebles que:
- Utilicen hojas de cálculo (Excel/XLSX) como fuente primaria de datos de huéspedes.
- Deseen mejorar su proceso de revisión de datos antes del envío oficial.
- Acepten explícitamente trabajar con **datos sintéticos, anonimizados o muestras controladas** durante esta fase.

## Alcance incluido
- Auditoría técnica de una muestra Excel/XLSX (sintética o anonimizada) proporcionada por el cliente.
- Diagnóstico de compatibilidad de formatos y detección de "puntos ciegos" en los datos de origen.
- Importación controlada en el entorno pre-MVP.
- Revisión operativa guiada: validación de documentos (DNI/NIE/PAS), fechas y campos obligatorios según lógica interna.
- Detección visual de errores, duplicados y placeholders de plantilla.
- Generación de un archivo XML revisable de prueba, orientado a la estructura de SES.HOSPEDAJES.
- Informe final de diagnóstico con incidencias encontradas y recomendaciones de limpieza de datos.
- Sesión de cierre para evaluar el encaje del producto en el flujo real del cliente.

## Alcance excluido
- **Tratamiento de datos personales (PII) reales por defecto.**
- Asesoramiento legal, fiscal o normativo de cualquier tipo.
- Garantía de cumplimiento ante el Ministerio del Interior o autoridades competentes.
- Integración oficial o conexión directa con la plataforma SES.HOSPEDAJES.
- Envío automático de datos a sistemas gubernamentales.
- Verificación de la aceptación oficial del XML generado (sujeto a validación externa del cliente).
- Uso del software en entorno de producción o para comunicaciones oficiales.
- Funcionalidades de PMS (gestión de reservas, pagos reales, calendarios).
- Almacenamiento permanente de datos personales.

## Condiciones de entrada
Para iniciar el piloto, el cliente debe:
1. Aportar una muestra representativa de su Excel en formato .xlsx, garantizando que ha sido **sintetizada o anonimizada** (sin nombres, documentos o contactos reales).
2. Describir su flujo actual de recogida de datos (manual, motor de reservas, etc.).
3. Confirmar que no enviará PII real hasta que se cierren las fases de seguridad y DPA.
4. Disponibilidad para una sesión de 45-60 minutos de revisión de resultados.

## Entregables
- Informe de diagnóstico de compatibilidad del Excel de origen.
- Resumen de errores operativos y campos pendientes detectados en la muestra.
- Archivo XML de prueba generado a partir de la muestra.
- Matriz de bloqueos técnicos identificados para el caso de uso específico.
- Recomendación técnica Go/No-Go para futuras fases.

## Criterios de éxito
- El cliente comprende y valida el flujo de importación y revisión.
- El sistema identifica correctamente al menos el 80% de las incidencias provocadas en la muestra sintética.
- Se genera un XML que respeta la estructura técnica orientada a SES.
- El cliente manifiesta que el ahorro de tiempo en revisión es perceptible.
- No se produce ninguna fuga ni tratamiento de PII real durante el proceso.

## Criterios de no-go (Bloqueo del piloto)
- El cliente se niega a usar datos sintéticos/anonimizados.
- El cliente exige integración automática inmediata con el Ministerio.
- El cliente busca una garantía legal o descarga de responsabilidad.
- El formato de origen es incompatible con una estructura tabular mínima.
- No existe aceptación firmada de los disclaimers de privacidad y límites del piloto.

## Duración estimada
Entre 2 y 4 semanas, dependiendo de la calidad de la muestra y la disponibilidad de las sesiones de revisión.

## Resultado esperado
Determinación clara de si Anclora SyncXML resuelve las necesidades operativas del cliente y definición de la hoja de ruta técnica necesaria antes de un MVP comercial.

## Disclaimer
**IMPORTANTE:** Anclora SyncXML es una herramienta de preparación y revisión técnica en fase pre-MVP. El resultado del piloto es un XML de prueba revisable. La responsabilidad final sobre la veracidad de los datos, el cumplimiento normativo y la comunicación oficial recae exclusivamente sobre el usuario. Este piloto no sustituye el asesoramiento legal ni el uso de las plataformas oficiales del Estado.
