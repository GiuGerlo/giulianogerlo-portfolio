-- ============================================================================
-- Phase 12 — Migration 0002: hardening de seguridad
-- Fecha: 2026-05-21
-- Plan: docs/plans/2026-05-21-phase-12-supabase.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Copia versionada en git.
--
-- Fixes warnings del security advisor sobre la migration 0001:
--   1. search_path mutable en función trigger `set_updated_at`.
--   2. RLS policies USING (true) en mutaciones -> chequear email del JWT.
--   3. Public bucket allows listing -> dropear policy SELECT del bucket.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Fix search_path mutable en `set_updated_at`.
--    Sin esto, un atacante con permiso de crear schemas podría hijackear
--    referencias no calificadas dentro de la función.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Tightening RLS en `public.projects`: solo el email admin puede mutar.
--    Defensa en profundidad: aunque desactivemos signups en Auth, si alguien
--    obtuviera una sesión `authenticated` por otra vía, no podría escribir.
-- ---------------------------------------------------------------------------
drop policy "admin insert" on public.projects;
drop policy "admin update" on public.projects;
drop policy "admin delete" on public.projects;

create policy "admin insert"
  on public.projects for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

create policy "admin update"
  on public.projects for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

create policy "admin delete"
  on public.projects for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

-- ---------------------------------------------------------------------------
-- 3. Storage policies del bucket `project-images`: mismo lock por email.
-- ---------------------------------------------------------------------------
drop policy "admin upload images" on storage.objects;
drop policy "admin update images" on storage.objects;
drop policy "admin delete images" on storage.objects;

create policy "admin upload images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  );

create policy "admin update images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  )
  with check (
    bucket_id = 'project-images'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  );

create policy "admin delete images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  );

-- ---------------------------------------------------------------------------
-- 4. Drop policy SELECT del bucket público.
--    Public buckets sirven URLs vía CDN sin tocar RLS. Mantener la policy
--    SELECT permite a clientes con anon key listar todos los archivos.
-- ---------------------------------------------------------------------------
drop policy "public read images" on storage.objects;
