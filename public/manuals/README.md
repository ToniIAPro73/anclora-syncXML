# Anclora SyncXML Published Manuals

This folder is the canonical publication folder for the latest user manuals.

## Current version

| Language | PDF | HTML preview |
| --- | --- | --- |
| ES | `anclora-syncxml-manual-usuario-es.pdf` | `anclora-syncxml-manual-usuario-es.html` |
| EN | `anclora-syncxml-user-manual-en.pdf` | `anclora-syncxml-user-manual-en.html` |
| DE | `anclora-syncxml-benutzerhandbuch-de.pdf` | `anclora-syncxml-benutzerhandbuch-de.html` |

## Source of truth

- Editable sources: `docs/manual/manual-usuario*.md`
- Generator: `scripts/generate-syncxml-manual-pdf.mjs`
- Command: `node scripts/generate-syncxml-manual-pdf.mjs --lang=all`

`tmp/manual-pdf/` is not a publication folder. It may contain local or legacy rendering artifacts and must not be treated as the latest version.
