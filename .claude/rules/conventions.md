# Convenciones del proyecto

Leer al instalar dependencias o crear archivos nuevos.

## Package manager

**pnpm 11+** (no npm). Razón: defaults seguros contra supply chain attacks
(TanStack/Mistral/etc. ataques de 2025). Config en `.npmrc`:
- `minimum-release-age=1440` — no instala paquetes publicados hace menos de 24hs.
- `auto-install-peers=true`.

Lockfile: `pnpm-lock.yaml` (commiteado). `package-lock.json` NO existe.

Comandos: `pnpm add <pkg>` (dependencia), `pnpm add -D <pkg>` (dev dependency).

**Excepción documentada**: `@colbymchenry/codegraph` se instala vía `npm i -g` (no pnpm).
Ver [codegraph-setup.md](codegraph-setup.md).

## Convenciones de código

- ES modules (`"type": "module"` en package.json).
- Archivos JSX usan extensión `.jsx`.
- Assets importados desde `src/assets/` se bundlean; archivos bajo `public/` se sirven
  en root sin cambios.

## Estilo y skills

- Para estilo de código (comentarios pedagógicos, no-emojis): ver [code-style.md](code-style.md).
- ESLint: flat config en `eslint.config.js` con plugins `react-hooks` y `react-refresh`.
  JS/JSX only — no TypeScript. Bloque aparte con globals de Node para `api/**` y `scripts/**`.
