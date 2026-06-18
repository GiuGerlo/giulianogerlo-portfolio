# Plan — Dashboard admin + registro de chats del chatbot

Fecha: 2026-06-18 · Estado: **en curso**

## Context

El panel `/admin` hoy abre directo en la gestión de proyectos (no hay "home"). Queremos:
(1) un **dashboard principal** en `/admin` (stats, accesos rápidos, estado del sitio); (2)
un **registro de chats** del chatbot, agrupado por conversación, para ver qué se pregunta.

## Decisiones (con el owner)

- **Escritura de logs**: con **service_role key** (privado total, sin inyección vía REST).
  Requiere `SUPABASE_SERVICE_ROLE_KEY` en Vercel (acción del owner).
- **Qué se loguea**: mensaje + respuesta + fecha, agrupado por `conversation_id` (hilo
  completo de cada visitante).
- **Widgets**: stat cards, accesos rápidos, estado del sitio, últimos chats. Vercel
  Analytics = link-out (no embed).

## Arquitectura

- `/admin` → home nuevo (`Dashboard.jsx` reescrito). Proyectos → `/admin/proyectos`
  (`Projects.jsx`). NAV_ITEMS suma Inicio + Chats.
- `supabase-server.js` suma `supabaseAdmin` (service_role, guard null).
- Logging fire-and-forget tras reply OK (no bloquea, no rompe el chat si falla).
- Lectura admin con RLS admin-read. Stats con count head:true en paralelo.
- Estilo: tokens existentes, `SectionHeading`, card `rounded-xl border ... bg-bg-elevated`,
  grid responsive, lucide. Cero deps nuevas.

## Tasks

- **T1** ✅: migración 0009 `chat_logs` (RLS privado, service_role write, admin read/delete)
  + `chat-logs-mapper.js`.
- **T2** ✅: `supabaseAdmin` (service_role, guard null) en `supabase-server.js`;
  `conversationId` (uuid por sesión, `useRef`) en `Chat.jsx` enviado en el body; `logChat()`
  en `api/chat.js` (valida uuid o genera uno, insert fire-and-forget tras el reply, try/catch
  que nunca tumba el chat, no-op sin service key); 3 tests nuevos de `logChat`; nota en
  `TODO-USUARIO.md` (logging necesita `SUPABASE_SERVICE_ROLE_KEY` en Vercel). Suite 211/211.
- **T3** ✅: `src/hooks/useChatLogs.js` (trae chat_logs desc, agrupa por
  `conversation_id` → conversaciones con turnos cronológicos, `remove(convId)` borra toda la
  conversación + refetch). `src/pages/admin/Chats.jsx` (lista de conversaciones, turnos
  visitante/bot, borrar con ConfirmDialog, estados loading/error/vacío). Ruta lazy
  `/admin/chats` en `App.jsx` + item "Chats" en `AdminLayout`. `Chats.test.jsx` (5 tests).
  Suite 216/216 (el fallo intermitente de `App.test "renders Home"` es flaky por su fetch
  real a Supabase, no relacionado).
- **T4**: Dashboard home (stats/accesos/estado/últimos chats) + mover proyectos a
  `/admin/proyectos` + `useDashboardStats` + rutas/nav.
- **T5**: QA + cierre.

## Verificación end-to-end

1. `pnpm lint` + `pnpm test:run` verdes.
2. RLS: anon NO lee `chat_logs`; admin logueado sí.
3. Logging: chatear → fila con `conversation_id`; 2 mensajes seguidos → misma conversación.
4. Fallback: sin service key, el chat responde igual (no 500), solo no loguea.
5. `/admin` = home con stats; `/admin/chats` = conversaciones; borrar pide confirmación.
6. Login → `/admin` (home). `/admin/proyectos` mantiene drag/drop + toggle.

## Fuera de alcance (YAGNI)

- Embed real de Vercel Analytics. Retención/prune de logs. Búsqueda/export. Multi-admin.

## Nota de privacidad

Se guardan mensajes de visitantes (posible PII). Vista admin-only, sin exposición pública.

## Log de cambios

- **2026-06-18 — T1**: `supabase/migrations/0009_chat_logs.sql` (tabla + 2 índices + RLS
  privado: admin SELECT/DELETE por email, service_role grant all, sin anon; aplicada vía
  MCP con nombre `0009_chat_logs`). `src/lib/chat-logs-mapper.js` (`dbToChatLog`).
- **2026-06-18 — T1 (mini-fix, fuera de plan)**: arreglado el *flash* de contenido viejo
  en el sitio público + transición de entrada. Causa del flash: las secciones hacían
  `data && !error ? data : FALLBACK` → durante el `loading` pintaban el seed y luego swap a
  la DB. Fix: nuevo primitive `src/components/ui/Skeleton.jsx`;
  Hero/About/Skills/AISection/Experience/Education muestran skeleton mientras `loading` y el
  FALLBACK estático queda SOLO para error real (`data ?? FALLBACK`). Transición:
  `.blur-in` global en `index.css` (keyframe blur 10px→0 + opacity) aplicada al wrapper de
  toda la página pública en `Layout.jsx` (Navbar+main+Footer; el Chat queda fuera por ser
  fixed) → toda la pantalla entra difuminada y se aclara una vez al montar. Sin `forwards`
  para no dejar un `filter` que rompa sticky/fixed; respeta `prefers-reduced-motion`.
  Tests: `About.test.jsx` cubre loading→skeleton vs error→fallback; `App.test.jsx`
  "renders Home" pasa a async (`findByRole`). Suite 208/208, lint limpio.
