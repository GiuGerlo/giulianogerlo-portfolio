# Portfolio — Giuliano Gerlo

Portfolio personal de [Giuliano Gerlo](https://github.com/GiuGerlo), desarrollador Full-Stack de Rosario, Argentina.

**Sitio en vivo:** https://giulianogerlo.vercel.app

---

## Stack

- **React 19** + **React Compiler** — memoización automática (sin `useMemo`/`useCallback` a mano).
- **Vite 8** — bundler y dev server.
- **Tailwind CSS v4** — config CSS-first en `src/index.css`, sin `tailwind.config.js`.
- **React Router v7** — routing del lado del cliente.
- **Vitest** + **Testing Library** — tests unitarios y de componentes.
- **Vercel** — hosting, serverless functions y analytics.

Animaciones con `motion`, `animejs`, `lenis` y `ogl`. Detalle completo de cada dependencia en [`docs/dependencias.md`](docs/dependencias.md).

## Features

- Landing de una página con 8 secciones (Hero, About, Skills, AI, Projects, Experience, Education, Contact).
- Páginas de detalle por proyecto (`/proyectos/:slug`).
- Tema claro/oscuro persistente.
- Formulario de contacto con **4 capas anti-spam**: honeypot, rate limiting (Upstash Redis), Cloudflare Turnstile y validación server-side. Envío de email vía Resend desde una serverless function.
- SEO: meta tags, Open Graph, Twitter Card, `sitemap.xml` generado en build, `robots.txt`.
- Headers de seguridad (`vercel.json`) e imágenes optimizadas a WebP.

## Setup local

Requisitos: **Node.js 20+** y **pnpm 11+**.

```bash
git clone https://github.com/GiuGerlo/giulianogerlo-portfolio.git
cd giulianogerlo-portfolio
pnpm install
pnpm dev
```

El formulario de contacto necesita un archivo `.env` (ver [`.env.example`](.env.example)). Para probar las serverless functions de `/api` localmente hace falta `vercel dev` en lugar de `pnpm dev`.

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Dev server con HMR (`http://localhost:5173`) |
| `pnpm build` | Build de producción a `dist/` (genera el sitemap) |
| `pnpm preview` | Sirve el build localmente |
| `pnpm test` | Tests en watch mode |
| `pnpm test:run` | Tests una vez (CI) |
| `pnpm lint` | ESLint sobre todo el repo |
| `pnpm optimize:images` | Convierte imágenes de `public/` a WebP |

Referencia completa en [`docs/comandos.md`](docs/comandos.md).

## Estructura

```
api/        Serverless functions de Vercel (form de contacto)
scripts/    Scripts de build/assets (sitemap, optimización de imágenes)
public/     Assets servidos sin procesar
src/
  pages/        Páginas de ruta completa
  components/   Componentes (layout / ui / sections)
  hooks/        Custom hooks
  lib/          Utilidades
  data/         Fuente única de verdad del contenido (proyectos, skills, ...)
docs/       Documentación del proyecto
```

El contenido del portfolio (proyectos, experiencia, skills) se edita en `src/data/` — un solo lugar.

## Seguridad

- Las API keys viven solo en variables de entorno (`.env` está en `.gitignore`); nunca en el bundle del cliente ni en el repo.
- pnpm con `minimum-release-age` de 24 hs contra ataques de supply chain.
- `pnpm audit` sin vulnerabilidades conocidas.

## Documentación

- [`docs/comandos.md`](docs/comandos.md) — comandos y troubleshooting.
- [`docs/dependencias.md`](docs/dependencias.md) — qué hace cada dependencia.
- [`docs/plans/`](docs/plans/) — design doc y plan de implementación.

---

Hecho con React. Código bajo este repo; contenido y assets © Giuliano Gerlo.
