# Estados del XML en Anclora SyncXML

La plataforma maneja diferentes estados lógicos para el ciclo de vida del XML de SES.HOSPEDAJES, de cara a no emitir "claims" de validación excesivos antes de tiempo.

- **generated**: El archivo XML se ha generado a partir de la importación del Excel/XLSX, pero no se ha sometido a revisión humana detallada en la UI.
- **locally_reviewed**: El usuario ha revisado visualmente las tarjetas y el mapping de datos y ha confirmado que los campos coinciden con sus registros operativos.
- **xsd_validated**: El XML generado ha pasado validación contra los esquemas XSD oficiales del Ministerio del Interior integrados en el repositorio (`schemas/ses-hospedajes/v3.1.3/`).
- **ses_preprod_tested**: El XML se ha enviado al entorno de preproducción de SES.HOSPEDAJES y ha recibido respuesta de aceptación.
- **production_sent_disabled**: El estado de envío a producción. Actualmente deshabilitado por razones de validación técnica y cumplimiento legal en la fase pre-MVP. No se promete cumplimiento garantizado y no se debe realizar con datos reales sin cerrar las implicaciones de DPA y RGPD.
