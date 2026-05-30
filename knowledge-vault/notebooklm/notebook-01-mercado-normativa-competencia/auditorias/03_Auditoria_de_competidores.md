Como analista senior de mercado especializado en software turístico y *legaltech* para alojamientos en España, he auditado la inteligencia competitiva del cuaderno documental. 

### Conclusión Ejecutiva

El mercado español de registro de viajeros bajo el RD 933/2021 está altamente polarizado. Por un lado, dominan los **ecosistemas 100% nube (SaaS)** que prometen envíos invisibles vía API, pero que sufren de "errores silenciosos" por datos incompletos de las OTAs. Por otro lado, reinan los **grandes PMS**, que imponen una curva de adopción excesiva para el pequeño propietario. 

**Anclora SyncXML** goza de un claro "océano azul" en el segmento de operadores que trabajan en Excel y exigen privacidad local. Sin embargo, se enfrenta a un **competidor directo altísimo (seshospedajes.es)** que ya ofrece importación desde Excel y a herramientas de bajísimo coste (Partee). La clave de supervivencia de Anclora no será la conectividad API, sino posicionarse como el **motor infalible de pre-validación local (anti-multas)**.

A continuación, presento la auditoría categorizada de todos los competidores extraídos de las fuentes.

---

### 1. Competidores Directos Altos
Soluciones que atacan directamente el nicho de cumplimiento normativo, enfocándose en pequeños propietarios y gestores, con modelos de precios agresivos o flujos similares a Anclora.

#### A. seshospedajes.es (Plataforma Privada / SES Hosting)
1. **Evidencia:** Páginas de producto y análisis comercial en el informe interno.
2. **SES.HOSPEDAJES explícito:** Sí. Su nombre comercial imita al Ministerio, aunque aclaran que son una plataforma privada.
3. **Integración:** Integración automática diaria vía API, pero también **permite importación de archivos Excel** y generación de XML.
4. **Cliente objetivo:** Propietarios individuales, pequeños alojamientos, hoteles, agencias y rent-a-car.
5. **Fortalezas:** Permite importar datos desde Excel, incluye enlace de pre-check-in, tiene un módulo para el informe anual VUD y ofrece representación legal para extranjeros sin certificado digital.
6. **Limitaciones:** Obliga a subir los datos a su nube privada. El precio escala drásticamente por volumen (de 2,99€ a 99,99€/mes). 
7. **Nivel de amenaza:** **Muy Alta**. Es el competidor que más se solapa con la propuesta de valor "Excel a XML" de Anclora.
8. **Dudas pendientes:** Posibles problemas de legalidad de marca (confusión con el portal oficial del Estado).

#### B. Chekin
1. **Evidencia:** Páginas web, manuales de soporte y análisis de mercado.
2. **SES.HOSPEDAJES explícito:** Sí, incluyen tutoriales paso a paso de cómo configurar las credenciales "+WS".
3. **Integración:** Integración automática vía Web Service (API) y asistencia manual con botón de "reenvío".
4. **Cliente objetivo:** Alquileres vacacionales, hoteles y gestores profesionales.
5. **Fortalezas:** Biometría, cobro de fianzas y tasas, integraciones con más de 35 PMS y envío 100% automatizado.
6. **Limitaciones:** Fricción operativa: si Airbnb oculta el email o falta el segundo apellido, la API de Chekin lanza un "error silencioso" y obliga al propietario a corregirlo y enviarlo a mano. 
7. **Nivel de amenaza:** **Alta**. Son el estándar de mercado en automatización.
8. **Dudas pendientes:** Fiabilidad de su gestión de errores sin una validación previa estricta.

#### C. Check-in Scan
1. **Evidencia:** Extensa documentación de su blog, guías de adaptación y web comercial.
2. **SES.HOSPEDAJES explícito:** Sí, poseen una guía oficial 2026 para la plataforma gubernamental.
3. **Integración:** Automática (Web Service) con una "cola de reintento" específica para caídas del servidor ministerial.
4. **Cliente objetivo:** Hostales, campings, complejos de apartamentos y casas rurales.
5. **Fortalezas:** Permite modo offline en zonas rurales sin cobertura. Altísima penetración de mercado (+8 millones de check-ins).
6. **Limitaciones:** 100% dependiente de la nube; exige la captura mediante su app o formulario web, alejando al usuario de sus propios Excels.
7. **Nivel de amenaza:** **Alta**. 
8. **Dudas pendientes:** ¿Permiten exportación manual de XML si falla su API de forma sostenida?

#### D. Partee
1. **Evidencia:** Web comercial y ficha de Google Play.
2. **SES.HOSPEDAJES explícito:** Sí, junto a Mossos y Ertzaintza.
3. **Integración:** Envío automático a las autoridades.
4. **Cliente objetivo:** Pequeños alojamientos, hoteles, hostales y viviendas de uso turístico.
5. **Fortalezas:** Precio extremadamente bajo (desde 1,49€/mes), sin costes de instalación, firma digital en pantalla de móvil y descarga de datos a Excel.
6. **Limitaciones:** Interfaz muy básica. Obliga a almacenar los partes legales en su nube.
7. **Nivel de amenaza:** **Alta**, debido a que compite en el mismo nicho de "pequeño propietario sensible al precio" que Anclora.
8. **Dudas pendientes:** Nivel de soporte real y resiliencia ante errores del Ministerio dado su bajísimo coste.

---

### 2. Competidores Directos Medios
Generan los archivos XML exigidos o cubren el flujo de envío, pero están orientados a segmentos de clientes distintos (hoteles grandes o usuarios de software cerrado).

#### A. Dispongo (Doblemente S.L.)
1. **Evidencia:** Artículo de soporte técnico para extraer XML.
2. **SES.HOSPEDAJES explícito:** Sí, guía detallada con los campos requeridos y mapeo de códigos.
3. **Integración:** Exportación de archivo XML manual para "Alta masiva" en el portal.
4. **Cliente objetivo:** Hoteles y empresas de alquiler de vehículos.
5. **Fortalezas:** Genera el archivo XML perfectamente estructurado. Incluye el esquema para *rent-a-car*.
6. **Limitaciones:** Es una funcionalidad encapsulada dentro de su PMS. No se vende por separado para usuarios de Excel.
7. **Nivel de amenaza:** **Media**. Valida que el modelo de "Generar XML y subir a mano" existe y es demandado, pero no compite por el mismo cliente independiente.
8. **Dudas pendientes:** N/A.

#### B. Civitfun
1. **Evidencia:** Web corporativa, manuales técnicos.
2. **SES.HOSPEDAJES explícito:** Sí. Detallan la subida de XML y TXT.
3. **Integración:** Envío automatizado vía API, y generación de ficheros XML/TXT.
4. **Cliente objetivo:** Cadenas hoteleras, resorts y grandes gestores.
5. **Fortalezas:** Kioscos físicos de auto check-in (Paperless), control de fraude en pagos (upselling y cross-selling).
6. **Limitaciones:** Sobredimensionado y costoso para un anfitrión con 1 a 5 propiedades.
7. **Nivel de amenaza:** **Baja/Media**. Operan en una liga "Enterprise" donde Anclora no compite.
8. **Dudas pendientes:** N/A.

---

### 3. Competidores Indirectos
Ofrecen cumplimiento normativo, pero su negocio principal es la gestión integral del alojamiento (PMS / Channel Managers). 

#### A. Cloudbeds
1. **Evidencia:** Centro de soporte y análisis de mercado.
2. **SES.HOSPEDAJES explícito:** Sí, módulo específico de "Spain Police Report".
3. **Integración:** Generación automática diaria de los XML requeridos.
4. **Cliente objetivo:** Hoteles medios, hostales, agrupaciones de VUT.
5. **Fortalezas:** Cumplimiento integrado sin coste extra para sus clientes. Genera tanto "Partes de Viajeros" como "Reservas".
6. **Limitaciones:** Fricción alta: obliga al usuario a buscar a mano los códigos de municipio del INE. **Punto crítico:** Tiene un fallo documentado por el que manda el método de pago como "OTRO", con promesa de solución para el Q4 de 2025.
7. **Nivel de amenaza:** **Baja** (quien usa Cloudbeds no usará Anclora). Pero es una gran **oportunidad comercial** si Anclora se ofrece para parchar esa limitación temporal.
8. **Dudas pendientes:** ¿Lograrán solventar su "brecha de pagos" antes del cierre de 2025?

#### B. Lodgify, Smoobu, Avirato
1. **Evidencia:** Web y guías de integración.
2. **SES.HOSPEDAJES explícito:** Sí. Lodgify tiene guías específicas sobre cómo darse de alta.
3. **Integración:** Típicamente recogen los datos, pero derivan la comunicación policial automatizada a integraciones de terceros (ej. Check-in Scan o Chekin) a través de su *Marketplace*.
4. **Cliente objetivo:** Propietarios profesionales y gestores vacacionales.
5. **Fortalezas:** Suites todo-en-uno que resuelven el calendario, los pagos y las OTAs.
6. **Limitaciones:** Dependen de pagar suscripciones extra a apps de check-in para un reporte policial fluido en España.
7. **Nivel de amenaza:** **Baja**.
8. **Dudas pendientes:** N/A.

---

### 4. Complementarios
#### A. Vikey
1. **Evidencia:** Web y casos de estudio.
2. **SES.HOSPEDAJES explícito:** Sí, mencionan el envío al portal de Hospedajes.
3. **Integración:** Envío automático de datos y escaneo de identidad.
4. **Cliente objetivo:** Propietarios que buscan domotizar su alojamiento (apertura remota).
5. **Fortalezas:** Hardware y software unificado. Abre la puerta solo cuando se validan los datos.
6. **Limitaciones:** Altísima barrera de entrada por el coste del hardware domótico.
7. **Nivel de amenaza:** **Baja**. Son complementarios; Anclora se enfoca en el dato, Vikey en la cerradura.
8. **Dudas pendientes:** Eficacia real de su integración API ante rechazos de SES por campos faltantes.

---

### 5. No competidor claro
#### A. HolidayHero
1. **Evidencia:** Artículo de soporte.
2. **SES.HOSPEDAJES explícito:** Sí.
3. **Integración:** Instrucciones de "Onboarding" y registro en la plataforma.
4. **Cliente objetivo:** Alojamientos que buscan una App de invitado (Guest App).
5. **Nivel de amenaza:** **Nula**. Actúa como una interfaz de experiencia del huésped, usando integraciones de terceros para lo gubernamental.

---

### Implicaciones Prácticas y Estratégicas para Anclora SyncXML

1. **Evitar la falsa promesa del "100% Automático":** La evidencia muestra que empresas como Chekin sufren por los "errores silenciosos" cuando una OTA (como Airbnb) no envía datos obligatorios (ej. email). Anclora debe venderse como el **filtro de pre-validación que garantiza que el Excel es perfecto** antes de generar el XML.
2. **Auditar agresivamente a seshospedajes.es:** Es el competidor directo más letal. Sin embargo, su modelo de cobrar más cuantos más partes envías genera rechazo. Anclora debería ofrecer un modelo de "tarifa plana" o licencia por software local para neutralizarlos.
3. **Capitalizar la "Brecha de Pagos" de los PMS:** Cloudbeds es incapaz, al menos hasta finales de 2025, de desglosar correctamente la tarjeta de crédito para SES.HOSPEDAJES. Anclora puede posicionarse comercialmente como un "parche táctico" para usuarios de Cloudbeds y otros PMS que necesiten enviar transacciones financieras sin fallos legales.