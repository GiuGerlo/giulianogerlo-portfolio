# Portfolio personal Giuliano Gerlo — Design Doc

**Fecha**: 2026-05-13
**Autor**: Giuliano Gerlo + Claude (brainstorming)
**Estado**: Aprobado, listo para implementación

## Objetivo

Construir portfolio personal profesional para deploy público y uso como herramienta de self-marketing. Usuario es Full-Stack Developer con experiencia en PHP/Laravel/MySQL, principiante en React. El portfolio también funciona como proyecto de práctica React.

## Audiencia

- Reclutadores / CTOs evaluando como candidato Full-Stack
- Clientes potenciales freelance
- Comunidad dev (GitHub network)

## Decisiones tomadas

### Stack técnico

- **Framework**: React 19 + Vite 8 (ya inicializado)
- **React Compiler**: activo (no agregar `useMemo`/`useCallback` manualmente)
- **Lenguaje**: JavaScript (sin TypeScript v1)
- **Estilos**: Tailwind CSS v4 + variables CSS custom
- **Componentes UI**: shadcn/ui (primitivos accesibles, copy-paste a `src/components/ui/`)
- **Íconos**: Lucide React
- **Routing**: React Router v7 (v6 ya es legacy a 2026-05; APIs `BrowserRouter`/`Routes`/`Route`/`Link`/`NavLink`/`useParams`/`Navigate`/`Outlet` son idénticas a v6 para nuestro uso)
- **Theme toggle**: hook custom + `next-themes` pattern, persistido en `localStorage`
- **Animaciones**: Motion (ex Framer Motion) + Anime.js (puntual hero) + Lenis (smooth scroll)
- **Componentes "wow"**: Magic UI + React Bits (copy-paste)
- **Form**: react-hook-form + zod
- **Anti-bot**: Cloudflare Turnstile (invisible, gratis)
- **Backend form**: Vercel serverless function + Resend SDK
- **Hosting**: Vercel (subdominio gratis inicial)
- **Analytics**: Vercel Analytics built-in

### Sistema visual

**Colores acento**: `#04773B` (verde bosque). Hover dark: `#06A352`, hover light: `#035C2D`.

**Tema**: dark/light dual mode con toggle persistente. Default dark.

**Tipografía**:
- UI: Inter (400, 500, 600, 700)
- Mono/código: JetBrains Mono (400, 600)
- Escala: 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56 / 72 px

**Paleta dark**:
- bg `#0A0A0A` / bg-elevated `#141414` / border `#262626`
- text-primary `#FAFAFA` / text-muted `#A1A1AA`

**Paleta light**:
- bg `#FFFFFF` / bg-elevated `#F5F5F5` / border `#E5E5E5`
- text-primary `#0A0A0A` / text-muted `#525252`

**Layout**: container max 1200px, padding lateral 16/32px responsive, vertical rhythm 96/64px entre secciones.

**Border radius**: 8px cards, 6px botones, 4px inputs.

## Arquitectura de información

### Rutas

- `/` — Home single-page scroll con todas las secciones
- `/proyectos/:slug` — caso de estudio detallado por proyecto
- `*` — 404

Slugs: `inmobiliaria-nz`, `clovertecno`, `ramcc`, `alpa`, `cenarb`.

### Layout global

- **Navbar sticky**: logo `giuliano.dev`, links a anchors, íconos GitHub/LinkedIn, toggle theme
- **Footer**: brand + tagline, nav rápido, redes, copyright

### Secciones del Home (orden)

1. **Hero** — `$ whoami` + nombre + rol + ubicación + CTAs ("Ver proyectos", "Contactarme"), background gradient verde radial
2. **Sobre mí** — bio expandida + foto + chips (disponibilidad, ubicación, idioma, cert en curso)
3. **Skills** — grid agrupado: Frontend / Backend / DB / DevOps / Soft Skills
4. **AI-Augmented Development** — bloque destacado con 6 features: claude_code, mcp_servers, anthropic_api, agent_sdk, prompt_engineering, ai_workflows
5. **Proyectos** — 5 cards: Inmobiliaria NZ, Clovertecno, RAMCC, ALPA, CENARB (con rol de colaboración explícito)
6. **Experiencia** — timeline vertical con punto verde en "Actualidad"
7. **Educación** — grid de 4 cards clickeables que linkean a certificados (PDF o URL externa)
8. **Contacto** — form (nombre, email, mensaje) + 4 links directos (email, WhatsApp, LinkedIn, GitHub)

### Página detalle de proyecto (`/proyectos/:slug`)

1. Back link
2. Tag categoría + título + meta (fechas, rol, cliente)
3. CTAs (Ver sitio, Ver repo)
4. Resumen
5. **Mi rol** — explicación específica de qué hizo Giuliano (importante: aclarar colaboración)
6. Stack técnico
7. Galería de capturas
8. Desafíos resueltos (lista)

## Estructura de código

```
giulianogerlo-portfolio/
├── api/
│   └── contact.js              # Vercel serverless (Resend + Turnstile verify)
├── public/
│   ├── favicon.svg
│   ├── certs/                  # PDFs certificados
│   └── images/
│       ├── avatar.png
│       └── projects/
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # Router + Layout
│   ├── index.css               # Tailwind base + CSS vars globales
│   ├── data/
│   │   ├── projects.js
│   │   ├── skills.js
│   │   ├── experience.js
│   │   ├── education.js
│   │   └── socials.js
│   ├── lib/
│   │   ├── cn.js
│   │   └── obfuscate-email.js
│   ├── hooks/
│   │   ├── useTheme.js
│   │   └── useScrollSpy.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Chip.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── sections/
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── AISection.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Experience.jsx
│   │   │   ├── Education.jsx
│   │   │   └── Contact.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── SkillCard.jsx
│   │   ├── TimelineItem.jsx
│   │   ├── EduCard.jsx
│   │   ├── ContactForm.jsx
│   │   └── SectionHeading.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── ProjectDetail.jsx
│       └── NotFound.jsx
├── docs/plans/
├── .env.local                  # NO commit
├── .env.example                # template público
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json                 # headers seguridad
├── package.json
├── CLAUDE.md
└── TODO-USUARIO.md
```

### Patrón de datos

Cada archivo de `src/data/` exporta un array con shape consistente. Componentes leen, hacen `.map()`, renderizan. Single source of truth.

**Ejemplo `projects.js`** — shape de cada proyecto:
- slug, title, category, role, summary, description, myRole
- stack[], image, gallery[], liveUrl, repoUrl, dateStart, dateEnd
- challenges[]

## Form de contacto — seguridad

### Capas anti-spam

1. **Honeypot** — campo `website` oculto con CSS, bots lo llenan
2. **Cloudflare Turnstile** — captcha invisible, server-side verify
3. **Rate limit** — Vercel KV, 3 envíos/hora por IP
4. **Email obfuscation** — email no plano en HTML, decoded en JS runtime

### Stack

- Frontend: react-hook-form + zod + Turnstile widget
- Backend: `api/contact.js` Vercel function
- Email: Resend SDK con HTML escape de inputs

### Env vars

```
RESEND_API_KEY            # server-only
TURNSTILE_SECRET          # server-only
VITE_TURNSTILE_SITE_KEY   # client (prefix VITE_)
CONTACT_EMAIL_TO          # destino del email
```

## Deploy

### Vercel

- Conectado a repo GitHub `GiuGerlo/giulianogerlo-portfolio`
- Auto-deploy en push a `main`
- Preview deploys por PR
- Build: `npm run build`, output: `dist/`
- Env vars configuradas en dashboard

### Performance targets

- LCP < 1.5s
- CLS < 0.05
- INP < 200ms
- Bundle < 200KB gzip
- Lighthouse 95+

### Estrategias

- Imágenes WebP + `loading="lazy"`
- Fonts `font-display: swap`
- React Compiler reduce re-renders
- Code splitting por ruta (React Router automático)

## SEO

- Meta tags base en `index.html`
- OG image 1200x630
- Title dinámico por ruta (proyectos)
- `robots.txt` y `sitemap.xml` en `public/`

## Accesibilidad

- HTML semántico
- `alt` en imágenes
- Labels en form
- Focus visible
- Contraste WCAG AA
- `prefers-reduced-motion`

## YAGNI — Descartado de v1

- TypeScript (v2 si se justifica)
- i18n EN/ES (v2 si apunta a clientes externos)
- Blog (compromiso de mantener)
- Testimonios (no hay aún)
- Dominio custom (v2, cuando se compre)
- Google Analytics (Vercel Analytics suficiente)

## Open questions / decisiones pendientes

- URLs reales de proyectos live (las pasa Giuliano)
- Certificados (PDFs o URLs públicas) — los pasa Giuliano
- Foto profesional — la pasa Giuliano
- Screenshots de proyectos — los pasa Giuliano
- API keys (Resend, Turnstile) — Giuliano crea cuentas y pasa

Lista completa en `TODO-USUARIO.md` en raíz del repo.

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Usuario es principiante React → fricción al codear | Cada nuevo concepto se explica al introducirlo |
| Stack grande para primer proyecto | Implementación incremental por fases (ver plan) |
| Olvido de env vars en deploy | `.env.example` + checklist en TODO-USUARIO.md |
| Spam al email post-deploy | 4 capas anti-spam + monitoring |
| Pérdida de API keys | Documentado en TODO-USUARIO.md, recordar guardar al generar |
