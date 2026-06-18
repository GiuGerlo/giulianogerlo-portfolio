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
- **T3**: `chat-insights.js` + bloque insights en `Chats.jsx` + test.
- **T4**: QA + cierre.

## Verificación end-to-end

1. `pnpm lint` + `pnpm test:run` verdes.
2. Footer sin "Hecho con…", copyright centrado.
3. GitHub: con `vercel dev`/deploy → repos + grid; en `pnpm dev` → aviso, no rompe.
4. Insights en `/admin/chats`: métricas + barras/semana + top preguntas.
5. Ancla "GitHub" en el nav scrollea a la sección.

## Fuera de alcance (YAGNI)

- Pinned repos (GraphQL+token). Clustering semántico de preguntas. Stats extra de lenguajes.

## Log de cambios

- **2026-06-18 — T1**: `Footer.jsx` — removido el `<p>Hecho con React + Tailwind</p>`; la
  fila del copyright pasó a un `<p>` centrado único. `Footer.test.jsx` no testeaba ese texto
  → sin cambios.
