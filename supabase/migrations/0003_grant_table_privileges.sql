-- ============================================================================
-- Phase 12 — Migration 0003: GRANT privileges a roles managed de Supabase
-- Fecha: 2026-05-26
-- Plan: docs/plans/2026-05-21-phase-12-supabase.md
--
-- Bug surfaced en Task 12.4: `pnpm seed:projects` con service_role key
-- falló con `permission denied for table projects`. Causa: migrations
-- 0001/0002 se aplicaron via MCP con un rol que no era `postgres`, asi
-- que los default privileges que Supabase suele setear para anon/
-- authenticated/service_role NO aplicaron. Solo `postgres` (owner)
-- tenia SELECT/INSERT/UPDATE/DELETE.
--
-- Fix: GRANT explicito por rol. RLS sigue siendo la capa que filtra
-- filas — los grants solo abren la puerta a nivel tabla.
-- ============================================================================

-- service_role bypassea RLS por diseño (scripts admin + serverless).
-- Necesita ALL para los flujos de seed, backup y serverless functions.
grant all on table public.projects to service_role;

-- authenticated puede SELECT/INSERT/UPDATE/DELETE; RLS filtra por email
-- (policies de migration 0002).
grant select, insert, update, delete on table public.projects to authenticated;

-- anon solo SELECT; RLS filtra a `published = true` (policy de 0001).
grant select on table public.projects to anon;
