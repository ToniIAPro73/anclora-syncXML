# SES.HOSPEDAJES v3.1.3 Schema Source

- Source package: `MIR-HOSPE-DSI-WS-Servicio de Hospedajes - Comunicaciones v3.1.3.zip`
- Version: `v3.1.3`
- Document date inside package: 2025-02-17
- Imported into repository: 2026-05-23
- Service described: Servicio de Comunicacion Hospedajes
- Test endpoint documented: `https://hospedajes.pre-ses.mir.es/hospedajes-web/ws/v1/comunicacion`
- Production endpoint documented: `https://hospedajes.ses.mir.es/hospedajes-web/ws/v1/comunicacion`

## Included Files

- `altaParteHospedaje.xsd`
- `altaReservaHospedaje.xsd`
- `altaAlquilerVehiculo.xsd`
- `altaReservaVehiculo.xsd`
- `anularComunicacion.xsd`
- `consultarComunicacion.xsd`
- `comunicacion.xsd`
- `tipoComunicacion.xsd`
- `tiposGenerales.xsd`
- `comunicacion.wsdl`
- `MIR-HOSPE-DSI-WS-Servicio de Hospedajes - Comunicaciones v3.1.3.pdf`
- `source/MIR-HOSPE-DSI-WS-Servicio de Hospedajes - Comunicaciones v3.1.3.zip`

## Operational Decision

The application may use the documented pre-production endpoint for tests when credentials are configured.

The production endpoint is blocked by default. Production transmission requires explicit configuration with `SYNCXML_SES_ALLOW_PRODUCTION_SEND=true` and must not be enabled until a successful pre-production test has been documented.
