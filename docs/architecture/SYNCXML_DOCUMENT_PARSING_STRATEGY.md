# SyncXML Document Parsing Strategy

## Decision ejecutiva

No forzar MinerU en el flujo principal de SyncXML. El parser core del producto sigue siendo el importador XLSX y la validacion local del XML. MinerU o parsers documentales solo deben entrar como capacidad auxiliar y reversible.

## Casos de uso reales

- convertir manuales o normativa SES a markdown;
- extraer contexto de contratos o instrucciones operativas;
- apoyar investigacion interna o RAG local;
- evaluar documentos de reserva solo en escenarios muy controlados.

## Cuando usar Excel

- flujo principal de reservas y huespedes;
- datos estructurados o semiestructurados;
- MVP actual y pruebas de piloto.

## Cuando usar PDF

- manuales;
- guias operativas;
- normativa o evidencias externas;
- documentos auxiliares no core.

## Cuando usar MinerU

- cuando el PDF sea dificil de copiar manualmente;
- cuando haga falta estructura markdown para analisis o agentes;
- cuando el beneficio operativo supere la complejidad adicional.

## Cuando usar parser ligero existente

- para XML SES;
- para validacion local;
- para contenidos controlados del propio flujo de negocio;
- cuando no se necesite OCR.

## Riesgos de OCR o parsing

- extraer mal nombres, fechas o documentos;
- falsa sensacion de precision;
- retener documentos innecesarios;
- introducir PII en flujos auxiliares o RAG.

## Controles humanos

- revisar cualquier campo extraido antes de reutilizarlo;
- no mezclar parsing documental con aprobacion automatica;
- no usar sobre DNI/pasaporte reales en esta fase.

## Estrategia sin Docker

Se mantiene la linea ya documentada:

- wrapper local sin Docker;
- ejecucion externa al flujo core;
- salida usada como apoyo, no como fuente canonica.

## MVP recomendado

1. mantener `ENABLE_MINERU_PARSER=false` por defecto;
2. usar MinerU solo para documentacion o pruebas internas;
3. no integrar parsing documental en importacion de huespedes sin evidencia clara;
4. documentar el uso y sus limites.

## Roadmap posterior

- evaluar parsing de PDFs de reserva anonimizados;
- medir calidad real de extraccion;
- poner feature flag y tests;
- decidir si compensa frente al importador XLSX existente.
