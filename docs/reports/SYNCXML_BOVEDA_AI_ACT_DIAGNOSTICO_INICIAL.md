# SyncXML Boveda AI Act - Diagnostico inicial

## Metadatos

- Fecha: 2026-06-08T14:07:49+02:00
- Rama base revisada: `development`
- Rama de trabajo: `feat/syncxml-boveda-ai-act-improvements`
- Commit base: `2226ef54a6fb58dd48e12cd11ad0e278c08a95eb`

## Fuentes revisadas en Boveda

- `contracts/core/ANCLORA_AI_ACT_COMPLIANCE_BASELINE.md`
- `contracts/core/ANCLORA_AI_HUMAN_OVERSIGHT_POLICY.md`
- `contracts/core/ANCLORA_AI_TRANSPARENCY_AND_DISCLOSURE_RULES.md`
- `contracts/templates/ai-compliance/AI_SYSTEM_CARD_TEMPLATE.md`
- `contracts/templates/ai-compliance/AI_FEATURE_REGISTER_TEMPLATE.md`
- `knowledge-vault/compliance/ai-act/product-system-cards/SYNCXML_AI_SYSTEM_CARD.md`
- `knowledge-vault/compliance/ai-act/product-system-cards/SYNCXML_AI_FEATURE_REGISTER.md`

## Fuentes revisadas en SyncXML

- `AGENTS.md`, `MEMORY.md`, `README.md`
- `docs/PILOT_CONTROLLED_ACCESS_FLOW.md`
- `docs/PRIVACY_MODEL.md`
- `docs/AI_DOCUMENT_INGESTION_WITH_MINERU.md`
- `docs/SES_ACCESS_CONTROL.md`
- `docs/syncxml-pilot-flow.md`
- `docs/audit/*`
- `src/app/api/pilot/request/route.ts`
- `src/app/api/auth/recover/route.ts`
- `src/app/api/internal/admin-access/route.ts`
- `src/lib/security/adminAccess.ts`
- `src/lib/audit.ts`
- `src/lib/i18n/landing.tsx`
- `prisma/schema.prisma`

## Estado observado

SyncXML ya parte de una base madura para piloto controlado:

- copy prudente en landing y README;
- protecciones para SES y entornos;
- flujo público de solicitud de piloto;
- login reservado a usuarios aprobados;
- trazabilidad técnica sin PII en el módulo de auditoría;
- estrategia de privacidad por defecto y persistencia opt-in.

## Gaps detectados

1. Falta una capa documental unificada alineada con la Boveda para SyncXML en el propio repo.
2. La AI System Card y el AI Feature Register canónicos existen en Boveda, pero no están consolidados en `docs/compliance/` dentro de SyncXML.
3. La narrativa de piloto, privacidad, SES y parsing documental está repartida entre varios documentos y reportes históricos.
4. Hay un hueco de trazabilidad de revisión: el repo no tenía un requirements map explícito contra la Boveda.
5. Persistían logs operativos con identificadores directos evitables en recuperación de credenciales y acceso interno de admin.

## Riesgos principales

- Confusión entre validación controlada y disponibilidad abierta.
- Claims excesivos sobre SES o AI Act si se reutiliza copy fuera del contexto actual.
- Tratamiento accidental de PII en logs o workflows auxiliares.
- Mezcla de features no IA con features IA previstas, sin registro único de mitigaciones y supervisión humana.
- Integración futura de parsers/OCR sin separar claramente MVP documental y flujo core de huéspedes.

## Mejoras propuestas

1. Crear un mapa de requisitos de Boveda -> SyncXML con evidencia y módulos afectados.
2. Crear `docs/compliance/AI_SYSTEM_CARD_SYNCXML.md` y `docs/compliance/AI_FEATURE_REGISTER_SYNCXML.md`.
3. Consolidar documentos operativos para piloto, privacidad, SES, parsing y copy prudente.
4. Documentar expresamente qué puede afirmarse y qué no en preproducción SES.
5. Reducir superficie de PII en logs auxiliares.

## Plan por fases

1. Diagnóstico y requirements map.
2. System card y feature register.
3. Hardening documental de piloto, privacidad, SES y parsing.
4. Ajustes de seguridad/copy de bajo riesgo en código.
5. QA final, resumen ejecutivo y checklist de revisión humana.
