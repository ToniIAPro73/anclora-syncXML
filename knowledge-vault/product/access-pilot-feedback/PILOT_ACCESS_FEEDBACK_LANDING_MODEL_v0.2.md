# PILOT_ACCESS_FEEDBACK_LANDING_MODEL_v0.2

## 1. Propósito

Este documento define el modelo oficial de acceso, landing pública, solicitud de piloto, lista prioritaria, login, app interna, dashboard y feedback para Anclora SyncXML durante la fase pre-MVP / validación controlada.

Su objetivo es evitar que la landing pública funcione como una zona operativa, reducir riesgos legales y técnicos, controlar el acceso a la aplicación y validar el interés comercial antes de ofrecer uso real o planes cerrados.

## 2. Principios

- La landing pública no es una zona operativa.
- La app funcional debe estar protegida por login/AuthGate o mecanismo equivalente.
- La solicitud de piloto no concede acceso automático.
- La lista prioritaria es el estado posterior a solicitar piloto, no un CTA público separado.
- El dashboard pertenece a la app, no a la landing.
- No deben pedirse datos reales de huéspedes ni documentos reales en la landing o solicitud.
- No debe prometerse cumplimiento legal, aceptación SES, integración oficial ni envío automático.
- El uso con datos reales requiere cerrar previamente seguridad, RGPD, DPA, retención, validación técnica, QA y responsabilidades.
- El feedback del piloto debe validar dolor, claridad, valor percibido, confianza y disposición de pago.

## 3. Arquitectura de experiencia

Flujo principal:

Landing pública → solicitud de piloto → lista prioritaria / estado pendiente → revisión manual → invitación o acceso aprobado → login/AuthGate → app interna → feedback → decisión comercial.

## 4. Landing pública

La landing pública debe:

- explicar el producto;
- generar confianza;
- captar solicitudes de piloto;
- mostrar límites de forma prudente;
- evitar claims peligrosos;
- permitir iniciar sesión solo a usuarios ya autorizados.

CTA principal:

“Solicitar piloto controlado”

CTA secundario:

“Ver cómo funciona”

CTA terciario:

“Iniciar sesión”

La landing no debe mostrar:

- Dashboard;
- Nueva reserva;
- componentes operativos de la app;
- subida de archivos;
- uso con datos reales;
- claims de producción;
- claims de aceptación SES;
- claims de cumplimiento legal garantizado.

## 5. Solicitud de piloto

La solicitud de piloto debe recoger datos mínimos del interesado.

Campos recomendados:

- nombre;
- apellidos;
- email principal;
- tipo de alojamiento;
- reservas aproximadas al mes;
- si trabaja actualmente con Excel/XLSX;
- principal problema operativo;
- posibilidad de usar muestra sintética o anonimizada;
- interés en piloto de pago;
- rango orientativo de precio o presupuesto, opcional;
- mensaje opcional;
- aceptación de privacidad.

No pedir:

- datos reales de huéspedes;
- DNI, NIE, pasaporte u otros documentos;
- XML real con PII;
- Excel real con PII;
- credenciales SES;
- datos de pago reales.

Tras enviar la solicitud, debe mostrarse:

“Solicitud recibida. Revisaremos el encaje del piloto antes de conceder acceso. No subas datos reales de huéspedes hasta que el piloto esté aprobado y configurado.”

## 6. Lista prioritaria

La lista prioritaria es el estado posterior a la solicitud.

No debe existir un CTA público separado llamado “Unirse a whitelist” si ya existe “Solicitar piloto controlado”.

Estados internos recomendados:

- pending;
- reviewed;
- approved;
- invited;
- rejected.

Uso público recomendado:

- “lista prioritaria”;
- “programa de validación controlada”;
- “solicitud pendiente de revisión”.

Uso interno permitido:

- whitelist;
- pilot_waitlist;
- pilot_leads;
- early_access_requests.

## 7. Acceso y AuthGate

La app debe estar protegida por login/AuthGate o mecanismo equivalente.

Rutas públicas:

- `/`;
- ruta o sección de solicitud de piloto;
- `/login`, si existe;
- `/privacy`;
- `/terms`;
- `/cookies`, si existe.

Rutas protegidas:

- `/app`;
- `/dashboard`;
- cualquier ruta que permita operar con datos;
- cualquier ruta que permita importar archivos;
- cualquier ruta que permita generar, revisar o descargar XML;
- cualquier ruta de reservas o configuración interna.

Comportamiento esperado:

- Si no hay sesión, mostrar login o redirigir a login.
- Si hay sesión pero el usuario no está aprobado/invitado, mostrar estado pendiente.
- Si faltan variables críticas, fallar cerrado.
- No exponer dashboard ni acciones operativas sin autorización.

Texto público preferente:

“Iniciar sesión”

Evitar:

- “Abrir app”;
- “Acceso cliente”;
- “Web”;
- “Entrar al dashboard”;
- “Abrir dashboard”.

## 8. App interna

Dentro de la app sí tiene sentido mostrar:

- Nueva reserva;
- Dashboard;
- revisión;
- XML;
- preferencias;
- idioma;
- tema;
- cuenta/sesión;
- feedback.

Dentro de la app no debe mostrarse un botón principal:

- “Web”;
- “Volver a la landing”;
- “Landing pública”;
- “Inicio público”.

El logo dentro de la app debe llevar al inicio interno de la app, salvo decisión explícita contraria.

## 9. Feedback de piloto

El feedback debe recogerse en tres momentos.

### 9.1. Antes del piloto

Dentro de la solicitud:

- problema principal;
- uso actual de Excel/XLSX;
- volumen de reservas;
- principal bloqueo;
- posibilidad de usar muestra sintética o anonimizada;
- interés en piloto de pago;
- rango orientativo.

Pregunta adicional recomendada:

“¿Cómo resuelves hoy este proceso y cuánto tiempo te lleva por reserva o por semana?”

### 9.2. Durante el uso

Feedback contextual discreto:

- claridad de revisión;
- utilidad del resultado;
- dudas;
- valor percibido;
- confianza o desconfianza.

Ejemplos:

“¿Te ha resultado clara esta revisión?”

“¿Este resultado te ayudaría a revisar mejor tus datos antes de preparar el XML?”

### 9.3. Cierre del piloto

Preguntas recomendadas:

- ¿El piloto resolvió el problema que esperabas?
- ¿Qué parte aportó más valor?
- ¿Qué parte generó dudas?
- ¿Qué necesitarías para usarlo con confianza?
- ¿Pagarías por una versión controlada?
- ¿Qué modelo preferirías: pago único, cuota mensual, setup + mensual o servicio a medida?
- ¿Recomendarías Anclora SyncXML a otro alojamiento? Escala 0–10.

El feedback no debe pedir datos reales de huéspedes ni documentos.

Si no hay backend seguro, usar email estructurado o flujo manual.

## 10. Cookies, idioma y accesibilidad

La landing debe incluir consentimiento de cookies si existen cookies no técnicas, analítica o preparación para analítica.

Requisitos:

- botón de cookies reabrible;
- aceptar necesarias;
- rechazar opcionales;
- configurar preferencias;
- no activar cookies no técnicas antes del consentimiento;
- persistir preferencias;
- enlazar a privacidad y términos;
- no usar dark patterns.

El selector de idioma debe seguir el patrón visual de la app o limitarse hasta tener traducciones completas.

No mostrar idiomas si generan textos incompletos, mezclados o claims distintos.

El toggle de tema es prioritario dentro de la app. En landing puede omitirse para mantener estética dark premium.

Los controles up/down pueden reutilizar el patrón visual de Private Estates si:

- no rompen accesibilidad;
- tienen aria-label;
- no tapan CTAs;
- funcionan en mobile;
- no interfieren con cookies.

## 11. Claims permitidos y prohibidos

Claims permitidos:

- “XML revisable”;
- “validación controlada”;
- “preparación orientada al flujo SES.HOSPEDAJES”;
- “piloto controlado”;
- “datos sintéticos o anonimizados”;
- “privacidad por defecto”;
- “revisión humana”;
- “detección de errores operativos”.

Claims prohibidos:

- “cumplimiento garantizado”;
- “evita sanciones”;
- “integración oficial con SES”;
- “envío automático al Ministerio”;
- “XML aceptado por SES”;
- “sustituye tu PMS”;
- “sustituye tu gestoría”;
- “solución legal completa”;
- “listo para producción”;
- “sube tus datos reales”.

## 12. Criterios de aceptación

- Landing no muestra dashboard.
- Landing no permite operar.
- Landing no permite subida de archivos.
- CTA principal es “Solicitar piloto controlado”.
- CTA secundario es “Ver cómo funciona”.
- CTA terciario es “Iniciar sesión”.
- Solicitud de piloto no concede acceso automático.
- Usuario queda en estado pending/lista prioritaria tras enviar.
- `/app` está protegida por AuthGate.
- Usuarios no aprobados no acceden a dashboard.
- No se piden datos reales de huéspedes ni documentos.
- No hay claims prohibidos.
- Feedback mide disposición de pago.
- Cookies son configurables y reabribles si hay cookies no técnicas.
- Selector de idioma no muestra traducciones incompletas.
- App no muestra botón principal “Web” ni “Volver a landing”.
- Dashboard solo aparece dentro de app.

## 13. Dependencias

Antes de uso real con datos de huéspedes:

- revisión legal;
- DPA;
- política de privacidad;
- política de retención/borrado;
- hardening de seguridad;
- QA E2E;
- validación XSD;
- evidencia SES en preproducción;
- control de acceso;
- revisión humana/legal.

## 14. Historial de decisiones

### v0.1

Modelo inicial de landing, piloto, lista prioritaria, login, app y feedback.

### v0.2

Consolidación como modelo oficial para pre-MVP / validación controlada. Se confirma que:

- la landing capta pilotos;
- la lista prioritaria es estado posterior;
- el login protege la app;
- el dashboard no aparece en landing;
- el feedback forma parte del aprendizaje comercial;
- cookies, idioma y controles deben alinearse con contratos Anclora.