# Plan — Footer cleanup + GitHub live + Insights del chatbot

Fecha: 2026-06-18 · Estado: **en curso**

## Context

Tres mejoras post deploy del dashboard + chatbot logging:
1. **Footer**: sacar "Hecho con React + Tailwind." (queda feo).
2. **GitHub live**: sección con repos destacados + grid de contribuciones, auto-actualizado
   vía API → señal de actividad real.
3. **Insights del chatbot** en `/admin/chats`: preguntas frecuentes + conversaciones por
   semana, desde los `chat_logs` ya guardados.

## Decisiones (con el owner)

- Repos: top por actividad (REST GitHub, auto).
- Contribuciones: grid propio desde API JSON (theme-aware).
- Fetch GitHub: proxy serverless `api/github.js` (cache + `GITHUB_TOKEN` opcional).
- FAQ: frecuencia por texto normalizado + conversaciones/semana.

## Arquitectura

- `api/github.js`: 2 fetch en paralelo → `{ repos, contributions, totalContributions }`.
  Repos `GET /users/GiuGerlo/repos?per_page=100&sort=pushed` (token opcional), filtra
  forks/archived, ordena stars→pushed, top 6. Contribuciones jogruber v4 (sin token). Cache
  CDN vía `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`. Fail-soft (parte
  vacía con 200). Helpers puros `mapRepo`/`pickFeatured`. `GITHUB_USER='GiuGerlo'`.
- `useGitHub.js`: fetch `/api/github`; en `import.meta.env.DEV` no fetchea (la función no
  corre en `pnpm dev`).
- `chat-insights.js`: helper puro desde las conversaciones de `useChatLogs` (sin queries).

## Tasks

- **T1** ✅: footer — sacado "Hecho con React + Tailwind", copyright centrado.
- **T2** ✅: `api/github.js` (proxy repos+contribuciones, cache CDN, fail-soft, helpers
  puros), `useGitHub.js` (siempre fetchea → anda bajo `vercel dev`/prod; `isLocalDev` solo
  para el aviso), `GitHub.jsx` (grid contrib theme-aware + cards repos + skeletons + aviso
  `vercel dev`), `<GitHub/>` en Home tras Proyectos, ancla `#github` en Navbar/Footer,
  ícono GitHub → aria-label "Perfil de GitHub" (a11y), `GITHUB_TOKEN` opcional en
  TODO-USUARIO. Tests: `api/github.test.js` + `GitHub.test.jsx` + ajuste Navbar/Footer.
  Suite 230/230, lint limpio. Nota: la sección solo trae data bajo `vercel dev` o prod
  (pnpm dev no sirve /api/*).
- **2026-06-18 — T2 (revisión, pedido del owner)**: SACADOS los repos destacados (solo queda
  el grid de contribuciones). `api/github.js` simplificado a solo contribuciones (jogruber,
  sin token, sin REST de repos); borrado `api/github.test.js` (testeaba los helpers de repos).
  `GitHub.jsx` solo grid de contribuciones. Sobre el conteo (717 perfil vs 181 público): el
  calendario público no cuenta repos privados → el owner debe activar GitHub Settings →
  "Include private contributions on my profile" para que coincida (sin token/código).
  `GITHUB_TOKEN` ya NO se usa → reemplazado en TODO-USUARIO por la nota del setting. Suite
  225/225, lint limpio.
- **T3** ✅: `src/lib/chat-insights.js` (puro: totales, promedio msgs/charla, conversaciones
  por semana últimas 8, preguntas frecuentes por texto normalizado) + bloque "Insights" en
  `Chats.jsx` (métricas + mini-barras semanales + top preguntas). `chat-insights.test.js`.
  GitHub: grid pasado a CSS grid (columnas 1fr) → llena todo el contenedor + `min-w` para
  scroll mobile. Fix flaky `App.test` (assert `$ whoami` estático en vez del h1 async).
  Suite 233/233, lint limpio.
- **T4**: QA + cierre.

## Verificación end-to-end

1. `pnpm lint` + `pnpm test:run` verdes.
2. Footer sin "Hecho con…", copyright centrado.
3. GitHub: con `vercel dev`/deploy → repos + grid; en `pnpm dev` → aviso, no rompe.
4. Insights en `/admin/chats`: métricas + barras/semana + top preguntas.
5. Ancla "GitHub" en el nav scrollea a la sección.

## Fuera de alcance (YAGNI)

- Pinned repos (GraphQL+token). Clustering semántico de preguntas. Stats extra de lenguajes.

## Log de cambios (extra)

- **2026-06-18 — GitHub mejoras (pedido owner)**: conteo de privados arreglado vía GraphQL
  `viewer` autenticado (necesita `GITHUB_TOKEN` en Vercel, scope `read:user`; el calendario
  público nunca cuenta privados). Selector de **años** (último año rolling + tabs por año
  calendario vía `?year=`, lista de años desde `contributionYears`). Grid estilo GitHub con
  **etiquetas de mes** (arriba) y de día (Lun/Mié/Vie), columnas por semana. `api/github.js`
  devuelve `{weeks, totalContributions, year, years}`; helpers `calendarToWeeks`/`daysToWeeks`.
  Tests reescritos. Suite 228/228.

## Log de cambios

- **2026-06-18 — T1**: `Footer.jsx` — removido el `<p>Hecho con React + Tailwind</p>`; la
  fila del copyright pasó a un `<p>` centrado único. `Footer.test.jsx` no testeaba ese texto
  → sin cambios.
