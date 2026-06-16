# CLAUDE.md

Guía para Claude Code en este repo. Las reglas detalladas viven en `.claude/rules/` —
este archivo es lean a propósito (índice + lo que aplica siempre). Leé la rule
correspondiente antes de cada tipo de tarea (tabla abajo).

## Project

Portfolio personal de Giuliano Gerlo. React 19 + Vite 8. Objetivo: showcase de calidad
producción para deploy y auto-marketing. Deployado en https://giulianogerlo.vercel.app.

## Stack

- **Frontend**: React 19 (+ React Compiler), Vite 8, React Router v7, Tailwind v4
  (CSS-first, sin config file), lucide-react.
- **Backend**: serverless functions de Vercel en `api/` (Node). Form de contacto con
  Upstash + Turnstile + Resend.
- **Data dinámica**: Supabase (Postgres + Auth magic link + Storage) — Phase 12 en curso.
- **Package manager**: pnpm 11+ (NO npm). Tests: Vitest. Lint: ESLint flat config.

## Comandos esenciales

- `pnpm dev` — dev server con HMR
- `pnpm build` — build de producción a `dist/`
- `pnpm lint` — ESLint sobre todo el repo
- `pnpm test:run` — Vitest single run (CI-style)
- `pnpm add <pkg>` / `pnpm add -D <pkg>` — agregar dep / dev dep

Referencia completa + troubleshooting en [docs/comandos.md](docs/comandos.md).

## Reglas que aplican SIEMPRE

- **pnpm only** (nunca npm). Ver [conventions.md](.claude/rules/conventions.md).
- **Español rioplatense** en chat. El owner es principiante React — explicar patrones
  nuevos. Ver [owner-profile.md](.claude/rules/owner-profile.md).
- **Comentarios pedagógicos** en código + **NO emojis Unicode** en UI (usar lucide-react
  o `public/icons.svg`). Ver [code-style.md](.claude/rules/code-style.md).
- **Modo caveman activo** para ahorrar tokens (lo activa el plugin solo). Excepción:
  explicar patrones React nuevos al owner va claro, no comprimido (es principiante).
- **Cerrar cada task** con el commit sugerido + sync del log del plan. Ver
  [workflow.md](.claude/rules/workflow.md).

## Tabla de punteros — leé X antes de Y

| Tarea | Leer |
|-------|------|
| Tocar `src/**` (estilo, comentarios, no-emojis) | `.claude/rules/code-style.md` |
| Instalar dep / crear archivo / ESLint | `.claude/rules/conventions.md` |
| Features, refactors, entender la arquitectura | `.claude/rules/architecture.md` |
| Cualquier task de un plan `docs/plans/*` | `.claude/rules/workflow.md` |
| Comunicación con el owner | `.claude/rules/owner-profile.md` |
| Preguntas estructurales del código | `.claude/CLAUDE.md` (uso CodeGraph, auto-cargado) |
| Setup de CodeGraph en PC nueva | `.claude/rules/codegraph-setup.md` |

## Skills disponibles (carga progresiva)

Viven como carpetas reales en `.claude/skills/` (commiteadas → sincronizan por git, sin
reinstalar en otra PC). Se instalan con skills.sh (`npx skills add`) y se convierten de
symlink a carpeta real antes de commitear (git en Windows no versiona symlinks). Ver
`/new-pc-setup`.

| Skill | Para qué |
|-------|----------|
| `frontend-design` | diseño visual, UI/UX |
| `seo` | meta tags, structured data, sitemap |
| `nodejs-best-practices` | Node/backend scripts (`api/`, `scripts/`) |
| `accessibility` | auditoría WCAG 2.2, a11y |
| `vitest` | tests (mocking, coverage, fixtures) |
| `tailwind-design-system` | Tailwind v4, design tokens, componentes |
| `vercel-react-best-practices` | performance React/hooks/bundle |
| `brainstorming` | diseño de feature antes de codear |
| `find-skills` | descubrir/instalar nuevas skills (`/find-skills`) |

Del plugin Vercel: `supabase:supabase` (RLS/auth/migrations), `supabase:supabase-postgres-best-practices`,
`vercel:ai-sdk`/`vercel:ai-gateway` (chatbot Gemini), `vercel:vercel-functions` (`api/`).

## MCP servers (`.mcp.json` + plugins)

| MCP | Para qué |
|-----|----------|
| `codegraph` | índice AST del código — preguntas estructurales |
| `supabase` | DB/Auth/Storage/RLS de Supabase |
| `context7` | docs live de libs (React 19, Tailwind v4, Supabase) — anti API vieja |
| `playwright` | manejar browser real — verificar `/admin` end-to-end |
| `vercel` (plugin) | deploys, logs, env |

## Slash commands del proyecto (`.claude/commands/`)

- `/close-task` — entregable de cierre de task + log del plan.
- `/next-task` — arranca la próxima task abierta del plan activo.
- `/sync-plan-log` — reconcilia el log del plan con `git log`.
- `/new-pc-setup` — onboarding en PC nueva.

## Source of truth

- [docs/plans/2026-05-13-portfolio-design.md](docs/plans/2026-05-13-portfolio-design.md) — design doc aprobado.
- [docs/plans/2026-05-13-portfolio-implementation-plan.md](docs/plans/2026-05-13-portfolio-implementation-plan.md) — plan principal. Phases 0-11 completas.
- [docs/plans/2026-05-21-phase-12-supabase.md](docs/plans/2026-05-21-phase-12-supabase.md) — **Phase 12 (cerrada, en prod)**: backend dinámico + admin `/admin` con Supabase (projects).
- [docs/plans/2026-06-16-phase-13-perfil-editable.md](docs/plans/2026-06-16-phase-13-perfil-editable.md) — **Phase 13 (cerrada)**: TODO el contenido del sitio editable desde `/admin` (Hero, About, Stack Técnico, AI Integration, Experiencia, Educación+certs, CV, Footer/redes). Tablas `profile` + `site_settings` (singletons) + `skill_groups`/`ai_skills`/`experience`/`education` (listas con CRUD inline) + bucket `documents`. Editor WYSIWYG TipTap, WebP en uploads, `ConfirmDialog`, reorder de chips.
- [docs/dependencias.md](docs/dependencias.md) — qué hace cada dependencia.
- [TODO-USUARIO.md](TODO-USUARIO.md) — checklist de cuentas/assets/keys a conseguir fuera del código.
