# Guía Rápida: Piloto Controlado Anclora SyncXML

**Versión:** 1.0  
**Idioma:** Español  
**Fecha:** 2026-06-05

---

## ¿Qué es esto?

Estás en la fase de **piloto controlado** de Anclora SyncXML. En esta fase, pruebas la funcionalidad principal con datos 100% sintéticos, sin conexión a sistemas reales de SES.HOSPEDAJES.

---

## ¿Qué puedo probar?

✅ **Permitido:**
- Importar el archivo Excel sintético adjunto
- Revisar y validar los datos en la interfaz
- Generar XML descargable
- Descargar el XML para inspección local
- Proporcionar feedback sobre la experiencia

❌ **NO permitido:**
- Enviar XML automáticamente a SES.HOSPEDAJES
- Usar datos reales de huéspedes o reservas
- Enviar información personal identificable (PII)
- Considerar el XML como envío oficial

---

## Paso a paso

### 1. Accede a la aplicación

Abre el enlace proporcionado en el email de aceptación:

```
https://<your-preview-or-prod-url>/app
```

El sistema solicitará confirmación de acceso a fase pre-MVP.

### 2. Descarga el archivo sintético

Desde la sección "Recursos de Piloto" o a través del email:

- Archivo: `pilot-demo-stable.xlsx`
- Datos: 1 reserva, 2 huéspedes, fechas coherentes, documentos sintéticos
- Tamaño: ~22 KB
- Formato: Excel XLSX compatible

### 3. Importa el archivo

En la interfaz:

1. Haz clic en "Importar archivo"
2. Selecciona `pilot-demo-stable.xlsx`
3. Espera validación inicial
4. Revisa los datos en la tabla

### 4. Revisa los datos

La interfaz muestra:

- **Reserva:** número, fechas, alojamiento
- **Huéspedes:** nombres, documentos, contacto
- **Validación:** indicadores de estado (✓ válido, ⚠️ advertencia, ✗ error)
- **Errores:** detalle si algo no es válido

### 5. Interpreta errores (si los hay)

Los errores posibles incluyen:

- **Formato incorrecto:** revisa la columna del archivo
- **Dato faltante:** algunos campos son obligatorios
- **Valor inválido:** fechas, números de documentos, formatos

Para el archivo sintético adjunto, no deberías ver errores críticos.

### 6. Genera XML

1. Haz clic en "Generar XML"
2. Espera procesamiento (< 10 segundos)
3. Se abre vista previa del XML

### 7. Descarga el XML

1. En la vista previa, haz clic en "Descargar"
2. Se descarga como `booking-<timestamp>.xml`
3. Puedes inspeccionarlo localmente en un editor de texto

---

## Información obligatoria

### ⚠️ Disclaimer legal

**Durante esta fase, el piloto no realiza envíos oficiales ni envíos autónomos al entorno SES.HOSPEDAJES. Cualquier prueba técnica contra preproducción SES, si procede, será ejecutada únicamente por el responsable técnico de Anclora SyncXML con datos sintéticos o anonimizados.**

- No hay garantía legal de cumplimiento
- No se valida contra reglamentaciones de hospedería
- El XML generado es **solo para revisar estructura**, no para envío oficial
- Anclora SyncXML está en **fase pre-MVP**

### No usar datos reales

Por favor:
- No importes datos reales de huéspedes
- No importes información bancaria real
- No importes documentos reales
- No importes direcciones o contactos reales

### Responsabilidad del técnico

Si se requieren pruebas contra preproducción SES:
- Solo el responsable técnico de Anclora puede hacerlas
- Se usan siempre datos sintéticos
- Las pruebas se hacen bajo ambiente controlado
- El usuario piloto **no tiene acceso** a esa funcionalidad

---

## Feedback

¿Cómo enviar feedback?

1. **Sobre UX/experiencia:** Responde al email de aceptación
2. **Sobre errores/bugs:** Describe paso a paso qué hiciste y qué error viste
3. **Sobre XML generado:** Indica si la estructura es clara o confusa
4. **Sugerencias:** Cualquier mejora es bienvenida

---

## Preguntas frecuentes

**P: ¿Puedo usar mis propios datos de prueba?**  
R: Sí, pero **solo datos sintéticos**. No importes información real.

**P: ¿Por qué el XML no se envía automáticamente?**  
R: Estamos en piloto controlado. El responsable técnico valida cualquier envío oficial.

**P: ¿El XML es válido para SES?**  
R: El XML sigue la estructura SES, pero **no se valida contra la API oficial** en esta fase.

**P: ¿Puedo usar esto en producción?**  
R: No. Espera al lanzamiento oficial. Este es solo piloto de validación.

**P: ¿Se guardan mis datos?**  
R: Los datos importados se usan solo en tu sesión. No se almacenan en servidor.

---

## Siguiente paso

Después de probar:

1. Copia el feedback
2. Responde al email con observaciones
3. Espera noticia del siguiente paso

¡Gracias por participar en el piloto!

---

*Anclora SyncXML — Piloto Controlado*  
*v1.0 — 2026-06-05*
