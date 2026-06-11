# Arquitectura

Leer antes de features o refactors.

- **React 19 + React Compiler**: enabled vía `@rolldown/plugin-babel` +
  `babel-plugin-react-compiler` en `vite.config.js`. NO agregar manualmente
  `useMemo`/`useCallback` para estabilidad referencial — el compiler maneja la
  memoización. Reservar esos hooks solo para dependencias semánticas. Nota: el compiler
  impacta perf de dev/build.
- **Tailwind v4 CSS-first, sin `tailwind.config.js`**: toda la config vive en
  `src/index.css` con `@theme inline` (CSS vars mapeadas a tokens Tailwind) y
  `@custom-variant dark` (data-theme attribute). NO agregar reset universal tipo
  `* { margin: 0; padding: 0 }` después de `@import 'tailwindcss'` — sobreescribe
  utilities como `mx-auto`. Preflight ya hace el reset moderno necesario.
- **Entry**: `index.html` → `src/main.jsx` → `src/App.jsx`.
- **Static SVG sprite**: `public/icons.svg` se referencia vía `<use href="/icons.svg#id">`.
  Agregar íconos nuevos como entradas `<symbol id="...">` ahí, no importar SVGs sueltos.
- **Routing**: React Router v7. Rutas en `src/App.jsx` (`/`, `/proyectos/:slug`,
  `*` → 404), con layout route que envuelve Navbar + Footer. Las rutas `/admin/*` van
  lazy-loaded fuera del Layout público.
- **Contenido**: `src/data/` fue la fuente única de verdad del contenido del portfolio.
  Con Phase 12 (Supabase) los **projects** migran a DB (runtime fetch vía hooks
  `useProjects`/`useProject`); el resto (`experience.js`, `skills.js`, `education.js`,
  `socials.js`) sigue en `src/data/`.
- **Backend**: serverless functions de Vercel en `api/`. `api/contact.js` maneja el form
  (honeypot + rate limit Upstash + Turnstile + Resend). Corren en Node — usan `process.env`.
- **Data layer Supabase**: `src/lib/supabase.js` (cliente singleton),
  `src/lib/projects-mapper.js` (snake↔camel), `src/lib/storage.js` (upload/remove
  imágenes). Schema/RLS versionados en `supabase/migrations/`.
- **Scripts**: `scripts/` — `generate-sitemap.js` (corre en `build`),
  `optimize-images.js` (manual), `seed-projects.js` (seed inicial de la DB).
