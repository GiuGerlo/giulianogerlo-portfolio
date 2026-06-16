-- ============================================================================
-- Phase 13 (cont.) — Migration 0005: tabla site_settings (singleton)
-- Fecha: 2026-06-16
-- Plan: docs/plans/2026-06-16-phase-13-perfil-editable.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Copia versionada en git.
--
-- Datos ÚNICOS del sitio editables desde /admin/sitio: Hero (nombre, tagline,
-- ubicación), Footer (tagline), CV (url Storage) y redes sociales. La tabla
-- profile (0004) queda enfocada solo en el About. Single-row id=1, mismo
-- patrón RLS/grants/trigger que profile.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabla singleton.
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id              int primary key default 1,
  hero_name       text not null default '',
  hero_tagline    text not null default '',
  hero_location   text not null default '',
  footer_tagline  text not null default '',
  cv_url          text,                         -- URL Storage o null (fallback /cv.pdf)
  social_github   text not null default '',
  social_linkedin text not null default '',
  social_email    text not null default '',
  social_whatsapp text not null default '',     -- formato internacional sin "+"
  social_location text not null default '',
  updated_at      timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);

-- ---------------------------------------------------------------------------
-- 2. Trigger updated_at (reusa public.set_updated_at(), search_path='').
-- ---------------------------------------------------------------------------
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS: fila pública legible; mutación lockeada al email admin.
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;

create policy "public read site_settings"
  on public.site_settings for select to anon using (true);

create policy "admin read site_settings"
  on public.site_settings for select to authenticated using (true);

create policy "admin insert site_settings"
  on public.site_settings for insert to authenticated
  with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

create policy "admin update site_settings"
  on public.site_settings for update to authenticated
  using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

-- ---------------------------------------------------------------------------
-- 4. GRANTs por rol (mirror 0003).
-- ---------------------------------------------------------------------------
grant all on table public.site_settings to service_role;
grant select, insert, update on table public.site_settings to authenticated;
grant select on table public.site_settings to anon;

-- ---------------------------------------------------------------------------
-- 5. Seed: valores actuales de Hero.jsx / Footer.jsx / socials.js.
-- ---------------------------------------------------------------------------
insert into public.site_settings
  (id, hero_name, hero_tagline, hero_location, footer_tagline, cv_url,
   social_github, social_linkedin, social_email, social_whatsapp, social_location)
values (
  1,
  'Giuliano Gerlo',
  'Full-Stack Developer · React · PHP · MySQL',
  'Rosario, Santa Fe, Argentina',
  'Full-Stack Developer enfocado en construir productos robustos con PHP/Laravel, React y workflows asistidos con IA.',
  null,
  'https://github.com/GiuGerlo',
  'https://www.linkedin.com/in/giuliano-gerlo-21a7b8221/',
  'ggiuliano526@gmail.com',
  '5493468536422',
  'Rosario, Santa Fe — Argentina'
)
on conflict (id) do nothing;
