Como arquitecto técnico senior y auditor del proyecto, he diseñado este plan de ejecución de 30 días basándome estrictamente en el estado documentado de las Fases 1 a 6. El objetivo es transformar la base actual (un entorno pre-MVP con `fail-closed` y validación robusta pero ciego respecto a la integración real) en un producto comercializable, jurídicamente sólido y técnicamente irrefutable.

A continuación, presento el plan de acción estructurado, priorizando la resolución de vulnerabilidades, el marco legal (DPA/RGPD) y la obtención del acuse de recibo de SES.HOSPEDAJES en pre-producción.

---

### Semana 1: Hardening de Producción y Arranque Legal
**Fases impactadas:** Fase 2 (Hardening) y Fase 6 (Gobernanza).

*   **Objetivo:** Eliminar el riesgo de vulnerabilidades de terceros, asegurar criptográficamente la persistencia y delegar el bloqueo legal a la asesoría externa para ganar tiempo.
*   **Tareas concretas:**
    1.  Ejecutar `npm audit fix` para resolver las 6 vulnerabilidades transitivas (5 de severidad alta) detectadas en la instalación de dependencias.
    2.  Implementar la rutina técnica de borrado cronológico en base de datos para garantizar la política de "solo metadatos operativos", purgando datos PII fuera del ciclo de vida aprobado.
    3.  Documentar formalmente el procedimiento de rotación de claves criptográficas (`SYNCXML_ENCRYPTION_KEY`).
    4.  Extraer los 694 literales marcados como sensibles (Aviso de Privacidad, Términos, Consentimientos) y enviarlos a la asesoría jurídica junto con el requerimiento de redacción del DPA.
*   **Entregables:** Repositorio libre de vulnerabilidades críticas. Procedimiento de rotación de claves (KMS). Borrador legal en manos de abogados.
*   **Criterios de aceptación:** `npm audit` devuelve 0 vulnerabilidades altas. El cron de limpieza se ejecuta correctamente.
*   **Riesgos:** Demora en la respuesta de los asesores legales (mitigado al iniciar esto el Día 1).
*   **Dependencias:** Aprobación del cliente (Controlador) sobre qué constituye exactamente el "metadato operativo".
*   **Qué NO debe hacerse todavía:** Cargar datos reales de huéspedes en el entorno de desarrollo o producción.

---

### Semana 2: Conformidad Técnica SES y Validación XML
**Fases impactadas:** Fase 1 (Cierre) y Fase 3 (Integración).

*   **Objetivo:** Abandonar la simulación (`dry-run`) y demostrar que el XML estructurado y el envoltorio SOAP generados por el sistema son aceptados nativamente por el portal del Ministerio.
*   **Tareas concretas:**
    1.  Integrar un motor XSD estándar (ej. `libxml` o similar) para validar el XML generado contra el esquema `altaParteHospedaje.xsd` v3.1.3 antes de cualquier envío.
    2.  Inyectar en el entorno local (`.env`) las credenciales de prueba de SES recibidas el 25/05/2026.
    3.  Desactivar el modo *dry-run* y forzar un envío SOAP (operación `A`, comunicación `PV`) al *endpoint* de pre-producción (`https://hospedajes.pre-ses.mir.es/...`).
    4.  Procesar la respuesta SOAP (`comunicacionResponse`) y capturar el código `0` de aceptación o archivar los errores devueltos por el Ministerio.
*   **Entregables:** Validador XSD local 100% estricto. Log o archivo físico del XML enviado y su correspondiente acuse de recibo de aceptación por parte de SES.
*   **Criterios de aceptación:** Un lote de prueba (*dry-run* = false) obtiene un `codigoComunicacion` válido en pre-producción.
*   **Riesgos:** La conexión con el Ministerio podría requerir configuraciones de TLS inesperadas (aunque el flag `SYNCXML_SES_ALLOW_INSECURE_TLS` existe para mitigarlo en pre-prod).
*   **Dependencias:** Credenciales de test operativas.
*   **Qué NO debe hacerse todavía:** Habilitar el flag `SYNCXML_SES_ALLOW_PRODUCTION_SEND=true`.

---

### Semana 3: Flexibilidad Comercial (Orígenes) y QA E2E
**Fases impactadas:** Fase 3 (Mapeo) y Fase 4 (QA/UX).

*   **Objetivo:** Asegurar la compatibilidad del producto con flujos de datos ajenos a Lodgify o a la plantilla estática actual de Villa Kentia y sellar la calidad visual.
*   **Tareas concretas:**
    1.  Desarrollar un mapeador visual de columnas (UI) que permita adaptar formatos CSV o Excel no estándar al modelo interno de SyncXML.
    2.  Probar el flujo con la batería completa de datos sintéticos (los 9 archivos en `test-data/` que incluyen casos límite españoles, europeos y no-UE).
    3.  Reintegrar el framework Playwright y desarrollar pruebas *End-to-End* en navegador para blindar la UI, el modo oscuro/claro y el *responsive* (omitido en el cierre de la Fase 4).
*   **Entregables:** Módulo de asignación dinámica de cabeceras. Suite Playwright automatizada en el pipeline (CI/CD).
*   **Criterios de aceptación:** La importación funciona en formatos variables indicando qué columna equivale a qué campo. Los tests E2E visuales pasan sin errores.
*   **Riesgos:** Complejidad no anticipada en la interfaz del mapeador.
*   **Dependencias:** Las validaciones de backend y motor XSD de la Semana 2 deben estar estables para no generar falsos negativos en QA.
*   **Qué NO debe hacerse todavía:** Programar importadores API directos (B2B/Multipropiedad Fase 7).

---

### Semana 4: Cierre de Gobernanza y Venta del MVP
**Fases impactadas:** Fase 5 (Pre-check-in) y Fase 6 (Cierre legal).

*   **Objetivo:** Levantar los bloqueos normativos para poder utilizar el sistema en un entorno productivo y habilitar sus funciones de recolección de datos orientadas al huésped.
*   **Tareas concretas:**
    1.  Recepción de los textos legales revisados (Aviso de Privacidad, Condiciones). Despliegue en la aplicación.
    2.  Firma del DPA (Acuerdo de Encargado del Tratamiento) entre la Propiedad/Controlador y Anclora.
    3.  Clarificación de los abogados sobre la obligatoriedad de capturar firmas digitales bajo la nueva normativa.
    4.  Una vez aprobado el aviso de privacidad, retirar el bloqueo del entorno de pruebas del Pre-check-in (`/precheckin/[token]`) y pasarlo a producción.
    5.  Activación definitiva del flag `SYNCXML_SES_ALLOW_PRODUCTION_SEND=true` bajo confirmación explícita del operador humano.
*   **Entregables:** Producto Anclora SyncXML en Producción. Textos legales firmados y validados. URL del *Pre-check-in* funcional y amparada por la base legal correcta.
*   **Criterios de aceptación:** El producto cuenta con un DPA firmado, su retención está limitada legalmente a los metadatos, la política `no-document-image` se mantiene y se puede generar o enviar a producción SES el primer archivo XML validado.
*   **Riesgos:** Que los servicios jurídicos tarden más de 3 semanas o que exijan cambios drásticos en el flujo de recogida del consentimiento.
*   **Dependencias:** Todos los entregables legales de la Semana 1. Aceptación técnica en la Semana 2.
*   **Qué NO debe hacerse todavía:** Vender el sistema bajo premisas de "automatización sin supervisión humana" (el alcance requiere revisión humana antes del envío) ni vender arquitecturas multipropiedad (Fase 7).