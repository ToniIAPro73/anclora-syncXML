# PHASE 5 — Pre-checking Seguro, Opcional y No Público por Defecto

## 1. Endurecimiento del Proceso
Se ha reforzado el flujo de pre-check-in para garantizar la seguridad y privacidad en el piloto controlado:
*   **Seguridad de Tokens**:
    *   Uso de tokens aleatorios largos (32 bytes `base64url`).
    *   Almacenamiento exclusivo del `tokenHash` (SHA-256) en lugar del token en plano.
    *   Validación contra el hash en cada acceso.
*   **Gestión de Estados y TTL**:
    *   Implementación de estados `EXPIRED` (por tiempo) y `REVOKED` (por acción administrativa).
    *   Tiempo de vida (TTL) obligatorio de 7 días para las sesiones de prueba.
*   **Cabeceras de Seguridad**:
    *   `X-Robots-Tag: noindex, noarchive, nosnippet` para evitar indexación en buscadores.
    *   `Referrer-Policy: no-referrer`.
    *   `Cache-Control: no-store`.

## 2. Privacidad y Minimización
*   **Carga Pública (Payload)**: La función `toPublicPrecheckinSession` elimina el `tokenHash` y cualquier metadato de envío interno antes de servir los datos al navegador del huésped.
*   **Validación de Datos**:
    *   Se bloquea explícitamente el envío de imágenes de documentos (`documentImage`).
    *   Es obligatorio aceptar el aviso de privacidad antes de enviar.
    *   Se valida el número de viajeros contra la reserva original.
*   **Rate Limiting**: Aplicado por IP y acción (`precheckin-get`, `precheckin-post`) mediante el `sensitiveRateLimiter`.

## 3. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
