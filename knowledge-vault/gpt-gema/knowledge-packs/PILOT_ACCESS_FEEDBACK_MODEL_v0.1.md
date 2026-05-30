# PILOT_ACCESS_FEEDBACK_MODEL_v0.1

## Propósito

Este documento define el modelo de acceso, solicitud de piloto, lista prioritaria, login y feedback para Anclora SyncXML durante la fase pre-MVP / validación controlada.

## Arquitectura de experiencia

Landing pública → solicitud de piloto → lista prioritaria → revisión manual → invitación/acceso → login → app → feedback → decisión comercial.

## Landing pública

La landing no es una zona operativa. Su función es captar solicitudes de piloto y explicar el producto.

CTA principal: Solicitar piloto controlado.  
CTA secundario: Ver cómo funciona.  
CTA terciario: Iniciar sesión.

No mostrar Dashboard en la landing.

## Solicitud de piloto

El formulario debe recoger datos mínimos:

- nombre;
- apellidos;
- email principal;
- tipo de alojamiento;
- reservas aproximadas al mes;
- uso actual de Excel/XLSX;
- posibilidad de usar muestra sintética o anonimizada;
- interés en piloto de pago;
- mensaje opcional;
- aceptación de privacidad.

La solicitud no concede acceso automático.

## Lista prioritaria

La lista prioritaria es el estado posterior a la solicitud. No debe ser un CTA público separado.

Estados internos posibles:

- pending;
- reviewed;
- approved;
- invited;
- rejected.

## Acceso a la app

La app debe estar protegida por login/AuthGate o mecanismo equivalente.

Texto público recomendado: Iniciar sesión.

Evitar:

- Abrir app;
- Acceso cliente;
- Web;
- Dashboard desde landing.

## App interna

Dentro de la app sí tiene sentido:

- Nueva reserva;
- Dashboard;
- idioma;
- tema;
- cuenta/sesión.

No debe haber un botón visible para volver a la landing pública dentro de la navegación principal.

## Feedback de piloto

Recoger feedback en tres fases:

1. Solicitud:
- problema principal;
- uso de Excel;
- volumen;
- interés en piloto de pago;
- rango orientativo.

2. Uso:
- claridad de revisión;
- utilidad del resultado;
- dudas;
- valor percibido.

3. Cierre:
- si resolvió el problema;
- qué aportó más valor;
- qué falta para confiar;
- disposición de pago;
- modelo preferido;
- recomendación 0–10.

## Restricciones

No pedir datos reales de huéspedes.  
No pedir documentos reales.  
No prometer cumplimiento legal.  
No prometer aceptación SES.  
No prometer integración oficial.  
No conceder acceso automático tras solicitar piloto.

## Decisión actual

La implementación debe priorizar:

1. Hero limpio.
2. Solicitud de piloto.
3. Lista prioritaria como estado posterior.
4. Login para usuarios aprobados.
5. Cookies y controles de navegación.
6. Feedback de piloto.
7. Demo sintética segura después de ordenar UX y acceso.