---
description: Cierra la task actual con el entregable obligatorio de 4 puntos + actualiza el log del plan
---

Cerrá la task en la que estuvimos trabajando siguiendo el contrato de
`.claude/rules/workflow.md`. Escribí en chat, en este orden:

1. **Archivos modificados/nuevos** — 1 línea por archivo, qué cambió.
2. **Cómo testearlo manualmente paso a paso** — comandos de terminal y/o pasos en
   navegador con qué verificar. Si es 100% backend/library, indicá los tests automáticos
   a correr (`pnpm test:run …`) + chequeo de que `pnpm dev` arranca sin errores.
3. **Commit sugerido** — una sola línea (Conventional Commits), sin descripción larga
   salvo que yo la pida.
4. **Qué viene next** — la próxima task del plan.

Además, ANTES de devolverme el turno:

- Agregá una entrada al "Log de cambios" del plan activo en `docs/plans/*.md` (fecha de
  hoy + qué se cerró + archivos clave + resultado de lint/tests). Mantené orden
  cronológico.
- Marcá los checkboxes `[x]` de la task en la sección de tasks del plan.

NO commitees vos — el commit lo hago yo a mano.

Contexto extra opcional: $ARGUMENTS
