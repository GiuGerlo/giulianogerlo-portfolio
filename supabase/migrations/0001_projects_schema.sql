-- ============================================================================
-- Phase 12 — Migration 0001: projects table + RLS + storage bucket + policies
-- Fecha: 2026-05-21
-- Plan: docs/plans/2026-05-21-phase-12-supabase.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Este archivo es la copia versionada en git — referencia para clonar el
-- proyecto desde cero en otra DB.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabla `projects`: espejo de src/data/projects.js + columnas nuevas
--    (id, published, order_index, timestamps).
-- ---------------------------------------------------------------------------
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  category    text not null,
  role        text not null,
  my_role     text not null,
  summary     text not null,
  description text not null,
  stack       text[] not null default '{}',
  image       text,
  gallery     text[] not null default '{}',
  live_url    text,
  repo_url    text,
  date_start  text not null,
  date_end    text,
  challenges  text[] not null default '{}',
  published   boolean not null default false,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indices: orden publicados (query del home) + lookup por slug (detalle).
create index projects_order_published_idx
  on public.projects (order_index)
  where published = true;

create index projects_slug_idx on public.projects (slug);

-- ---------------------------------------------------------------------------
-- 2. Trigger: mantener updated_at fresco en cada UPDATE.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security: anon ve publicados, authenticated ve todo y muta.
--    NOTA: las policies de mutación se tightenearon en migration 0002.
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;

create policy "public read published"
  on public.projects for select
  to anon
  using (published = true);

create policy "admin read all"
  on public.projects for select
  to authenticated
  using (true);

create policy "admin insert"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "admin update"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

create policy "admin delete"
  on public.projects for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 4. Storage bucket `project-images` (público de lectura).
--    `public = true` significa: URLs accesibles sin token; las policies
--    siguen controlando INSERT/DELETE.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Storage policies sobre storage.objects scoped al bucket.
--    NOTA: la policy SELECT pública se dropeó en migration 0002 (los public
--    buckets sirven URLs por CDN sin necesitar policy). Las policies de
--    mutación se tightenearon por email también en 0002.
-- ---------------------------------------------------------------------------
create policy "public read images"
  on storage.objects for select
  to anon
  using (bucket_id = 'project-images');

create policy "admin upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "admin update images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

create policy "admin delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');
