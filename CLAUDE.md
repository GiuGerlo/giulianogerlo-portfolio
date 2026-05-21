# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site for Giuliano Gerlo. Built with React 19 + Vite 8. Goal: production-quality showcase to deploy and use for self-marketing.

## Package manager

**pnpm 11+** (no npm). Razón: defaults seguros contra supply chain attacks (TanStack/Mistral/etc. ataques de 2025). Config en `.npmrc`:
- `minimum-release-age=1440` — no instala paquetes publicados hace menos de 24hs.
- `auto-install-peers=true`.

Lockfile: `pnpm-lock.yaml` (commiteado). `package-lock.json` NO existe.

**Excepción documentada**: `@colbymchenry/codegraph` se instala vía `npm i -g` (no pnpm). Ver sección [CodeGraph](#codegraph) más abajo.

## CodeGraph

Este proyecto usa **CodeGraph** ([colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)) como MCP server para Claude Code. Es un índice AST (tree-sitter) de todos los símbolos del codebase — permite que Claude responda preguntas estructurales ("qué llama a X", "qué se rompe si cambio Y", "dónde está definido Z") en milisegundos, sin grep ni reads múltiples.

### Setup en una PC nueva

Si clonás el repo en otra máquina y `codegraph` NO está instalado, ejecutar **en este orden**:

```bash
# 1. Instalar el binario CLI + MCP server (excepción a la regla pnpm).
#    Va con npm global porque better-sqlite3 11.x no tiene prebuild para
#    Node 24, y compilarlo local requiere VS C++ Build Tools en Windows.
#    Riesgo de supply chain: cero — codegraph NO está en package.json del
#    proyecto, no se deploya, no corre en CI/CD ni Vercel build. Es solo
#    una herramienta dev local.
npm i -g @colbymchenry/codegraph

# 2. Construir el índice del proyecto (crea `.codegraph/codegraph.db`).
#    El dir `.codegraph/` ya está en `.gitignore`.
codegraph init

# 3. Registrar el MCP server en Claude Code a nivel proyecto.
#    Esto crea/actualiza `.mcp.json` y `.claude.json` — ya están commiteados,
#    así que en teoría con el repo clonado ya están, pero re-correr este
#    comando regenera la config si está rota.
codegraph install -t claude -l local -y

# 4. Reiniciar Claude Code (cerrar sesión, abrir nueva en el proyecto).
#    Las tools MCP se cargan al iniciar, no en runtime.

# 5. Verificar que conectó:
claude mcp list
# → debe mostrar: `codegraph: codegraph serve --mcp - ✓ Connected`
```

### Cómo Claude usa CodeGraph

Las instrucciones detalladas de cuándo usar cada tool (`codegraph_search`, `codegraph_callers`, `codegraph_callees`, `codegraph_impact`, `codegraph_node`, `codegraph_context`, `codegraph_explore`, `codegraph_files`, `codegraph_status`) viven en [.claude/CLAUDE.md](.claude/CLAUDE.md) — ese archivo se carga automáticamente en cada sesión.

Resumen: preferir CodeGraph sobre grep/read para preguntas estructurales. Trust los resultados (vienen de un parse AST completo). No re-verificar con grep.

### Si las tools no aparecen

- `claude mcp list` no muestra `codegraph` → correr `codegraph install -t claude -l local -y`.
- `claude mcp list` muestra `✗ Failed` → probar `codegraph status` (verifica binary + índice). Si el índice está corrupto, `codegraph uninit && codegraph init`.
- Las tools `codegraph_*` no aparecen en la sesión → reiniciar Claude Code (cerrar/abrir).

## Commands

- `pnpm dev` — Vite dev server with HMR
- `pnpm build` — production build to `dist/`
- `pnpm preview` — serve built output locally
- `pnpm lint` — ESLint over entire repo (`eslint .`)
- `pnpm test` — Vitest watch mode
- `pnpm test:run` — Vitest single run (CI-style)
- `pnpm test:ui` — Vitest web UI
- `pnpm optimize:images` — convierte imágenes de `public/` a WebP (`scripts/optimize-images.js`)
- `pnpm dlx react-doctor@latest` — auditoría React (perf, hooks, anti-patterns, accessibility). Correr sin instalar. Usar cuando se quiera diagnóstico del estado del código React.
- `pnpm add <pkg>` — add dependency
- `pnpm add -D <pkg>` — add dev dependency

Referencia completa de comandos en [docs/comandos.md](docs/comandos.md) (incluye troubleshooting, convención de commits, estructura del repo).

## Architecture

- **React 19 + React Compiler**: enabled via `@rolldown/plugin-babel` + `babel-plugin-react-compiler` in [vite.config.js](vite.config.js). Do not manually add `useMemo`/`useCallback` for referential stability — the compiler handles memoization. Reserve those hooks for semantic dependencies only. Note: compiler impacts dev/build perf.
- **Tailwind v4 CSS-first, no `tailwind.config.js`**: toda la config vive en [src/index.css](src/index.css) con `@theme inline` (CSS vars mapeadas a tokens Tailwind) y `@custom-variant dark` (data-theme attribute). NO agregar reset universal tipo `* { margin: 0; padding: 0 }` después de `@import 'tailwindcss'` — sobreescribe utilities como `mx-auto`. Preflight ya hace el reset moderno necesario.
- **Entry**: [index.html](index.html) → [src/main.jsx](src/main.jsx) → [src/App.jsx](src/App.jsx).
- **Static SVG sprite**: [public/icons.svg](public/icons.svg) is referenced via `<use href="/icons.svg#id">`. Add new icons as `<symbol id="...">` entries there rather than importing individual SVGs.
- **Routing**: React Router v7. Rutas en [src/App.jsx](src/App.jsx) (`/`, `/proyectos/:slug`, `*` → 404), con layout route que envuelve Navbar + Footer.
- **Contenido**: [src/data/](src/data/) es la **fuente única de verdad** del contenido del portfolio (`projects.js`, `experience.js`, `skills.js`, `education.js`, `socials.js`). Editar el contenido ahí, no en los componentes.
- **Backend**: serverless functions de Vercel en [api/](api/). `api/contact.js` maneja el form (honeypot + rate limit Upstash + Turnstile + Resend). Corren en Node — usan `process.env`.
- **Scripts**: [scripts/](scripts/) — `generate-sitemap.js` (corre en `build`) y `optimize-images.js` (manual).
- **ESLint**: flat config in [eslint.config.js](eslint.config.js) with `react-hooks` and `react-refresh` plugins. JS/JSX only — no TypeScript. Bloque aparte con globals de Node para `api/**` y `scripts/**`.

## Conventions

- ES modules (`"type": "module"` in package.json).
- JSX files use `.jsx` extension.
- Assets imported from `src/assets/` are bundled; files under `public/` are served at root unchanged.
- **NO emojis Unicode en UI** (📍, 🇪🇸, ☾, ●, etc.). Para íconos usar siempre `lucide-react` (`<MapPin size={14} />`, `<Mail />`, `<Github />`, etc.) o el sprite `public/icons.svg` para marcas no incluidas en lucide. Razón: emojis se renderizan distinto por OS/font (verde en Apple, plano en Windows, color random en Linux), rompen consistencia visual y no escalan con tipografía. Lucide es SVG vectorial, hereda `currentColor` y respeta `size`. Aplica a todo el proyecto retroactivamente — si veo un emoji en un componente existente, lo reemplazo.

## Estilo de código (override de defaults Claude Code)

**Este proyecto es herramienta de aprendizaje React para Giuliano (principiante).** Por eso el código va con:

1. **Indentación impecable**: 2 espacios consistente. Props JSX largas alineadas verticalmente cuando ayuda a leer. Separación visual entre bloques lógicos.
2. **Comentarios pedagógicos abundantes en español rioplatense**:
   - Cada hook (`useState`, `useEffect`, custom) lleva comentario explicando qué hace.
   - Cada decisión no-obvia (ternarios con lógica de producto, side effects, destructurings complejos) se explica en línea.
   - Bloques de imports agrupados (React core / libs externas / componentes propios / data) con comentario de grupo cuando ayuda.
   - **NO** comentar lo obvio (`import React from 'react'`, returns triviales).
3. **Override explícito**: este es el opuesto a mi default "no comments". Aplica SOLO a este proyecto.

Cuando agregue/modifique código en este repo, siempre con este estilo.

## Owner profile & communication

- **Owner**: Giuliano Gerlo — Full-Stack Developer (PHP / Laravel / MySQL strong, React beginner).
- **Location/language**: Rosario, Argentina. Respond in español rioplatense.
- **React level**: PRINCIPIANTE. Cuando se introduce un patrón React nuevo (hook, JSX feature, lib API), explicar brevemente en chat (no en comentarios de código). Si ya se explicó en la sesión, no repetir. El portfolio es también herramienta de práctica — el aprendizaje es objetivo, no efecto colateral.
- **Email contacto público**: ggiuliano526@gmail.com
- **Email cuenta de trabajo (RAMCC)**: desarrolloramcc25@gmail.com

## Reference skills en .agents/skills/

Antes de trabajar en cualquier tarea, leer el `SKILL.md` de la skill correspondiente en `.agents/skills/`:

| Tarea | Skill a leer |
|-------|-------------|
| Componentes React, composición, props | `.agents/skills/composition-patterns/SKILL.md` |
| Estilos, layout, animaciones | `.agents/skills/tailwind-css-patterns/SKILL.md` |
| Diseño visual, UI/UX | `.agents/skills/frontend-design/SKILL.md` |
| Accesibilidad | `.agents/skills/accessibility/SKILL.md` |
| Formularios | `.agents/skills/react-hook-form/SKILL.md` |
| Vite config, build, plugins | `.agents/skills/vite/SKILL.md` |
| Tests | `.agents/skills/vitest/SKILL.md` |
| SEO, meta tags | `.agents/skills/seo/SKILL.md` |
| Node/backend scripts | `.agents/skills/nodejs-best-practices/SKILL.md` |
| Brainstorming / diseño de feature | `.agents/skills/brainstorming/SKILL.md` |

Cada skill puede tener una carpeta `references/` con docs detallados — leerlos cuando la tarea lo requiera.

## Source of truth for the project

- [docs/plans/2026-05-13-portfolio-design.md](docs/plans/2026-05-13-portfolio-design.md) — design doc aprobado (sistema visual, arquitectura, decisiones técnicas).
- [docs/plans/2026-05-13-portfolio-implementation-plan.md](docs/plans/2026-05-13-portfolio-implementation-plan.md) — plan de implementación task-por-task. Estado: **Phases 0-11 completas, sitio + chatbot deployados** en https://giulianogerlo.vercel.app.
- [docs/plans/2026-05-21-phase-12-supabase.md](docs/plans/2026-05-21-phase-12-supabase.md) — **Phase 12 (en curso)**: backend dinámico + admin `/admin` con Supabase (Postgres + Auth magic link + Storage). Scope v1: solo Projects. Mantener el "Log de cambios" sincronizado entre PCs vía git.
- [docs/dependencias.md](docs/dependencias.md) — qué hace cada dependencia del proyecto.
- [docs/comandos.md](docs/comandos.md) — comandos, troubleshooting, estructura del repo.
- [TODO-USUARIO.md](TODO-USUARIO.md) — checklist de cuentas/assets/keys que Giuliano tiene que conseguir fuera del código.

## Ejecución del plan

Modo elegido: **subagent-driven con paradas**. Por cada task: dispatch subagent → revisar resultado → explicar al usuario → usuario testea → usuario commitea → siguiente task. NO commitear automáticamente — el usuario lo hace manualmente.
