# Contrato Git obligatorio para agentes IA

**Versión:** 1.0  
**Vigencia:** Permanente  
**Aplica a:** Codex, Claude Code, Gemini CLI, y cualquier agente IA  
**Actualizado:** 2026-06-06

---

## ⚠️ LECTURA OBLIGATORIA

Todo agente debe leer este archivo antes de modificar el repositorio `anclora-syncxml`.

---

## Flujo obligatorio

### 1. Antes de empezar

```bash
git fetch origin --prune
git checkout development
git pull --ff-only origin development
git checkout -b feat/<agente>-<descripcion>
```

Ejemplos válidos:
```
feat/codex-mejora-landing
fix/claude-auth-guard
chore/gemini-update-docs
hotfix/codex-critical-bug
```

### 2. Durante el trabajo

Ejecuta checks frecuentemente:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Si alguno no existe, documenta por qué y continúa con los disponibles.

### 3. Al terminar

```bash
git add .
git commit -m "<tipo>(<scope>): <resumen>"
git push -u origin <rama>
```

Ejemplos válidos:
```
feat(landing): improve pilot messaging
fix(auth): harden session validation
chore(docs): update branching model
```

### 4. Reporta al terminar

```text
Rama: feat/codex-mejora-landing
Commits: 3
Checks ejecutados:
  ✓ lint
  ✓ typecheck
  ✓ test
  ✓ build
Resultado: ÉXITO
Pendientes: Toni integrará en development
```

---

## Reglas NO negociables

| Regla | Por qué |
|-------|---------|
| ❌ No trabajar en `development`, `staging` o `production` | Solo Toni integra en development; los demás solo en ramas propias |
| ❌ No hacer merge automático a `development` | Toni valida localmente primero |
| ❌ No promocionar a `staging` ni `production` | Solo Toni puede hacer esto |
| ❌ No usar `git push --force` | Destruye historial y confunde el flujo |
| ❌ No borrar ramas remotas sin confirmar | Podrían contener trabajo no fusionado |
| ❌ No tocar secretos ni variables reales de Vercel | Riesgos de seguridad críticos |
| ❌ No copiar variables de producción a staging/dev | Aislamiento de datos |
| ❌ No desplegar producción sin aprobación | Riesgos operativos |

---

## Ramas permitidas

### Ramas permanentes (NUNCA las uses directamente)
```
production  ← Producción pública
staging     ← Preproducción
development ← Integración principal
```

### Ramas temporales (Tú trabajas aquí)
```
feat/<agente>-<descripcion>      ← Nuevas características
fix/<agente>-<descripcion>       ← Bug fixes
chore/<agente>-<descripcion>     ← Documentación, config
hotfix/<agente>-<descripcion>    ← Solo urgencias en prod
```

---

## Hotfix crítico (excepcional)

**Solo** si hay incidente urgente en producción:

```bash
git fetch origin --prune
git checkout production
git pull --ff-only origin production
git checkout -b hotfix/<agente>-<descripcion>
# Cambios críticos
git push -u origin <rama>
```

Después:
```
hotfix/* → production → staging → development
```

**Esto debe hacerlo Toni**, solo avisa al agente si la autoriza.

---

## Checklist antes de hacer commit

- [ ] Cambios solo en rama propia
- [ ] No he tocado `development`, `staging` ni `production`
- [ ] He ejecutado `lint`, `typecheck`, `test`, `build`
- [ ] No hay secretos, credenciales ni datos reales
- [ ] Commit message es claro y sigue formato
- [ ] Push es a `origin/<mi-rama>`, no a permanentes

---

## Checklist antes de push

- [ ] Working tree limpio: `git status`
- [ ] Cambios visibles: `git diff --stat`
- [ ] Commits bien formados: `git log --oneline -n 5`
- [ ] No hay fuerza: `git push -u origin <rama>` (sin --force)

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "cannot fast-forward" | Historia divergida | `git log --oneline --graph --all` y comunicar a Toni |
| "permission denied" | Variables de prod | No tocar secretos, usar dev vars |
| "force push needed" | Historia divergida localmente | NO fuerces, contacta a Toni |
| "merge conflicts" | Cambios overlaps | Comunicar a Toni, no fuerces |

---

## Comandos de ayuda

| Necesidad | Comando |
|-----------|---------|
| Ver estado | `bash scripts/git-flow/status-release-flow.sh` |
| Ver rama actual | `git branch --show-current` |
| Ver cambios | `git diff --stat` |
| Ver commits | `git log --oneline -n 10` |
| Ver remoto | `git remote -v` |
| Sincronizar | `git fetch origin --prune` |
| Revertir cambio | `git reset --soft HEAD~1` |
| Cancelar merge | `git merge --abort` |

---

## Flujo de Toni (referencia para agentes)

Toni integra ramas de agentes así:

```bash
git fetch origin --prune
git checkout development
git pull --ff-only origin development
git merge --no-ff origin/feat/<agente>-<descripcion>
npm run lint && npm run typecheck && npm run test && npm run build
git push origin development
```

Si todo pasa, promociona:

```
development → staging → production
```

---

## Escalamiento

Si tienes dudas:

1. Lee `docs/devops/BRANCHING_MODEL.md` (descripción detallada)
2. Lee `docs/devops/TONI_GIT_WORKFLOW_PLAYBOOK.md` (pasos prácticos)
3. Comunica a Toni claramente qué necesitas

---

## Cambios a este contrato

Este contrato es permanente. Solo Toni puede modificarlo.

Si encuentras un error o necesitas una excepción, comunica directamente.

---

**Firmado:** Anclora SyncXML Governance  
**Vigencia:** A perpetuidad en este repositorio  
**Última actualización:** 2026-06-06

---

*Para agentes IA: Este archivo es parte de tu contrato con este repositorio. Léelo antes de cada sesión.*
