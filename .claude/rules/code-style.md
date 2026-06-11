# Estilo de código (override de defaults Claude Code)

**Aplica al tocar `src/**`.** Este proyecto es herramienta de aprendizaje React para
Giuliano (principiante). Por eso el código va con:

1. **Indentación impecable**: 2 espacios consistente. Props JSX largas alineadas
   verticalmente cuando ayuda a leer. Separación visual entre bloques lógicos.
2. **Comentarios pedagógicos abundantes en español rioplatense**:
   - Cada hook (`useState`, `useEffect`, custom) lleva comentario explicando qué hace.
   - Cada decisión no-obvia (ternarios con lógica de producto, side effects,
     destructurings complejos) se explica en línea.
   - Bloques de imports agrupados (React core / libs externas / componentes propios /
     data) con comentario de grupo cuando ayuda.
   - **NO** comentar lo obvio (`import React from 'react'`, returns triviales).
3. **Override explícito**: este es el opuesto al default "no comments" de Claude Code.
   Aplica SOLO a este proyecto.

Cuando agregue/modifique código en este repo, siempre con este estilo.

## NO emojis Unicode en UI

NO usar emojis Unicode en UI (📍, 🇪🇸, ☾, ●, etc.). Para íconos usar siempre
`lucide-react` (`<MapPin size={14} />`, `<Mail />`, `<Github />`, etc.) o el sprite
`public/icons.svg` para marcas no incluidas en lucide.

Razón: emojis se renderizan distinto por OS/font (verde en Apple, plano en Windows,
color random en Linux), rompen consistencia visual y no escalan con tipografía. Lucide
es SVG vectorial, hereda `currentColor` y respeta `size`. Aplica a todo el proyecto
retroactivamente — si veo un emoji en un componente existente, lo reemplazo.
