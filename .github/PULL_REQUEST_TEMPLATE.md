## Descripción

<!-- Describe brevemente qué cambios hace este PR y por qué. -->

## Tipo de cambio

- [ ] Característica nueva
- [ ] Bug fix
- [ ] Documentación
- [ ] Refactoring
- [ ] Otra (especifica):

## Checklist Git Workflow

Todo PR debe cumplir con el flujo Git obligatorio:

- [ ] La rama parte de `development`, salvo hotfix
- [ ] La rama usa prefijo permitido: `feat/`, `fix/`, `chore/` o `hotfix/`
- [ ] La rama sigue patrón: `feat/<agente>-<descripcion>`
- [ ] No se ha hecho push directo a `development`, `staging` o `production`
- [ ] Se han ejecutado `npm run lint`
- [ ] Se han ejecutado `npm run typecheck`
- [ ] Se han ejecutado `npm run test`
- [ ] Se han ejecutado `npm run build`

## Checklist Seguridad

- [ ] No se han añadido secretos, tokens, API keys ni credenciales
- [ ] No se han añadido datos reales, PII ni información sensible
- [ ] No se han copiado variables de producción a otros entornos
- [ ] No se han tocado variables reales de Vercel

## Checklist Contenido

- [ ] Los cambios son consistentes con `docs/devops/BRANCHING_MODEL.md`
- [ ] El commit message sigue formato: `<tipo>(<scope>): <resumen>`
- [ ] La rama será integrada solo por Toni a `development`
- [ ] La promoción a `staging` y `production` seguirá el flujo controlado

## Testing

<!-- ¿Cómo se puede probar? -->

## Referencias

- Contrato: `docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md`
- Modelo: `docs/devops/BRANCHING_MODEL.md`
- Playbook: `docs/devops/TONI_GIT_WORKFLOW_PLAYBOOK.md`

---

**Nota**: Este PR debe cumplir con el flujo Git obligatorio de Anclora SyncXML. Ver `AGENTS.md` para detalles.
