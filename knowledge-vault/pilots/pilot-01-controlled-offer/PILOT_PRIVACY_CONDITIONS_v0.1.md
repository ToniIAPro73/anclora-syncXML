# PILOT_PRIVACY_CONDITIONS_v0.1 — Condiciones de privacidad del piloto

## Estado
Borrador inicial / v0.1

## Propósito
Establecer el marco de seguridad y privacidad para el tratamiento de información durante el Piloto 01, minimizando el riesgo de exposición de datos personales reales (PII).

## Principio principal
**Minimización absoluta:** El piloto se ejecutará por defecto **sin datos reales**. Se dará prioridad total al uso de datos sintéticos, anonimizados o muestras de estructura vacías.

## Datos permitidos

| Tipo de dato | Permitido | Condiciones |
| :--- | :--- | :--- |
| Datos sintéticos | SÍ | Generados aleatoriamente o con herramientas de test. |
| Datos anonimizados | SÍ | Irreversibles (ej. Huésped 1, Huésped 2). |
| Muestras de estructura | SÍ | Excel con cabeceras pero sin registros de clientes. |
| Campos ficticios válidos | SÍ | DNI con letra correcta pero número inexistente. |

## Datos no permitidos (PII Real)

| Dato | Motivo | Acción si se recibe |
| :--- | :--- | :--- |
| DNI / PAS / NIE Reales | Riesgo legal alto (RGPD). | **Borrado inmediato** y aviso al cliente. |
| Nombres y Apellidos reales | Identificación directa. | Solicitar anonimización inmediata. |
| Emails y Teléfonos reales | Datos de contacto sensibles. | No procesar; eliminar el archivo. |
| Direcciones exactas | Localización física. | Sustituir por datos genéricos (ej. Calle Falsa 123). |
| Imágenes de documentos | Prohibido por política AEPD. | Rechazar el envío; borrar del sistema. |

## Reglas de anonimización para el cliente
Se recomienda al cliente seguir estas pautas antes de enviar muestras:
- **Nombres:** Sustituir por "Nombre 1", "Titular A", etc.
- **Documentos:** Usar numeraciones genéricas (ej. 12345678Z).
- **Emails:** Usar el dominio `@example.com` o `@test.es`.
- **Notas/Observaciones:** Eliminar cualquier campo de texto libre que pueda contener datos personales.
- **Estructura:** Mantener las columnas originales para validar el mapeo técnico.

## Condiciones técnicas del piloto
- **No persistencia:** Los datos importados no se almacenarán de forma permanente en base de datos.
- **Enmascarado:** La interfaz mostrará por defecto datos enmascarados (ej. `****1234Z`).
- **Borrado operativo:** Se activará la función de "Borrar datos de la operación" tras cada sesión.
- **Logs limpios:** El sistema de logging técnico tiene prohibido registrar cualquier valor de campo de huésped.

## Uso de datos reales (Excepción)
El uso de datos reales queda estrictamente **excluido** de este piloto. Solo podrá plantearse en fases posteriores tras cumplir:
1. Revisión y aprobación por consultoría legal externa.
2. Firma mutua de Contrato de Encargado de Tratamiento (DPA).
3. Publicación de Aviso de Privacidad específico.
4. Implementación verificada de cifrado en reposo (AES-256).

## Responsabilidades del cliente
- Garantizar que la muestra enviada no contiene datos personales reales.
- Obtener las autorizaciones necesarias si decide (bajo su riesgo) usar datos propios para test.
- No utilizar los archivos XML generados durante el piloto para comunicaciones oficiales con el Ministerio.

## Procedimiento ante recepción accidental de PII Real
1. **Detección:** Si se identifica un documento o nombre real.
2. **Parada:** Detener cualquier procesamiento o demo en curso.
3. **Eliminación:** Borrado físico del archivo y de los registros temporales.
4. **Notificación:** Informar al cliente del error en la muestra enviada.
5. **Reinicio:** Solicitar una nueva muestra correctamente anonimizada.

## Disclaimer de privacidad
*"Anclora SyncXML procesa datos en memoria únicamente para fines de validación técnica. Durante el piloto, no se almacenarán ni tratarán datos personales reales. El usuario garantiza la anonimización de las muestras aportadas."*

## Checklist previa a demo o sesión
- [ ] ¿He confirmado con el cliente que el Excel es de prueba?
- [ ] ¿He revisado visualmente que no hay fotos de DNI?
- [ ] ¿Está activado el modo privado/sin persistencia?
- [ ] ¿Tengo el botón de "Borrar datos" localizado para el cierre de la sesión?
