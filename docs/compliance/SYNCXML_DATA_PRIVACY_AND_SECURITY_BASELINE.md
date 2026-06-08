# SyncXML Data Privacy And Security Baseline

## Objetivo

Fijar una baseline operativa y tecnica para SyncXML en piloto controlado. No sustituye DPA, DPIA ni validacion legal futura.

## Categorias de datos

- datos de reserva: fechas, alojamiento, referencia, canal;
- datos de viajeros: nombre, documento, nacionalidad, direccion, telefono, email;
- datos operativos: incidencias, estados, hashes tecnicos, metadata de sesion;
- documentos: Excel/XLSX, XML generado, posibles PDFs auxiliares;
- datos de piloto: nombre, email, empresa, rol y mensaje comercial.

## Datos especialmente sensibles o de alto impacto

- documentos identificativos;
- emails y telefonos personales;
- historico de estancias;
- documentos subidos por el usuario;
- futuras capturas de pre-check-in si se activan.

## Principios operativos

1. privacidad por defecto;
2. no persistencia permanente por defecto;
3. minimizacion y masking en UI;
4. no logs con payloads completos;
5. separar demo local, preview y cualquier uso oficial.

## Logs

- Permitido: hashes, request id, estado, entorno, conteos, version de reglas.
- No permitido: email, documento, telefono, direccion, XML completo, Excel completo, tokens, secretos.
- Ajustes aplicados en esta fase:
  - reemision de password: se registra `emailHash`, no email en claro;
  - admin access interno: se elimina el email del log de exito.

## Retencion

- Modo por defecto: sin conservacion duradera.
- Persistencia opcional: solo con `SYNCXML_ENABLE_PERSISTENT_STORAGE=true`.
- Cualquier retencion de datos reales sigue pendiente de politica formal con finalidad, duracion, borrado y responsables.

## Entornos

- local/demo: solo datos sinteticos o anonimizados;
- preview/staging: no copiar credenciales de produccion sin revision;
- produccion: no habilitar envio SES ni persistencia sin decision expresa y evidencia previa.

## Secretos y variables

- no commitear secretos;
- mantener `SESSION_SECRET`, credenciales SES y tokens internos fuera del repositorio;
- no usar variables de produccion en preview sin necesidad clara;
- no exponer secretos en errores o respuestas JSON.

## Manejo de errores

- devolver errores resumidos al cliente;
- guardar solo la minima evidencia tecnica necesaria;
- evitar interpolar payloads de usuario en logs de error.

## Anonimizacion y datos sinteticos

Durante el piloto se priorizan:

- muestras sinteticas;
- datos anonimizados;
- pruebas de UX y QA sin huespedes reales.

## Endpoints y superficies sensibles revisadas

- `src/app/api/pilot/request/route.ts`
- `src/app/api/auth/recover/route.ts`
- `src/app/api/internal/admin-access/route.ts`
- `src/app/api/ses/*`
- `src/lib/precheckin.ts`
- `src/lib/audit.ts`

## Hallazgos y correcciones razonables

- corregido log de recuperacion para no incluir email directo;
- corregido log de admin access para no incluir email administrativo;
- no se detecto necesidad inmediata de cambiar la estrategia base de masking, hashing o bloqueo SES.

## Recomendaciones para produccion futura

1. definir politica formal de retencion;
2. cerrar DPA/DPIA si se usan datos reales;
3. cifrar y revisar accesos si se habilita persistencia;
4. archivar evidencia de preproduccion SES real;
5. formalizar borrado, revocacion y respuesta a incidentes.
