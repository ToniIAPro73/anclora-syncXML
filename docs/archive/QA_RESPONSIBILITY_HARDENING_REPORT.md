# QA responsibility hardening report

## Revisado

- Dashboard dark/light.
- Importacion con consentimiento.
- Banner de modo privado.
- Preview de tabla enmascarada.
- Errores y duplicados.
- Preview XML.
- Paginas de privacidad y terminos.
- Footer legal.
- Responsive desktop/tablet/mobile por CSS.

## Resultado

Correcto para validacion controlada. Lint, tests y build pasan. La revision visual se ejecuto con Playwright CLI sobre `http://localhost:3002` en modo demo local explicito.

## Incidencias encontradas y corregidas

- Bypass de login sin password administrativa.
- Persistencia DB activa por presencia de `DATABASE_URL`.
- Visualizacion completa de documentos, emails y telefonos.
- Falta de consentimiento granular.
- Falta de paginas legales especificas.
- Mezcla de idioma en labels alemanes de clasificacion y validacion.

## Pendientes

- Capturas visuales reales con navegador si se requiere evidencia grafica.
- Auditoria externa antes de produccion.
- `npm install` informa 6 vulnerabilidades transitivas; revisar con `npm audit` antes de produccion.

## Comandos ejecutados

- `npm install`
- `npm run lint`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `rg -n "console\\.log|documento|numeroDocumento|correo|telefono|direccion|payment|pago|password|secret|TODO|FIXME" . -g '!node_modules' -g '!.next' -g '!package-lock.json'`
- `SYNCXML_LOCAL_DEMO=true npm run dev`
- Playwright CLI: snapshots y screenshots de importacion dark/light, privacidad mobile, terminos DE, flujo de importacion con XLSX de ejemplo.

## Estado final

Pre-MVP serio con la condicion de mantener modo privado por defecto, no usar datos reales hasta auditoria y resolver vulnerabilidades de dependencias antes de produccion.
