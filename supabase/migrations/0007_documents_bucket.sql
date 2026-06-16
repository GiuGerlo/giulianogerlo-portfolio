-- ============================================================================
-- Phase 13 (cont.) — Migration 0007: bucket de Storage `documents`
-- Fecha: 2026-06-16
-- Plan: docs/plans/2026-06-16-phase-13-perfil-editable.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Copia versionada en git.
--
-- Bucket para certificados (Education) y CV (site_settings). Acepta PDF e
-- imágenes. Público de lectura (servido por CDN, sin policy SELECT — igual
-- que project-images tras 0002). Escritura lockeada al email admin.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "admin upload documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  );

create policy "admin update documents"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'documents'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  )
  with check (
    bucket_id = 'documents'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  );

create policy "admin delete documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'
  );
