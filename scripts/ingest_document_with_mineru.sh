#!/usr/bin/env bash
set -euo pipefail

INPUT="${1:-}"
PROJECT="${2:-syncxml}"
BACKEND="${3:-${MINERU_DEFAULT_BACKEND:-pipeline}}"

if [ -z "$INPUT" ]; then
  echo "Uso: npm run ingest:doc -- <documento> [proyecto] [backend]"
  exit 1
fi

"$HOME/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh" "$INPUT" "$PROJECT" "$BACKEND"
