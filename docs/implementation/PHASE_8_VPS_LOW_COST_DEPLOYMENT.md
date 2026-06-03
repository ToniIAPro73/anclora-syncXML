# PHASE 8 — Preparación VPS Low-Cost y Despliegue

## 1. Estrategia de Despliegue
Para el piloto controlado de Anclora SyncXML se recomienda un despliegue basado en **Docker** y **Caddy** como proxy inverso para simplificar la gestión de certificados SSL y subdominios.

### Arquitectura Recomendada
*   **Servidor**: VPS básico (1-2 vCPU, 2GB RAM).
*   **Base de Datos**: PostgreSQL (contenedor local o servicio gestionado tipo Neon).
*   **Proxy**: Caddy (certificados automáticos Let's Encrypt).
*   **Runtime**: Node.js 22 (LTS).

## 2. Archivos de Configuración
Se han incluido los siguientes archivos en la raíz del repositorio:
*   `Dockerfile`: Imagen optimizada para producción con soporte para el modo `standalone` de Next.js.
*   `docker-compose.example.yml`: Orquestación de la App, PostgreSQL y Caddy.
*   `.env.example`: Actualizado con las variables necesarias para producción.

## 3. Guía de Puesta en Marcha (Resumen)
1.  **Clonar el repositorio** en el VPS.
2.  **Preparar el entorno**:
    ```bash
    cp .env.example .env
    # Editar .env con secretos reales
    ```
3.  **Configurar Caddyfile**:
    Crear un archivo `Caddyfile` con la siguiente estructura:
    ```caddy
    syncxml.anclora.com {
      reverse_proxy syncxml_app:3000
    }
    ```
4.  **Lanzar la infraestructura**:
    ```bash
    docker compose -f docker-compose.example.yml up -d
    ```

## 4. Alternativa sin Docker (Directo con PM2)
Si no puedes usar Docker en tu entorno, puedes desplegar directamente sobre Node.js utilizando **PM2** para la gestión de procesos.

### Requisitos en el VPS
*   Node.js 22+ y npm.
*   PostgreSQL instalado y configurado localmente.
*   PM2 instalado globalmente: `npm install -g pm2`.

### Pasos para Despliegue Directo
1.  **Instalar dependencias**:
    ```bash
    npm ci
    ```
2.  **Configurar entorno**:
    ```bash
    cp .env.example .env
    # Editar .env con tus credenciales de Postgres local
    ```
3.  **Preparar Base de Datos**:
    ```bash
    npx prisma generate
    npx prisma migrate deploy
    ```
4.  **Construir la aplicación**:
    ```bash
    npm run build
    ```
5.  **Lanzar con PM2**:
    ```bash
    pm2 start npm --name "syncxml" -- start
    ```
6.  **Persistencia tras reinicio**:
    ```bash
    pm2 save
    pm2 startup
    ```

## 5. Seguridad en Despliegue
*   **Logs**: Asegurar que `NODE_ENV=production` está activo para minimizar el volumen de logs.
*   **Variables Críticas**: `SYNCXML_ENCRYPTION_KEY`, `SESSION_SECRET` y `SYNCXML_ADMIN_PASSWORD` deben ser cadenas largas y aleatorias.
*   **Acceso Admin**: Mantener `SYNCXML_ADMIN_ACCESS_ENABLED=false` a menos que se requiera mantenimiento explícito.
*   **Persistencia**: El modo por defecto sigue siendo `SYNCXML_ENABLE_PERSISTENT_STORAGE=false`.

## 5. Comandos Ejecutados
*   `npm run lint`
*   `npm run typecheck`
*   `npm run test`
*   `npm run build`
