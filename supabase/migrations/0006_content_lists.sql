-- ============================================================================
-- Phase 13 (cont.) — Migration 0006: tablas de listas de contenido
-- Fecha: 2026-06-16
-- Plan: docs/plans/2026-06-16-phase-13-perfil-editable.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Copia versionada en git.
--
-- 4 listas editables desde /admin: skill_groups (Stack Técnico), ai_skills
-- (AI Integration), experience (timeline), education (educación + certs).
-- Cada una: pk uuid, order_index para ordenar, timestamps, RLS (anon SELECT
-- todo, admin CRUD por email), grants por rol, trigger updated_at. Seed desde
-- los data/*.js actuales (mismo orden de array → order_index secuencial).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tablas.
-- ---------------------------------------------------------------------------
create table public.skill_groups (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  icon        text not null default '',          -- nombre lucide (set curado)
  items       text[] not null default '{}',
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.ai_skills (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  status      text not null default 'active',    -- 'active' | 'exploring'
  description text not null default '',
  items       text[] not null default '{}',
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.experience (
  id           uuid primary key default gen_random_uuid(),
  date_label   text not null default '',
  date_start   text,
  date_end     text,
  role         text not null default '',
  company      text not null default '',
  description  text not null default '',
  current      boolean not null default false,
  project_slug text,                              -- linkea a /proyectos/<slug> (opcional)
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.education (
  id          uuid primary key default gen_random_uuid(),
  date_label  text not null default '',
  title       text not null default '',
  org         text not null default '',
  status      text not null default 'completed', -- 'completed' | 'in-progress'
  cert_url    text,                               -- URL Storage/pública del cert o null
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Triggers updated_at (reusan public.set_updated_at()).
-- ---------------------------------------------------------------------------
create trigger skill_groups_set_updated_at before update on public.skill_groups
  for each row execute function public.set_updated_at();
create trigger ai_skills_set_updated_at before update on public.ai_skills
  for each row execute function public.set_updated_at();
create trigger experience_set_updated_at before update on public.experience
  for each row execute function public.set_updated_at();
create trigger education_set_updated_at before update on public.education
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS + policies + grants por tabla (loop para no repetir 5x el bloque).
--    anon SELECT (todo público, sin concepto "published"); admin CRUD por email.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['skill_groups','ai_skills','experience','education'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($f$create policy "public read %1$s" on public.%1$I for select to anon using (true);$f$, t);
    execute format($f$create policy "admin read %1$s" on public.%1$I for select to authenticated using (true);$f$, t);
    execute format($f$create policy "admin insert %1$s" on public.%1$I for insert to authenticated with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');$f$, t);
    execute format($f$create policy "admin update %1$s" on public.%1$I for update to authenticated using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com') with check (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');$f$, t);
    execute format($f$create policy "admin delete %1$s" on public.%1$I for delete to authenticated using (auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com');$f$, t);
    execute format('grant all on table public.%I to service_role;', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated;', t);
    execute format('grant select on table public.%I to anon;', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Seeds (order_index secuencial = orden del array en cada data/*.js).
-- ---------------------------------------------------------------------------
insert into public.skill_groups (title, icon, items, order_index) values
  ('Frontend', 'Layout', array['HTML','CSS','JavaScript','React','Tailwind CSS','Bootstrap','jQuery'], 0),
  ('Backend', 'Server', array['PHP','Laravel','API REST','Node.js'], 1),
  ('Base de datos', 'Database', array['MySQL','MariaDB','Modelado','Optimización'], 2),
  ('DevOps / Tools', 'Wrench', array['Git','GitHub','GitHub Actions','Docker','Playwright','Postman','Figma','VS Code'], 3),
  ('Soft Skills', 'Heart', array['Trabajo en equipo','Comunicación','Autonomía','Aprendizaje rápido','Pensamiento lógico','Adaptabilidad'], 4);

insert into public.ai_skills (title, status, description, items, order_index) values
  ('ai_dev_tooling', 'active', 'Agentes y asistentes de coding IA usados en el día a día: CLI agéntico, autocomplete en editor, extensiones especializadas. Combino varios según la tarea (refactors largos vs. snippet rápido vs. workflow custom).', array['Claude Code','OpenAI Codex','GitHub Copilot','OpenCode','Claude Skills','Claude Plugins'], 0),
  ('mcp_servers', 'active', 'Model Context Protocol — conexión de Claude con herramientas propias y APIs externas.', array[]::text[], 1),
  ('anthropic_api', 'active', 'Integración del SDK de Anthropic en apps: tool use, prompt caching, streaming.', array[]::text[], 2),
  ('agent_sdk', 'active', 'Construcción de agentes custom con loops, tool use y manejo de contexto.', array[]::text[], 3),
  ('prompt_engineering', 'active', 'Diseño de prompts efectivos: few-shot, chain-of-thought, structured output.', array[]::text[], 4),
  ('ai_workflows', 'active', 'Automatización de procesos dev con IA: code review, docs, testing asistido.', array[]::text[], 5);

insert into public.experience (date_label, date_start, date_end, role, company, description, current, project_slug, order_index) values
  ('NOV 2024 — ACTUALIDAD', '2024-11', null, 'Asistente de Desarrollo', 'RAMCC', 'Trabajo full-stack en el ecosistema digital de RAMCC: sitios institucionales, aula virtual con Mercado Pago, sistema Mi-Huella (app Flutter + API PHP) y censo de arbolado CenArb (Flutter + Laravel).', true, 'ramcc', 0),
  ('FEB 2026 — MAR 2026', '2026-02', '2026-03', 'Desarrollo Full-Stack · App Personal', 'Proyecto personal', 'App de seguimiento de entrenamiento de hipertrofia con React, PHP y pipeline de CI/CD propio a Hostinger.', false, 'gym-tracker', 1),
  ('AGO 2025 — SEP 2025', '2025-08', '2025-09', 'Desarrollo Full-Stack · Finanzas Personales', 'Proyecto personal', 'Gestor de finanzas multi-usuario con control de acceso por roles (RBAC), registro de ingresos, gastos y gastos fijos.', false, 'gestor-finanzas', 2),
  ('JUL 2025 — SEP 2025', '2025-07', '2025-09', 'Desarrollo Full-Stack · Sistema para Tienda de Ropa', 'Next (Chañar Ladeado)', 'Sistema integral de gestión para una tienda de ropa: ventas, pagos parciales, préstamos de prendas, reportes en Excel y dashboard con métricas.', false, 'next-tienda', 3),
  ('JUN 2025 — AGO 2025', '2025-06', '2025-08', 'Desarrollo Full-Stack · Sitio Web Inmobiliario', 'Inmobiliaria NZ', 'Catálogo público de propiedades con buscador instantáneo, mapa dinámico con clusters y panel de administración.', false, 'inmobiliaria-nz', 4),
  ('MAR 2025 — AGO 2025', '2025-03', '2025-08', 'Colaborador Full-Stack · E-commerce', 'CloverTecno', 'Tienda online con checkout integrado a Mercado Pago, gestión de stock vía Excel y panel administrativo con DataTables.', false, 'clovertecno', 5);

insert into public.education (date_label, title, org, status, cert_url, order_index) values
  ('2022 — 2024', 'Técnico Superior en Desarrollo de Software', 'Terciario Brigadier López, Rosario', 'completed', null, 0),
  ('ENE 2024 — MAR 2024', 'Curso de Desarrollo Web', 'CoderHouse', 'completed', '/certs/coderhouse-web.pdf', 1),
  ('AGO 2024 — OCT 2024', 'Curso de JavaScript', 'CoderHouse', 'completed', '/certs/coderhouse-js.pdf', 2),
  ('JUN 2025 — JUN 2026', 'Certificación React Developer', 'DigitalHouse', 'in-progress', null, 3);
