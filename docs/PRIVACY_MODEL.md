# Privacy model

## Flujo de datos

1. Entrada XLSX/XML proporcionada por el usuario.
2. Validacion defensiva de archivo.
3. Parseo en memoria.
4. Normalizacion y validacion.
5. Preview enmascarada.
6. Resolucion de errores/duplicados.
7. Generacion XML temporal.
8. Descarga por el usuario.
9. Borrado manual de la operacion.

## Entrada XLSX/XML

Solo se aceptan extensiones permitidas. El XLSX se lee como datos, no se ejecutan macros ni formulas como codigo. Los nombres se sanitizan.

## Memoria temporal

Los datos personales se mantienen en estado de operacion o memoria del proceso solo mientras sea necesario para validar, revisar y exportar.

## Validacion

Se comprueban campos obligatorios, fechas, documentos, nacionalidad ISO3, pagos permitidos, duplicados, mapeo y XML.

## Exportacion

El XML se genera bajo demanda y se descarga por el usuario. No queda almacenado indefinidamente salvo opt-in de persistencia.

## Borrado

La accion "Borrar datos de esta operacion" elimina archivo seleccionado, parseo temporal, preview, XML generado, validaciones y estados asociados en la UI.

## Logs

La auditoria registra eventos tecnicos sin PII: fecha, evento, sesion pseudonimizada, conteos, estado de validacion, hash tecnico, idioma y tema.

## Almacenamiento

La base de datos no se usa para persistir datos personales salvo `SYNCXML_ENABLE_PERSISTENT_STORAGE=true`. En ese caso, los campos personales de huesped se cifran y el payload normalizado se minimiza para no guardar Excel/XML completo.

## Cifrado

Si se habilita persistencia, se requiere clave de cifrado y se cifran campos personales de huesped. La retencion formal debe documentarse antes de datos reales.

## Retencion

Retencion por defecto: sin conservacion permanente. Retencion persistente: pendiente de politica formal previa a produccion.
