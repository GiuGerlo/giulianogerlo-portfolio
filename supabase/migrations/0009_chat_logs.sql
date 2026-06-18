-- ============================================================================
-- Migration 0009: tabla chat_logs (registro de chats del chatbot)
-- Fecha: 2026-06-18
-- Plan: docs/plans/2026-06-18-admin-dashboard-chat-logs.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Copia versionada en git.
--
-- Guarda cada par pregunta/respuesta del chatbot (api/chat.js) para que el
-- admin pueda ver qué se pregunta. Las filas de una misma sesión comparten
-- `conversation_id` (lo genera el frontend) → el admin agrupa por ese id para
-- ver el hilo completo.
--
-- Privacidad: contiene mensajes de visitantes (posible PII). Es PRIVADO:
--   - NO hay acceso anon (ni lectura ni escritura).
--   - Escribe SOLO el serverless con la service_role key (bypassa RLS).
--   - Lee SOLO el admin logueado (policy por email, patrón de 0006).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabla.
-- ---------------------------------------------------------------------------
create table public.chat_logs (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,                 -- agrupa los turnos de una sesión
  message         text not null default '',      -- pregunta del visitante
  reply           text not null default '',      -- respuesta del bot
  created_at      timestamptz not null default now()
);

-- Índice para listar/agrupar conversaciones por orden temporal.
create index chat_logs_conversation_idx
  on public.chat_logs (conversation_id, created_at);

-- Índice para el orden "más recientes primero" del listado admin.
create index chat_logs_created_idx
  on public.chat_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- 2. RLS: privado total. Sin policies para anon → anon no lee ni escribe.
--    El service_role bypassa RLS (no necesita policy) y es quien inserta.
-- ---------------------------------------------------------------------------
alter table public.chat_logs enable row level security;

create policy "admin read chat_logs"
  on public.chat_logs for select to authenticated
  using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

create policy "admin delete chat_logs"
  on public.chat_logs for delete to authenticated
  using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

-- ---------------------------------------------------------------------------
-- 3. GRANTs. service_role: todo (inserta el serverless). authenticated:
--    select + delete (la lectura/borrado del admin la filtra RLS). anon: NADA.
-- ---------------------------------------------------------------------------
grant all on table public.chat_logs to service_role;
grant select, delete on table public.chat_logs to authenticated;
