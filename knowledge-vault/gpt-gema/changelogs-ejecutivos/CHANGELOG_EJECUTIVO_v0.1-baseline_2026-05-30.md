# Changelog ejecutivo — Anclora SyncXML v0.1-baseline

## Fecha
2026-05-30

## Versión
v0.1-baseline

## Estado
Versión inicial de referencia para gestión del conocimiento, auditoría técnica y futura Gema/GPT.

## Cambios implementados
- Creado knowledge-vault para almacenar snapshots, documentos de NotebookLM, material de Gema/GPT y archivo histórico.
- Movido el snapshot inicial del repo a repo-snapshots/v0.1-baseline.
- Preparada estructura para cuaderno 1, cuaderno 2 y futura Gema/GPT.
- Añadidos manifiestos iniciales para knowledge packs.
- Excluidos snapshots del repo en .gitingest y .gitignore.

## Riesgos cerrados
- Se evita que futuros snapshots del repo incluyan snapshots antiguos.
- Se reduce el riesgo de mezclar documentación técnica, outputs derivados y fuentes activas.
- Se establece una convención inicial de versionado documental.

## Riesgos abiertos
- Falta generar y guardar el índice maestro 05 si aún no existe.
- Falta crear la Gema/GPT.
- Falta auditar el primer cuaderno si no se han completado sus auditorías.
- Falta definir qué documentos exactos del cuaderno 1 formarán parte del primer knowledge pack.

## Cambios en la prioridad
- Prioridad inmediata: cerrar el índice maestro 05 del cuaderno técnico.
- Prioridad posterior: preparar el primer paquete documental para la Gema/GPT.
- Prioridad paralela: completar auditorías del cuaderno de mercado y normativa.

## Funcionalidades nuevas
No aplica a la aplicación. Esta versión afecta a gestión del conocimiento, no al producto funcional.

## Funcionalidades aún no implementadas
- Gema/GPT operativa.
- Knowledge pack empaquetado.
- Flujo recurrente de actualización por versiones del repo.
- Auditoría final cruzada entre cuaderno 1 y cuaderno 2.

## Impacto en el MVP
Se mejora la trazabilidad de decisiones y prioridades para avanzar hacia MVP vendible.

## Impacto en la venta
Se prepara una base documental más clara para argumentarios, posicionamiento, pricing y roadmap.

## Impacto en RGPD / privacidad
Se separan documentos técnicos, fuentes activas y outputs derivados, reduciendo confusión documental. No sustituye una auditoría RGPD.

## Impacto en SES / XML
Se conserva el snapshot técnico inicial como referencia para futuras comparaciones sobre integración SES, XML, XSD y validación.

## Decisiones pendientes
- Qué documentos del cuaderno 1 pasarán al primer knowledge pack.
- Si la Gema/GPT incluirá solo documentos estratégicos o también documentación técnica del repo.
- Frecuencia de actualización del knowledge-vault.
- Criterios para pasar de v0.1-baseline a v0.2.

## Qué debe saber NotebookLM desde ahora
El cuaderno 2 debe usar el snapshot v0.1-baseline y los documentos 01-04 como base activa. El diagnóstico inicial 00 queda solo como histórico.

## Qué debe saber la Gema/GPT desde ahora
La futura Gema/GPT debe alimentarse con documentos refinados y auditados, no con fuentes brutas ni snapshots completos salvo necesidad específica de revisión de código.
