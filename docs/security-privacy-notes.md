# Notas de Seguridad y Privacidad - Pilot Candidate v0.2

## Uso de Datos en el Piloto
- **Datos permitidos**: Datos sintéticos, generados aleatoriamente, o completamente anonimizados. Ficheros Excel generados por nuestros scripts de QA (\`test-data/\`).
- **Datos prohibidos**: PII real de huéspedes, documentos de identidad reales, emails y teléfonos no ofuscados de huéspedes reales.
- **Flujo de Bloqueo**: Se advierte expresamente en la UI de \`/piloto\` y al importar en \`AuthGate\`. Además, Hermes rechaza el acceso al piloto si el usuario indica intención de subir datos reales.

## Almacenamiento y Logs
- **Retención y Borrado**: \`SYNCXML_ENABLE_PERSISTENT_STORAGE=false\` por defecto, no se guardan permanentemente Excels ni XMLs generados en la base de datos de producción.
- **Política de Logs**: Está estrictamente prohibido el logueo de payloads completos, emails, y claves en texto plano. Los errores Pydantic y \`console.log\` fueron anonimizados en la Fase 5.

## Autenticación
- **Contraseña Temporal**: Nexus solicita el aprovisionamiento enviando un token seguro a SyncXML. SyncXML genera una contraseña temporal que se devuelve y envía por correo en texto claro por una única vez.
- **Cambio Obligatorio**: Al realizar el primer inicio de sesión, el \`AuthGate\` obliga a rotar la contraseña temporal. No se permite navegación a otros endpoints de la API ni vistas hasta que este cambio se efectúa.

## Legal y Normativo
- **Estado Actual**: RGPD y Data Processing Agreement (DPA) pendientes de cierre formal para el producto.
- **Compromisos**: No se prometen beneficios de "cumplimiento legal garantizado", no se asume responsabilidad por la validación del Ministerio en esta fase. No se activa el envío automático productivo.
