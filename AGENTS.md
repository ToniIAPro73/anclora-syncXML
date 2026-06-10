<!-- MEMANTO-MANAGED-SECTION -->
## Uso de Memanto

Agente por defecto en este repo: `anclora-syncxml`.

Usa Memanto como memoria operativa persistente. Sirve para recordar decisiones tecnicas, errores resueltos, contexto estable, preferencias del usuario y pendientes reales.

No sustituye documentacion canonica, Git, issues ni contratos de la boveda.

### Reglas

- Lee `MEMORY.md` antes de empezar.
- Si hay dudas sobre contexto previo, ejecuta `memanto recall` o `memanto answer` antes de asumir.
- Guarda solo informacion que ahorre tiempo o evite repetir errores.
- Todos los comandos `memanto` son comandos de shell. Ejecutalos en terminal.
- Nunca guardes secretos, tokens, contrasenas, credenciales completas ni datos personales sensibles.

### Inicio de tarea

```bash
memanto agent activate anclora-syncxml
memanto recall "contexto actual de este proyecto" --limit 10
memanto answer "Que decisiones previas debo respetar aqui?"
```

### Durante la tarea

Guardar decision:

```bash
memanto remember "Decision: <que se decidio> porque <razon>. Afecta a <repo/modulo>." \
  --type decision \
  --confidence 0.95 \
  --provenance explicit_statement \
  --source codex-dev
```

Guardar error resuelto:

```bash
memanto remember "Error resuelto: <sintoma>. Causa: <causa>. Solucion: <solucion>. Verificado con <test/comando>." \
  --type error \
  --confidence 0.95 \
  --provenance observed \
  --source codex-dev
```

Guardar preferencia:

```bash
memanto remember "Preferencia: <preferencia concreta del usuario>." \
  --type preference \
  --confidence 1.0 \
  --provenance explicit_statement \
  --source codex-dev
```

Guardar pendiente:

```bash
memanto remember "Pendiente: <tarea>. Bloqueo: <bloqueo>. Siguiente paso: <accion>." \
  --type commitment \
  --confidence 0.9 \
  --provenance explicit_statement \
  --source codex-dev
```

### Cierre

```bash
memanto remember "Cierre: se completo <tarea>. Rama: <rama>. Commit: <sha>. Pendiente: <si/no>." \
  --type event \
  --confidence 0.95 \
  --provenance observed \
  --source codex-dev

memanto memory sync --project-dir .
```
<!-- /MEMANTO-MANAGED-SECTION -->

---

## Flujo Git obligatorio

**Antes de modificar código, todo agente debe leer:**

- [`docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md`](docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md) — Contrato obligatorio
- [`docs/devops/BRANCHING_MODEL.md`](docs/devops/BRANCHING_MODEL.md) — Modelo detallado
- [`docs/devops/TONI_GIT_WORKFLOW_PLAYBOOK.md`](docs/devops/TONI_GIT_WORKFLOW_PLAYBOOK.md) — Pasos prácticos

### Regla base

Este repositorio trabaja con tres ramas permanentes:

```
development → staging → production
```

**Ningún agente IA trabaja directamente en estas ramas.**

### Flujo obligatorio

1. **Crear rama propia** desde `development`:
   ```bash
   git fetch origin --prune
   git checkout development
   git pull --ff-only origin development
   git checkout -b feat/<agente>-<descripcion>
   ```

2. **Usar prefijos permitidos**:
   - `feat/<agente>-<descripcion>` — Nuevas características
   - `fix/<agente>-<descripcion>` — Bug fixes
   - `chore/<agente>-<descripcion>` — Documentación, config
   - `hotfix/<agente>-<descripcion>` — Solo urgencias en prod (raro)

3. **Ejecutar checks antes de terminar**:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

4. **Hacer commit y push**:
   ```bash
   git add .
   git commit -m "<tipo>(<scope>): <resumen>"
   git push -u origin <rama>
   ```

5. **Reportar**:
   ```
   Rama: feat/codex-mejora-landing
   Commits: 3
   Checks: ✓ lint ✓ typecheck ✓ test ✓ build
   Resultado: ÉXITO
   Pendientes: Toni integrará en development
   ```

### Reglas NO negociables

✗ No trabajar en `development`, `staging` o `production`  
✗ No hacer merge automático a ramas permanentes  
✗ No promocionar a `staging` ni `production`  
✗ No usar `git push --force`  
✗ No tocar secretos ni variables reales de Vercel  
✗ No copiar variables de producción a otros entornos  
✗ No desplegar sin aprobación  

### Integración (Toni)

Toni integra ramas en `development` así:

```bash
git checkout development
git merge --no-ff origin/feat/<agente>-<descripcion>
npm run lint && npm run typecheck && npm run test && npm run build
git push origin development
```

Luego promociona entre permanentes según necesidad.

<!-- ANCLORA-GLOBAL-AGENT-MEMORY-START -->
## Memoria global Anclora obligatoria

Antes de modificar este repositorio, todo agente IA debe leer:

1. `.anclora/global/GLOBAL_AGENT_WORKFLOW.md`, si existe
2. `.anclora/global/GLOBAL_GIT_WORKFLOW.md`, si existe
3. `.anclora/global/GLOBAL_SECURITY_RULES.md`, si existe
4. `.anclora/AGENT_PROJECT_CONTEXT.md`
5. `.anclora/GIT_WORKFLOW.md`
6. `.anclora/SECURITY_RULES.md`
7. `MEMORY.md`

Regla base: No trabajar directamente en `development`, `staging` ni `production`.
<!-- ANCLORA-GLOBAL-AGENT-MEMORY-END -->

<!-- ANCLORA-SDD-STANDARDS-START -->
## Metodología SDD — Estándar Unificado Anclora

Todo desarrollo en este repo sigue la metodología SDD unificada del ecosistema Anclora.

**Referencia canónica**: `agency-agents/docs/guides/SDD_INTEGRATION_GUIDE.md`
**Workflow OpenSpec**: `agency-agents/docs/guides/OPENSPEC_WORKFLOW.md`

### Flujo de trabajo Git

- Rama base de desarrollo: **`development`**
- Los agentes crean ramas desde `development`: `feat/<agente>-<descripcion>`, `fix/...`, `chore/...`
- Las ramas se mergean de vuelta a `development` via PR
- Promoción manual: `development → staging → production → main`
- Nunca commitear directamente en `main`, `staging` ni `production`

### Principios de desarrollo (Specboot)

1. **Small Tasks, One at a Time** — baby steps, nunca saltarse pasos
2. **Test-Driven Development** — escribir tests fallidos antes de implementar
3. **Type Safety** — código completamente tipado (TypeScript)
4. **Clear Naming** — variables y funciones descriptivas
5. **English Only** — código, comentarios y docs técnicos en inglés
6. **90% Test Coverage** — cobertura exhaustiva en todas las capas
7. **Incremental Changes** — modificaciones focalizadas y revisables

### Ciclo de cambios (SDD en este repo)

Toda feature o fix sigue este flujo antes de escribir código:

- Crear spec: `sdd/features/<nombre>/<nombre>-spec-v1.md`
- Crear plan: `sdd/features/<nombre>/<nombre>-plan-v1.md` (cambios complejos)
- Crear tasks: `sdd/features/<nombre>/<nombre>-tasks-v1.md`
- Implementar tarea a tarea (tests primero)
- Validar contra criterios de aceptación de la spec
- PR contra `development`, con referencia a la spec

### Reglas obligatorias

- **No spec, no code**: toda feature empieza con spec en `sdd/features/`
- **Tests primero**: el agente ejecuta los tests, nunca el usuario
- **Hermes gate**: cambio que afecta copy público → Hermes Copy Curator antes del merge
- **Spec inmutable**: una spec cerrada no se edita; los cambios generan una spec nueva
<!-- ANCLORA-SDD-STANDARDS-END -->
