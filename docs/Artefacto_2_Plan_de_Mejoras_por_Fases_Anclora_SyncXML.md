# Plan de Mejoras por Fases para Optimizar Anclora SyncXML

> **Proyecto:** Anclora SyncXML — Caso de uso Villa Kentia (Mallorca)
> **Naturaleza del documento:** Plan operativo de ejecución
> **Fecha de elaboración:** Mayo 2026
> **Documento complementario:** "Análisis Exhaustivo Integrado de la Base Documental de Anclora SyncXML"
> **Versión:** 1.0

---

## Propósito y principios de ejecución

Este plan organiza la evolución de Anclora SyncXML en **siete fases secuenciales**. Cada fase produce un producto entregable y vendible, de modo que la inversión se recupera de forma escalonada y no se acumula riesgo en un desarrollo monolítico.

El plan se rige por tres principios obligatorios, extraídos del consenso de la base documental:

1. **Estabilizar antes que ampliar.** Ninguna funcionalidad nueva se desarrolla sobre un núcleo inseguro. El propósito de este principio es evitar multiplicar el riesgo: construir integraciones sobre fundaciones rotas degrada el producto en lugar de mejorarlo.
2. **Cerrar el alcance antes de presupuestar.** Cada fase parte de un alcance escrito. El propósito es impedir la expansión incontrolada del trabajo y proteger la rentabilidad.
3. **Verificar contra la fuente oficial.** Toda afirmación de conformidad se sostiene en el XSD oficial y en un XML real aceptado. El propósito es no asumir responsabilidad legal indebida.

La numeración de las fases es vinculante: **deberás ejecutarlas en orden**. Las dependencias declaradas en cada fase impiden adelantar trabajo sin haber consolidado el anterior.

### Cuadro resumen de fases

| Fase | Denominación | Prioridad | Resultado comercial habilitado |
|---|---|---|---|
| 1 | Diagnóstico funcional y normalización de la base de conocimiento | Crítica | Alcance cerrado y presupuestable |
| 2 | Hardening técnico y de seguridad del núcleo | Crítica | Producto fiable, vendible como conversor validado |
| 3 | Motor de validación y mapeador flexible de orígenes | Alta | Producto adaptable a varios formatos |
| 4 | Experiencia profesional, historial y trazabilidad | Alta | Herramienta operativa recurrente |
| 5 | Pre-check-in y automatización asistida del envío | Media | Escritorio de cumplimiento; reducción del trabajo manual |
| 6 | Gobernanza, cumplimiento RGPD y control de calidad | Alta | Seguridad jurídica; producto auditable |
| 7 | Escalado multipropiedad, B2B y mejora continua | Media | Plataforma; ingresos recurrentes y de mayor margen |

---

## FASE 1 — Diagnóstico funcional y normalización de la base de conocimiento

### 1.1. Objetivo

Establecer una base de conocimiento única, verificada y sin contradicciones sobre el estado real del producto, el flujo de datos del cliente y los requisitos normativos, antes de escribir una sola línea de código nuevo.

### 1.2. Justificación

La base documental contiene contradicciones de parámetro —dos descripciones del stack tecnológico, cifras de ahorro divergentes, rangos sancionadores distintos— y deja sin resolver el flujo de datos real de Villa Kentia. Ejecutar desarrollo sobre información no verificada conduce a construir funcionalidades equivocadas. Esta fase elimina esa incertidumbre y convierte hipótesis en hechos accionables.

### 1.3. Acciones concretas

1. **Auditar el estado real del repositorio.** Confirma el stack tecnológico vigente (React/Vite frente a Next.js/Prisma), el cableado real del cifrado y la persistencia, y la cobertura de tests existente.
2. **Mantener una sesión de descubrimiento estructurada con la propietaria de Villa Kentia.** Aplica el cuestionario de validación: origen del Excel, canales de reserva, uso o no de Lodgify como centro operativo, destino del XML, volumen anual de reservas, número de propiedades y política de almacenamiento deseada.
3. **Obtener un XML real previamente aceptado por SES.HOSPEDAJES.** Es el patrón de oro de compatibilidad; sin él no puede afirmarse conformidad.
4. **Descargar y archivar el XSD oficial de SES.HOSPEDAJES** y la guía operativa vigente.
5. **Verificar el régimen sancionador** contra el texto normativo en vigor, resolviendo la divergencia entre los documentos de la base.
6. **Construir la tabla maestra de campos**: obligatorios y opcionales, con reglas de validación por campo (formato, rango, dependencias como la regla de municipio según país).
7. **Consolidar un único documento de alcance cerrado** que recoja qué hará el producto, qué no hará y bajo qué supuestos.

### 1.4. Entregables

1. Informe de auditoría del repositorio con el stack y el estado real confirmados.
2. Acta de la sesión de descubrimiento con el flujo de datos real de Villa Kentia identificado.
3. XML de referencia aceptado por SES, archivado.
4. XSD oficial y guía operativa archivados.
5. Tabla maestra de campos con reglas de validación.
6. Documento de alcance cerrado, firmado por ambas partes.

### 1.5. Criterios de éxito

1. El escenario de flujo de datos de Villa Kentia (A, B o C) está identificado de forma inequívoca.
2. El stack tecnológico real está confirmado y documentado.
3. Existe al menos un XML real aceptado como referencia.
4. El documento de alcance no contiene ambigüedades pendientes.

### 1.6. Riesgos

1. **La propietaria no dispone de un XML aceptado.** Mitigación: generar uno con el producto actual y validarlo manualmente en el portal antes de continuar.
2. **El flujo de datos resulta ser más complejo de lo previsto.** Mitigación: ampliar el alcance de la Fase 3, no improvisar en fases posteriores.
3. **La sesión de descubrimiento no se concreta.** Mitigación: no iniciar la Fase 2 sin alcance cerrado.

### 1.7. Prioridad

**Crítica.** Es la única fase que no puede omitirse ni solaparse. Todas las demás dependen de ella.

### 1.8. Dependencias

Ninguna. Es la fase inicial.

### 1.9. Resultado esperado

Una base de conocimiento verificada, sin contradicciones, que permite presupuestar con precisión y dirigir el desarrollo hacia las funcionalidades que el caso real exige.

---

## FASE 2 — Hardening técnico y de seguridad del núcleo

### 2.1. Objetivo

Corregir la totalidad de la deuda técnica crítica identificada en el análisis, de modo que el producto pueda manejar datos personales sensibles y generar XML de forma fiable y segura.

### 2.2. Justificación

El producto actual presenta defectos bloqueantes: autenticación que falla en abierto, persistencia del XML rota, cifrado no cableado, parser que interpreta mal el Excel y validación opcional. Mientras existan, el producto no puede comercializarse como herramienta de cumplimiento sin asumir un riesgo de seguridad y de confianza inaceptable. Esta fase transforma un MVP frágil en un producto fiable.

### 2.3. Acciones concretas

1. **Corregir el parser del Excel** para que segmente automáticamente la zona tabular de huéspedes y la zona inferior de metadatos de reserva y establecimiento. El producto debe extraer exactamente 7 huéspedes del archivo de Villa Kentia, no 24.
2. **Extraer los metadatos de reserva** del bloque inferior: código de establecimiento, referencia, fechas y horas de entrada/salida, fecha de contrato, número de personas y tipo de pago.
3. **Implementar denegación por defecto en la autenticación.** El acceso debe quedar bloqueado si faltan o están mal configuradas las variables de entorno. Eliminar cualquier vía de fail-open.
4. **Reparar la persistencia del XML.** La ruta de descarga debe devolver el XML realmente generado, no la estructura del Excel parseado.
5. **Cablear el cifrado AES-256-GCM al flujo real** de creación de reservas, de modo que todo archivo almacenado se cifre efectivamente.
6. **Mover la validación crítica al backend** y hacerla obligatoria antes de cualquier exportación: letra de control de DNI/NIE (módulo 23), nacionalidad ISO3, orden de fechas, formato de correo, longitud de teléfonos.
7. **Eliminar los valores por defecto peligrosos.** Los campos sin dato (`sexo`, `parentesco`, `codigoMunicipio`) deben marcarse como faltantes y bloquear la consolidación si son críticos, en lugar de rellenarse con valores inventados.
8. **Corregir el cálculo de zona horaria** para que el offset se determine según la fecha y la ubicación del establecimiento, no fijado a `+02:00`.
9. **Corregir el detector de placeholders** para que no marque fechas legítimas como falsos positivos.
10. **Implementar rate limiting** en las rutas de autenticación y añadir cobertura de tests de regresión para los casos límite.

### 2.4. Entregables

1. Parser corregido con segmentación de zonas, verificado contra el Excel real.
2. Sistema de autenticación con denegación por defecto.
3. Flujo de persistencia y descarga del XML reparado.
4. Cifrado de archivos cableado y verificado.
5. Motor de validación obligatorio en backend.
6. Suite de tests de regresión ampliada.

### 2.5. Criterios de éxito

1. El Excel de Villa Kentia produce 7 huéspedes y los metadatos de reserva se trasladan correctamente al contrato.
2. El número de personas del XML coincide con el de huéspedes válidos.
3. La descarga devuelve el XML real en todos los modos de instalación.
4. Ningún XML se genera con valores `texto` o `00000` sin advertencia.
5. La aplicación deniega el acceso si las variables de entorno no están configuradas.
6. La validación crítica no puede omitirse desde la interfaz.

### 2.6. Riesgos

1. **La corrección del parser introduce regresiones.** Mitigación: ampliar los tests antes de modificar el código.
2. **El cifrado afecta al rendimiento.** Mitigación: medir y optimizar; el cifrado no es negociable.
3. **El alcance de la deuda técnica resulta mayor de lo previsto.** Mitigación: priorizar los defectos 1 a 8 del análisis; el resto puede diferirse a una iteración interna de la Fase 3.

### 2.7. Prioridad

**Crítica.** Es la fase que convierte el producto en comercializable. No puede omitirse.

### 2.8. Dependencias

Depende de la Fase 1: requiere el estado real del repositorio confirmado y la tabla maestra de campos.

### 2.9. Resultado esperado

Un producto técnicamente fiable y seguro, vendible como conversor validado Excel→XML para Villa Kentia, con la promesa comercial respaldada por el comportamiento real del software.

---

## FASE 3 — Motor de validación y mapeador flexible de orígenes

### 3.1. Objetivo

Dotar al producto de validación contra el esquema oficial y de la capacidad de aceptar archivos Excel o CSV con estructuras distintas de la del formato verificado.

### 3.2. Justificación

El producto actual valida con reglas internas, lo que no garantiza la conformidad técnica del XML ante SES. Además, está acoplado a un único formato de Excel, lo que impide procesar exportaciones de otros canales (Booking, Airbnb, Lodgify). Esta fase elimina ambas limitaciones y convierte el "custom mapping" en un activo monetizable, no en deuda técnica.

### 3.3. Acciones concretas

1. **Integrar la validación contra el XSD oficial de SES.HOSPEDAJES**, ejecutada automáticamente tras la generación del XML.
2. **Implementar feedback de error granular.** Cuando la validación falla, el producto debe señalar el nodo concreto, el tipo de error y, cuando sea posible, una sugerencia de corrección. No es admisible un mensaje genérico.
3. **Bloquear la descarga del XML si no supera la validación XSD.**
4. **Desarrollar un mapeador visual de columnas.** El usuario debe poder cargar un Excel de cabeceras no estándar y asignar cada columna al campo correspondiente del modelo de datos.
5. **Implementar detección automática de cabeceras** con mecanismo de respaldo al mapeo manual.
6. **Permitir guardar plantillas de mapeo por origen** (Villa Kentia manual, exportación de Lodgify, exportación de Booking, otro PMS).
7. **Generar un informe de campos no mapeados** antes de permitir la importación.
8. **Reforzar los normalizadores** de municipios, países ISO3, teléfonos y documentos, con cobertura de casos internacionales.

### 3.4. Entregables

1. Módulo de validación XSD integrado y operativo.
2. Sistema de feedback de error a nivel de campo.
3. Mapeador visual de columnas con detección automática de cabeceras.
4. Biblioteca de plantillas de mapeo por origen.
5. Normalizadores reforzados con tests internacionales.

### 3.5. Criterios de éxito

1. Ningún XML que no supere la validación XSD puede descargarse.
2. Los errores de validación se explican a nivel de nodo y campo.
3. El producto procesa un Excel de formato distinto del verificado mediante mapeo manual, sin tocar código.
4. La tasa de rechazo de XML en SES tiende a cero por causas de formato.

### 3.6. Riesgos

1. **El XSD oficial no está disponible públicamente o cambia.** Mitigación: archivar la versión obtenida en la Fase 1 y versionar el motor de validación.
2. **El mapeador añade complejidad excesiva a la interfaz.** Mitigación: ocultarlo tras la detección automática; solo aparece cuando esta falla.

### 3.7. Prioridad

**Alta.** Es la fase que diferencia el producto frente a competidores y elimina su mayor limitación funcional.

### 3.8. Dependencias

Depende de la Fase 2: requiere el parser corregido y el motor de validación de backend operativo. La integración del XSD requiere el esquema archivado en la Fase 1.

### 3.9. Resultado esperado

Un producto que garantiza la conformidad técnica del XML y se adapta a múltiples formatos de origen sin desarrollo adicional, habilitando la venta a clientes con exportaciones distintas de la de referencia.

---

## FASE 4 — Experiencia profesional, historial y trazabilidad

### 4.1. Objetivo

Transformar el producto en una herramienta operativa que un usuario no técnico pueda utilizar de forma recurrente y con confianza, con historial de operaciones y trazabilidad completa.

### 4.2. Justificación

El producto actual muestra el XML crudo como resultado final, lo que resulta poco profesional para un usuario no técnico, y carece de historial. Para que Villa Kentia lo use cada temporada, necesita una experiencia guiada, comprensible y con memoria de las reservas procesadas. Esta fase eleva el valor percibido y habilita el cobro como herramienta profesional.

### 4.3. Acciones concretas

1. **Diseñar un flujo guiado por pasos**: importar, resumen de reserva, revisión de huéspedes, corrección de errores, vista visual del XML, consolidar y descargar.
2. **Implementar la vista visual del XML** mediante tarjetas o árbol jerárquico, con alternancia entre vista visual y vista XML avanzada.
3. **Añadir un validador visual por huésped** con semáforo de severidad: válido, advertencia, error crítico.
4. **Habilitar la edición previa al XML**, de modo que el usuario corrija campos faltantes sin modificar el Excel de origen.
5. **Implementar el resumen final de consolidación**: registros existentes, nuevos, duplicados y total consolidado, con resaltado de los registros recién añadidos.
6. **Condicionar el botón de consolidar** a la ausencia de errores críticos.
7. **Desarrollar el historial local de reservas procesadas**, con búsqueda por referencia, fecha o huésped, y descarga del XML anterior sin reprocesar.
8. **Implementar la detección de duplicados** entre reservas y contra el XML existente.
9. **Generar nombres de archivo normalizados** para los XML descargados.
10. **Exportar un informe de validación** en PDF o CSV por reserva.

### 4.4. Entregables

1. Interfaz de flujo guiado por pasos.
2. Vista visual del XML con alternancia de modos.
3. Validador visual por huésped con semáforo.
4. Editor de corrección previo a la generación.
5. Historial de reservas con búsqueda y descarga.
6. Informe de validación exportable.

### 4.5. Criterios de éxito

1. El usuario no técnico determina si todo está correcto sin leer el XML.
2. Los errores se comunican en lenguaje simple y por severidad.
3. El botón de consolidar solo se habilita sin errores críticos.
4. Es posible revisar y volver a descargar reservas anteriores.
5. Los duplicados se detectan antes de la consolidación.

### 4.6. Riesgos

1. **El rediseño de la interfaz alarga el desarrollo.** Mitigación: priorizar el flujo guiado y la vista visual; el historial avanzado puede dividirse.
2. **El historial local introduce obligaciones de retención.** Mitigación: coordinar con la Fase 6; definir la política de retención antes de activar el historial.

### 4.7. Prioridad

**Alta.** Es la fase que convierte una demo en un producto profesional vendible.

### 4.8. Dependencias

Depende de las Fases 2 y 3: requiere el núcleo estable y el motor de validación para alimentar el semáforo y los informes.

### 4.9. Resultado esperado

Una herramienta operativa que Villa Kentia puede usar cada temporada con autonomía y confianza, con historial y trazabilidad, justificando el modelo de precio profesional.

---

## FASE 5 — Pre-check-in y automatización asistida del envío

### 5.1. Objetivo

Atacar los dos mayores cuellos de botella restantes: la obtención de los datos faltantes de los huéspedes y el envío manual del XML a SES.HOSPEDAJES.

### 5.2. Justificación

Incluso con el producto estable y profesional, persisten dos tareas manuales: perseguir a los huéspedes para completar datos y subir el XML al portal oficial. El pre-check-in resuelve la primera; el asistente de envío reduce la segunda. Esta fase acerca el producto al cumplimiento operativo completo, manteniendo la honestidad sobre lo que el producto garantiza.

### 5.3. Acciones concretas

1. **Generar un enlace seguro y único por reserva** para que el huésped complete sus propios datos.
2. **Desarrollar un formulario de pre-check-in** para el titular y los acompañantes, con validación de documento, fecha de nacimiento, nacionalidad, teléfono, correo y dirección.
3. **Incorporar consentimiento y aviso de privacidad** en el formulario, recogiendo solo los campos exigidos por la normativa.
4. **No almacenar copia del DNI ni del pasaporte.** Cualquier extracción de datos debe realizarse sin retener imágenes del documento, conforme a la directriz de la AEPD.
5. **Implementar la captura de firma digital** para los huéspedes mayores de 14 años, cuando la normativa lo exija.
6. **Desarrollar el asistente de envío a SES**: en una primera iteración, un asistente que facilita la subida manual; posteriormente, integración con el servicio web del Ministerio si resulta técnicamente viable.
7. **Implementar el seguimiento de estado por reserva**: generado, descargado, enviado, aceptado, rechazado.
8. **Registrar los errores del portal y habilitar reintentos.**
9. **Añadir recordatorios** de reservas pendientes antes del plazo legal de 24 horas.

### 5.4. Entregables

1. Módulo de pre-check-in con enlace seguro por reserva.
2. Formulario de huéspedes con validación y consentimiento RGPD.
3. Captura de firma digital.
4. Asistente de envío a SES con seguimiento de estado.
5. Sistema de recordatorios de plazo.

### 5.5. Criterios de éxito

1. La propietaria deja de recopilar datos por mensajería y de copiarlos manualmente.
2. El formulario no almacena imágenes de documentos.
3. El estado de cada XML es visible y trazable.
4. Los recordatorios se emiten antes del vencimiento del plazo legal.

### 5.6. Riesgos

1. **El servicio web de SES no está disponible o requiere certificados complejos.** Mitigación: limitar la primera iteración al asistente de subida manual; no prometer envío automático sin viabilidad confirmada.
2. **La captura de firma introduce obligaciones legales adicionales.** Mitigación: validar el requisito normativo en la Fase 1 y coordinar con la Fase 6.
3. **El pre-check-in amplía la superficie de tratamiento de datos.** Mitigación: aplicar minimización estricta y coordinar con la Fase 6 antes de su activación.

### 5.7. Prioridad

**Media.** Aporta valor alto, pero no es condición de comercialización. Se ejecuta tras consolidar el producto profesional.

### 5.8. Dependencias

Depende de las Fases 2, 3 y 4: requiere el núcleo estable, la validación y la experiencia profesional. La integración con SES depende de la viabilidad técnica confirmada en la Fase 1.

### 5.9. Resultado esperado

Un escritorio de cumplimiento documental que reduce el trabajo manual al mínimo, con la propuesta de valor evolucionada hacia "deja de copiar datos entre canales y el portal oficial".

---

## FASE 6 — Gobernanza, cumplimiento RGPD y control de calidad

### 6.1. Objetivo

Garantizar que el producto cumple el marco legal de protección de datos, mantiene consistencia y dispone de un sistema de control de calidad permanente.

### 6.2. Justificación

El producto trata datos personales sensibles de huéspedes. Sin una política de retención conforme a la obligación legal de 3 años, sin los documentos legales mínimos y sin control de calidad, el producto expone a la propietaria y al desarrollador a un riesgo legal. Esta fase convierte el cumplimiento normativo en una garantía verificable, no en una declaración de intenciones.

> **Nota de secuenciación:** esta fase tiene prioridad alta y, aunque se numera en sexto lugar, sus elementos legales mínimos (documentos contractuales y política de retención) **deben estar resueltos antes de cobrar al cliente y antes de activar el historial de la Fase 4**. La numeración indica el cierre formal de la gobernanza, no el momento de iniciar su preparación.

### 6.3. Acciones concretas

1. **Resolver la incongruencia entre borrado lógico y retención legal.** Definir si el producto es sistema de registro —y entonces conservar 3 años— o capa de transformación previa —y declararlo con claridad.
2. **Implementar la política de retención** conforme a la decisión anterior, con borrado automático de datos fuera del plazo.
3. **Redactar y poner en vigor los documentos legales mínimos**: Términos de Servicio, Política de Privacidad, Contrato de Encargado de Tratamiento (DPA) y Política de Cookies.
4. **Auditar el tratamiento de datos** para confirmar la minimización: solo se procesan y conservan los campos exigidos por SES.
5. **Implementar un registro de auditoría completo y visible**: qué se generó, cuándo, con qué datos y bajo qué reserva, sin registrar datos personales en los logs.
6. **Establecer un sistema de control de calidad permanente**: suite de tests de regresión que se ejecuta ante cada cambio, con cobertura del Excel real, el XML real y los casos de error.
7. **Implementar la rotación de claves de cifrado** de forma periódica.
8. **Documentar el procedimiento de respuesta** ante un cambio de esquema XML por parte de SES.

### 6.4. Entregables

1. Política de retención implementada y documentada.
2. Términos de Servicio, Política de Privacidad, DPA y Política de Cookies en vigor.
3. Informe de auditoría de minimización de datos.
4. Registro de auditoría operativo y visible.
5. Suite de control de calidad automatizada.
6. Procedimiento documentado de respuesta a cambios normativos.

### 6.5. Criterios de éxito

1. La política de retención es coherente con la obligación legal de 3 años.
2. Todos los documentos legales están firmados antes del primer cobro.
3. No se almacena ningún dato no exigido por la normativa.
4. El registro de auditoría documenta cada operación sin exponer datos personales.
5. Ningún cambio de código se despliega sin superar la suite de calidad.

### 6.6. Riesgos

1. **La redacción del DPA y los documentos legales requiere asesoría jurídica.** Mitigación: emplear plantillas estándar adaptadas al RGPD español y revisión legal; presupuestar el coste.
2. **La política de retención entra en conflicto con el deseo del cliente.** Mitigación: la obligación legal prevalece; explicar al cliente que la retención protege a ambas partes.
3. **El control de calidad ralentiza el desarrollo.** Mitigación: la automatización compensa el coste inicial; el control de calidad no es negociable.

### 6.7. Prioridad

**Alta.** El incumplimiento RGPD es un riesgo legal directo. Sus elementos mínimos condicionan el inicio del cobro.

### 6.8. Dependencias

Depende de la Fase 1 (verificación normativa) y se coordina con las Fases 4 y 5, cuyas funcionalidades de almacenamiento y recogida de datos no deben activarse sin la gobernanza resuelta.

### 6.9. Resultado esperado

Un producto jurídicamente sólido, auditable y con control de calidad permanente, que protege a la propietaria y al desarrollador frente al riesgo regulatorio y de protección de datos.

---

## FASE 7 — Escalado multipropiedad, B2B y mejora continua

### 7.1. Objetivo

Habilitar la evolución del producto desde una herramienta para una propiedad hacia una plataforma capaz de servir a gestorías y a partners B2B, con un proceso de mejora continua.

### 7.2. Justificación

Una vez consolidado el producto para Villa Kentia, la base documental identifica un mercado más amplio: gestores de propiedades, pequeñas cadenas y partners B2B/white-label. Esta fase convierte el producto en plataforma y abre las vías de ingreso recurrente y de mayor margen. No debe abordarse antes de tener un producto maduro, para no dispersar el esfuerzo.

### 7.3. Acciones concretas

1. **Implementar la gestión multipropiedad**: panel de propiedades, plantillas de establecimiento por propiedad y configuración independiente para cada una.
2. **Desarrollar importadores por canal**: exportaciones de Lodgify, Booking y Airbnb, con detección de duplicados por referencia y fechas, y un asistente de unificación de varios ficheros en un set único.
3. **Implementar roles de usuario** para equipos: propietaria, gestora, asistente.
4. **Publicar una API documentada** que permita a PMS y partners enviar datos al producto.
5. **Desarrollar la capa white-label** para gestores y partners que revendan el producto con su marca.
6. **Implementar la facturación consolidada** para clientes de tipo agencia.
7. **Establecer un ciclo de mejora continua**: medición de métricas de uso, recogida de feedback, priorización trimestral y vigilancia normativa permanente del marco SES y del marco adyacente (Ventanilla Única Digital, registros de arrendamiento).

### 7.4. Entregables

1. Módulo multipropiedad con plantillas y configuración por establecimiento.
2. Importadores por canal con detección de duplicados.
3. Sistema de roles de usuario.
4. API pública documentada.
5. Capa white-label operativa.
6. Sistema de facturación consolidada.
7. Proceso de mejora continua con vigilancia normativa.

### 7.5. Criterios de éxito

1. Una misma instalación gestiona varias propiedades sin mezclar códigos de establecimiento.
2. Los importadores por canal eliminan la consolidación manual de exportaciones.
3. Un partner puede integrar el producto vía API.
4. El proceso de mejora continua produce una priorización revisada cada trimestre.

### 7.6. Riesgos

1. **El escalado se aborda antes de tener un producto maduro.** Mitigación: no iniciar esta fase sin las Fases 1 a 6 cerradas.
2. **Las integraciones por canal asumen formatos que cambian.** Mitigación: construirlas sobre el mapeador flexible de la Fase 3; no acoplarlas a un formato fijo.
3. **El modelo B2B exige soporte y mantenimiento crecientes.** Mitigación: dimensionar el precio y la capacidad de soporte antes de captar partners.

### 7.7. Prioridad

**Media.** Es la fase de mayor potencial de ingresos, pero también la de mayor riesgo si se aborda de forma prematura.

### 7.8. Dependencias

Depende de la totalidad de las fases anteriores. Requiere un producto estable, validado, profesional, automatizado y jurídicamente sólido.

### 7.9. Resultado esperado

Una plataforma de cumplimiento documental escalable, con vías de ingreso recurrente y B2B/white-label de alto margen, sostenida por un proceso de mejora continua que la mantiene alineada con un entorno normativo cambiante.

---

## Síntesis del plan y secuencia de monetización

La ejecución secuencial de las siete fases permite recuperar la inversión de forma escalonada y alinear cada incremento de precio con un incremento real de valor.

| Fase completada | Producto resultante | Modelo de monetización habilitado |
|---|---|---|
| Fase 1 | Alcance cerrado | Presupuesto cerrado, sin riesgo de expansión |
| Fase 2 | Conversor validado y seguro | Pago único de setup (~450 €), o cuota baja |
| Fase 3 | Producto adaptable y conforme XSD | Setup más mantenimiento; venta a clientes con otros formatos |
| Fase 4 | Herramienta operativa profesional | Modelo mixto: pago único más mantenimiento anual (~99 €/año) |
| Fase 5 | Escritorio de cumplimiento | Cuota recurrente superior; reducción de trabajo manual demostrable |
| Fase 6 | Producto jurídicamente sólido | Condición para cobrar con garantías; reduce el riesgo de ambas partes |
| Fase 7 | Plataforma multipropiedad y B2B | SaaS por propiedad, plan agencia y white-label de alto margen |

La regla de oro del plan es invariable: **no se avanza a una fase sin haber cerrado las dependencias de la anterior**. El propósito de esta regla es proteger la rentabilidad y la confianza del cliente, evitando que el producto crezca sobre fundaciones débiles.

---

*Documento elaborado en mayo de 2026 como plan operativo del proyecto Anclora SyncXML. Su ejecución está condicionada a la resolución previa de la Fase 1 y a la verificación de las incertidumbres declaradas en el documento de análisis complementario.*
