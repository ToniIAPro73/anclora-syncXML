# Modelo de acceso — estado actual

Este documento describe **cómo funciona hoy** el control de acceso a Anclora
SyncXML y qué parte del modelo `PILOT_ACCESS_FEEDBACK_LANDING_MODEL_v0.2`
todavía es un **proceso manual**, para evitar dar por implementado algo que no
lo está.

## Resumen

| Aspecto | Estado hoy |
| --- | --- |
| Autenticación de `/app` y `/dashboard` | **Contraseña única compartida** (AuthGate) |
| Origen de la contraseña | Variable de entorno `SYNCXML_ADMIN_PASSWORD` |
| Cuentas por usuario | **No existen** (no hay registro ni tabla de usuarios) |
| Estados `pending/approved/invited/rejected` | **Proceso manual**, sin persistencia |
| Tabla / backend de leads | **No existe** (la solicitud se gestiona por email) |
| Fail-closed si faltan secretos | Sí (ver `src/lib/security/env.ts`) |
| Logout | Existe como `POST /api/auth/logout`; borra solo la cookie de sesión |

## Contrato visual de login

La pantalla `/login` y el estado no autenticado de AuthGate siguen el contrato
de Bóveda `ANCLORA_AUTH_LOGIN_SCREEN_CONTRACT` **v1.3.0** como fuente visual:

- card compacto premium con ancho aproximado de `460px` y altura mínima de
  `560px`;
- logo centrado de `50px`, sin contenedor circular;
- divisor gradiente bajo el logo;
- nombre `Anclora SyncXML` separado del logo;
- badge de estado de piloto o validación controlada;
- texto legal con enlaces a `/terms` y `/privacy`.

SyncXML adapta el contrato porque hoy usa **clave compartida del piloto**, no
cuentas personales. Por tanto, el patrón email/password, recuperación de
contraseña, registro y OAuth del contrato general no se muestra en esta fase.
Esta excepción está justificada por el modelo actual de pre-MVP / validación
controlada y debe revisarse si se introducen usuarios individuales.

## Cómo se concede el acceso (flujo real)

1. El interesado envía la solicitud desde `/piloto` (formulario estructurado
   que compone un `mailto:`; no hay backend ni almacenamiento de leads).
2. La solicitud se **revisa manualmente** por correo. No hay aprobación
   automática ni cola persistida.
3. Si se aprueba, se comparte **fuera de banda** (por correo) la **clave de
   acceso del piloto** (`SYNCXML_ADMIN_PASSWORD`). Es una clave **compartida**
   del piloto, no una credencial personal.
4. El participante entra por `/login` (o el AuthGate de `/app`) introduciendo
   esa clave. La sesión se gestiona con cookie de sesión firmada.
5. Si necesita salir, `/login` permite cerrar sesión mediante
   `POST /api/auth/logout`, que elimina la cookie de sesión sin tocar datos de
   operación.

## Relación con el modelo v0.2

El modelo v0.2 describe estados de lead `pending → reviewed → approved →
invited → rejected`. **Hoy esos estados no están modelados en código**: son una
etiqueta mental del proceso manual de revisión por correo. No hay:

- tabla de `pilot_leads` / `whitelist`,
- panel de administración de solicitudes,
- invitaciones por usuario ni expiración,
- roles ni permisos por participante.
- OAuth o proveedores sociales.

El copy de la aplicación (landing, `/login`, AuthGate) **no afirma** que exista
aprobación automática ni cuentas individuales: indica explícitamente que la
revisión es manual y que la clave es compartida.

## Pendiente para un modelo de acceso completo

Antes de escalar más allá de un piloto controlado pequeño, se recomienda:

- Tabla de leads/participantes con estados `pending/approved/invited/rejected`.
- Credenciales por usuario (no clave compartida) y, si aplica, OAuth según
  `ANCLORA_AUTH_LOGIN_SCREEN_CONTRACT`.
- Panel interno para revisar solicitudes e invitar.
- Caducidad/rotación de invitaciones y registro de accesos.
- Cierre previo de seguridad, RGPD, DPA, retención y validación técnica antes de
  usar datos reales (ver `README.md` y `docs/PRIVACY_MODEL.md`).

> Mientras tanto, el acceso debe tratarse como un **piloto controlado con clave
> compartida** y **solo datos sintéticos o anonimizados**.

## Desarrollo local

Para una demo local sin datos reales:

```bash
SYNCXML_LOCAL_DEMO=true npm run dev
```

Para probar el login real por clave en local o staging:

```env
SYNCXML_ADMIN_PASSWORD="clave-del-piloto"
SESSION_SECRET="secreto-largo"
SYNCXML_LOCAL_DEMO="false"
SYNCXML_DISABLE_AUTH="false"
```

`SYNCXML_DISABLE_AUTH=true` no debe usarse en producción.
