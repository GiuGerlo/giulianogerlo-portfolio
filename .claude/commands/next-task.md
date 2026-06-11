---
description: Identifica y arranca la próxima task abierta del plan activo
---

1. Encontrá el plan activo en `docs/plans/*.md` (el de Phase en curso — hoy
   `2026-05-21-phase-12-supabase.md`). Si hay duda de cuál, preguntame.
2. Leé el "Log de cambios" y la sección de tasks. Identificá la **próxima task abierta**
   (primer checkbox `[ ]` sin cerrar, en orden).
3. Leé `.claude/rules/workflow.md` (contrato de ejecución).
4. Antes de arrancar, decime en una línea: qué task es y qué incluye.
5. Ejecutá la task siguiendo el plan (es el contrato — no me pidas "¿adelante?"). Pará
   DESPUÉS, con el entregable de cierre (equivalente a `/close-task`).

Si la task tiene pre-requisitos operativos (env vars, pasos manuales en dashboards),
verificalos o recordámelos antes de empezar.

Task específica a arrancar (opcional, si querés saltear el auto-detect): $ARGUMENTS
