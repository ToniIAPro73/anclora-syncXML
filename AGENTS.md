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
