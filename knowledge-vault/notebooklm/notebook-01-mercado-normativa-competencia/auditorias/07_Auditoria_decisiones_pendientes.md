Basado en la auditoría del repositorio documental y nuestra conversación, he sistematizado las decisiones estratégicas y técnicas que debes resolver antes de avanzar con el desarrollo y lanzamiento de Anclora SyncXML. 

A continuación, presento el panel de decisiones pendientes clasificado por áreas.

### 1. Producto
*   **Decisión pendiente:** Cómo resolver la fricción de la introducción manual de 21 campos (incluyendo métodos de pago y parentescos) en un Excel local.
*   **Por qué importa:** El RD 933/2021 exige datos que no están en el documento de identidad. Si el usuario debe teclearlos a mano, la fricción será enorme.
*   **Información aportada:** Anclora se basa en la importación de Excel/XLSX y planea un pre-check-in web ligero a futuro.
*   **Información que falta:** ¿Aceptará el usuario teclear manualmente todos esos datos para preservar su privacidad local, o preferirá la comodidad de enviar un enlace como hace la competencia?
*   **Riesgo de decidir sin más datos:** Construir un producto que los usuarios abandonen a la semana por ser demasiado tedioso frente a opciones en la nube.
*   **Acción recomendada:** Desarrollar de inmediato el MVP del "Pre-check-in web ligero sin base de datos persistente" para que el Excel se pueble automáticamente.
*   **Prioridad:** **Alta**.

### 2. Normativa
*   **Decisión pendiente:** Cómo abordar las nuevas obligaciones de la Ventanilla Única Digital (VUD) y el modelo VAU/1560/2025.
*   **Por qué importa:** La normativa exige a los anfitriones un informe anual (VAU/1560) y el registro VUD desde 2025 para operar en OTAs.
*   **Información aportada:** Competidores directos como *Check-in Scan* y *seshospedajes.es* ya ofrecen la generación de estos modelos fiscales/informativos.
*   **Información que falta:** ¿Integrará Anclora la exportación de datos para la VUD y la Orden VAU en su hoja de cálculo?
*   **Riesgo de decidir sin más datos:** Quedar posicionado como un producto "incompleto" que solo resuelve una parte (SES) del problema legal del propietario.
*   **Acción recomendada:** Investigar los esquemas técnicos del VUD y VAU e integrarlos como una funcionalidad "Premium" del Excel.
*   **Prioridad:** **Alta**.

### 3. SES.HOSPEDAJES
*   **Decisión pendiente:** Viabilidad técnica de la conexión "Web Service" (API) desde una aplicación de escritorio local.
*   **Por qué importa:** El Ministerio permite la conexión máquina-a-máquina generando credenciales `+WS`.
*   **Información aportada:** El manual técnico y competidores (Chekin, Check-in Scan) documentan el uso del Web Service.
*   **Información que falta:** No hay evidencia de que el servidor gubernamental permita peticiones API desde IPs dinámicas (el router de una casa) sin certificados SSL de un servidor central autorizado.
*   **Riesgo de decidir sin más datos:** Basar la "Fase 2" del producto en una automatización que el firewall del Ministerio bloqueará por defecto.
*   **Acción recomendada:** Programar un *script* de prueba desde un PC local usando credenciales `+WS` reales para comprobar si el Ministerio devuelve un `SUCCESS` o rechaza la conexión.
*   **Prioridad:** **Alta**.

### 4. RGPD y Privacidad
*   **Decisión pendiente:** Cómo asegurar el estándar PCI-DSS al manejar tarjetas de crédito en local.
*   **Por qué importa:** El RD 933/2021 exige reportar el número de tarjeta y su caducidad.
*   **Información aportada:** Anclora se enorgullece de la privacidad por defecto en local.
*   **Información que falta:** Directrices sobre cómo almacenar PANs (Primary Account Numbers) en un `.xlsx` sin incumplir las normativas de seguridad bancaria (PCI-DSS).
*   **Riesgo de decidir sin más datos:** Inducir al usuario a cometer una negligencia grave de seguridad financiera al guardar tarjetas sin cifrar en un Excel.
*   **Acción recomendada:** Consultar a un experto en PCI-DSS. Evaluar si Anclora debe cifrar automáticamente la columna de tarjetas en el Excel local.
*   **Prioridad:** **Alta**.

### 5. Competencia
*   **Decisión pendiente:** Estrategia de neutralización de *seshospedajes.es*.
*   **Por qué importa:** Es el competidor directo más peligroso, ya que también permite la importación desde Excel y genera el XML para SES.HOSPEDAJES.
*   **Información aportada:** *seshospedajes.es* es un intermediario privado con planes desde 2,99€ al mes, pero sus precios escalan por volumen y obliga a usar su nube.
*   **Información que falta:** ¿Qué nivel de flexibilidad tiene su importador de Excel? ¿Es estricto o admite errores?
*   **Riesgo de decidir sin más datos:** Subestimar a un rival que ya ha educado al mercado en el concepto "Excel a XML".
*   **Acción recomendada:** Auditar la usabilidad de *seshospedajes.es*. Posicionar a Anclora atacando sus debilidades: "Nosotros no cobramos por volumen y tus datos no van a nuestra nube".
*   **Prioridad:** **Media**.

### 6. Precio y Monetización
*   **Decisión pendiente:** Definir el modelo de negocio (Licencia única vs. Suscripción SaaS plana).
*   **Por qué importa:** El mercado está saturado de suscripciones recurrentes.
*   **Información aportada:** Competidores oscilan entre 1,49€ (Partee) y modelos por tramos de uso. Las fuentes sugieren que Anclora debe ofrecer un modelo de "coste marginal efectivo" que destruya barreras.
*   **Información que falta:** Elasticidad del precio del pequeño propietario por un software local.
*   **Riesgo de decidir sin más datos:** Fijar un precio que no cubra los costes de soporte técnico (las dudas sobre XML serán altas).
*   **Acción recomendada:** Testear un modelo de "Licencia Anual Plana" (sin límite de registros) frente a una suscripción mensual, ofreciendo actualizaciones normativas incluidas.
*   **Prioridad:** **Media**.

### 7. Cliente Objetivo
*   **Decisión pendiente:** Cómo dar servicio a los propietarios extranjeros no residentes.
*   **Por qué importa:** La sede del Ministerio exige Cl@ve, DNIe o Certificado Digital español para subir el XML manualmente.
*   **Información aportada:** Un gran volumen de propietarios son extranjeros y carecen de esto. Plataformas privadas ofrecen "representación legal" por 9,99€/mes extra.
*   **Información que falta:** Solución técnica o legal de Anclora para este segmento si la app es puramente local.
*   **Riesgo de decidir sin más datos:** Perder a todo el segmento de inversores extranjeros y expatriados (muy frecuente en zonas costeras).
*   **Acción recomendada:** Restringir el marketing inicial a residentes españoles, y buscar una alianza paralela con una gestoría digital para ofrecer el servicio de representación.
*   **Prioridad:** **Alta**.

### 8. Go-to-Market
*   **Decisión pendiente:** Política de marca (Naming) y prevención de conflictos institucionales.
*   **Por qué importa:** La denominación y el *look & feel* no deben inducir a pensar que es una app estatal.
*   **Información aportada:** Se identifica un riesgo legal con la OEPM y Consumo si se abusa de términos como "SES.HOSPEDAJES" en la marca comercial.
*   **Información que falta:** Confirmación legal sobre los límites del uso de la nomenclatura del Ministerio en *landing pages* y material de ventas.
*   **Riesgo de decidir sin más datos:** Recibir un "Cease and Desist" (cese y desista) del Gobierno.
*   **Acción recomendada:** Asegurar *disclaimers* visibles en la web indicando: "Anclora es un software independiente, no afiliado al Ministerio del Interior".
*   **Prioridad:** **Alta**.

### 9. Soporte y Operación
*   **Decisión pendiente:** Protocolo de gestión de errores del Ministerio (Falsos Negativos).
*   **Por qué importa:** SES.HOSPEDAJES es inestable, sufre micro-caídas y errores de validación.
*   **Información aportada:** El Ministerio manda correos de error al propietario (ej. "Ha de indicar el nombre de la persona") cuando falla la validación semántica. Además, no admite caídas técnicas de su servidor como excusa legal.
*   **Información que falta:** Cómo procesará Anclora los reportes de error que el Ministerio devuelve al usuario, para que este sepa qué celda del Excel falló.
*   **Riesgo de decidir sin más datos:** Colapso del departamento de soporte de Anclora por usuarios frustrados ante rechazos ministeriales incomprensibles.
*   **Acción recomendada:** Incorporar en la herramienta un lector de mensajes de error de SES que traduzca el fallo técnico del Gobierno a un lenguaje sencillo (ej: "Falta el segundo apellido en la celda B4").
*   **Prioridad:** **Media**.