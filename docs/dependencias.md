# Dependencias del proyecto

Referencia de **todos** los paquetes instalados y para qué se usa cada uno. Si una dependencia no aparece acá, sobra — borrarla.

> Versiones: ver `package.json`. El lockfile `pnpm-lock.yaml` fija las versiones exactas instaladas.

---

## Runtime (`dependencies`)

Paquetes que forman parte de la app que corre en el browser (o en las serverless functions).

### Core

| Paquete | Para qué |
|---|---|
| `react` / `react-dom` | La librería UI. React 19 + React Compiler. |
| `react-router-dom` | Routing del lado del cliente (SPA). Define las rutas `/`, `/proyectos/:slug`, `404`. |

### UI / estilos / animación

| Paquete | Para qué |
|---|---|
| `lucide-react` | Íconos SVG vectoriales. Único set de íconos del proyecto (no se usan emojis). |
| `clsx` | Arma strings de `className` a partir de condicionales/objetos sin `if` en el JSX. |
| `tailwind-merge` | Resuelve conflictos entre clases Tailwind (`px-2 px-4` → `px-4`). Junto con `clsx` forma el helper `cn()` en `src/lib/cn.js`. |
| `motion` | Animaciones declarativas (sucesor de Framer Motion). Usado en el componente `Reveal` (fade-up al scrollear). |
| `animejs` | Animaciones imperativas. Usado en el typewriter del Hero. |
| `lenis` | Smooth scroll (scroll suave) en toda la página. |
| `ogl` | Librería WebGL liviana. Usada en el fondo animado `Plasma.jsx`. |

### Formulario de contacto

| Paquete | Para qué |
|---|---|
| `react-hook-form` | Manejo de estado y validación del formulario de contacto. |
| `zod` | Define el schema de validación de los campos (nombre, email, mensaje). |
| `@hookform/resolvers` | Puente entre `zod` y `react-hook-form` (el `zodResolver`). |
| `@marsidev/react-turnstile` | Widget de Cloudflare Turnstile (anti-bot) embebido en el form. |

### Backend (serverless `api/`)

| Paquete | Para qué |
|---|---|
| `resend` | SDK para enviar el email del formulario de contacto. |
| `@upstash/redis` | Cliente Redis (vía REST). Rate limiting del form: máx 3 envíos/hora por IP. |

### Analytics

| Paquete | Para qué |
|---|---|
| `@vercel/analytics` | Web Analytics de Vercel (visitas, sin cookies). El componente `<Analytics />` vive en `App.jsx`. |

---

## Desarrollo (`devDependencies`)

Paquetes que NO van al bundle final — solo se usan para construir, testear o lintear.

### Build (Vite + React Compiler)

| Paquete | Para qué |
|---|---|
| `vite` | Bundler y dev server. |
| `@vitejs/plugin-react` | Plugin de React para Vite (JSX, Fast Refresh). |
| `@rolldown/plugin-babel` | Corre Babel dentro de Rolldown/Vite — necesario para el React Compiler. |
| `@babel/core` | Motor de Babel, requerido por el plugin de arriba. |
| `babel-plugin-react-compiler` | El **React Compiler**: memoiza automáticamente (por eso no se escriben `useMemo`/`useCallback` a mano). |

### Estilos (Tailwind v4)

| Paquete | Para qué |
|---|---|
| `tailwindcss` | Framework de utilidades CSS. Config CSS-first en `src/index.css` (sin `tailwind.config.js`). |
| `@tailwindcss/postcss` | Plugin de Tailwind v4 para PostCSS. |
| `postcss` | Procesador CSS sobre el que corre Tailwind. |
| `autoprefixer` | Agrega prefijos de browser a las reglas CSS automáticamente. |

### Testing (Vitest + Testing Library)

| Paquete | Para qué |
|---|---|
| `vitest` | Test runner. |
| `@vitest/ui` | Dashboard web de Vitest (`pnpm test:ui`). |
| `jsdom` | DOM simulado para correr tests de componentes sin browser real. |
| `@testing-library/react` | Render y queries de componentes React en los tests. |
| `@testing-library/user-event` | Simula interacciones reales del usuario (typing, clicks). |
| `@testing-library/jest-dom` | Matchers extra para el DOM (`toBeInTheDocument`, etc.). |

### Linting

| Paquete | Para qué |
|---|---|
| `eslint` | Linter. |
| `@eslint/js` | Reglas base recomendadas de ESLint. |
| `eslint-plugin-react-hooks` | Reglas de los hooks de React (incluye la regla de refs). |
| `eslint-plugin-react-refresh` | Verifica compatibilidad con Fast Refresh. |
| `globals` | Sets de variables globales (browser, node) para la config de ESLint. |

### Imágenes y tipos

| Paquete | Para qué |
|---|---|
| `sharp` | Optimización de imágenes (JPG/PNG → WebP). Lo usa `scripts/optimize-images.js`. |
| `@types/react` / `@types/react-dom` | Tipos de React. El proyecto no usa TypeScript, pero los tipos mejoran el autocompletado del editor. |

---

## Servicios externos (no son paquetes npm)

| Servicio | Para qué | Plan |
|---|---|---|
| **Vercel** | Hosting, serverless functions, deploys automáticos, analytics. | Hobby (gratis) |
| **Resend** | Envío de los emails del formulario. | Free (3000/mes) |
| **Cloudflare Turnstile** | Verificación anti-bot del formulario. | Gratis |
| **Upstash Redis** | Almacén para el rate limiting del formulario. | Free (500k cmd/mes) |

---

## Gestión de dependencias — seguridad

- Package manager: **pnpm** (nunca npm). Ver `.npmrc`.
- `minimum-release-age=1440` — pnpm no instala paquetes publicados hace menos de 24 hs (defensa contra ataques de supply chain).
- `pnpm audit` — corrió sin vulnerabilidades conocidas.
- Los build scripts de dependencias no se ejecutan salvo aprobación explícita en `pnpm-workspace.yaml` (`allowBuilds`).
