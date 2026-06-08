# SyncXML Boveda Requirements Map

## Objetivo

Mapear requisitos relevantes de la Boveda Anclora contra el estado actual de SyncXML para dejar evidencia de alcance, prioridad, estado y módulos afectados.

| Bloque | Requisito | Fuente Boveda | Impacto en SyncXML | Prioridad | Estado | Evidencia esperada | Modulo o archivo afectado |
|---|---|---|---|---|---|---|---|
| Identidad y alcance | Mantener SyncXML como piloto controlado y baseline interna prudente | `ANCLORA_AI_ACT_COMPLIANCE_BASELINE.md` | Afecta copy pública, README y docs de acceso | P0 | completado | Claims prudentes y límites visibles | `README.md`, `src/lib/i18n/landing.tsx`, `docs/PILOT_CONTROLLED_ACCESS_FLOW.md` |
| Features IA | Documentar features IA reales y previstas por separado | `AI_FEATURE_REGISTER_TEMPLATE.md`, `SYNCXML_AI_FEATURE_REGISTER.md` | Evita mezclar automatización clásica con IA | P0 | completado | Register con estado, riesgo y revisión humana | `docs/compliance/AI_FEATURE_REGISTER_SYNCXML.md` |
| AI System Card | Mantener card de sistema con límites y dependencias | `AI_SYSTEM_CARD_TEMPLATE.md`, `SYNCXML_AI_SYSTEM_CARD.md` | Base de trazabilidad interna | P0 | completado | Card con entradas, salidas, riesgos y disclaimers | `docs/compliance/AI_SYSTEM_CARD_SYNCXML.md` |
| Datos tratados | Minimizar PII y separar datos reales de pruebas | `ANCLORA_AI_ACT_COMPLIANCE_BASELINE.md` | Afecta importación, precheck-in, logs y persistencia | P0 | completado | Documento de baseline de privacidad y seguridad | `docs/compliance/SYNCXML_DATA_PRIVACY_AND_SECURITY_BASELINE.md`, `src/lib/audit.ts`, `src/lib/precheckin.ts` |
| Riesgos y mitigaciones | No afirmar cumplimiento legal ni automatización oficial | `ANCLORA_AI_TRANSPARENCY_AND_DISCLOSURE_RULES.md` | Copy, emails, XML export y panel SES | P0 | completado | Audit de copy y docs de SES | `docs/reports/SYNCXML_COPY_COMPLIANCE_AUDIT.md`, `docs/ses/SYNCXML_SES_PREPRODUCTION_EVIDENCE.md` |
| Supervisión humana | Confirmación humana antes de usar XML o enviar a SES | `ANCLORA_AI_HUMAN_OVERSIGHT_POLICY.md` | Impacta UI, flujos internos y documentación de piloto | P0 | completado | Puntos de control humano y bloqueo producción | `docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md`, `docs/SES_ACCESS_CONTROL.md` |
| Logs y trazabilidad | Trazabilidad mínima sin PII innecesaria | `ANCLORA_AI_HUMAN_OVERSIGHT_POLICY.md` | Afecta APIs internas y recuperación de acceso | P0 | en progreso | Logs pseudonimizados o sin identificador directo | `src/app/api/auth/recover/route.ts`, `src/app/api/internal/admin-access/route.ts` |
| Proveedores externos | Registrar Nexus, Hermes, Resend, Prisma, SES y MinerU | `ANCLORA_AI_ACT_COMPLIANCE_BASELINE.md` | Dependencias y reparto de responsabilidades | P1 | completado | Dependencias y límites listados | `docs/compliance/AI_SYSTEM_CARD_SYNCXML.md`, `docs/compliance/AI_FEATURE_REGISTER_SYNCXML.md` |
| Seguridad y privacidad | No persistir por defecto, controlar secretos y errores | `ANCLORA_AI_ACT_COMPLIANCE_BASELINE.md` | Afecta env vars, persistencia, email y storage | P0 | completado | Baseline con riesgos y recomendaciones | `docs/compliance/SYNCXML_DATA_PRIVACY_AND_SECURITY_BASELINE.md` |
| SES.HOSPEDAJES | Separar claramente test/preprod de producción | `ANCLORA_AI_TRANSPARENCY_AND_DISCLOSURE_RULES.md` | Claims, operaciones críticas y checklist | P0 | completado | Documento de evidencia y no-claims | `docs/ses/SYNCXML_SES_PREPRODUCTION_EVIDENCE.md` |
| Piloto controlado | Acceso solo por revisión manual; sin autoaprobación | `ANCLORA_AI_HUMAN_OVERSIGHT_POLICY.md` | Afecta solicitud, provisionado y login | P0 | completado | Flujo con estados y responsables | `docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md`, `src/app/api/pilot/request/route.ts` |
| Documentación al usuario | Mensajes prudentes y premium, sin promesas excesivas | `ANCLORA_AI_TRANSPARENCY_AND_DISCLOSURE_RULES.md` | Landing, login, emails y docs públicas | P1 | completado | Audit de copy y hallazgos | `docs/reports/SYNCXML_COPY_COMPLIANCE_AUDIT.md`, `src/lib/i18n/landing.tsx` |
| Parsers documentales | No forzar MinerU si no aporta valor real al core | `SYNCXML_AI_FEATURE_REGISTER.md` | Afecta roadmap técnico y flags | P1 | completado | Estrategia incremental y no core | `docs/architecture/SYNCXML_DOCUMENT_PARSING_STRATEGY.md`, `docs/AI_DOCUMENT_INGESTION_WITH_MINERU.md` |

## Conflictos o tensiones detectadas

- La Boveda contempla features IA previstas en SyncXML, pero el repo actual opera sobre todo con validación determinista y automatización defensiva.
- El login público existe como superficie de acceso para usuarios aprobados, pero la estrategia del producto sigue siendo piloto controlado, no apertura general.
- El schema de `PilotUser` modela estados de acceso (`active`, `revoked`, `expired`) y no el pipeline completo de solicitud; la revisión previa vive fuera de SyncXML, principalmente en Nexus.

## Decisión operativa

Cuando haya tensión entre documentación aspiracional y estado real del producto, SyncXML debe priorizar:

1. privacidad;
2. seguridad;
3. trazabilidad;
4. supervisión humana;
5. prudencia en claims.
