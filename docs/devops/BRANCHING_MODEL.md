# Branching Model — Anclora SyncXML

**Versión:** 1.0  
**Fecha:** 2026-06-06  
**Status:** Active

---

## Visión general

```
feat/*, fix/*, chore/*, hotfix/*
        ↓
development (integración local)
        ↓
staging (preproducción)
        ↓
production (público)
```

---

## Ramas permanentes

### `production`
- **Propósito:** Código en producción público
- **Deployment:** Vercel Production automático (opcional manual)
- **Política:** Solo desde `staging` mediante merge controlado
- **Protección:** Sí (no force push, require reviews)
- **Base:** `main`

### `staging`
- **Propósito:** Preproducción / validación final
- **Deployment:** Vercel Custom Environment o Preview Staging
- **Política:** Solo desde `development` mediante merge controlado
- **Protección:** Sí (no force push)
- **Base:** Deriv de `production`

### `development`
- **Propósito:** Integración de cambios / rama principal de trabajo
- **Deployment:** Vercel Preview (automático por rama)
- **Política:** Recibe cambios de `feat/*`, `fix/*`, `chore/*`
- **Protección:** Recomendado (depende de Toni)
- **Base:** Deriv de `staging`

### `main`
- **Propósito:** Histórico de releases estables (opcional)
- **Política:** Puntos de etiquetado/tags cuando se promociona
- **Nota:** Puede ser alias de `production` o mantener separado según preferencia

---

## Ramas temporales

Patrón: `<tipo>/<creator>-<descripción>`

### Tipos permitidos

| Tipo | Origen | Destino | Uso |
|------|--------|---------|-----|
| `feat/` | `development` | `development` | Características nuevas |
| `fix/` | `development` | `development` | Bug fixes |
| `chore/` | `development` | `development` | Documentación, config, sin lógica |
| `hotfix/` | `production` | `production`, luego a `staging` y `development` | Urgencias en prod |

### Ejemplos válidos

```
feat/codex-mejora-landing
feat/claude-admin-access-flow
fix/gemini-auth-guard-typo
chore/toni-update-dependencies
hotfix/claude-critical-ses-injection-guard
```

---

## Flujo de Toni (desarrollador principal)

### Empezar sesión de trabajo

```bash
git checkout development
git pull --ff-only origin development
bash scripts/git-flow/status-release-flow.sh
```

### Integrar rama de agente IA en desarrollo local

```bash
bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-mejora-landing
```

**Qué hace:**
1. Valida working tree limpio
2. Actualiza `development` desde remoto
3. Fusiona rama de agente con `--no-ff`
4. Ejecuta tests y validaciones
5. Si todo pasa, pushea a `origin/development`
6. Si falla, deja estado para corrección

### Promocionar a staging

```bash
bash scripts/git-flow/promote-development-to-staging.sh
```

O desde GitHub Actions:

```text
Actions → Promote development to staging → Run workflow
```

### Promocionar a production

```bash
CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0
```

O desde GitHub Actions:

```text
Actions → Promote staging to production → Run workflow → Version: v0.2.0
```

---

## Flujo de agentes IA

### Crear rama

**Automático (script):**
```bash
bash scripts/git-flow/start-agent-branch.sh codex mejora-landing
```

**Manual:**
```bash
git checkout development
git pull --ff-only origin development
git checkout -b feat/codex-mejora-landing
```

### Trabajar y commitear

```bash
git add .
git commit -m "feat(landing): improve controlled pilot messaging"
git push -u origin feat/codex-mejora-landing
```

### Después de hacer push

El agente:
1. Espera a que GitHub Actions valide la rama (`validate-agent-branch.yml`)
2. No fusiona a `development` (eso lo hace Toni)
3. Indica a Toni que está lista para integrar

### Toni lo integra en local

```bash
bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-mejora-landing
```

Si pasa validación, se sube a `origin/development`.

---

## Flujo de hotfix urgente

Caso: Bug crítico en production que necesita arreglarse **ahora**.

### Crear hotfix desde production

```bash
git checkout production
git pull --ff-only origin production
git checkout -b hotfix/codex-critical-auth-guard
# cambios
git add .
git commit -m "fix(auth): harden production auth guard"
git push -u origin hotfix/codex-critical-auth-guard
```

### Mergear hotfix a production

```bash
git checkout production
git pull --ff-only origin production
git merge --no-ff hotfix/codex-critical-auth-guard
npm run lint && npm run typecheck && npm run test && npm run build
git push origin production
```

### Propagar hotfix a staging y development

```bash
# A staging
git checkout staging
git pull --ff-only origin staging
git merge --no-ff production
git push origin staging

# A development
git checkout development
git pull --ff-only origin development
git merge --no-ff staging
git push origin development
```

O ejecutar scripts si existen.

---

## Reglas de merge

### Siempre usar `--no-ff`

```bash
git merge --no-ff feat/codex-mejora-landing
```

Esto preserva historial de ramas, facilitando auditoría.

### Resolver conflictos

Si hay conflicto:

1. Comunicar al creador de la rama
2. Resolver en local
3. Ejecutar tests completos
4. Hacer nuevo commit de merge
5. No forzar historia

### Nunca forzar ramas permanentes

```bash
# ❌ NO HAGAS ESTO
git push --force origin development
git push --force-with-lease origin staging
```

---

## Limpieza de ramas

Después de fusionar una rama de agente:

```bash
# Local
git branch -d feat/codex-mejora-landing

# Remoto
git push origin --delete feat/codex-mejora-landing
```

Pero **solo** si:
- Rama está completamente fusionada
- No hay trabajo pendiente
- Se ha confirmado con el agente/Toni

---

## Comandos de referencia diaria

| Necesidad | Comando |
|-----------|---------|
| Ver estado flujo | `bash scripts/git-flow/status-release-flow.sh` |
| Crear rama agente | `bash scripts/git-flow/start-agent-branch.sh <agente> <descripción>` |
| Integrar rama agente | `bash scripts/git-flow/merge-agent-branch-to-development.sh <rama>` |
| Ir a development limpio | `git checkout development && git pull --ff-only` |
| Promocionar a staging | `bash scripts/git-flow/promote-development-to-staging.sh` |
| Promocionar a production | `CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0` |
| Ver ramas | `git branch -a` |
| Ver commits no en staging | `git log staging..development --oneline` |

---

## Protección de ramas

Se recomienda configurar en GitHub:

### `development`
- ❓ Require pull request (opcional si Toni hace merge local)
- ✓ Require status checks (CI)
- ✓ Restrict force pushes
- ✓ Restrict deletions

### `staging`
- ✓ Require pull request o workflow manual
- ✓ Require status checks
- ✓ Restrict force pushes
- ✓ Restrict deletions

### `production`
- ✓ Require pull request o workflow manual
- ✓ Require status checks
- ✓ Restrict force pushes
- ✓ Restrict deletions
- ✓ Require approval (si GitHub Environments disponible)

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Merge directo de `feat/*` a `staging` | Revisar PRs, usar scripts |
| Conflictos en merge | Comunicar temprano, resolver juntos |
| Push --force accidental | Branch protection + workflow manual |
| Rama de agente desconectada | `git pull --ff-only` siempre |
| Hotfix sin propagar | Script de propagación |

---

## Ejemplo completo: Nueva feature de Toni

```bash
# 1. Agente IA crea rama
git checkout development
git pull --ff-only origin development
git checkout -b feat/codex-nueva-feature

# 2. Agente trabaja
echo "nuevo código" > src/components/NewComponent.tsx
git add .
git commit -m "feat(components): add new feature component"
git push -u origin feat/codex-nueva-feature

# 3. GitHub Actions valida rama

# 4. Toni integra localmente
git checkout development
bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-nueva-feature

# 5. Si pasa: Toni promociona a staging
bash scripts/git-flow/promote-development-to-staging.sh

# 6. Si staging valida: Toni promociona a production
CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0

# 7. Vercel despliega production automáticamente
```

---

## Glosario

| Término | Significado |
|---------|-----------|
| `--no-ff` | No-fast-forward: preserva commit de merge |
| `--ff-only` | Fast-forward only: falla si no es linear |
| `git fetch` | Actualiza refs remotas sin cambiar working tree |
| `git pull` | Fetch + merge |
| Working tree | Los archivos actuales en disk |
| Origin | Remoto GitHub |

---

*Anclora SyncXML — Branching Model v1.0*  
*Última actualización: 2026-06-06*
