# Workflow de ejecución de planes

Leer en toda task que forme parte de un plan en `docs/plans/*.md`.

## Modo de ejecución

Modo elegido: **subagent-driven con paradas**. Por cada task: dispatch subagent →
revisar resultado → explicar al usuario → usuario testea → usuario commitea → siguiente
task. NO commitear automáticamente — el usuario lo hace manualmente.

**Si hay plan task-por-task aprobado en `docs/plans/*.md`, ejecutar cada task sin pedir
"¿adelante?" antes de empezar.** El plan es el contrato — la parada es DESPUÉS de la task
(entrega para test + commit), no antes. Solo parar antes si surge desvío real, decisión
nueva no cubierta, o ambigüedad del plan.

## Cierre de cada task — entregable obligatorio al usuario

Al cerrar **cada** task, antes de devolverle el turno, escribir SIEMPRE en chat:

1. **Resumen de archivos modificados/nuevos** (1 línea por archivo).
2. **Cómo testearlo manualmente paso a paso** — comandos a correr en terminal y/o pasos
   en navegador con qué tiene que ver/verificar. Sin esto el usuario no entiende qué se
   hizo. Si la task es 100% backend/library sin UI, indicar tests automáticos a correr
   (`pnpm test:run …`) + chequeo de que `pnpm dev` arranca sin errores.
3. **Nombre del commit sugerido** (sola línea, sin descripción larga salvo que el usuario
   la pida).
4. **Qué viene next** (próxima task).

## Mantenimiento del log del plan

Después de cada task cerrada, agregar entrada al "Log de cambios" del plan
correspondiente. Los desvíos se documentan in-line en `docs/plans/*.md` en el momento,
no solo en chat (el usuario trabaja entre 2 PCs y sincroniza vía git).
