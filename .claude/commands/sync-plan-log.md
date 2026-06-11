---
description: Reconcilia el Log de cambios del plan con los commits recientes de git
---

Sincronizá el "Log de cambios" del plan activo con el historial real de git (lo que se
hizo a mano cuando el log quedó atrás de los commits).

Pasos:

1. Identificá el plan activo en `docs/plans/*.md`.
2. Mirá los commits recientes: `git log --oneline -15`. Fijate hasta qué task llega el
   log del plan vs. hasta dónde llegan los commits.
3. Para cada task commiteada pero NO documentada en el log:
   - Leé el diff del commit (`git show <hash> --stat` y el contenido relevante) para
     redactar con precisión.
   - Agregá una entrada al "Log de cambios" (misma forma que el resto: fecha + task + qué
     se hizo + archivos clave + resultado lint/tests). Respetá el orden cronológico.
   - Marcá los checkboxes `[x]` de esa task en la sección de tasks.
4. Mostrame un resumen de qué entradas agregaste.

NO inventes detalles — todo sale de los diffs reales. NO commitees vos.

Plan o rango de commits específico (opcional): $ARGUMENTS
