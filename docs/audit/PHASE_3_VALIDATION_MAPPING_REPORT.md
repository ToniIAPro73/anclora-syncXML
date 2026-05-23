# Phase 3 Validation and Mapping Report

## Metadata

- Date: 2026-05-23
- Branch: `feat/syncxml-phased-hardening`
- Status: Partially implemented. XSD/WSDL source archived and SES service client prepared. Production send remains blocked.

## Official Source Archived

The package `MIR-HOSPE-DSI-WS-Servicio de Hospedajes - Comunicaciones v3.1.3.zip` has been archived under:

```text
schemas/ses-hospedajes/v3.1.3/source/
```

Extracted official files are versioned under:

```text
schemas/ses-hospedajes/v3.1.3/
```

Included source files:

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
- Official PDF manual v3.1.3

The local source note is:

```text
schemas/ses-hospedajes/v3.1.3/SOURCE.md
```

## Service Endpoints Confirmed From Manual

- Pre-production: `https://hospedajes.pre-ses.mir.es/hospedajes-web/ws/v1/comunicacion`
- Production: `https://hospedajes.ses.mir.es/hospedajes-web/ws/v1/comunicacion`

The implementation defaults to pre-production. Production sending is blocked unless `SYNCXML_SES_ALLOW_PRODUCTION_SEND=true` is explicitly configured.

## Implemented

- Local SES schema-source archive.
- SES XML validation helper for `altaParteHospedaje`.
- Integration of SES local validation into XML generation errors.
- ZIP/Base64 packaging helper for the XML payload required by the service.
- SOAP envelope builder for documented operations.
- Basic Auth client configuration through environment variables.
- API routes for:
  - `POST /api/ses/validate`
  - `POST /api/ses/communicate`
  - `POST /api/ses/lote`
  - `POST /api/ses/comunicacion`
  - `POST /api/ses/anulacion-lote`
  - `POST /api/ses/catalogo`
- Dry-run default so no data is sent unless explicitly requested.
- Tests for local validation, ZIP/Base64 packaging, SOAP envelope generation and production-send blocking.

## Important Limitation

The current local validation is a defensive application-level validator based on the official XSD structure, not a full standards-complete XSD engine. It checks required structure, key datatypes, lengths, patterns and `numPersonas`, but it does not yet execute a full XSD validator such as `xmllint`/libxml against imported schemas.

This is enough to unblock service integration work safely, but the next hardening step should add full XSD validation with a dedicated validator.

## Mapping Status

Villa Kentia mapping remains code-based and covered by tests for the known workbook shape:

- Header detection.
- Guest row extraction.
- Lower metadata extraction.
- Payment normalization.

No visual mapping-template editor was implemented in this step.

## Production Safety Decision

The production endpoint is present in code because it is part of the official WSDL/manual, but sending to production is blocked by default.

Required before production send:

1. Valid SES pre-production credentials.
2. Successful pre-production send test.
3. Successful lot/status consultation.
4. Accepted communication code evidence.
5. Written operator approval.
6. `SYNCXML_SES_ALLOW_PRODUCTION_SEND=true`.

## Validation Evidence

Latest local commands:

- `npm run test`: passed, 9 files / 35 tests.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.

## Residual Risk

- No live pre-production call has been executed because credentials were not provided.
- No accepted SES communication evidence is archived yet.
- Full XSD engine validation is still pending.
- UI controls for SES send/query are not yet exposed to users.
