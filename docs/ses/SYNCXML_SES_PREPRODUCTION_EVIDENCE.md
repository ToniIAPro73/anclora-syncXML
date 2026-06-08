# SyncXML SES Preproduction Evidence

## Objetivo

Delimitar que puede afirmarse hoy sobre la integracion SES.HOSPEDAJES y que evidencia falta antes de escalar claims o activar flujos mas sensibles.

## Alcance actual

- validacion local de reglas SES relevantes;
- empaquetado y cliente SOAP preparados;
- entorno de preproduccion contemplado;
- envio a produccion bloqueado por defecto;
- respuestas resumidas para reducir exposicion de PII.

## Que si puede afirmarse

- SyncXML prepara XML revisable orientado al flujo SES.HOSPEDAJES.
- Existen helpers y tests locales para reglas y comunicaciones SES.
- El repo esta preparado para pruebas controladas de preproduccion.
- La app no presenta el envio de produccion como disponible por defecto.

## Que no debe afirmarse

- que el XML sea aceptado oficialmente en todos los casos;
- que exista conformidad legal plena;
- que la integracion este validada en produccion;
- que la preproduccion ya aporte evidencia suficiente si no se ha archivado el resultado concreto.

## Entradas esperadas

- payload normalizado de reserva y huespedes;
- credenciales SES configuradas fuera del repo;
- entorno `pre` o `prod`;
- revision humana previa.

## Salidas

- XML revisable;
- resumen operativo de validacion o de respuesta SES;
- hashes tecnicos y metadatos minimos.

## Limitaciones

- falta evidencia archivada de aceptacion real en preproduccion;
- sigue pendiente validacion completa contra todos los esquemas oficiales;
- el rol final de sistema de record legal no esta aprobado;
- no debe usarse con datos reales sin governance formal.

## Evidencias requeridas

1. credenciales operativas de preproduccion;
2. muestra aceptada o respuesta de SES archivada;
3. procedimiento de gestion de aceptado/rechazado;
4. checklist de envio revisado por responsable tecnico;
5. politica de retencion y acceso si se usan datos reales.

## Checklist antes de enviar a SES

- XML revisado manualmente;
- entorno correcto (`pre` salvo excepcion documentada);
- credenciales verificadas;
- `SYNCXML_SES_ALLOW_PRODUCTION_SEND=false` salvo autorizacion expresa;
- datos sinteticos o anonimizados si sigue en piloto;
- evidencia y resultado archivables sin exponer PII innecesaria.

## Manejo de respuestas y errores

- resumir respuestas al usuario final;
- no mostrar payloads completos salvo necesidad tecnica controlada;
- registrar estado, codigo y batch si aplica;
- tratar rechazos como evidencia operativa, no como fallo silencioso.

## Trazabilidad de lotes y comunicaciones

- `xmlHash`
- entorno
- endpoint
- `sesBatchCode`
- codigo/resumen de respuesta
- timestamp de envio y consulta

## Criterios para pasar de test a piloto real

- evidencia positiva o suficientemente explicada de preproduccion;
- validacion legal y de privacidad del flujo real;
- roles y responsables definidos;
- checklist operativo aprobado;
- decision explicita de Toni antes de cualquier claim o apertura mayor.
