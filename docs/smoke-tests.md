# Smoke Tests E2E - Anclora SyncXML Pilot Candidate

Este documento describe cómo ejecutar las pruebas E2E reales en los diferentes repositorios para validar el flujo completo.

## 1. anclora-syncXML
Para simular el envío de una solicitud de piloto desde la landing hacia el webhook de Nexus.

\`\`\`bash
cd anclora-syncXML
node scripts/smoke-pilot-request.mjs
\`\`\`
Simula 3 casos (Elegible, Dudoso con datos reales, y No apto por envío automático a SES). Verifica que Nexus responda 200 OK a las 3 solicitudes y las envíe a revisión.

## 2. anclora-nexus
Para probar la creación y revisión de tareas de SyncXML de manera directa en Supabase (Dry Run por defecto):

\`\`\`bash
cd anclora-nexus
DRY_RUN=true backend/.venv/bin/python backend/scripts/smoke_syncxml_pilot_task.py
\`\`\`
Si deseas ejecutar la prueba contra un entorno real (escribir en Supabase), incluye \`ALLOW_REAL_SUPABASE_WRITE=true\`.

## 3. anclora-content-generator-ai (Hermes Worker)
Para validar directamente el Endpoint de Hermes y comprobar las reglas de negocio, así como la conexión LLM:

\`\`\`bash
cd anclora-content-generator-ai/workers/hermes-content-worker
node scripts/smoke-syncxml-pilot-validation.mjs
\`\`\`
Devuelve un JSON con el \`score\`, \`decision\` (approve, manual_review, reject) y \`riskFlags\` para cada uno de los 3 casos (A, B y C).
