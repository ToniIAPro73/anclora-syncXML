# SyncXML Copy Compliance Audit

## Objetivo

Revisar copy publica y privada para evitar claims excesivos sobre SES, AI Act, cumplimiento legal o automatizacion sensible.

## Superficies revisadas

- `README.md`
- `src/lib/i18n/landing.tsx`
- `src/components/landing/*`
- `src/components/landing/LoginView.tsx`
- `src/lib/email-templates/pilot-acceptance.tsx`
- `docs/PILOT_CONTROLLED_ACCESS_FLOW.md`
- `docs/SES_ACCESS_CONTROL.md`

## Hallazgos

1. La copy principal ya mantiene una postura prudente: habla de piloto controlado, XML revisable y ausencia de garantia legal.
2. El login publico existe, pero la narrativa asociada lo presenta como acceso solo para participantes aprobados manualmente.
3. No se han encontrado claims tipo "cumple AI Act" o "SES oficial garantizado" en las superficies revisadas.

## Ajustes y decision

- No se considero necesario abrir la app al publico ni anadir CTA de login mas visibles.
- Se mantiene la estrategia actual:
  - CTA principal a `Solicitar piloto controlado`
  - `/login` reservado a aprobados manualmente
  - exportaciones y SES bajo supervision humana

## Before / after

- Antes: existia documentacion prudente, pero dispersa.
- Despues: queda consolidada en docs de compliance, piloto y SES con el mismo lenguaje prudente.

## Claims permitidos

- baseline interna;
- validacion controlada;
- asistencia operativa;
- XML revisable;
- supervision humana;
- preparacion para futuras revisiones de compliance.

## Claims prohibidos

- cumplimiento automatico AI Act;
- garantia legal;
- aceptacion SES garantizada;
- sustitucion de asesoria legal o gestor profesional;
- automatizacion oficial completa.
