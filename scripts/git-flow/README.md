# Git Flow Scripts — Anclora SyncXML

Conjunto de scripts para automatizar el flujo de ramas entre `development`, `staging` y `production`.

---

## Requisitos

- Bash (Git Bash en Windows, WSL, o bash nativo en macOS/Linux)
- Git 2.10+
- Node.js 16+ (para ejecutar checks)
- npm/pnpm (gestor de paquetes configurado en proyecto)

---

## Scripts disponibles

### `status-release-flow.sh`
**Uso:**
```bash
bash scripts/git-flow/status-release-flow.sh
```

**Qué hace:**
- Muestra rama actual y estado working tree
- Últimos 5 commits de cada rama permanente
- Commits en `development` no en `staging`
- Commits en `staging` no en `production`
- Tags recientes

**Salida:**
```
=== GIT FLOW STATUS ===
Current branch: development
Working tree: CLEAN ✓

=== BRANCH STATUS ===
development commits:
  abc1234 feat: add new feature
  def5678 docs: update README

staging commits:
  ...

=== COMMITS AHEAD ===
development ahead of staging by 2 commits
staging ahead of production by 0 commits

=== RECENT TAGS ===
v0.1.0 v0.0.5
```

---

### `start-agent-branch.sh`
**Uso:**
```bash
bash scripts/git-flow/start-agent-branch.sh <agente> <descripción>
```

**Ejemplo:**
```bash
bash scripts/git-flow/start-agent-branch.sh codex mejora-landing
```

**Qué hace:**
1. Valida que working tree esté limpio
2. Hace `git fetch origin`
3. Cambia a `development`
4. Actualiza con `git pull --ff-only origin development`
5. Crea rama `feat/codex-mejora-landing`
6. Muestra instrucciones de siguiente paso

**Instrucciones de salida:**
```
✓ Branch created: feat/codex-mejora-landing

Next steps:
  git add .
  git commit -m "feat(scope): description"
  git push -u origin feat/codex-mejora-landing
```

---

### `merge-agent-branch-to-development.sh`
**Uso:**
```bash
bash scripts/git-flow/merge-agent-branch-to-development.sh <rama>
```

**Ejemplo:**
```bash
bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-mejora-landing
```

**Qué hace:**
1. Valida working tree limpio
2. `git fetch origin --prune`
3. Cambia a `development`
4. `git pull --ff-only origin development`
5. Verifica que exista `origin/<rama>`
6. `git merge --no-ff origin/<rama>`
7. Ejecuta checks: lint, typecheck, test, build
8. Si pasan, pushea a `origin/development`
9. Si fallan, deja estado actual para corrección

**Salida OK:**
```
✓ Merged feat/codex-mejora-landing into development
✓ All checks passed
✓ Pushed to origin/development
```

**Salida ERROR:**
```
✗ Merge conflict detected in src/components/Landing.tsx
  Resolve manually, then:
  git add .
  git commit -m "chore: merge feat/codex-mejora-landing"
  git push origin development
```

---

### `promote-development-to-staging.sh`
**Uso:**
```bash
bash scripts/git-flow/promote-development-to-staging.sh
```

**Qué hace:**
1. Valida working tree limpio
2. `git fetch origin --prune`
3. `git checkout staging`
4. `git pull --ff-only origin staging`
5. `git merge --no-ff development`
6. Ejecuta checks
7. Si pasan, pushea a `origin/staging`
8. Crea tag informativo si versión presente en env

---

### `promote-staging-to-production.sh`
**Uso:**
```bash
CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh [version]
```

**Ejemplo:**
```bash
CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0
```

**Qué hace:**
1. **Requiere** variable `CONFIRM_PRODUCTION_PROMOTION=yes` (evita accidentes)
2. Valida working tree limpio
3. `git fetch origin --prune`
4. `git checkout production`
5. `git pull --ff-only origin production`
6. `git merge --no-ff staging`
7. Ejecuta checks
8. Si versión proporcionada, crea tag anotado
9. Pushea `production` y tags
10. Muestra instrucciones para Vercel

**Safety:** Sin `CONFIRM_PRODUCTION_PROMOTION=yes`, falla inmediatamente.

---

## Uso desde Windows / PowerShell

### Opción 1: Git Bash (recomendado)
```powershell
# En PowerShell
$env:Path += ";C:\Program Files\Git\bin"
bash scripts/git-flow/status-release-flow.sh
```

### Opción 2: WSL (Windows Subsystem for Linux)
```powershell
wsl bash scripts/git-flow/status-release-flow.sh
```

### Opción 3: Direct bash si Git Bash está en PATH
```bash
bash scripts/git-flow/status-release-flow.sh
```

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `bash: command not found` | Bash no en PATH | Instalar Git Bash o WSL |
| `working tree dirty` | Cambios sin commitear | `git add .` y `git commit` |
| `--ff-only` falla | Historia divergida | `git log --oneline --graph --all` para revisar |
| Merge conflict | Cambios conflictivos | Resolver, `git add .`, `git commit` |
| `CONFIRM_PRODUCTION_PROMOTION` no set | Olvido safety var | `CONFIRM_PRODUCTION_PROMOTION=yes bash ...` |

---

## Flujo típico de Toni

### Mañana: Empezar sesión
```bash
bash scripts/git-flow/status-release-flow.sh
git checkout development
git pull --ff-only origin development
```

### Revisar rama de agente
```bash
git log <rama> --oneline -n 5
```

### Integrar si válida
```bash
bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-mejora-landing
```

### Promocionar a staging después de validación
```bash
bash scripts/git-flow/promote-development-to-staging.sh
```

### Promocionar a production después de validación
```bash
CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0
```

---

## Notas de seguridad

✓ Los scripts usan `--ff-only` para evitar divergencias  
✓ Los scripts usan `--no-ff` para preservar historial  
✓ Los scripts ejecutan checks antes de push  
✓ Los scripts requieren confirmación explícita para production  
✓ Los scripts No usan `--force` nunca  

---

## Debugging

Si algo falla, los scripts dejan el estado actual para corrección manual.

Ejemplo:

```bash
# Merge falla
git merge --no-ff origin/feat/codex-mejora-landing
# ← conflicto

# Toni resuelve manual
vim src/components/Landing.tsx
git add .
git commit -m "chore: resolve merge conflict"
git push origin development
```

---

## Próximas mejoras

- [ ] Versión PowerShell para Windows native
- [ ] Configuración de hooks automáticos
- [ ] Rollback script si deployment falla
- [ ] Integración con GitHub CLI para PRs

---

*Git Flow Scripts v1.0 — Anclora SyncXML*
