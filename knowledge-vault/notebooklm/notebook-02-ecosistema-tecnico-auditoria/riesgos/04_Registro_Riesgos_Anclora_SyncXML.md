Como arquitecto técnico senior y auditor del producto, he consolidado el **Registro de Riesgos Oficial para Anclora SyncXML**. Este registro cruza los hallazgos de las Fases 0 a 6 del repositorio, las auditorías de seguridad y el marco normativo de SES.HOSPEDAJES.

Este documento no asume la existencia de funcionalidades no demostradas en el código y clasifica el estado real de la herramienta, que actualmente opera de forma segura como capa de transformación *in-memory* (pre-MVP), pero que carece de la validación legal y externa necesaria para la comercialización o automatización en producción.

A continuación, presento el registro de riesgos segmentado en las 10 áreas críticas solicitadas.

---

### 1. Seguridad

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Vulnerabilidades en dependencias:** El árbol de `npm` tiene 6 vulnerabilidades (5 de severidad alta). | Alta | Alto | **Crítica** | `PHASE_0_REPOSITORY_BASELINE.md`, `QA_RESPONSIBILITY.md` | Ejecutar `npm audit fix` antes de cualquier despliegue productivo. | Dev / DevOps | Abierto |
| **Rate Limiting Volátil:** El límite de peticiones (`syncXmlSensitiveLimiter`) reside en memoria. En despliegues Serverless/Vercel, se reinicia con cada instancia. | Media | Medio | **Media** | `PHASE_2_HARDENING.md`, `rateLimit.ts` | Migrar a un almacén persistente tipo Redis/Vercel KV si el riesgo de abuso aumenta. | Arquitectura | Mitigado parcialmente |
| **Falta de Procedimiento de Rotación de Claves:** El cifrado AES-256-GCM existe, pero no hay un flujo operativo para rotar la `SYNCXML_ENCRYPTION_KEY` si se ve comprometida. | Baja | Crítico | **Alta** | `PHASE_6_GOVERNANCE.md`, `encryption.ts` | Documentar el ciclo de vida de los *secrets* y crear un script de re-cifrado de base de datos. | Seguridad | Pendiente de decisión |

### 2. RGPD y Privacidad

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Literales Legales sin revisar:** 694 *keys* de traducción (Aviso de Privacidad, Términos, Consentimientos) pendientes de revisión jurídica. | Alta | Crítico | **Crítica** | `copy-quality-report.md` | Enviar textos a la asesoría jurídica y firmar DPA con la propiedad. | Legal / Negocio | Bloqueado |
| **Pre-check-in sin base legal validada:** Recopilar datos de viajeros a través de enlaces externos (`/precheckin/[token]`) sin un consentimiento RGPD validado ni requerimiento de firma cerrado. | Alta | Crítico | **Crítica** | `PHASE_5_PRECHECKIN.md` | Mantener el bloqueo productivo. Confirmar con el Ministerio si la captura de firma es indispensable. | Legal | Bloqueado |
| **Límites de retención ambiguos:** Si se habilita la persistencia (`ENABLE_PERSISTENT_STORAGE=true`), no hay un `cron` documentado que ejecute el borrado más allá de la "política de metadatos" acordada. | Media | Alto | **Alta** | `PHASE_6_GOVERNANCE.md`, `PHASE_REENTRY.md` | Implementar *job* de borrado físico de PII que exceda el ciclo de vida operativo. | Dev / Legal | Pendiente de decisión |

### 3. SES.HOSPEDAJES

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Falta de evidencia de aceptación XML:** El sistema nunca ha enviado un *payload* que devuelva un código `0` en pre-producción o producción de SES. | Alta | Crítico | **Crítica** | `PHASE_3_VALIDATION.md`, `PHASE_1_VERIFICATION.md` | Usar las credenciales de test obtenidas el 25/05/2026 para forzar un envío SOAP y archivar la respuesta. | Integración SES | Abierto |
| **Respuestas a cambios de esquema (WSDL/XSD):** El Ministerio puede actualizar la v3.1.3 y romper la validación y comunicación sin previo aviso. | Media | Alto | **Alta** | `PHASE_6_GOVERNANCE.md`, `config.ts` | Documentar el procedimiento de respuesta ante cambios normativos o de esquema. | Operaciones | Abierto |

### 4. XML / XSD / WSDL

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Validación XSD simulada/local:** La validación actual del esquema SES usa reglas de la aplicación, pero no un motor estándar `libxml/xmllint` contra el archivo `altaParteHospedaje.xsd`. | Media | Medio | **Media** | `PHASE_3_VALIDATION.md` | Integrar un validador estricto XML contra el XSD oficial archivado antes de habilitar el envío productivo. | Dev | Mitigado parcialmente |
| **Zonas horarias incorrectas (Verano/Invierno):** Generar XML en invierno con offset de verano (+02:00) podría causar rechazo. | Baja | Alto | **Alta** | `PHASE_2_HARDENING.md`, `normalizers.ts` | Se mitigó calculando dinámicamente el offset `Europe/Madrid`. Requiere control en QA para otros husos. | Dev | Mitigado parcialmente |

### 5. Validación de Datos

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Falsos positivos en validación:** Datos legítimos podrían bloquearse (ej. una reserva fechada exactamente el "2026-04-09"). | Baja | Medio | **Baja** | `PHASE_2_HARDENING.md`, `validation.ts` | Se ha ajustado la regex de *placeholders*. Evaluar con test continuos sobre casos límite. | QA | Mitigado parcialmente |
| **Falta de códigos de municipio (INE):** El Excel de origen rara vez contiene el código INE de 5 dígitos requerido por SES para huéspedes españoles. | Alta | Alto | **Alta** | `manual-usuario.md`, `smart-validation.test.ts` | La corrección manual guiada y la inferencia por CP ya operan. Reforzar BD de municipios. | UX / Dev | Mitigado parcialmente |

### 6. Persistencia y Almacenamiento

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Activación accidental de DB:** Desplegar en producción con `DATABASE_URL` configurada activa la retención sin las políticas de borrado cerradas. | Baja | Crítico | **Alta** | `QA_RESPONSIBILITY.md`, `README.md` | Se implementó variable bandera `SYNCXML_ENABLE_PERSISTENT_STORAGE=false` por defecto. | DevOps | Mitigado parcialmente |
| **Blobs encriptados huérfanos:** El código incluye un módulo `@vercel/blob`, pero no está integrado al flujo. Si se activa, los archivos podrían persistir indefinidamente. | Baja | Medio | **Media** | `PHASE_2_HARDENING.md`, `blob.ts` | No enlazar la función `storeEncryptedFile` al flujo de reserva hasta que el cliente defina su política de alojamiento de adjuntos. | Arquitectura | Abierto |

### 7. UX y Errores de Usuario

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Acoplamiento al Excel de Villa Kentia:** El *parser* asume un formato específico. Clientes que exporten de Booking, Airbnb o PMS distintos no podrán usarlo. | Alta | Crítico | **Alta (Ventas)** | `PHASE_3_VALIDATION.md`, `Artefacto_2...md` | Implementar el "Mapeador Visual de Columnas" documentado en el Roadmap (Fase 3). | UX / Producto | Abierto |
| **Envío de XML no revisado a SES:** El usuario podría descargar y enviar el archivo al portal de Interior sin revisarlo humanamente. | Media | Alto | **Media** | `manual-usuario.md`, `Artefacto_2...md` | UI actual obliga a la resolución de bloqueos y a la confirmación de la pre-vista antes de permitir `Descargar XML`. | UX | Mitigado parcialmente |

### 8. QA y Tests

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Falta de cobertura E2E (Playwright):** Se extrajo la automatización del navegador de la Fase 4 para agilizar la entrega, perdiendo detección temprana de regresiones en UI. | Media | Medio | **Media** | `PHASE_4_UX_TRACEABILITY_REPORT.md` | Reintegrar `playwright` y añadir pruebas visuales para Modo Oscuro/Claro e idiomas. | QA | Abierto |
| **Falta de baterías sobre XSD final:** Las pruebas actuales pasan sobre un *stub* de reglas. No cubren el 100% de las restricciones XSD de SES. | Media | Alto | **Alta** | `PHASE_3_VALIDATION.md` | Ejecutar toda la batería de `test-data/` contra el motor XSD en cuanto se integre `libxml`. | QA | Abierto |

### 9. Producto y Monetización

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Promesa de "Automatización Oficial":** Vender SyncXML como una integración oficial B2B con SES cuando técnicamente sólo es un transformador/revisor intermedio. | Media | Crítico | **Alta** | `README.md`, `Artefacto_2...md` | El clasificador de producto de la UI (`ProductClassification.tsx`) ya indica que requiere validación manual. Ajustar marketing. | Negocio / Ventas | Mitigado parcialmente |
| **Escalado prematuro (Multipropiedad):** Desarrollar la Fase 7 (B2B, multi-tenant) antes de obtener la evidencia de aceptación de Villa Kentia y firmar los DPA. | Baja | Alto | **Alta** | `PHASE_7_SCALE_B2B_ROADMAP_REPORT.md` | Mantener la Fase 7 estrictamente bloqueada. Priorizar la estabilización y cumplimiento del caso de uso actual. | Dirección | Bloqueado |

### 10. Soporte y Operación

| Descripción | Prob. | Impacto | Severidad | Evidencia en fuentes | Mitigación recomendada | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Respuesta ante reincidencias de SES:** Sin un procedimiento de incidencias, los errores 5xx del servicio SOAP de pre/producción afectarán la operatividad del hotel. | Media | Alto | **Media** | `PHASE_7_SCALE_B2B_ROADMAP_REPORT.md` | Redactar el procedimiento operativo de contingencia ante caídas del portal del Ministerio. | Soporte / Ops | Abierto |
| **Desconocimiento del flujo de verdad (Lodgify):** Todavía no se ha aclarado operativamente si el PMS (Lodgify) se conectará vía API en el futuro o si se dependerá eternamente de la importación manual de XLSX. | Alta | Medio | **Baja** | `PHASE_1_VERIFICATION_GATE.md` | Validar este supuesto directamente con la propiedad de Villa Kentia para definir el alcance de la Fase 3. | Producto | Pendiente de decisión |

---

### Resumen Ejecutivo para la Toma de Decisiones
Los riesgos identificados como **Críticos** y **Bloqueados** que deben resolverse antes de poder procesar PII real o cobrar por el software son:
1.  **RGPD Legal (Riesgo 2.1 y 2.2):** Cierre del DPA, confirmación de retención mínima operativa y revisión de 694 traducciones.
2.  **Integración (Riesgo 3.1):** Validar contra el servicio web de prueba con las credenciales entregadas el 25/05/2026.
3.  **Seguridad (Riesgo 1.1):** Limpieza de vulnerabilidades NPM (`npm audit fix`).