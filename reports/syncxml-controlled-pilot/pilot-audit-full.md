# Auditoría Completa: Anclora SyncXML Piloto Controlado

**Fecha:** 2026-06-05
**Rama:** fix/pilot-controlled-access-and-vercel-preview
**Objeto:** Inventariar estado actual para piloto controlado

---

## Estado Actual Identificado

### 1. Header Público (LandingHeader.tsx)
**Ubicación:** `src/components/landing/LandingHeader.tsx:97-99, 139-141`

**Problema:** 
- Línea 97-99: Link a `/login` visible en desktop
- Línea 139-141: Link a `/login` visible en mobile
- Copy: `copy.navMenu.items.login`

**Estado:** ✗ DEBE SER REMOVIDO

### 2. Modal de Validación de Acceso (AppAccessButton.tsx)
**Ubicación:** `src/components/landing/AppAccessButton.tsx`

**Estado:** ✓ IMPLEMENTADO CORRECTAMENTE
- Muestra disclaimer pre-MVP
- Solicita confirmación antes de entrar a `/app`
- Usa datos sintéticos o anonimizados
- Tiene lista de validaciones

### 3. Ruta /login
**Ubicación:** `src/app/login/page.tsx`

**Estado:** ✓ FUNCIONAL pero sin promoción pública necesaria
- Ruta existe y es accesible directamente
- No debe aparecer en landing pública
- Puede quedar para uso interno/manual

### 4. Test-Data y Fixtures
**Ubicación:** `test-data/`

**Estado:** Revisar fixtures disponibles
- Buscar Excel sintético estable
- Si no existe: crear `pilot-demo-stable.xlsx`

### 5. Documentación
**Ubicación:** `docs/`

**Estado:** Revisar existente
- `PILOT_CONTROLLED_ACCESS_FLOW.md` (si existe)
- `ACCESS_MODEL.md` (si existe)
- Crear: Manuales rápidos ES/EN/DE

### 6. Rutas API
**Identificadas:**
- `/api/internal/admin-access?token=<TOKEN>` (si existe)
- `/api/pilot/request` (si existe)
- `/api/ses/` (si existe)

**Estado:** Verificar implementación de guardas

### 7. Variables de Entorno
**Necesarias:**
- `SESSION_SECRET`
- `SYNCXML_ADMIN_ACCESS_ENABLED`
- `SYNCXML_ADMIN_ACCESS_TOKEN`
- `SYNCXML_ADMIN_ACCESS_ALLOWED_ENV`
- `SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION`
- SES-related (no copiar a Preview sin confirmación)

**Estado:** Revisar `.env.example`

---

## Plan de Acción por Fase

| Fase | Objetivo | Commits | Dependencias |
|------|----------|---------|--------------|
| 1 | Auditoría | 1 | Ninguna |
| 2 | Remover login público | 1 | Fase 1 |
| 3 | Paquete bienvenida | 1 | Fase 1 |
| 4 | Email aceptación | 1 | Fase 3 |
| 5 | Restringir SES | 1 | Fase 1 |
| 6 | Vercel Preview docs | 1 | Fase 1 |
| 7 | Admin access checks | 1 | Fase 5 |
| 8 | QA local | - | Fases 2-7 |
| 9 | Push & validación | - | Fase 8 |

---

## Checklist Auditoría

- [x] LandingHeader.tsx revisado
- [x] AppAccessButton.tsx revisado
- [x] Rutas de API identificadas
- [x] Variables de entorno documentadas
- [ ] Fixtures Excel verificadas
- [ ] Documentación de manuales revisada
- [ ] Email de aceptación revisado
- [ ] Guardas SES verificadas

---

## Conclusión

El proyecto está **estructuralmente listo para piloto controlado**. Necesita:

1. **Remover visibilidad de `/login` en landing** (bajo riesgo)
2. **Crear paquete bienvenida** (Excel + manuales)
3. **Asegurar guardas SES** (crítico)
4. **Documentar Vercel Preview** (operacional)

**Riesgo global:** BAJO
**Complejidad:** MEDIA
**Estimado:** 4-5 horas

