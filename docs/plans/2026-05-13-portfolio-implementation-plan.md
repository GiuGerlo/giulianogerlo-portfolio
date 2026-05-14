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

### Task 2.1: Datos completos

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

### Task 3.1: `Button` component

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

### Task 3.2-3.5: `Input`, `Textarea`, `Chip`, `SectionHeading`

Similar pattern. Cada uno: componente + test mínimo + commit.

---

## Phase 4 — Home sections (en orden)

### Task 4.1: `Hero` section

**Files:**
- Create: `src/components/sections/Hero.jsx`

**Steps:**

1. Implementar según mockup: `$ whoami` prompt, nombre 72px, rol, ubicación, 2 CTAs, gradient verde radial detrás.
2. Botones usan `<Button>` primitive.
3. Smoke test renderiza nombre.
4. Importar en `Home.jsx`, ver en dev.
5. Commit.

### Task 4.2: `About` section

Layout grid 2 columnas (texto + foto). Foto placeholder con gradient (Tasa 4.2 del usuario subir real).

### Task 4.3: `Skills` section

Grid de `SkillCard` mapeando `skillGroups`. Resolver íconos por nombre vía lookup en objeto Lucide.

### Task 4.4: `AISection`

Bloque destacado con background radial. Grid de 6 `aiSkills` con border-left accent.

### Task 4.5: `Projects` section

Grid de `ProjectCard`. Cada card linkea a `/proyectos/${slug}`.

```jsx
<Link to={`/proyectos/${project.slug}`} className="block ...">
  {/* card content */}
</Link>
```

### Task 4.6: `Experience` section

Timeline vertical con `TimelineItem`. Item con `current: true` tiene punto sólido + halo.

### Task 4.7: `Education` section

Grid de `EduCard`. Si `certUrl` existe → `<a>` con "Ver certificado ↗". Si `status === 'in-progress'` → texto "Certificado al finalizar".

### Task 4.8: `Contact` section (UI only)

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
