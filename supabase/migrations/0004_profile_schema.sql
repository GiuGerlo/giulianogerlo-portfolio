-- ============================================================================
-- Phase 13 — Migration 0004: tabla profile (single-row) + RLS + GRANTs + seed
-- Fecha: 2026-06-16
-- Plan: docs/plans/2026-06-16-phase-13-perfil-editable.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Esta es la copia versionada en git — espeja exacto el SQL aplicado.
--
-- Hace editable la seccion "Sobre mi" (src/components/sections/About.jsx) desde
-- /admin, replicando el patron de projects (Phase 12). El seed deja la fila id=1
-- con los valores ACTUALES del JSX para que el About se vea identico apenas se
-- aplica.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabla `profile` single-row.
--    Solo hay UN perfil, asi que en vez de un id autogenerado usamos id=1 fijo
--    (default 1 + check id=1). El hook/admin siempre apuntan a `.eq('id', 1)`.
--    Columnas explicitas (no key-value): matchea 1:1 los campos del About.
--    Los parrafos son markdown (negritas con **...**), se renderizan con
--    react-markdown en la UI (sin HTML crudo -> sin XSS).
-- ---------------------------------------------------------------------------
create table public.profile (
  id             int primary key default 1,
  about_image    text,                       -- URL Storage o null (fallback a /foto-giulianogerlo.*)
  about_p1       text not null default '',    -- parrafo 1 (markdown)
  about_p2       text not null default '',    -- parrafo 2 (markdown)
  chip_available text not null default '',    -- "Disponible para proyectos" (variant dot)
  chip_location  text not null default '',    -- "Rosario, AR" (MapPin)
  chip_language  text not null default '',    -- "Español" (Languages)
  chip_education text not null default '',    -- "Cursando React Cert..." (GraduationCap)
  updated_at     timestamptz not null default now(),
  constraint profile_single_row check (id = 1)
);

-- ---------------------------------------------------------------------------
-- 2. Trigger: refresca updated_at en cada UPDATE.
--    Reusa la funcion public.set_updated_at() — ya existe desde 0001 y se
--    endurecio con search_path='' en 0002. Aca solo la attacheamos a la tabla.
-- ---------------------------------------------------------------------------
create trigger profile_set_updated_at
  before update on public.profile
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security.
--    La fila es publica (no hay concepto "published" como en projects): anon
--    siempre la lee. Las mutaciones quedan lockeadas al email del admin via
--    JWT (mismo patron que projects en 0002). NO hay policy DELETE: la fila
--    nunca se borra (single-row).
-- ---------------------------------------------------------------------------
alter table public.profile enable row level security;

create policy "public read profile"
  on public.profile for select
  to anon
  using (true);

create policy "admin read profile"
  on public.profile for select
  to authenticated
  using (true);

create policy "admin insert profile"
  on public.profile for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

create policy "admin update profile"
  on public.profile for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');

-- ---------------------------------------------------------------------------
-- 4. GRANTs por rol (espeja 0003). RLS sigue siendo la capa que filtra filas;
--    los grants solo abren la puerta a nivel tabla.
-- ---------------------------------------------------------------------------
grant all on table public.profile to service_role;
grant select, insert, update on table public.profile to authenticated;
grant select on table public.profile to anon;

-- ---------------------------------------------------------------------------
-- 5. Seed: fila id=1 con los valores ACTUALES exactos del JSX.
--    `on conflict do nothing` -> migration idempotente (re-correrla no pisa
--    cambios hechos despues desde /admin).
-- ---------------------------------------------------------------------------
insert into public.profile
  (id, about_image, about_p1, about_p2,
   chip_available, chip_location, chip_language, chip_education)
values (
  1, null,
  'Soy **Giuliano Gerlo**, Técnico Superior en Desarrollo de Software egresado del Brigadier López (Rosario). Programador con experiencia en desarrollo **Full Stack**, especializado en automatización de procesos, gestión de bases de datos y creación de soluciones eficientes.',
  'Actualmente me desempeño como **Asistente de Desarrollo** en RAMCC, donde participo en software a medida en front-end y back-end. Me interesa la optimización continua de sistemas y cada vez más el desarrollo asistido por **IA** (Claude Code, MCP, agentes).',
  'Disponible para proyectos',
  'Rosario, AR',
  'Español',
  'Cursando React Cert · DigitalHouse'
)
on conflict (id) do nothing;
