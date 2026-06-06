# Memoria del proyecto — Anclora

Estructura de documentación operativa para agentes IA.

## Orden de lectura

1. `.anclora/global/GLOBAL_AGENT_WORKFLOW.md`
2. `.anclora/global/GLOBAL_GIT_WORKFLOW.md`
3. `.anclora/global/GLOBAL_SECURITY_RULES.md`
4. `.anclora/AGENT_PROJECT_CONTEXT.md`
5. `.anclora/GIT_WORKFLOW.md`
6. `.anclora/SECURITY_RULES.md`
7. `AGENTS.md`
8. `MEMORY.md`

## Archivos

- `GLOBAL_*`: Políticas globales (vinculadas o copiadas)
- `AGENT_PROJECT_CONTEXT.md`: Contexto específico del proyecto
- `GIT_WORKFLOW.md`: Flujo Git del proyecto
- `SECURITY_RULES.md`: Reglas de seguridad del proyecto
- `VERCEL_WORKFLOW.md`: Configuración Vercel del proyecto
- `PROJECT_STATUS.md`: Estado y configuración actual

## Symlink

Si `.anclora/global` no existe, la memoria global está copiada en esta carpeta.

Si `.anclora/global` existe, es un symlink a `../../.anclora-agents`.
