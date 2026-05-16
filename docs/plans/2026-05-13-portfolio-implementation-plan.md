# Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir portfolio personal de Giuliano Gerlo en React 19 + Vite, dual mode dark/light, deployado en Vercel con form de contacto seguro.

**Architecture:** Vite SPA con React Router v6. Single-page home compone secciones desde `src/data/*.js`. Página de detalle por proyecto en `/proyectos/:slug`. Form de contacto vía Vercel serverless (`api/contact.js`) → Resend. Anti-spam con honeypot + Cloudflare Turnstile + rate limit + email obfuscation.

**Tech Stack:** React 19 (Compiler activo), Vite 8, Tailwind CSS v4 (CSS-first config, sin `tailwind.config.js`), shadcn/ui (manual copy), Motion, Lenis, Anime.js (hero), React Router v7, react-hook-form, zod, lucide-react, Resend, Cloudflare Turnstile, Vercel.

## Log de cambios al plan

- **2026-05-14**: Task 0.3 reescrito — Tailwind v4 estable usa **CSS-first config**, no `tailwind.config.js` (sintaxis v3). Config dentro de `src/index.css` con `@theme inline` y `@custom-variant dark`. Versiones reales instaladas: `tailwindcss@4.3.0`, `@tailwindcss/postcss@4.3.0`.
- **2026-05-14**: Task 0.4 actualizado — se instaló `react-router-dom@7.15.0` (v7), no v6. APIs idénticas para el uso del plan.
- **2026-05-14**: Task 0.5 — `animejs` resolvió a v4.4.1, API muy distinta a v3. Adaptar Task 6.3 (hero typewriter) al patrón v4 (`animate(target, options)` en vez de `anime({ targets })`). Corregido también el commit step que decía `package-lock.json` (estamos en pnpm → `pnpm-lock.yaml`).
- **2026-05-14**: Task 0.6 ✅ — Vitest 4.1.6 + Testing Library funcionando. 2 smoke tests de routing pasan. **Phase 0 completa.**
- **2026-05-14**: Task 1.1 ✅ — hook `useTheme` con 5 tests (los 3 del plan eran flaky por falta de cleanup de localStorage entre tests; se agregó `beforeEach` + 2 tests extras).
- **2026-05-14**: Task 1.2 ✅ — componente `ThemeToggle` con 3 tests (renders + toggle + persist). Mismo patrón `beforeEach` que useTheme.
- **2026-05-14**: Task 1.3 ✅ — Navbar. lucide-react v1 sacó brand icons → migración a sprite `public/icons.svg` con `fill="currentColor"`. Agregado `linkedin-icon` al sprite. 14 tests passing en total.
- **2026-05-14**: Task 1.3 refinado — bug encontrado: el reset `* { margin: 0; padding: 0 }` en `src/index.css` venía DESPUÉS de `@import 'tailwindcss'` y con misma especificidad → sobreescribía `mx-auto` (margin: auto) rompiendo centrado de containers. Tailwind v4 preflight ya hace los resets correctos; el universal `*` reset es **innecesario y dañino**. Removido. Navbar refactor: agregado menú hamburguesa mobile-first con useState + íconos Menu/X de lucide. Backfilled comentarios pedagógicos en archivos previos (useTheme, ThemeToggle, App, main, Home, NotFound, index.css). 15 tests passing.
- **2026-05-14**: Task 1.4 ✅ — Footer con 3 columnas responsive + copyright dinámico. Helper `<Icon>` del sprite duplicado de Navbar (TODO refactor a primitive compartido). 20 tests passing.
- **2026-05-14**: Style override registrado en CLAUDE.md y memoria — código en este proyecto va con indentación impecable + comentarios pedagógicos en español. Es herramienta de aprendizaje para Giuliano (principiante React).
- **2026-05-14**: Task 1.5 ✅ — Layout wrapper con `<Outlet />` envolviendo todas las rutas. Removido el `<Navbar />` / `<Footer />` temporal de `Home.jsx` (preview de Task 1.3). `ProjectDetail.jsx` stub creado leyendo `:slug` con `useParams()`. App.test.jsx sumó 2 tests: ruta `/proyectos/:slug` y smoke de Layout (brand + copyright año). 22 tests passing. **Phase 1 completa.**
- **2026-05-14**: Hero → DarkVeil (reactbits.dev, shader WebGL CPPN). BlobCursor sustituido por completo, gsap removido (`pnpm remove gsap`), `ogl@1.0.11` instalado. Archivos: `src/components/ui/DarkVeil.jsx` + `DarkVeil.css`. Spec preservada en `docs/components/darkveil-spec.md` por si hay que re-integrar desde cero. Adaptación: guard try/catch en init del `Renderer` para que jsdom (sin WebGL) no rompa los tests. Tuning: `hueShift=110` (rota verde accent), `speed=0.45`, `noiseIntensity=0.02` (granito sutil), `warpAmount=0.04` (ondulación leve). Encima del veil un overlay `bg-bg/55` baja brillo del fondo para que el texto contraste sin necesidad de text-shadow. BlobCursor.jsx/css borrados. 55 tests passing.
- **2026-05-14**: Smooth transition al togglear theme. Antes solo el `<body>` animaba bg/color (regla `transition` en `body{}`), todo el resto (header, footer, borders, íconos, cards) snappeaba porque heredaba CSS vars que cambiaban de golpe. Fix en `src/index.css`: universal selector `*, *::before, *::after` con `transition-property: background-color, color, border-color, fill, stroke; duration: 250ms; ease;`. Lista de props acotada para que `transform`/`opacity`/`box-shadow` sigan snappy (hover de cards/botones no se vuelve perezoso). Removida la regla redundante del `body{}`. Tradeoff aceptado: universal selector tiene costo CSS marginal — alternativa era taggear cada componente con `transition-colors` Tailwind class, frágil. Si algún componente puntual se siente lento, escape hatch = `transition-none` en ese elemento.
- **2026-05-14**: Fix `useTheme` + Hero veil por theme. Bug encontrado: cada llamada a `useTheme()` creaba state local independiente → toggle desde ThemeToggle solo actualizaba SU state, otras instancias (Logo, Hero) quedaban con valor viejo y mostraban contenido inconsistente. Fix: sumado `MutationObserver` sobre `<html data-theme>` en useTheme — todas las instancias del hook se sincronizan al cambio. No-op cuando el observer dispara con el mismo valor que ya tenía (React skipea el re-render). Alternativa rechazada: refactor a Context — requería wrapper Provider en App.jsx, más invasivo. Hero ahora consume `useTheme()` y pasa props condicionales al `<DarkVeil>`: en dark `hueShift=110` (verde aurora) + overlay `bg-bg/55`; en light `hueShift=215` (azul/lavanda) + overlay `bg-bg/75` (más opaco, look más limpio). `key={theme}` fuerza remount del DarkVeil al toggle para que shader uniforms se reinicialicen.
- **2026-05-14**: Task 4.2 ✅ — About section. Grid responsive (1col mobile / `1fr 280px` desktop) con texto + chips a la izquierda y placeholder foto cuadrada (gradient `from-accent to-bg-elevated` con "GG" 7xl) a la derecha. Reemplazos de emojis del mockup por lucide-react: `📍 Rosario` → `<MapPin>`, `🇪🇸 Español` → `<Languages>`, agregado `<GraduationCap>` al chip de DigitalHouse. **Refactor Chip retroactivo**: el dot del variant 'dot' usaba el carácter Unicode `●` — viola la regla CLAUDE.md (NO emojis Unicode en UI, lista incluía `●` explícitamente). Reemplazado por `<span class="inline-block h-2 w-2 rounded-full bg-accent" data-testid="chip-dot" />`. Tests de Chip actualizados (de `textContent` match a `getByTestId`). 4 tests nuevos About. 59 tests passing.
- **2026-05-14**: Task 4.3 ✅ — Skills section. Grid responsive `auto-fit minmax(240px, 1fr)` con 5 cards (Frontend, Backend, Base de datos, DevOps, Soft Skills). Cada card: cuadrado 36x36 accent-bg con ícono lucide + h3 + tags squared mono pequeños. **Patrón nuevo introducido — icon lookup por nombre**: la data (`src/data/skills.js`) guarda `icon: 'Layout'` como string (serializable, JSON-friendly para futura migración a CMS). El componente resuelve vía objeto `ICONS = { Layout, Server, Database, Wrench, Heart }`. Razón vs import dinámico: tree-shaking — solo entran al bundle los 5 íconos usados, no los ~1000 de lucide-react. Los emojis Unicode del mockup (◧ ⌘ ▤ ⚙ ♡) reemplazados por lucide. Skill tags renderizados inline (no se usa Chip primitive: Chip es pill grande, skill-tag es squared chico — si después se reusa, extraer a primitive Tag). 5 tests Skills (heading / id / cards count / íconos / items). 64 tests passing.
- **2026-05-14**: Ajuste pre-Phase 4.4 — entry `claude_code` reemplazada por `ai_dev_tooling` consolidada en `aiSkills` (src/data/skills.js). Agrupa Claude Code, OpenAI Codex, GitHub Copilot, OpenCode, Claude Skills, Claude Plugins. Field nuevo opcional `items[]` en el shape de aiSkills: si existe, AISection lo renderiza como tags chicos debajo del desc. MCP queda separado (es protocolo, no asistente). Total entries sigue en 6, todas `status: 'active'`. Shape ahora: `{ id, title, status, desc, items? }`.
- **2026-05-14**: Task 4.4 ✅ — AISection. Bloque destacado dentro de `<article>` con `bg-bg-elevated`, border, rounded-2xl, padding 32-56px responsive, glow radial verde tenue arriba-derecha (400x400, opacity 0.15, vía arbitrary value `bg-[radial-gradient(...)]` de Tailwind). **No reusa SectionHeading** — el eyebrow/title/subtitle viven dentro del bloque sin el `mb-14` que SectionHeading impone. Grid de features `auto-fit minmax(220px, 1fr)` gap-6, cada feature con border-left-2 accent (línea verde a la izq) + h4 mono 13px accent + p muted. Render condicional de `items[]`: el entry `ai_dev_tooling` (único con items hoy) muestra 6 chips mono chicos (Claude Code, Codex, Copilot, OpenCode, Skills, Plugins). 5 tests AISection (heading / id / features count / items wrapper / herramientas individuales). 69 tests passing.
- **2026-05-14**: Logos PNG integrados. Usuario subió `public/logo-original.png` (fondo negro, `{gg}.dev` blanco+verde) y `public/logo-secundario.png` (fondo blanco, mismo texto). Creado `src/components/ui/Logo.jsx` que swappea `src` según `useTheme()`. Reemplaza el texto "giuliano.dev" en Navbar (`h-8 md:h-9`) y Footer (`h-10`). Como ambos PNG tienen fondo opaco que matchea el bg del theme, el "rectángulo" se confunde con el header → visualmente parece transparente. Tests Navbar/Footer actualizados: dejaron de buscar texto y ahora buscan `getByAltText('Giuliano Gerlo')`. 55 tests passing.
- **2026-05-14**: Hero polish post-BlobCursor — feedback del usuario: (1) blobs se separaban a velocidad de cursor alto → subido `filterStdDeviation` 28→38 + `slowDuration` 0.55→0.42 + tamaños más cerrados; (2) blobs tapaban CTAs → content z-index `z-10` → `z-20`, blob wrapper `-z-0` → `z-0` (explícito); (3) blobs reducían legibilidad del texto → opacities 0.55/0.45/0.4 → 0.32/0.26/0.22 + `text-shadow` oscuro en h1/role/loc; (4) emoji 📍 reemplazado por `<MapPin>` de lucide-react. **Regla nueva persistente** en CLAUDE.md y memoria: NO usar emojis Unicode en UI del portfolio — siempre lucide-react o sprite `icons.svg`. Razón: emojis rinden distinto por OS/font, rompen sistema visual.
- **2026-05-14**: Task 4.1 refinado — Hero pasó de "soso" (glow radial estático) a interactivo con BlobCursor (componente de reactbits.dev). 3 blobs gelatinosos color accent verde que siguen al cursor con trail, efecto metaballs vía SVG filter (feGaussianBlur + feColorMatrix). Instalado `gsap@3.15.0`. Adaptaciones al componente original: (1) listener mousemove movido de container a `window` para que el container pueda tener `pointer-events: none` y NO bloquee clicks de los CTAs; (2) removido `'use client'` directive (Next-only); (3) respeta `prefers-reduced-motion` (skip listener si OS lo pide). Archivos nuevos: `src/components/ui/BlobCursor.jsx` + `BlobCursor.css`. 55 tests siguen passing (sin tests para BlobCursor — animación gsap no testea bien en jsdom).
- **2026-05-14**: Task 4.1 ✅ — Hero section. `$ whoami` mono accent + h1 con `clamp(2.5rem,8vw,4.5rem)` (escalado fluido sin breakpoints intermedios) + rol + ubicación + 2 CTAs. Glow radial verde detrás (700x700, opacity 0.18) con pseudo-div absoluto `-z-0`, `pointer-events-none`, `aria-hidden`. CTAs usan Button con `onClick={() => scrollIntoView({behavior:'smooth'})}` — en Phase 6.2 lo absorbe Lenis. App.test.jsx actualizado: "Home page" placeholder reemplazado por chequeo del h1 con nombre; test Layout movido a `/proyectos/clovertecno` para evitar colisión con "Giuliano Gerlo" del Hero. Showcase de primitives borrado de Home.jsx. 4 tests Hero. 55 tests passing.
- **2026-05-14**: Task 3.2-3.5 (fix) — Button sin disabled styles. Sumado `disabled:opacity-50 disabled:cursor-not-allowed` + neutralización de `disabled:hover:*` (sin esto el hover seguía aplicando shadow/color a botón inactivo). Test asserción negativa cambiada de substring `toContain('bg-accent ')` a split por tokens (la base ahora incluye `disabled:hover:bg-accent`, matcheaba como substring).
- **2026-05-14**: Tasks 3.2-3.5 ✅ — Input, Textarea, Chip, SectionHeading. Input/Textarea con label + error + a11y (aria-invalid, aria-describedby, role="alert", htmlFor/id auto-generado para que click en label enfoque el control). Chip con 2 variantes (default / dot con punto verde). SectionHeading = eyebrow mono accent + h2 + subtitle muted opcional, con `id` prop para anclas (`<a href="#about">`). Home.jsx ahora renderiza showcase temporal de los primitives (se borra en Phase 4). 15 tests nuevos (Input 4, Textarea 3, Chip 3, SectionHeading 5). 51 tests passing. **Phase 3 completa.**
- **2026-05-14**: Task 3.1 ✅ — Button primitive. Instalado `clsx@2.1.1` + `tailwind-merge@3.6.0`. Helper `src/lib/cn.js` exporta `cn(...inputs)` (clsx → twMerge). `Button.jsx` con 3 variantes (primary/secondary/ghost), spread `{...rest}` para reenviar props nativas, `type="button"` default para evitar submit accidental en forms. 6 tests (render, onClick, default variant, secondary, override className vía twMerge, disabled). 36 tests passing.
- **2026-05-14**: Task 2.1 ✅ — Data layer. 4 archivos en `src/data/`: `projects.js` (5 proyectos: Inmobiliaria NZ, Clovertecno, RAMCC, ALPA, CENARB — datos del mockup), `skills.js` (5 skillGroups + 6 aiSkills con `status: 'active'`), `experience.js` (4 items, 2 con `current: true`), `education.js` (4 items: Brigadier López, DigitalHouse en curso, CoderHouse x2). URLs (`liveUrl`/`repoUrl`/`certUrl`) y assets (`image`/`gallery`) quedan `null` — los completa Giuliano (TODO-USUARIO.md). `challenges[]` arranca vacío, se llena en Phase 4/5. 8 tests de shape sumados (slug único, campos requeridos, formato fecha YYYY-MM, slug kebab-case URL-safe, status válido). 30 tests passing. **Phase 2 completa.**

- **2026-05-15**: Task 4.5 ✅ — `Projects` section. Grid de cards de proyecto; cada card entera es un `<Link>` a `/proyectos/:slug`. Links live/repo movidos al detalle (evita `<a>` anidado). Placeholder de imagen con gradiente hasta tener screenshots. 5 tests sumados. 74 passing.

- **2026-05-15**: Task 4.6 ✅ — `Experience` section. Timeline vertical; línea + puntos hechos con elementos `absolute` reales (no `::before`). Item `current` con punto sólido + halo. 5 tests sumados. 79 passing.

- **2026-05-15**: Task 4.7 ✅ — `Education` section. Grid de cards; 3 casos según `status`/`certUrl`. Card no es `<a>` entera (evita link muerto). 5 tests sumados. 85 passing.

- **2026-05-15**: Task 4.8 ✅ — `Contact` section (UI only). Form con primitives + `console.log` placeholder; 4 cards de contacto; email obfuscado con base64 (`obfuscate-email.js`). 6 tests sumados. 91 passing.

**Target audience:** Reclutadores, CTOs, clientes potenciales, comunidad dev.

**Usuario es principiante React** — cada nueva primitiva (hook, pattern, lib) se explica al introducirla en chat (no en comentarios de código).

---

## Phase 0 — Foundation, tooling & cleanup

### Task 0.1: Inicializar git + .gitignore ✅ (2026-05-13)

**Files:**
- Verify: `.gitignore` (existe)
- Create: `.git/` via `git init`

**Steps:**

1. `git init`
2. Verificar que `.gitignore` ignora `node_modules/`, `dist/`, `.env.local`, `.env*.local`. Si falta, agregar.
3. `git add -A && git status` para confirmar.
4. Commit inicial:
   ```bash
   git commit -m "chore: initial commit (Vite + React 19 + React Compiler base)"
   ```

### Task 0.2: Limpiar template Vite ✅ (2026-05-13)

**Files:**
- Modify: `src/App.jsx` → vaciar a componente mínimo
- Modify: `src/App.css` → vaciar
- Modify: `src/index.css` → reset mínimo
- Delete: `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`

**Steps:**

1. Reemplazar `src/App.jsx`:
   ```jsx
   function App() {
     return <div>Portfolio en construcción</div>;
   }
   export default App;
   ```
2. Vaciar `src/App.css` (queda vacío).
3. Reemplazar `src/index.css` con reset:
   ```css
   *, *::before, *::after { box-sizing: border-box; }
   * { margin: 0; padding: 0; }
   html { font-family: system-ui, -apple-system, sans-serif; }
   body { min-height: 100vh; }
   img, picture, svg { display: block; max-width: 100%; }
   button { font: inherit; cursor: pointer; background: none; border: none; }
   a { color: inherit; text-decoration: none; }
   ```
4. Borrar assets viejos.
5. `pnpm dev` → verificar página dice "Portfolio en construcción".
6. Commit:
   ```bash
   git add -A
   git commit -m "chore: limpiar template Vite default"
   ```

### Task 0.3: Instalar Tailwind CSS v4 ✅ (2026-05-14)

**IMPORTANTE:** Tailwind v4 estable usa **CSS-first config** — NO existe `tailwind.config.js`. Toda la configuración (colores custom, fuentes, variantes) vive en `src/index.css` con `@theme inline` y `@custom-variant`. La sintaxis original de este task (con `tailwind.config.js`, `content`, `darkMode`, `theme.extend`) era v3 y se reescribió.

**Files:**
- Create: `postcss.config.js`
- Modify: `src/index.css` → import Tailwind + config CSS-first + CSS vars
- Modify: `index.html` → `data-theme="dark"`, `lang="es"`, title
- Modify: `src/App.jsx` → cartel "Tailwind OK"
- Modify: `package.json` (vía pnpm install)

**Steps reales ejecutados:**

1. Instalar (versiones reales que se resolvieron):
   ```bash
   pnpm install -D tailwindcss@latest @tailwindcss/postcss@latest postcss autoprefixer
   ```
   Quedó: `tailwindcss@4.3.0`, `@tailwindcss/postcss@4.3.0`, `postcss@8.5.14`, `autoprefixer@10.5.0`.
2. Crear `postcss.config.js`:
   ```js
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
       autoprefixer: {},
     },
   };
   ```
3. **NO crear `tailwind.config.js`** — no es necesario en v4. Si en el futuro hace falta override avanzado, se hace todo dentro del CSS con `@theme`.
4. Reemplazar `src/index.css`:
   ```css
   @import 'tailwindcss';
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

   @custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));

   @theme inline {
     --color-bg: var(--bg);
     --color-bg-elevated: var(--bg-elevated);
     --color-border: var(--border);
     --color-text-primary: var(--text-primary);
     --color-text-muted: var(--text-muted);
     --color-accent: var(--accent);
     --color-accent-hover: var(--accent-hover);
     --color-accent-bg: var(--accent-bg);
     --font-sans: 'Inter', system-ui, sans-serif;
     --font-mono: 'JetBrains Mono', monospace;
   }

   :root,
   :root[data-theme='dark'] {
     --bg: #0a0a0a;
     --bg-elevated: #141414;
     --border: #262626;
     --text-primary: #fafafa;
     --text-muted: #a1a1aa;
     --accent: #04773b;
     --accent-hover: #06a352;
     --accent-bg: rgba(4, 119, 59, 0.1);
     color-scheme: dark;
   }

   :root[data-theme='light'] {
     --bg: #ffffff;
     --bg-elevated: #f5f5f5;
     --border: #e5e5e5;
     --text-primary: #0a0a0a;
     --text-muted: #525252;
     --accent: #04773b;
     --accent-hover: #035c2d;
     --accent-bg: rgba(4, 119, 59, 0.08);
     color-scheme: light;
   }

   *, *::before, *::after { box-sizing: border-box; }
   * { margin: 0; padding: 0; }

   body {
     min-height: 100vh;
     background: var(--bg);
     color: var(--text-primary);
     font-family: 'Inter', system-ui, sans-serif;
     transition: background 0.2s, color 0.2s;
   }

   img, picture, svg { display: block; max-width: 100%; }
   button { font: inherit; cursor: pointer; background: none; border: none; }
   a { color: inherit; text-decoration: none; }
   ```
5. Modificar `index.html` → `<html lang="es" data-theme="dark">` + title.
6. Reemplazar `src/App.jsx`:
   ```jsx
   function App() {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <h1 className="text-4xl font-bold text-accent">Tailwind OK</h1>
       </div>
     );
   }
   export default App;
   ```
7. `pnpm dev` → "Tailwind OK" en verde grande sobre fondo casi negro.
8. Commit: `feat: setup Tailwind CSS v4 con CSS vars dark/light`.

**Conceptos clave introducidos:**
- `@import 'tailwindcss'` reemplaza los 3 `@tailwind base/components/utilities` de v3.
- `@theme inline { --color-bg: var(--bg) }` mapea tokens de Tailwind a CSS vars custom; el `inline` deja `var(--bg)` literal en el output (no hardcodea valor), permitiendo runtime swap.
- `@custom-variant dark (...)` define cuándo se activa la variante `dark:` (cualquier hijo de `[data-theme='dark']`).
- Toggle dark/light futuro (hook `useTheme`, Phase 1.1): cambia `data-theme` en `<html>` y todas las clases Tailwind responden sin tocar JSX.

### Task 0.4: Instalar React Router v7 ✅ (2026-05-14)

**Nota:** El plan original decía "v6" pero `pnpm install react-router-dom` resolvió a `react-router-dom@7.15.0` (v7 ya es estable; v6 quedó como legacy). Las APIs usadas (`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useParams`, `Navigate`, `Outlet`) **son idénticas** a v6 para nuestro uso.

**Files:**
- Modify: `src/main.jsx` → wrap con `<BrowserRouter>`
- Modify: `src/App.jsx` → usar `<Routes>`
- Create: `src/pages/Home.jsx`
- Create: `src/pages/NotFound.jsx`

**Steps:**

1. `pnpm install react-router-dom` (resolvió a v7.15.0)
2. Modificar `src/main.jsx`:
   ```jsx
   import { StrictMode } from 'react';
   import { createRoot } from 'react-dom/client';
   import { BrowserRouter } from 'react-router-dom';
   import App from './App.jsx';
   import './index.css';

   createRoot(document.getElementById('root')).render(
     <StrictMode>
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </StrictMode>
   );
   ```
3. Crear `src/pages/Home.jsx`:
   ```jsx
   export default function Home() {
     return <div className="p-8">Home page</div>;
   }
   ```
4. Crear `src/pages/NotFound.jsx`:
   ```jsx
   import { Link } from 'react-router-dom';

   export default function NotFound() {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center gap-4">
         <h1 className="text-6xl font-bold">404</h1>
         <p className="text-text-muted">Página no encontrada</p>
         <Link to="/" className="text-accent hover:underline">← Volver al inicio</Link>
       </div>
     );
   }
   ```
5. Reemplazar `src/App.jsx`:
   ```jsx
   import { Routes, Route } from 'react-router-dom';
   import Home from './pages/Home.jsx';
   import NotFound from './pages/NotFound.jsx';

   function App() {
     return (
       <Routes>
         <Route path="/" element={<Home />} />
         <Route path="*" element={<NotFound />} />
       </Routes>
     );
   }
   export default App;
   ```
6. `pnpm dev` → ir a `/` (ver "Home page") y a `/asdf` (ver 404).
7. Commit:
   ```bash
   git add -A
   git commit -m "feat: setup React Router v7 con Home + NotFound"
   ```

**Explicar al usuario:** `<BrowserRouter>` provee contexto de routing. `<Routes>` define qué componente renderizar según URL. `<Route path="*">` matchea cualquier ruta no definida = 404. `<Link>` cambia URL sin recargar página (SPA).

### Task 0.5: Instalar librerías core restantes ✅ (2026-05-14)

**Versiones reales instaladas:** `motion@12.38.0`, `lenis@1.3.23`, `lucide-react@1.14.0`, `react-hook-form@7.75.0`, `zod@4.4.3`, `@hookform/resolvers@5.2.2`, `animejs@4.4.1` (dev).

**⚠️ Atención animejs v4:** La API cambió drásticamente respecto a v3 (que es la que muchos tutoriales/docs viejas usan). En v4 las animaciones se crean con `animate(target, options)` en vez del builder `anime({ targets, ... })`. Adaptar Task 6.3 (hero typewriter) al patrón v4.

**Steps:**

1. Instalar:
   ```bash
   pnpm install motion lenis lucide-react react-hook-form zod @hookform/resolvers
   pnpm install -D animejs
   ```
2. Verificar que no rompió nada: `pnpm build` (o `pnpm dev`).
3. Commit:
   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "chore: install motion, lenis, lucide-react, react-hook-form, zod, animejs"
   ```

**Explicar al usuario:**
- `motion` (ex framer-motion): animaciones declarativas con `<motion.div>`.
- `lenis`: smooth scroll global.
- `lucide-react`: librería de íconos como componentes.
- `react-hook-form` + `zod` + `@hookform/resolvers`: form con validación type-safe.
- `animejs@4`: animaciones JS imperativas (hero typewriter). API distinta a v3.

### Task 0.6: Setup Vitest para tests críticos ✅ (2026-05-14)

**Files:**
- Modify: `package.json` → script test
- Create: `vitest.config.js`
- Create: `src/test/setup.js`

**Steps:**

1. Instalar:
   ```bash
   pnpm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```
2. Crear `vitest.config.js`:
   ```js
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.js'],
       globals: true,
     },
   });
   ```
3. Crear `src/test/setup.js`:
   ```js
   import '@testing-library/jest-dom/vitest';
   ```
4. Agregar scripts en `package.json`:
   ```json
   "test": "vitest",
   "test:run": "vitest run",
   "test:ui": "vitest --ui"
   ```
5. Test smoke en `src/App.test.jsx`:
   ```jsx
   import { render, screen } from '@testing-library/react';
   import { MemoryRouter } from 'react-router-dom';
   import App from './App.jsx';

   test('renders Home on /', () => {
     render(
       <MemoryRouter initialEntries={['/']}>
         <App />
       </MemoryRouter>
     );
     expect(screen.getByText(/Home page/i)).toBeInTheDocument();
   });

   test('renders 404 on unknown route', () => {
     render(
       <MemoryRouter initialEntries={['/no-existe']}>
         <App />
       </MemoryRouter>
     );
     expect(screen.getByText('404')).toBeInTheDocument();
   });
   ```
6. Run: `pnpm test:run` → ambos pasan.
7. Commit:
   ```bash
   git add -A
   git commit -m "test: setup Vitest + Testing Library con smoke tests de routing"
   ```

---

## Phase 1 — Theme system + layout shell

### Task 1.1: Hook `useTheme` ✅ (2026-05-14)

**Cambios al plan original:** los 3 tests del plan no limpiaban `localStorage` entre tests → eran flaky (el toggle del test 2 dejaba `'light'` en storage, contaminando tests posteriores). Se agregó `beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute('data-theme'); })` y se sumaron 2 tests más: "reads existing theme from localStorage on mount" y "writes data-theme attribute to <html>". 5 tests totales, todos passing.



**Files:**
- Create: `src/hooks/useTheme.js`
- Create: `src/hooks/useTheme.test.js`

**Step 1: Failing test**

```js
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme.js';

test('default theme is dark', () => {
  const { result } = renderHook(() => useTheme());
  expect(result.current.theme).toBe('dark');
});

test('toggle switches dark → light', () => {
  const { result } = renderHook(() => useTheme());
  act(() => result.current.toggle());
  expect(result.current.theme).toBe('light');
});

test('persists to localStorage', () => {
  const { result } = renderHook(() => useTheme());
  act(() => result.current.toggle());
  expect(localStorage.getItem('theme')).toBe('light');
});
```

**Step 2: Verify fail**

Run: `pnpm test:run -- useTheme` → FAIL.

**Step 3: Implement**

```js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
```

**Step 4: Pass**

Run: `pnpm test:run -- useTheme` → PASS.

**Step 5: Commit**

```bash
git add src/hooks/useTheme.js src/hooks/useTheme.test.js
git commit -m "feat: useTheme hook con persistencia localStorage"
```

**Explicar al usuario:** `useState` con función inicializadora corre 1 vez (lazy init). `useEffect` corre después del render → sincroniza DOM y localStorage cada vez que `theme` cambia. Custom hook = función que usa hooks de React, reutilizable entre componentes.

### Task 1.2: Componente `ThemeToggle` ✅ (2026-05-14)

**Cambios al plan original:** mismo `beforeEach` que `useTheme.test` para evitar contaminación entre tests. Se pasó de 1 test a 3 (renderiza con aria-label / toggle data-theme on click / persiste en localStorage). 10 tests totales en el proyecto, todos passing.



**Files:**
- Create: `src/components/ui/ThemeToggle.jsx`
- Create: `src/components/ui/ThemeToggle.test.jsx`

**Step 1: Failing test**

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle.jsx';

test('toggles theme on click', async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);
  const btn = screen.getByRole('button', { name: /tema/i });
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  await user.click(btn);
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});
```

**Step 2: Implement**

```jsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      title="Cambiar tema"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-primary transition-colors hover:border-accent hover:text-accent"
    >
      <Icon size={16} />
    </button>
  );
}
```

**Step 3: Run test → PASS.**

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: ThemeToggle component"
```

### Task 1.3: Componente `Navbar` ✅ (2026-05-14)

**Cambios al plan original:**
- `lucide-react@1.x` **removió los brand icons** (`Github`, `Linkedin`) por trademark. Cambiado a usar el sprite `public/icons.svg` (convención del proyecto declarada en CLAUDE.md) vía `<svg><use href="/icons.svg#id" /></svg>`.
- Modificado `public/icons.svg`: `github-icon` cambió `fill="#08060d"` → `fill="currentColor"` para que tome el color del tema. Agregado nuevo símbolo `linkedin-icon` con `fill="currentColor"`.
- Sumado helper `<Icon id="..." size={16} />` dentro de Navbar.jsx para no repetir el patrón `<svg><use>`.
- Test sumó assertions de target=_blank + rel anti-tabnabbing (4 tests vs 1 del plan).
- `socials.js` placeholder ya tiene los datos reales (no quedaron vacíos como decía el plan).
- Preview temporal: `<Navbar />` agregado a `Home.jsx` para verificación visual. Se quita en Task 1.5 cuando el Layout lo envuelva.



**Files:**
- Create: `src/components/layout/Navbar.jsx`
- Create: `src/components/layout/Navbar.test.jsx`

**Steps:**

1. Implement (caveman: keep concise):
   ```jsx
   import { Github, Linkedin } from 'lucide-react';
   import { NavLink } from 'react-router-dom';
   import ThemeToggle from '../ui/ThemeToggle.jsx';
   import { socials } from '../../data/socials.js';

   const links = [
     { to: '/#about', label: 'Sobre mí' },
     { to: '/#skills', label: 'Skills' },
     { to: '/#projects', label: 'Proyectos' },
     { to: '/#experience', label: 'Experiencia' },
     { to: '/#contact', label: 'Contacto' },
   ];

   export default function Navbar() {
     return (
       <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-md">
         <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-8">
           <NavLink to="/" className="font-mono text-base font-semibold">
             giuliano<span className="text-accent">.dev</span>
           </NavLink>
           <ul className="hidden gap-7 md:flex">
             {links.map((l) => (
               <li key={l.to}>
                 <a href={l.to} className="text-sm font-medium text-text-muted transition-colors hover:text-accent">
                   {l.label}
                 </a>
               </li>
             ))}
           </ul>
           <div className="flex items-center gap-2">
             <a href={socials.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-accent hover:text-accent">
               <Github size={16} />
             </a>
             <a href={socials.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-accent hover:text-accent">
               <Linkedin size={16} />
             </a>
             <ThemeToggle />
           </div>
         </nav>
       </header>
     );
   }
   ```
2. Crear `src/data/socials.js` placeholder (Task 2.1 lo completa):
   ```js
   export const socials = {
     github: 'https://github.com/GiuGerlo',
     linkedin: 'https://www.linkedin.com/in/giuliano-gerlo-21a7b8221/',
     email: 'ggiuliano526@gmail.com',
     whatsapp: '5493468536422',
     location: 'Rosario, Santa Fe — Argentina',
   };
   ```
3. Smoke test que renderiza con Router context.
4. Commit:
   ```bash
   git add -A
   git commit -m "feat: Navbar component con links y theme toggle"
   ```

### Task 1.4: Componente `Footer` ✅ (2026-05-14)

**Implementado siguiendo el design doc**: 3 columnas responsive (brand+tagline+ubicación / nav rápido / redes con GitHub+LinkedIn+Email mailto). Bottom bar con copyright dinámico (`new Date().getFullYear()`) y "Hecho con React + Tailwind". Misma helper `<Icon>` que Navbar para el sprite SVG (duplicada por ahora; se podría extraer a `src/components/ui/Icon.jsx` en una refactor futura). 5 tests passing (brand / año / GitHub+LinkedIn+Email / mailto / 5 nav links). 20 tests totales.



**Files:**
- Create: `src/components/layout/Footer.jsx`

**Steps:**

1. Implement con 3 columnas (brand, nav, redes) según design doc.
2. Bottom line con copyright dinámico:
   ```jsx
   <span>© {new Date().getFullYear()} Giuliano Gerlo</span>
   ```
3. Commit:
   ```bash
   git add -A
   git commit -m "feat: Footer component"
   ```

### Task 1.5: `Layout` wrapper ✅ (2026-05-14)

**Implementado según plan, sin desvíos.** Layout con `<Navbar /> + <main className="min-h-screen"><Outlet /></main> + <Footer />`. App.jsx pasó a usar layout route (`<Route element={<Layout />}>` envolviendo las 3 rutas hijas). Home.jsx volvió a su versión limpia (sin Navbar/Footer temporal). ProjectDetail.jsx stub mínimo leyendo `:slug` con `useParams()`. Tests: 2 nuevos en App.test.jsx (ruta `/proyectos/:slug` matchea + smoke de Layout con brand y año). 22 tests passing.



**Files:**
- Create: `src/components/layout/Layout.jsx`

**Steps:**

1. Implement:
   ```jsx
   import { Outlet } from 'react-router-dom';
   import Navbar from './Navbar.jsx';
   import Footer from './Footer.jsx';

   export default function Layout() {
     return (
       <>
         <Navbar />
         <main className="min-h-screen">
           <Outlet />
         </main>
         <Footer />
       </>
     );
   }
   ```
2. Modificar `App.jsx` para usar nested routes:
   ```jsx
   <Routes>
     <Route element={<Layout />}>
       <Route path="/" element={<Home />} />
       <Route path="/proyectos/:slug" element={<ProjectDetail />} />
       <Route path="*" element={<NotFound />} />
     </Route>
   </Routes>
   ```
3. Crear stub `src/pages/ProjectDetail.jsx`:
   ```jsx
   import { useParams } from 'react-router-dom';
   export default function ProjectDetail() {
     const { slug } = useParams();
     return <div className="p-8">Proyecto: {slug}</div>;
   }
   ```
4. `pnpm dev` → ver Navbar + Footer en `/` y `/proyectos/clovertecno`.
5. Commit:
   ```bash
   git add -A
   git commit -m "feat: Layout con Outlet + nested routes"
   ```

**Explicar al usuario:** `<Outlet />` es donde se renderiza el componente hijo de la ruta. `useParams()` lee parámetros dinámicos de URL (`:slug`).

---

## Phase 2 — Data layer

### Task 2.1: Datos completos ✅ (2026-05-14)

**Implementado sin desvíos.** Datos extraídos del mockup.html (5 proyectos, 4 jobs, 4 educación). Slugs kebab-case URL-safe: `inmobiliaria-nz`, `clovertecno`, `ramcc`, `alpa`, `cenarb`. Fechas en formato `'YYYY-MM'` (string) en vez de `Date` — más simple para comparar y compatible con JSON serialization futura. `challenges[]` arranca vacío en cada proyecto (TODO Phase 4/5 con desafíos técnicos reales). 8 tests de shape (4 projects + 4 skills/aiSkills).



**Files:**
- Create: `src/data/projects.js`
- Create: `src/data/skills.js`
- Create: `src/data/experience.js`
- Create: `src/data/education.js`
- Modify: `src/data/socials.js` (ya creado)

**Steps:**

1. Poblar `projects.js` con 5 proyectos según shape del design doc. URLs reales pendientes (placeholder `null`).
2. Poblar `skills.js`:
   ```js
   export const skillGroups = [
     { id: 'frontend', title: 'Frontend', icon: 'Layout',
       items: ['HTML', 'CSS', 'JavaScript', 'React', 'Bootstrap', 'jQuery'] },
     { id: 'backend', title: 'Backend', icon: 'Server',
       items: ['PHP', 'Laravel', 'API REST', 'Node.js'] },
     { id: 'database', title: 'Base de datos', icon: 'Database',
       items: ['MySQL', 'Modelado', 'Optimización'] },
     { id: 'devops', title: 'DevOps / Tools', icon: 'Wrench',
       items: ['Git', 'GitHub', 'Docker', 'Postman', 'Figma', 'VS Code'] },
     { id: 'soft', title: 'Soft Skills', icon: 'Heart',
       items: ['Trabajo en equipo', 'Comunicación', 'Autonomía', 'Aprendizaje rápido'] },
   ];

   export const aiSkills = [
     { id: 'claude-code', title: 'claude_code',
       desc: 'CLI agéntico para desarrollo asistido. Refactors, generación de features, debugging.' },
     { id: 'mcp', title: 'mcp_servers',
       desc: 'Model Context Protocol — conexión de Claude con herramientas propias y APIs externas.' },
     { id: 'api', title: 'anthropic_api',
       desc: 'Integración del SDK de Anthropic en apps: tool use, prompt caching, streaming.' },
     { id: 'agent', title: 'agent_sdk',
       desc: 'Construcción de agentes custom con loops, tool use y manejo de contexto.' },
     { id: 'prompt', title: 'prompt_engineering',
       desc: 'Diseño de prompts efectivos: few-shot, chain-of-thought, structured output.' },
     { id: 'workflows', title: 'ai_workflows',
       desc: 'Automatización de procesos dev con IA: code review, docs, testing asistido.' },
   ];
   ```
3. Poblar `experience.js` con datos del CV (RAMCC, Inmobiliaria NZ, Clovertecno, etc.).
4. Poblar `education.js` con 4 entries (Brigadier López, DigitalHouse, CoderHouse x2). `certUrl: null` por ahora.
5. Tests de shape:
   ```js
   // src/data/projects.test.js
   import { projects } from './projects.js';

   test('cada proyecto tiene slug único', () => {
     const slugs = projects.map((p) => p.slug);
     expect(new Set(slugs).size).toBe(slugs.length);
   });

   test('cada proyecto tiene fields requeridos', () => {
     projects.forEach((p) => {
       expect(p.slug).toBeTruthy();
       expect(p.title).toBeTruthy();
       expect(p.stack).toBeInstanceOf(Array);
     });
   });
   ```
6. Commit:
   ```bash
   git add src/data/
   git commit -m "feat: data layer con projects, skills, experience, education, socials"
   ```

---

## Phase 3 — UI primitives

### Task 3.1: `Button` component ✅ (2026-05-14)

**Sin desvíos**. `type="button"` agregado como default (no estaba en el plan) — previene submit accidental cuando el botón está dentro de un `<form>`. El caller puede overrideear pasando `type="submit"` vía `{...rest}` (va antes del spread propio del componente, así el caller gana).



**Files:**
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/Button.test.jsx`
- Create: `src/lib/cn.js`

**Steps:**

1. `pnpm install clsx tailwind-merge`
2. Crear `src/lib/cn.js`:
   ```js
   import { clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs) {
     return twMerge(clsx(inputs));
   }
   ```
3. Implementar `Button.jsx`:
   ```jsx
   import { cn } from '../../lib/cn.js';

   const variants = {
     primary: 'bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(4,119,59,0.3)]',
     secondary: 'border border-border text-text-primary hover:border-accent hover:text-accent',
     ghost: 'text-text-muted hover:text-accent',
   };

   export default function Button({ variant = 'primary', className, children, ...rest }) {
     return (
       <button
         {...rest}
         className={cn(
           'inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all',
           variants[variant],
           className
         )}
       >
         {children}
       </button>
     );
   }
   ```
4. Test cubre variants + click handler.
5. Commit.

**Explicar al usuario:** `cn()` resuelve clases Tailwind duplicadas (`px-2 px-4` → `px-4`). `{...rest}` reenvía cualquier prop al `<button>` (onClick, disabled, type, etc.).

### Task 3.2-3.5: `Input`, `Textarea`, `Chip`, `SectionHeading` ✅ (2026-05-14)

**Hecho en bloque (1 commit).** Inputs con a11y completa (label htmlFor/id, aria-invalid + aria-describedby cuando hay error, role="alert" en mensaje). Chip variantes 'default' y 'dot' (punto verde adelante para estados activos). SectionHeading acepta `id` prop para que las secciones del Home funcionen como anclas. Preview visual temporal agregado a Home.jsx (se elimina cuando arranque Phase 4).

Similar pattern. Cada uno: componente + test mínimo + commit.

---

## Phase 4 — Home sections (en orden)

### Task 4.1: `Hero` section ✅ (2026-05-14)

**Implementado según mockup**. CTAs hacen scroll smooth a `#projects` y `#contact` (esas secciones no existen aún — Phase 4.5 y 4.8 las crean). Mientras tanto el botón clickea pero no scrollea (no encuentra el id). No es bug, es orden de implementación. Tamaño h1 con `clamp()` en vez de breakpoints — más fluido y menos clases.



**Files:**
- Create: `src/components/sections/Hero.jsx`

**Steps:**

1. Implementar según mockup: `$ whoami` prompt, nombre 72px, rol, ubicación, 2 CTAs, gradient verde radial detrás.
2. Botones usan `<Button>` primitive.
3. Smoke test renderiza nombre.
4. Importar en `Home.jsx`, ver en dev.
5. Commit.

### Task 4.2: `About` section ✅ (2026-05-14)

Layout grid 2 columnas (texto + foto). Foto placeholder con gradient (TODO usuario: subir foto real, queda como `<img />` reemplazando el div con "GG").

### Task 4.3: `Skills` section ✅ (2026-05-14)

Grid de cards mapeando `skillGroups`. Íconos resueltos vía lookup `ICONS[group.icon]` (string → componente lucide). Tags inline (no Chip primitive: styling difiere). 5 tests. 64 passing.

Grid de `SkillCard` mapeando `skillGroups`. Resolver íconos por nombre vía lookup en objeto Lucide.

### Task 4.4: `AISection` ✅ (2026-05-14)

Bloque destacado `bg-bg-elevated` rounded-2xl con glow radial verde decorativo + grid de 6 features (border-left accent). Render condicional de `items[]` para entries que agrupan herramientas. 5 tests. 69 passing.

### Task 4.5: `Projects` section ✅ (2026-05-15)

Grid de `ProjectCard`. Cada card linkea a `/proyectos/${slug}`.

Implementado en `Projects.jsx` (sección 04). Eyebrow `// 04 — projects`,
título "Proyectos destacados". Grid `auto-fit minmax(340px,1fr)` gap-5.
La card **entera** es UN solo `<Link>` de react-router-dom a
`/proyectos/:slug` — los links a sitio live / repo NO van acá (anidar
`<a>` dentro de `<a>` es HTML inválido); viven en la página de detalle.
La card muestra el afford "Ver caso" como texto + ícono `ArrowRight`
(no anchor). Imagen del proyecto: placeholder con gradiente + título mono
mientras `project.image` siga `null` (faltan screenshots, TODO-USUARIO).
5 tests (heading, id, card por proyecto, href por slug, stack). 74 passing.

```jsx
<Link to={`/proyectos/${project.slug}`} className="block ...">
  {/* card content */}
</Link>
```

### Task 4.6: `Experience` section ✅ (2026-05-15)

Timeline vertical con `TimelineItem`. Item con `current: true` tiene punto sólido + halo.

Implementado en `Experience.jsx` (sección 05, eyebrow `// 05 — experience`,
sin subtitle). La línea vertical y los puntos del mockup (que usaban
`::before` de CSS) se rehicieron con `<div>`/`<span>` `absolute` reales:
contenedor `relative pl-8`, línea `absolute left-2 w-0.5 bg-border`, cada
punto `absolute -left-8`. Item `current` → punto sólido `bg-accent` +
halo `ring-4 ring-accent-bg`; resto → punto hueco `bg-bg`. NO se extrajo
`TimelineItem` aparte (item chico, uso único). `data-testid` en el punto
para testearlo. 5 tests. 79 passing.

**Ajuste post-review (2026-05-15):** (1) Fecha de `ramcc-dev` corregida
de NOV 2025 a NOV 2024 (estaba mal en el CV). (2) Items del timeline
ahora linkean: campo opcional `projectSlug` en `experience.js`. Si
existe, el contenido del item se envuelve en `<Link>` a /proyectos/<slug>
(hover → rol en accent); si no, va en `<div>` plano. Mapeo: ramcc-dev →
`ramcc`, inmobiliaria-nz → `inmobiliaria-nz`, clovertecno → `clovertecno`,
ramcc-alpa-cenarb → sin link (agrupa 3 proyectos). Test extra de href.
80 passing.

### Task 4.7: `Education` section ✅ (2026-05-15)

Grid de `EduCard`. Si `certUrl` existe → `<a>` con "Ver certificado ↗". Si `status === 'in-progress'` → texto "Certificado al finalizar".

Implementado en `Education.jsx` (sección 06). Grid `auto-fit minmax(280px,1fr)`.
3 casos por card: (1) `in-progress` → badge "En curso" inline + texto muted
"Certificado al finalizar"; (2) `certUrl` existe → `<a target="_blank">`
"Ver certificado" con ícono lucide `ExternalLink` (no flecha Unicode);
(3) `completed` sin `certUrl` → slot vacío, sin link. La card NO es un
`<a>` entera (a diferencia de ProjectCard): el único destino útil es el
cert y muchas cards aún no lo tienen → link muerto evitado. Hoy todos los
`certUrl` son `null`, así que solo se ven casos 1 y 3. 5 tests. 85 passing.

### Task 4.8: `Contact` section (UI only) ✅ (2026-05-15)

Grid 2 columnas: form (placeholder action — `console.log`) + 4 contact links.

Cada link usa Lucide icon en cuadrado verde-bg.

**Email obfuscation** — crear `src/lib/obfuscate-email.js`:

```js
// Encoded en base64 para no quedar plano en HTML
export function obfuscateEmail(email) {
  return btoa(email);
}
export function decodeEmail(encoded) {
  return atob(encoded);
}
```

Usar en `Contact.jsx`:
```jsx
const [revealed, setRevealed] = useState(false);
const encoded = 'Z2dpdWxpYW5vNTI2QGdtYWlsLmNvbQ=='; // ggiuliano526@gmail.com en base64

<button onClick={() => setRevealed(true)}>
  {revealed ? atob(encoded) : 'Click para ver email'}
</button>
```

Commit por cada sección. Después de cada commit, `pnpm dev` y verificar visualmente.

**Implementado (2026-05-15):** `Contact.jsx` (sección 07). Grid 2 cols
(`md:grid-cols-2 gap-14`). Izq: form con primitives `Input`/`Textarea`/
`Button`; `onSubmit` hace `preventDefault` + `console.log` de `FormData`
(UI only, sin envío real). Der: 4 cards de contacto (Email, WhatsApp,
LinkedIn, GitHub) con ícono en cuadrado accent-bg. Email obfuscado:
`src/lib/obfuscate-email.js` (`btoa`/`atob`) + constante `ENCODED_EMAIL`
en Contact.jsx; card es `<button>` ("Click para ver email") hasta el
click, después `<a mailto>` con la dirección revelada. WhatsApp usa
`MessageCircle` de lucide (no hay logo de marca en lucide v1); LinkedIn/
GitHub usan el sprite. 6 tests (incluye obfuscation + submit con spy de
console.log). 91 passing.

**Pendiente / nota:** `socials.js` y `Footer.jsx` todavía usan el email
en texto plano — la obfuscation de Contact es parcial mientras eso siga
así. Decidir en review si se obfusca el footer también.

### Task 4.9: Composer `Home.jsx`

```jsx
import Hero from '../components/sections/Hero.jsx';
import About from '../components/sections/About.jsx';
// ... resto

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <AISection />
      <Projects />
      <Experience />
      <Education />
      <Contact />
    </>
  );
}
```

Commit final phase 4.

---

## Phase 5 — Project detail page

### Task 5.1: `ProjectDetail` page

**Files:**
- Modify: `src/pages/ProjectDetail.jsx`

**Steps:**

1. Buscar proyecto por slug:
   ```jsx
   import { useParams, Navigate } from 'react-router-dom';
   import { projects } from '../data/projects.js';

   export default function ProjectDetail() {
     const { slug } = useParams();
     const project = projects.find((p) => p.slug === slug);
     if (!project) return <Navigate to="/404" replace />;
     // render según mockup
   }
   ```
2. Renderizar: back link, hero, mi rol, stack, gallery, challenges.
3. Set document title vía effect:
   ```jsx
   useEffect(() => {
     document.title = `${project.title} — Giuliano Gerlo`;
     return () => { document.title = 'Giuliano Gerlo — Full-Stack Developer'; };
   }, [project.title]);
   ```
4. Smoke test con MemoryRouter en ruta de proyecto válido + inválido.
5. Commit.

---

## Phase 6 — Animaciones + polish

### Task 6.1: Scroll reveals con Motion

Wrapper component `<Reveal>`:
```jsx
import { motion } from 'motion/react';

export default function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

Envolver cada section heading + cards.

**Reduced motion:** ya viene out-of-the-box con Motion si el usuario lo tiene activo.

Commit.

### Task 6.2: Smooth scroll con Lenis

`src/hooks/useLenis.js`:
```js
import { useEffect } from 'react';
import Lenis from 'lenis';

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}
```

Llamar en `Layout`.

Commit.

### Task 6.3: Hero typewriter con Anime.js

Animar el nombre con stagger de chars al mount.

Commit.

---

## Phase 7 — Contact form backend

### Task 7.1: Form con react-hook-form + zod

Reemplazar form placeholder con validación real.

Mostrar errores por campo.

Commit.

### Task 7.2: Honeypot field

Campo `website` con CSS `position: absolute; left: -9999px; opacity: 0; pointer-events: none;` + `tabIndex={-1}` + `autoComplete="off"`.

Commit.

### Task 7.3: Cloudflare Turnstile widget

**Pre-requisito usuario:** crear cuenta Cloudflare, obtener SITE KEY + SECRET KEY (ver `TODO-USUARIO.md`).

Instalar:
```bash
pnpm install @marsidev/react-turnstile
```

Agregar widget al form, capturar token en estado.

Commit.

### Task 7.4: Serverless function `api/contact.js`

`pnpm install resend`

Implementar según design doc:
- Verify method POST
- Honeypot check
- Turnstile verify
- Resend send
- HTML escape inputs

Commit.

### Task 7.5: Wire form → /api/contact

`fetch('/api/contact', { method: 'POST', body: JSON.stringify(...) })`

Loading / success / error states.

Commit.

### Task 7.6: Rate limiting

Opción simple: Vercel Edge Config o `@vercel/kv` (gratis tier).

```bash
pnpm install @vercel/kv
```

Verificar IP en `api/contact.js`, max 3 / hora.

Commit.

---

## Phase 8 — SEO + meta + performance

### Task 8.1: Meta tags base

Modificar `index.html` con title, description, OG tags, twitter card.

### Task 8.2: OG image

Generar 1200x630 PNG con título + foto (puede ser Figma o Canva). Pone en `public/og-image.png`.

### Task 8.3: Title dinámico por ruta

`useEffect` en `Home.jsx` y `ProjectDetail.jsx`.

### Task 8.4: `robots.txt` y `sitemap.xml`

`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://giulianogerlo.vercel.app/sitemap.xml
```

`public/sitemap.xml` generado por script en build (`scripts/generate-sitemap.js` lee `projects.js`).

### Task 8.5: Image optimization

Convertir screenshots a WebP. Lazy load con `loading="lazy"`. Sizes/srcset si fuera necesario.

### Task 8.6: Headers de seguridad

`vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

Commit cada paso.

---

## Phase 9 — Deploy a Vercel

### Task 9.1: Crear repo GitHub

**Usuario:** crear repo público `giulianogerlo-portfolio` en GitHub (sin README inicial).

Local:
```bash
git remote add origin git@github.com:GiuGerlo/giulianogerlo-portfolio.git
git branch -M main
git push -u origin main
```

### Task 9.2: Conectar Vercel

**Usuario** sigue checklist en `TODO-USUARIO.md` sección Vercel.

### Task 9.3: Configurar env vars en Vercel

**Usuario** pega en dashboard:
- `RESEND_API_KEY`
- `TURNSTILE_SECRET`
- `VITE_TURNSTILE_SITE_KEY`
- `CONTACT_EMAIL_TO`

### Task 9.4: Deploy inicial

Click "Deploy" en Vercel. Esperar 2 min. Verificar URL live.

### Task 9.5: Test form en producción

Enviar mensaje desde el form deployado. Verificar que llega a `ggiuliano526@gmail.com`.

Si falla:
- Logs en Vercel dashboard → Functions tab
- Verificar env vars
- Verificar Turnstile domain en Cloudflare

### Task 9.6: Vercel Analytics

Dashboard → Analytics → Enable.

Verificar que tracking script se agregó al bundle.

---

## Phase 11 — Bonus AI Chatbot RAG (post-MVP)

**Goal:** Construir chatbot embebido en portfolio "Pregúntale a Giuliano" usando RAG sobre CV + proyectos. Legitima skills AI declaradas.

**Stack:**
- Front: componente Chat en React (`src/components/Chat.jsx`)
- Vector DB: Upstash Vector (gratis 10k vectors) o pgvector vía Vercel Postgres
- Embeddings: `text-embedding-3-small` de OpenAI (barato) o Voyage AI
- LLM: Claude Haiku (rápido + barato)
- Agentic flow: LangGraph.js con nodo retrieval + nodo respuesta
- Backend: Vercel function `api/chat.js`

**Tasks (alto nivel):**

### Task 11.1: Generar embeddings de data
Script `scripts/build-embeddings.js` que lee CV + projects.js + experience.js, los chunkea, genera embeddings, sube a vector DB.

### Task 11.2: API endpoint `api/chat.js`
Recibe pregunta → embedea query → busca top-3 chunks similares → arma prompt con contexto → llama Claude → devuelve respuesta streaming.

### Task 11.3: LangGraph workflow
Nodo 1: clasifica si pregunta necesita RAG o no.
Nodo 2: retrieval (si aplica).
Nodo 3: respuesta final con contexto.

### Task 11.4: Chat UI component
Input + stream de mensajes. Bubble user / bot. Loading state. Markdown render con `react-markdown`.

### Task 11.5: Embed en Home
Botón flotante "💬 Preguntale a Giuliano" abajo-derecha. Click abre drawer con chat.

### Task 11.6: Cambiar labels Grupo 2 → "✓ implementado"
Una vez deployado, mover de "🌱 explorando" a "✓ activo" las skills usadas.

---

## AI Skills — actualización de Phase 2

Modificar `src/data/skills.js` para incluir `status` field:

```js
export const aiSkills = [
  // Grupo 1 — activo
  { id: 'claude-code', title: 'claude_code', status: 'active', desc: '...' },
  { id: 'mcp', title: 'mcp_servers', status: 'active', desc: '...' },
  { id: 'api', title: 'anthropic_api', status: 'active', desc: '...' },
  { id: 'agent', title: 'agent_sdk', status: 'active', desc: '...' },
  { id: 'prompt', title: 'prompt_engineering', status: 'active', desc: '...' },
  { id: 'workflows', title: 'ai_workflows', status: 'active', desc: '...' },
  // Grupo 2 — explorando (legitimadas post Phase 11)
  { id: 'rag', title: 'rag_pipelines', status: 'exploring',
    desc: 'Retrieval-Augmented Generation: embeddings, vector DBs, búsqueda semántica.' },
  { id: 'langgraph', title: 'langgraph', status: 'exploring',
    desc: 'Agentes como grafo de estados. Loops, tool use, branching condicional.' },
  { id: 'vector-db', title: 'vector_databases', status: 'exploring',
    desc: 'pgvector, Upstash Vector. Storage y similarity search semántica.' },
];
```

Render visual: Grupo 1 con badge verde `✓ activo`. Grupo 2 con badge amarillo `🌱 explorando`.

---

## Phase 10 — Cleanup final

### Task 10.1: Borrar `mockup.html`

Ya no es necesario. Quitar.

```bash
rm mockup.html
git add -A
git commit -m "chore: remove mockup.html — diseño implementado"
```

### Task 10.2: Actualizar `CLAUDE.md`

Sumar:
- Comandos: `pnpm test`, `pnpm test:run`, `pnpm dev`, `pnpm build`, `pnpm lint`
- Stack añadido: Tailwind v4, Motion, Lenis, React Router, shadcn primitives, Resend
- Mencionar `src/data/` como punto único de edición de contenido

### Task 10.3: README final

Reemplazar `README.md` con descripción real del proyecto + screenshots + link live.

### Task 10.4: Lighthouse audit

`pnpm build && pnpm preview` → Chrome DevTools → Lighthouse → run.

Target 95+ todas categorías. Arreglar lo que falle (típicamente alt en imágenes, contraste, etc.).

Commit fixes.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Tailwind v4 todavía es relativamente nuevo, edge cases | Bloquear versión en package.json una vez funcionando |
| React Compiler peleando con Motion (rare) | Si pasa, marcar componente con `"use no memo"` |
| Turnstile bloqueando tests | Mockear en test env, key real solo en runtime |
| API key Resend filtrada | Solo en env vars, nunca en client bundle, `.env.local` en `.gitignore` |
| Vercel deploy falla por límite serverless | Function `api/contact.js` < 10s timeout, suficiente |

---

## Definition of Done

- [ ] Todos los tests passing (`pnpm test:run`)
- [ ] `pnpm lint` sin errores
- [ ] `pnpm build` exitoso
- [ ] Lighthouse 95+ todas categorías
- [ ] Form de contacto recibe email en `ggiuliano526@gmail.com`
- [ ] Theme toggle funciona y persiste
- [ ] Todas las rutas funcionan (`/`, `/proyectos/clovertecno`, etc.)
- [ ] 404 funciona en rutas inválidas
- [ ] Deploy live en Vercel
- [ ] Todo en `TODO-USUARIO.md` resuelto
- [ ] `mockup.html` borrado
- [ ] README + CLAUDE.md actualizados
