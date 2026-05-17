# Comandos del proyecto

Referencia rápida de todos los comandos útiles para trabajar en este portfolio.

> Pre-requisito: tener **Node.js 20+** y **pnpm 11+** instalados.
> Si pnpm no está instalado en la PC: `npm install -g pnpm`

---

## 🚀 Levantar el proyecto desde cero (PC nueva)

```powershell
git clone <repo-url>
cd giulianogerlo-portfolio
pnpm install   # lee pnpm-lock.yaml, instala dependencias exactas
pnpm dev       # arranca Vite dev server en http://localhost:5173
```

A partir de **Phase 7** (form de contacto) vas a necesitar también un archivo `.env.local` en la raíz con las API keys. **Ese archivo NO está en git** (`.gitignore` lo excluye). Lista de keys necesarias en [`TODO-USUARIO.md`](../TODO-USUARIO.md).

---

## 💻 Desarrollo

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta dev server con **HMR** (Hot Module Replacement — recarga el módulo modificado sin perder estado). URL: `http://localhost:5173` |
| `pnpm build` | Build de producción → carpeta `dist/`. Muestra tamaño de bundles JS/CSS gzipeados. Útil para verificar que el proyecto compila sin errores |
| `pnpm preview` | Sirve el build de `dist/` localmente. Sirve para probar el bundle final antes de deployar |

---

## 🧪 Testing (Vitest + Testing Library)

| Comando | Qué hace |
|---|---|
| `pnpm test` | **Watch mode** — corre los tests y re-corre automáticamente al guardar un archivo. Ideal mientras desarrollás |
| `pnpm test:run` | Corre todos los tests **una vez** y termina. Útil para CI o para chequear antes de commitear |
| `pnpm test:ui` | Abre un **dashboard web** con resultados, filtros, diff de errores. Más visual. URL aparece en consola |

**Convención:** archivos de test van al lado del archivo testeado con sufijo `.test.jsx`/`.test.js`.
Ej: `src/hooks/useTheme.js` → `src/hooks/useTheme.test.js`.

---

## 🧹 Linting

| Comando | Qué hace |
|---|---|
| `pnpm lint` | Corre ESLint sobre todo el repo. Reporta errores y warnings de estilo/correctness |

---

## 🖼️ Optimización de imágenes

| Comando | Qué hace |
|---|---|
| `pnpm optimize:images` | Convierte las imágenes raster de `public/` a **WebP** (formato moderno, ~70% más liviano) y las reduce de tamaño. Corre `scripts/optimize-images.js` |

**Cuándo correrlo:** cada vez que agregás una imagen nueva a `public/` (ej. screenshots de proyectos). Pasos:
1. Poné el archivo fuente (`.jpg`/`.png`) en `public/`.
2. Agregalo a la lista `images` en `scripts/optimize-images.js` con su `width` de salida.
3. Corré `pnpm optimize:images` — genera el `.webp`.
4. En el componente, usá `<picture>` con el `.webp` + el original como fallback.

> NO corre en el build — es un paso manual de preparación de assets. El `.webp` generado se commitea al repo.

---

## 📦 Gestión de dependencias

| Comando | Qué hace |
|---|---|
| `pnpm add <paquete>` | Instalar dependencia runtime (va a `dependencies`) |
| `pnpm add -D <paquete>` | Instalar dev-dependency (va a `devDependencies`) — para tools que solo corren en build/test |
| `pnpm remove <paquete>` | Desinstalar |
| `pnpm install` | Sincronizar `node_modules` con `pnpm-lock.yaml` (después de `git pull` con cambios de deps) |
| `pnpm update --interactive` | Actualizar deps interactivamente, mostrando qué versión está disponible |
| `pnpm outdated` | Listar paquetes desactualizados sin actualizar nada |

**Importante:** `.npmrc` tiene `minimum-release-age=1440` — pnpm **no instala paquetes publicados hace menos de 24hs** (defensa contra ataques de supply chain). Si una versión recientísima es bloqueada, toma la anterior. Esto es intencional.

---

## 🔀 Git workflow del proyecto

```powershell
git status                      # ver archivos modificados
git diff                        # ver cambios en detalle
git add -A                      # stagear todo lo modificado
git add <archivo>               # stagear archivo específico
git commit -m "tipo: mensaje"   # commit (ver convención abajo)
git log --oneline -20           # ver últimos 20 commits
```

### Convención de mensajes de commit

Prefijos comunes (basado en Conventional Commits, en español):

| Prefijo | Cuándo usar | Ejemplo |
|---|---|---|
| `feat:` | Feature nueva visible para el usuario | `feat: setup React Router v7 con Home + NotFound` |
| `fix:` | Bug fix | `fix: corregir contraste de texto en dark mode` |
| `chore:` | Tareas de mantenimiento (deps, configs) | `chore: install motion, lenis, lucide-react` |
| `docs:` | Cambios en documentación | `docs: actualizar plan con realidad v4/v7` |
| `test:` | Tests agregados o modificados | `test: setup Vitest + Testing Library` |
| `refactor:` | Reorganizar código sin cambiar comportamiento | `refactor: extraer SkillCard a su propio archivo` |
| `style:` | Cambios solo de formato (espacios, comas) | `style: aplicar formato prettier` |
| `perf:` | Mejoras de performance | `perf: lazy load imágenes de proyectos` |

---

## 🗂️ Estructura del repo (referencia rápida)

```
giulianogerlo-portfolio/
├── api/                         # Vercel serverless functions (Phase 7+)
├── scripts/                     # Scripts de build/assets (generate-sitemap, optimize-images)
├── public/                      # Assets servidos al root (favicon, icons.svg, imágenes)
├── src/
│   ├── main.jsx                 # Entry point, monta React
│   ├── App.jsx                  # Routes (BrowserRouter wrap está en main.jsx)
│   ├── index.css                # Tailwind + CSS vars + reset global
│   ├── pages/                   # Páginas de ruta completa (Home, NotFound, ProjectDetail)
│   ├── components/              # Componentes reutilizables
│   │   ├── layout/              # Navbar, Footer, Layout
│   │   ├── ui/                  # Primitivas (Button, Input, ThemeToggle, Chip)
│   │   └── sections/            # Secciones del Home (Hero, About, Skills, ...)
│   ├── hooks/                   # Hooks custom (useTheme, useLenis, ...)
│   ├── lib/                     # Utilidades (cn, obfuscate-email)
│   ├── data/                    # Single source of truth de contenido (projects, skills, ...)
│   └── test/setup.js            # Setup global de Vitest
├── docs/
│   ├── comandos.md              # Este archivo
│   └── plans/                   # Design doc + implementation plan
├── .gitignore
├── .npmrc                       # pnpm config (minimum-release-age, auto-install-peers)
├── pnpm-workspace.yaml          # pnpm config (allowBuilds — aprobación de build scripts)
├── pnpm-lock.yaml               # Lockfile (COMMITEADO — no editar a mano)
├── package.json
├── vite.config.js               # Config Vite (React + React Compiler)
├── vitest.config.js             # Config Vitest (jsdom + setup)
├── postcss.config.js            # PostCSS plugins (Tailwind + autoprefixer)
├── eslint.config.js             # ESLint flat config
├── CLAUDE.md                    # Instrucciones para Claude Code
└── TODO-USUARIO.md              # Checklist de assets/keys a conseguir
```

**Tailwind v4** NO usa `tailwind.config.js` — toda la config vive en `src/index.css` (CSS-first config con `@theme` y `@custom-variant`).

---

## 🐛 Troubleshooting

| Síntoma | Solución probable |
|---|---|
| `pnpm: command not found` | Instalar pnpm: `npm install -g pnpm` |
| `Cannot find module 'X'` después de `git pull` | Correr `pnpm install` — alguien agregó deps |
| Vite dev server no toma cambios | Verificar que el archivo esté guardado. En extremo: matar proceso (`Ctrl+C`) y `pnpm dev` de nuevo |
| Tailwind no aplica clases | Verificar que el archivo esté dentro de los paths que Tailwind escanea (auto-detect en v4). Borrar `node_modules/.vite` y reiniciar `pnpm dev` |
| Tests fallan con `document is not defined` | Verificar que `vitest.config.js` tenga `environment: 'jsdom'` |
| Build de producción falla pero `pnpm dev` anda | Probablemente import case-sensitive: `./Component.jsx` vs `./component.jsx`. Windows es case-insensitive, Linux (Vercel build) no |

---

## 🚢 Deploy (Phase 9+, todavía no implementado)

Pendiente — se completa cuando lleguemos a Phase 9 del plan.
