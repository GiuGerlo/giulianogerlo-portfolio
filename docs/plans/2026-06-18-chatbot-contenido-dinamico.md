# Plan — Chatbot lee contenido dinámico de Supabase

Fecha: 2026-06-18 · Estado: **en curso**

## Context

Tras Phase 12 (projects) y Phase 13 (resto del contenido), el **sitio público lee de
Supabase** pero el **chatbot `api/chat.js` sigue leyendo de los `src/data/*.js`
hardcodeados**. Consecuencia: editás algo en `/admin` → cambia en la web, pero el bot
sigue diciendo lo viejo. El chatbot quedó anticuado respecto a la fuente de verdad real.

Además, `bio.js` (datos extra solo-chatbot: edad, disponibilidad, idiomas, modalidad) no
era editable desde ningún lado — había que tocar código y redeployar.

**Objetivo**: que `api/chat.js` lea el mismo contenido que la web (de la DB, siempre
fresco) y que los datos extra del bot sean editables desde `/admin`. Los `src/data/*.js`
y `bio.js` quedan como **fallback** (fail-open si la DB falla) — mismo criterio que el
rate-limit de Redis.

## Decisiones (con el owner)

- **bio → textarea libre**: columna `chatbot_context` (text) en `site_settings`, editable
  con un `<textarea>` en `/admin/sitio`. Prosa libre, se inyecta tal cual. Sin tabla
  nueva, sin estructura clave-valor.
- **Alcance**: paridad con hoy (projects + experience + skills + ai_skills + education) +
  el contexto extra. NO se suman secciones nuevas (About/redes) al prompt.
- **Frescura**: fetch en cada mensaje (~5-6 queries en paralelo), fallback al `.js`
  estático si falla. Sin cache (rate-limit 30/h hace el volumen trivial).

## Arquitectura

- Cliente Supabase **server-side** nuevo (`src/lib/supabase-server.js`): el del front
  (`supabase.js`) usa `import.meta.env` + `persistSession` (browser) → no sirve en Node.
  Server: `createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } })`. RLS `anon SELECT` público alcanza, sin service role.
- `@supabase/supabase-js` ya es dependencia. Cero deps nuevas.
- Reusar mappers existentes (`dbToExperience`, `dbToSkillGroup`, `dbToAiSkill`,
  `dbToEducation`, `dbToProject`) para serializar igual que la web.

## Tasks

- **T1** ✅: migración 0008 (`chatbot_context` en site_settings) + mapper.
- **T2**: `supabase-server.js` + refactor `api/chat.js` a fetch dinámico con fallback +
  `api/chat.test.js`.
- **T3**: textarea "Contexto del chatbot" en `Site.jsx` + test.
- **T4**: QA end-to-end + cierre. Evaluar deprecar `bio.js` (queda como fallback).

## Verificación end-to-end

1. `pnpm lint` y `pnpm test:run` verdes.
2. `select chatbot_context from site_settings where id=1;` devuelve el seed.
3. `vercel dev` → chat responde con data de la DB.
4. Drift: editar proyecto/exp en `/admin`, preguntarle al bot → responde lo nuevo.
5. Fallback: con env Supabase ausente, el bot sigue respondiendo (cae al `.js`) sin 500.
6. Editar textarea en `/admin/sitio`, preguntarle al bot ese dato → lo dice.
7. Deploy prod + repetir 3-4.

## Fuera de alcance (YAGNI)

- Cache del contexto. Sumar About/redes al prompt. Migrar el fallback estático.

## Log de cambios

- **2026-06-18 — T1**: `supabase/migrations/0008_chatbot_context.sql` (columna additiva +
  seed con la prosa de bio.js, aplicada vía MCP). `site-settings-mapper.js`: agregado
  `chatbotContext` ↔ `chatbot_context`. Site.test.jsx sigue verde (4/4). Fix: la migración
  se había registrado como `chatbot_context` en la DB → renombrada a `0008_chatbot_context`
  para seguir el patrón `0001`–`0007`.
- **2026-06-18 — T2**: `src/lib/supabase-server.js` (cliente Node anon key,
  `persistSession:false`, guard a `null` si faltan env vars → no rompe fail-open).
  `api/chat.js`: nuevo `fetchContent()` (6 lecturas en paralelo + mapeo + fallback estático
  total), `buildContext(content)` ahora recibe el contenido y tolera shape `desc`/
  `description`, `buildSystemPrompt`/handler pasan a async. `api/chat.test.js` (nuevo, 2
  tests: serialización + fallback sin Supabase). `eslint.config.js`: supabase-server.js al
  bloque de globals Node. Suite 206/206 verde, lint limpio.
- **2026-06-18 — T3**: `Site.jsx`: campo `chatbotContext` en schema/defaults/reset +
  sección "Contexto del chatbot" con `<textarea>` nativo (texto plano, sin WYSIWYG) y nota
  de privacidad. `Site.test.jsx`: fixture + asserts del textarea (populate + payload
  `chatbot_context` en el UPDATE). Tests 4/4, lint limpio.
