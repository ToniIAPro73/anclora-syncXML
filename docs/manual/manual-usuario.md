<div class="cover-page">

<div class="cover-logo"><img src="screenshots/logo-anclora-syncxml.png" alt="Anclora SyncXML" /></div>

<div class="cover-brand">Anclora SyncXML</div>

<div class="cover-title">Manual de Usuario</div>

<div class="cover-subtitle">Guia premium para operar el piloto controlado, validar reservas, preparar XML SES.HOSPEDAJES y mantener controles de privacidad</div>

<div class="cover-meta">
  <div class="cover-version">Version 1.1</div>
  <div class="cover-date">20 julio 2026</div>
</div>

<div class="cover-disclaimer">SyncXML prepara, valida y exporta datos estructurados para el flujo SES.HOSPEDAJES. No sustituye la revision humana, el portal oficial, la evidencia de preproduccion ni el criterio legal del responsable del tratamiento.</div>

</div>

<div class="page-break"></div>

## Indice

<nav class="toc-grid">
  <div class="toc-item"><span class="toc-num">01</span><span><span class="toc-title">Alcance del producto</span><span class="toc-note">Piloto controlado y claims prudentes</span></span></div>
  <div class="toc-item"><span class="toc-num">02</span><span><span class="toc-title">Acceso y sesiones</span><span class="toc-note">Login aprobado, contrasena temporal y cierre</span></span></div>
  <div class="toc-item"><span class="toc-num">03</span><span><span class="toc-title">Preparacion antes de importar</span><span class="toc-note">Datos minimos y entorno privado</span></span></div>
  <div class="toc-item"><span class="toc-num">04</span><span><span class="toc-title">Importacion documental</span><span class="toc-note">Confirmaciones y limite de archivo</span></span></div>
  <div class="toc-item"><span class="toc-num">05</span><span><span class="toc-title">Revision guiada</span><span class="toc-note">Errores, avisos y correcciones</span></span></div>
  <div class="toc-item"><span class="toc-num">06</span><span><span class="toc-title">XML y descarga</span><span class="toc-note">Bloqueos antes de exportar</span></span></div>
  <div class="toc-item"><span class="toc-num">07</span><span><span class="toc-title">SES y pre-check-in</span><span class="toc-note">Preproduccion y permisos por rol</span></span></div>
  <div class="toc-item"><span class="toc-num">08</span><span><span class="toc-title">Dashboard operativo</span><span class="toc-note">Historial aislado por usuario</span></span></div>
  <div class="toc-item"><span class="toc-num">09</span><span><span class="toc-title">Feedback del piloto</span><span class="toc-note">Senales sin datos de huespedes</span></span></div>
  <div class="toc-item"><span class="toc-num">10</span><span><span class="toc-title">Seguridad y privacidad</span><span class="toc-note">Controles diarios</span></span></div>
  <div class="toc-item"><span class="toc-num">11</span><span><span class="toc-title">Incidencias frecuentes</span><span class="toc-note">Respuesta operativa</span></span></div>
  <div class="toc-item"><span class="toc-num">12</span><span><span class="toc-title">Glosario</span><span class="toc-note">Terminos clave</span></span></div>
</nav>

<div class="page-break"></div>

## 1. Alcance del producto

![Pantalla inicial de importacion](screenshots/syncxml-es-import.png)

**Anclora SyncXML** transforma un Excel de reserva en datos revisables y en un XML preparado para el flujo SES.HOSPEDAJES. La aplicacion esta orientada a validacion controlada, reduccion de errores operativos y trabajo con datos sensibles bajo minimizacion.

La version actual se usa en **piloto controlado**. El acceso se concede tras revision manual y no implica aprobacion automatica, garantia legal ni envio productivo a SES.

### Lo que permite hacer

| Necesidad | Como ayuda SyncXML |
| --- | --- |
| Importar reservas | Lee `.xlsx` y detecta reserva, alojamiento, pago y viajeros. |
| Validar datos | Marca errores y avisos antes de generar XML. |
| Corregir campos | Permite completar campos SES obligatorios desde revision guiada. |
| Preparar XML | Genera una vista visual y una vista tecnica revisable. |
| Probar SES | Incluye validacion local y acciones asistidas de preproduccion. |
| Revisar historial | Guarda reservas aisladas por usuario cuando la persistencia esta activa. |
| Recoger feedback | Permite enviar comentarios del piloto sin pedir datos de huespedes. |

### Limites importantes

- No sustituye el portal ni los servicios oficiales de SES.
- No ofrece asesoramiento legal ni garantiza cumplimiento absoluto.
- No debe usarse con produccion SES sin pruebas, credenciales y aprobacion operativa.
- No almacena imagenes de DNI o pasaporte.
- No autoaprueba solicitudes de piloto.

---

## 2. Acceso y sesiones

El acceso a la aplicacion esta reservado a usuarios aprobados del piloto o administradores autorizados.

### Flujo de acceso de usuario piloto

1. Abre `/login` o pulsa **Iniciar sesion** desde la landing.
2. Introduce email autorizado y contrasena.
3. Si la cuenta usa contrasena temporal, define una nueva contrasena antes de entrar.
4. Comprueba en la cabecera que aparece tu email de sesion.
5. Usa **Cerrar aplicacion** para salir; la aplicacion limpia la sesion local y vuelve al login.

### Acceso de administrador

| Area | Uso |
| --- | --- |
| `/admin/login` | Login oculto para perfiles admin. |
| Provisionado interno | Alta o rotacion de credenciales de usuarios piloto. |
| SES | Las acciones de envio quedan restringidas por rol y configuracion. |

### Controles de sesion

- No compartas credenciales del piloto.
- Cambia la contrasena temporal en el primer acceso.
- Cierra sesion al terminar una revision con PII.
- Si el usuario conectado no aparece en cabecera tras login, recarga la aplicacion y vuelve a iniciar sesion.

---

## 3. Preparacion antes de importar

Antes de subir un archivo, confirma que el caso encaja con el piloto.

### Necesitas

- Excel de la reserva en formato `.xlsx`.
- Autorizacion para tratar los datos personales incluidos.
- Datos de establecimiento y codigo cuando vayan a comunicarse a SES.
- Datos de viajeros: documento, nacimiento, nacionalidad, direccion, contacto y relacion.
- Criterio interno sobre quien revisa y aprueba el XML.

### Controles previos

| Control | Accion esperada |
| --- | --- |
| Entorno privado | Usa pantalla no compartida y evita exponer PII. |
| Archivo minimo | Sube solo el Excel necesario para la operacion. |
| Datos reales | En piloto, prioriza datos sinteticos o anonimizados salvo autorizacion expresa. |
| Muestra opcional | Si no tienes muestra propia, puedes solicitar el piloto sin adjuntarla; no equivale a aceptar datos sinteticos por defecto. |
| Trazabilidad | Define quien revisa y que evidencia se conserva. |

---

## 4. Importacion documental

![Flujo de importacion en espanol](screenshots/syncxml-es-import.png)

La importacion inicia el flujo operativo y aplica controles antes de leer el archivo.

### Pasos

1. Revisa las confirmaciones informadas.
2. Marca **Seleccionar todas las confirmaciones** o cada casilla individual.
3. Selecciona el archivo `.xlsx`.
4. Pulsa **Importar**.

### Controles automaticos

| Control | Resultado |
| --- | --- |
| Extension permitida | Solo se aceptan formatos soportados. |
| Tamano maximo | Los archivos excesivos se rechazan antes del procesamiento. |
| Payload validado | La respuesta parseada se valida antes de continuar. |
| Municipios INE | Cuando hay base de datos disponible, se resuelven codigos municipales. |
| Duplicados | Se muestran registros sospechosos para decision manual. |

Si el archivo no es valido, esta vacio o no se puede leer, la aplicacion muestra un error sin continuar al XML.

---

## 5. Revision guiada

![Revision de datos importados](screenshots/syncxml-es-review.png)

La revision guiada permite corregir los datos antes de generar XML.

### Elementos principales

| Elemento | Uso |
| --- | --- |
| Tabla de huespedes | Revisa nombre, documento, nacionalidad, contacto y estado. |
| Mostrar datos completos | Revela datos sin enmascarar solo en entorno privado. |
| Validar datos | Ejecuta reglas inteligentes y SES implementadas. |
| Informe CSV | Exporta incidencias por reserva y viajero. |
| Revision guiada | Completa campos obligatorios o corrige avisos. |
| Duplicados | Permite omitir, mantener o revisar registros sospechosos. |

### Estados de validacion

| Estado | Significado | Puede continuar? |
| --- | --- | --- |
| Valido | Campo correcto o suficiente para el flujo actual. | Si |
| Aviso | Debe revisarse; no siempre bloquea. | Depende del caso |
| Error | Bloquea XML, descarga o consolidacion. | No |

### Campos que suelen requerir atencion

- Codigo de municipio INE para direcciones en Espana.
- Soporte de documento para NIF/NIE.
- Sexo y relacion conforme a catalogos MIR.
- Telefono o email de contacto.
- Segundo apellido cuando aplique.
- Codigo postal y direccion.

---

## 6. XML y descarga

![Vista visual del XML generado](screenshots/syncxml-es-xml.png)

Cuando los errores criticos esten corregidos, pulsa **Generar XML**. La aplicacion crea una vista visual y una vista tecnica.

### Revision antes de descargar

| Bloque | Que comprobar |
| --- | --- |
| Solicitud | Codigo de establecimiento, nombre y direccion. |
| Contrato | Referencia, entrada, salida, personas y pago. |
| Pago | Tipo de pago, IBAN enmascarado e indicador de internet. |
| Personas | Viajeros incluidos, documento enmascarado y contacto. |
| Incidencias XML | Errores de estructura, namespace o campos requeridos. |

### Descarga

El nombre del archivo descargado usa el formato:

`syncxml-numeroReserva-DDMMRRHH24MISS.xml`

La descarga queda bloqueada si existen incidencias criticas. Si solo hay avisos, revisalos y deja evidencia interna de la decision.

---

## 7. SES y pre-check-in

![Panel SES y pre-check-in de prueba](screenshots/syncxml-es-precheckin-panel.png)

SyncXML incluye acciones SES asistidas. Su disponibilidad depende de credenciales, entorno y rol.

| Accion | Control |
| --- | --- |
| Validar XML SES | Validacion local contra reglas implementadas. |
| Preparar simulacion | Prepara una peticion sin enviar datos al Ministerio. |
| Enviar a preproduccion | Solo con credenciales configuradas y usuario permitido. |
| Consultar lote/comunicacion | Requiere credenciales y codigo de seguimiento. |
| Consultar catalogo | Revisa catalogos oficiales cuando SES esta configurado. |
| Produccion | Permanece bloqueada por defecto hasta aprobacion y evidencia. |

Los usuarios piloto no deben enviar a SES. Las rutas de envio aplican control de rol y fallan de forma segura si la configuracion no permite la accion.

### Pre-check-in de prueba

![Formulario publico de pre-check-in](screenshots/syncxml-es-precheckin-form.png)

El panel de pre-check-in genera enlaces temporales para completar datos de viajeros antes de la revision.

Controles del modo actual:

- Enlace temporal con expiracion.
- Token almacenado como hash.
- Sin imagenes de documentos.
- Sin registro legal completo.
- Estado operativo: pendiente, enviado, expirado o revocado.
- Revision humana antes de usar la informacion oficialmente.

---

## 8. Dashboard operativo

![Dashboard con reserva consolidada](screenshots/syncxml-es-dashboard-detail.png)

El dashboard permite buscar reservas, revisar estado y descargar XML cuando el modo de almacenamiento configurado lo permite.

### Controles de historial

| Control | Descripcion |
| --- | --- |
| Aislamiento por usuario | Cada usuario ve solo sus reservas persistidas. |
| Busqueda | Filtra por referencia o alojamiento. |
| Detalle | Muestra fechas, personas y viajeros detectados. |
| Descarga XML | Usa la ruta protegida de la reserva seleccionada. |
| Eliminacion | Borra la reserva accesible para el usuario actual. |
| Sesion pendiente | Permite retomar una operacion local en curso. |

Las fechas se muestran como `DD/MM/RRRR`. Si existe hora, se muestran como `DD/MM/RRRR HH:MM:SS`.

---

## 9. Feedback del piloto

La aplicacion incluye feedback durante el uso y al cerrar la experiencia.

### Que se debe enviar

| Tipo de feedback | Ejemplo util |
| --- | --- |
| Friccion operativa | "La correccion de municipio fue lenta." |
| Calidad de validacion | "El aviso de relacion no era claro." |
| Resultado del piloto | "Pude generar XML revisable con datos sinteticos." |
| Siguiente necesidad | "Necesito plantilla para mi PMS." |

### Que no se debe enviar

- Nombres, documentos, telefonos o emails de huespedes.
- XML con datos reales.
- Capturas con PII visible.
- Secretos, credenciales o tokens.

El feedback se envia al canal configurado del equipo Anclora y no sustituye soporte legal ni tecnico formal.

---

## 10. Seguridad y privacidad

SyncXML trabaja con informacion personal. Usa estos controles diarios:

| Control | Motivo |
| --- | --- |
| Minimizar datos | Reducir exposicion y superficie de riesgo. |
| Enmascarar por defecto | Evitar que documentos y contacto queden visibles sin necesidad. |
| Revisar antes de exportar | Evitar errores antes de uso oficial. |
| No almacenar imagenes | DNI/pasaporte no forman parte del almacenamiento actual. |
| Usar preproduccion | Probar SES antes de cualquier operacion real. |
| Borrar operaciones temporales | Eliminar reservas de prueba cuando terminen. |
| Controlar accesos | Solo usuarios aprobados deben abrir reservas con PII. |
| Evitar logs sensibles | No copiar PII en incidencias, chats o tickets. |

> SyncXML no ofrece asesoramiento legal. El responsable del tratamiento debe aprobar privacidad, DPA, retencion y procedimiento de uso.

---

## 11. Incidencias frecuentes

| Incidencia | Accion recomendada |
| --- | --- |
| No puedo iniciar sesion | Verifica email aprobado, contrasena y si la cuenta esta activa. |
| Me pide cambiar contrasena | Es una contrasena temporal; define una nueva antes de continuar. |
| El Excel no importa | Revisa extension, tamano, estructura y que no este vacio. |
| Falta codigo de municipio | Completa el codigo INE desde revision guiada. |
| Hay errores criticos | Corrige antes de generar o descargar XML. |
| SES rechaza una prueba | Conserva respuesta, lote/comunicacion y revisa el bloque de errores. |
| No veo una reserva | Comprueba que entraste con el mismo usuario que la consolido. |
| Necesito usar datos reales | Requiere autorizacion, entorno privado y aprobacion operativa previa. |

---

## 12. Glosario

| Termino | Significado |
| --- | --- |
| SES | Sistema oficial usado para comunicaciones de hospedajes. |
| XML | Archivo estructurado que contiene reserva y viajeros. |
| Preproduccion | Entorno de pruebas antes de produccion. |
| RBAC | Control de acceso basado en roles. |
| Owner | Usuario propietario de una reserva persistida. |
| Hash | Huella tecnica que identifica un dato sin guardar su valor original. |
| DPA | Contrato de encargado de tratamiento de datos. |
| PII | Informacion personal identificable. |
| INE | Instituto Nacional de Estadistica; fuente de codigos municipales. |

<div class="footer-brand">Anclora SyncXML · Manual de Usuario · Version 1.1 · 20 julio 2026</div>
