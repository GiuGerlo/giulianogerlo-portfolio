-- ============================================================================
-- Migration 0008: columna chatbot_context en site_settings
-- Fecha: 2026-06-18
-- Plan: docs/plans/2026-06-18-chatbot-contenido-dinamico.md
--
-- Aplicada via MCP de Supabase (`mcp__supabase__apply_migration`).
-- Copia versionada en git.
--
-- Contexto: el chatbot (api/chat.js) pasa a leer su contenido de la DB. Los
-- "datos extra" que solo conocía el bot (lo que vivía en src/data/bio.js: edad,
-- disponibilidad, idiomas, modalidad) se vuelven editables como texto libre
-- desde /admin/sitio. Una sola columna de prosa: el bot la inyecta tal cual en
-- su contexto. Lo que se ponga acá el chatbot lo puede decir a cualquier
-- visitante (es público por diseño).
--
-- Reusa la fila singleton id=1 de site_settings (0005). RLS/grants/trigger ya
-- aplican a la tabla — agregar una columna no requiere tocarlos.
-- ============================================================================

-- 1. Columna nueva (additiva, con default '' → no rompe filas/lecturas existentes).
alter table public.site_settings
  add column chatbot_context text not null default '';

-- 2. Seed: prosa equivalente al bio.js actual, así el bot no pierde contexto al
--    migrar. Editable después desde /admin/sitio.
update public.site_settings
set chatbot_context =
  'Edad: 22 años. ' ||
  'Ubicación: Rosario, Santa Fe, Argentina. ' ||
  'Idiomas: español (nativo); inglés con lectura técnica de documentación, ' ||
  'tomando clases particulares. ' ||
  'Disponibilidad: abierto a propuestas laborales. ' ||
  'Modalidad: trabajo remoto o presencial en Rosario.'
where id = 1;
