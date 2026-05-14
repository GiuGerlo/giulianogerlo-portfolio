# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site for Giuliano Gerlo. Built with React 19 + Vite 8. Goal: production-quality showcase to deploy and use for self-marketing.

## Package manager

**pnpm 11+** (no npm). Razón: defaults seguros contra supply chain attacks (TanStack/Mistral/etc. ataques de 2025). Config en `.npmrc`:
- `minimum-release-age=1440` — no instala paquetes publicados hace menos de 24hs.
- `auto-install-peers=true`.

Lockfile: `pnpm-lock.yaml` (commiteado). `package-lock.json` NO existe.

## Commands

- `pnpm dev` — Vite dev server with HMR
- `pnpm build` — production build to `dist/`
- `pnpm preview` — serve built output locally
- `pnpm lint` — ESLint over entire repo (`eslint .`)
- `pnpm test` — Vitest watch mode
- `pnpm test:run` — Vitest single run (CI-style)
- `pnpm test:ui` — Vitest web UI
- `pnpm add <pkg>` — add dependency
- `pnpm add -D <pkg>` — add dev dependency

Referencia completa de comandos en [docs/comandos.md](docs/comandos.md) (incluye troubleshooting, convención de commits, estructura del repo).

## Architecture

- **React 19 + React Compiler**: enabled via `@rolldown/plugin-babel` + `babel-plugin-react-compiler` in [vite.config.js](vite.config.js). Do not manually add `useMemo`/`useCallback` for referential stability — the compiler handles memoization. Reserve those hooks for semantic dependencies only. Note: compiler impacts dev/build perf.
- **Entry**: [index.html](index.html) → [src/main.jsx](src/main.jsx) → [src/App.jsx](src/App.jsx).
- **Static SVG sprite**: [public/icons.svg](public/icons.svg) is referenced via `<use href="/icons.svg#id">`. Add new icons as `<symbol id="...">` entries there rather than importing individual SVGs.
- **Styling**: plain CSS — global [src/index.css](src/index.css), component [src/App.css](src/App.css). No CSS framework installed yet.
- **ESLint**: flat config in [eslint.config.js](eslint.config.js) with `react-hooks` and `react-refresh` plugins. JS/JSX only — no TypeScript.

## Conventions

- ES modules (`"type": "module"` in package.json).
- JSX files use `.jsx` extension.
- Assets imported from `src/assets/` are bundled; files under `public/` are served at root unchanged.

## Owner profile & communication

- **Owner**: Giuliano Gerlo — Full-Stack Developer (PHP / Laravel / MySQL strong, React beginner).
- **Location/language**: Rosario, Argentina. Respond in español rioplatense.
- **React level**: PRINCIPIANTE. Cuando se introduce un patrón React nuevo (hook, JSX feature, lib API), explicar brevemente en chat (no en comentarios de código). Si ya se explicó en la sesión, no repetir. El portfolio es también herramienta de práctica — el aprendizaje es objetivo, no efecto colateral.
- **Email contacto público**: ggiuliano526@gmail.com
- **Email cuenta de trabajo (RAMCC)**: desarrolloramcc25@gmail.com

## Source of truth for the project

- [docs/plans/2026-05-13-portfolio-design.md](docs/plans/2026-05-13-portfolio-design.md) — design doc aprobado (sistema visual, arquitectura, decisiones técnicas).
- [docs/plans/2026-05-13-portfolio-implementation-plan.md](docs/plans/2026-05-13-portfolio-implementation-plan.md) — plan de implementación task-por-task. Fase actual: **Phase 0**.
- [TODO-USUARIO.md](TODO-USUARIO.md) — checklist de cuentas/assets/keys que Giuliano tiene que conseguir fuera del código.
- [mockup.html](mockup.html) — mockup HTML de referencia visual (se elimina en Phase 10).

## Ejecución del plan

Modo elegido: **subagent-driven con paradas**. Por cada task: dispatch subagent → revisar resultado → explicar al usuario → usuario testea → usuario commitea → siguiente task. NO commitear automáticamente — el usuario lo hace manualmente.
