<p align="center">
  <img src="public/brand/logo-anclora-syncxml-email.png" alt="Anclora SyncXML" width="112" />
</p>

<h1 align="center">Anclora SyncXML</h1>

<p align="center">
  Herramienta con privacidad por diseño para revisar hojas de reserva y preparar XML
  SES.HOSPEDAJES dentro de un piloto controlado.
</p>

<p align="center">
  <strong>Español</strong> ·
  <a href="README.en.md">English</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

<p align="center">
  <a href="#estado">Estado</a> ·
  <a href="#qué-hace">Producto</a> ·
  <a href="#controles">Controles</a> ·
  <a href="#manuales">Manuales</a> ·
  <a href="#inicio-rápido">Inicio rápido</a> ·
  <a href="#controles-de-calidad">Calidad</a>
</p>

<p align="center">
  <img alt="Estado del proyecto" src="https://img.shields.io/badge/estado-piloto%20controlado-orange" />
  <img alt="Licencia" src="https://img.shields.io/badge/licencia-MIT-yellow" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-blue" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-Vitest%20171%20passing-brightgreen" />
  <img alt="Privacidad" src="https://img.shields.io/badge/privacidad-minimizaci%C3%B3n%20primero-brightgreen" />
</p>

---

## Estado

Anclora SyncXML es un proyecto open source bajo licencia MIT. El repositorio es
público para que el producto, el modelo de privacidad y los controles operativos
puedan revisarse y mejorarse.

El producto está actualmente en fase **pre-MVP / validación controlada**. Debe
describirse con precisión:

- No es asesoría legal.
- No garantiza cumplimiento normativo.
- No es un sistema automático de envío SES.HOSPEDAJES en producción.
- No debe almacenar datos reales de huéspedes sin controles aprobados de
  seguridad, retención y acceso.

## Qué Hace

SyncXML ayuda a operadores a convertir hojas de reserva en un flujo XML revisable,
manteniendo baja la exposición de datos sensibles.

| Capacidad | Comportamiento actual |
| --- | --- |
| Importación de hojas | Lee archivos `.xlsx` con análisis defensivo mediante ExcelJS. |
| Validación inteligente | Detecta campos ausentes o de riesgo en reservas, viajeros, direcciones, documentos y pagos. |
| Revisión guiada | Permite corregir bloqueos antes de generar XML. |
| Preparación XML | Genera vistas visuales y técnicas del XML antes de descargarlo. |
| Asistencia SES | Soporta validación local y acciones controladas de preproducción cuando está configurado. |
| Historial de reservas | Persistencia opcional con acceso a reservas limitado por usuario. |
| Acceso piloto | Email/contraseña para usuarios aprobados, cambio de contraseña temporal y alta admin. |
| Ciclo de feedback | Feedback de piloto dentro de la app sin pedir datos de huéspedes. |

## Controles

La aplicación se construye sobre barreras operativas, no sobre promesas amplias.

| Control | Propósito |
| --- | --- |
| Acceso controlado | `/app` y `/dashboard` requieren sesión aprobada salvo modo demo local. |
| Roles | Las acciones de envío SES se restringen por rol y configuración de entorno. |
| Auth fail-closed | Producción no permite el flag de bypass local de autenticación. |
| Aislamiento por propietario | Las reservas persistidas quedan asociadas al usuario autenticado. |
| Minimización PII | Los datos de huésped se enmascaran por defecto y no se guardan imágenes de documentos. |
| Restricciones de subida | Tipo, tamaño y forma del payload se validan antes de procesar. |
| Alcance SES prudente | SES en producción queda bloqueado salvo configuración, pruebas y aprobación explícitas. |
| Disciplina de copy público | El texto evita garantías legales, absolutas o de cumplimiento. |

## Superficie Del Producto

| Área | Ruta o artefacto |
| --- | --- |
| Landing pública | `/` |
| Solicitud de piloto | `/piloto` |
| Login piloto | `/login` |
| Login admin | `/admin/login` |
| Flujo de aplicación | `/app` |
| Panel de reservas | `/dashboard` |
| Pre-check-in de prueba | `/precheckin/[token]` |
| Manuales publicados | `public/manuals/` |

## Arquitectura

| Capa | Stack |
| --- | --- |
| Aplicación web | Next.js App Router, React 19, TypeScript |
| Rutas API | Rutas server de Next.js con validación Zod |
| Persistencia | Prisma, almacenamiento opcional con base de datos |
| Lectura de hojas | ExcelJS |
| XML | `fast-xml-parser` y helpers locales de validación SES |
| Email | Helpers de envío con Resend cuando está configurado |
| Tests | Vitest, React Testing Library y cobertura enfocada de rutas/unidades |
| Manuales | Fuentes Markdown renderizadas a HTML/PDF con Chromium |

## Inicio Rápido

### Requisitos

- Node.js 22 recomendado.
- npm 10+ recomendado.
- Chrome o Chromium solo para regenerar manuales PDF.

### Desarrollo local

```bash
cp .env.example .env
npm install
npm run dev
```

Para una demo local sin datos reales:

```bash
SYNCXML_LOCAL_DEMO=true npm run dev
```

Para flujos de acceso controlado en local o staging, configura `.env` con cuidado y
usa datos sintéticos o anonimizados salvo que exista aprobación para un piloto con
datos reales.

## Entorno

Variables comunes en desarrollo:

| Variable | Uso |
| --- | --- |
| `SESSION_SECRET` | Secreto de firma de sesión. |
| `SYNCXML_ADMIN_PASSWORD` | Fallback de acceso admin controlado. |
| `DATABASE_URL` / `DIRECT_URL` | Conexión de base de datos Prisma. |
| `SYNCXML_ENABLE_PERSISTENT_STORAGE` | Activa persistencia opcional de reservas. |
| `SYNCXML_LOCAL_DEMO` | Permite modo demo local fuera de producción. |
| `RESEND_API_KEY` | Activa envío de email cuando hace falta. |

Más detalle:

- [.env.example](.env.example)
- [docs/env-syncxml-pilot.md](docs/env-syncxml-pilot.md)
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

## Manuales

Los manuales de usuario publicados viven en una carpeta canónica:
[public/manuals](public/manuals).

| Idioma | PDF | HTML |
| --- | --- | --- |
| Español | [PDF](public/manuals/anclora-syncxml-manual-usuario-es.pdf) | [HTML](public/manuals/anclora-syncxml-manual-usuario-es.html) |
| Inglés | [PDF](public/manuals/anclora-syncxml-user-manual-en.pdf) | [HTML](public/manuals/anclora-syncxml-user-manual-en.html) |
| Alemán | [PDF](public/manuals/anclora-syncxml-benutzerhandbuch-de.pdf) | [HTML](public/manuals/anclora-syncxml-benutzerhandbuch-de.html) |

Las fuentes editables están en [docs/manual](docs/manual). Regenera los manuales
publicados con:

```bash
node scripts/generate-syncxml-manual-pdf.mjs --lang=all
```

## Controles De Calidad

Ejecuta la puerta local completa antes de entregar una rama:

```bash
npm run check:public-docs
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev --audit-level=high
```

## Expectativas De Seguridad

- No subas datos reales de huéspedes, XML exportados ni hojas con PII.
- No registres nombres, DNI/pasaporte, teléfonos, emails, direcciones, pagos ni XML completo.
- Usa datos sintéticos o anonimizados para tests, capturas, demos e informes de bug.
- No copies secretos de producción entre entornos.
- Usa evidencia de preproducción antes de considerar cualquier flujo SES en producción.

Divulgación responsable y gestión de seguridad: [SECURITY.md](SECURITY.md).

## Mapa De Documentación

| Tema | Documento |
| --- | --- |
| Índice de documentación | [docs/README.md](docs/README.md) |
| Modelo de acceso | [docs/ACCESS_MODEL.md](docs/ACCESS_MODEL.md) |
| Modelo de privacidad | [docs/PRIVACY_MODEL.md](docs/PRIVACY_MODEL.md) |
| Control de acceso SES | [docs/SES_ACCESS_CONTROL.md](docs/SES_ACCESS_CONTROL.md) |
| Flujo piloto | [docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md](docs/pilot/SYNCXML_CONTROLLED_PILOT_FLOW.md) |
| Configuración de entorno | [docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md](docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |
| Gobierno | [GOVERNANCE.md](GOVERNANCE.md) |

## Contribuir

Las contribuciones son bienvenidas cuando preservan los límites de privacidad por
diseño y piloto controlado.

Empieza por:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [docs/community/INITIAL_ISSUES.md](docs/community/INITIAL_ISSUES.md)
- [docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md](docs/devops/AGENT_GIT_WORKFLOW_CONTRACT.md)

## Licencia

MIT. Ver [LICENSE](LICENSE).
