# AI Document Ingestion With MinerU

## Objetivo

SyncXML no usa MinerU para el flujo principal de Excel a XML. Lo usa como capacidad auxiliar para:

- manuales y PDFs operativos
- normativa o instrucciones SES.HOSPEDAJES
- contratos e integraciones que convenga convertir a Markdown

## Regla operativa

- El parser principal de negocio sigue siendo el importador XLSX/CSV actual.
- MinerU se usa fuera del flujo critico de huespedes.
- No procesar datos reales de viajeros salvo entorno controlado y autorizacion expresa.

## Wrapper local

```bash
npm run ingest:doc -- ./docs/manual/manual-usuario.md syncxml pipeline
```

Tambien puedes llamar al wrapper central directamente:

```bash
~/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh <documento> syncxml pipeline
```

## Variables de entorno

```env
ENABLE_MINERU_PARSER=false
MINERU_AGENT_INGEST_PATH=/home/toni/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh
MINERU_DEFAULT_BACKEND=pipeline
MINERU_OUTPUT_BASE=/home/toni/projects/agent-tooling/mineru/output
MINERU_PARSE_TIMEOUT_MS=180000
```

## Privacidad

- No commitear PDFs, DOCX, XLSX ni salidas parseadas.
- No usar MinerU para escaneos de DNI, pasaporte o datos reales de viajeros en esta fase.
- La salida de MinerU sirve como contexto para agentes y RAG local, no como fuente canonica.
