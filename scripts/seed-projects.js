// scripts/seed-projects.js
//
// Seed inicial de la tabla `public.projects` en Supabase a partir del
// contenido actual de `src/data/projects.js`.
//
// Por qué este script:
//  - Phase 12 migra el contenido del portfolio de un archivo JS (que se
//    hornea en el build) a una DB en Supabase (que se lee en runtime).
//    Antes de poder cambiar los hooks del sitio (Task 12.5) hay que
//    tener los 6 proyectos cargados en la DB.
//  - Lo corremos UNA vez con `pnpm seed:projects`. Es idempotente:
//    usamos `upsert` con `onConflict: 'slug'` para que correrlo dos
//    veces no duplique filas — actualiza la fila existente por su slug.
//
// Por qué usa la SERVICE ROLE KEY:
//  - La RLS de `public.projects` (migration 0002) restringe INSERT/UPDATE
//    a `auth.jwt()->>'email' = 'ggiuliano526@gmail.com'`. Desde un script
//    de Node no hay sesión de Auth, entonces la anon key se bloquearía.
//  - La service role key BYPASSEA RLS por diseño (es lo correcto para
//    scripts admin y serverless functions). NUNCA debe entrar al bundle
//    del frontend — por eso este archivo vive en `scripts/`, no en `src/`.
//
// Cómo se corre:
//   pnpm seed:projects        (script en package.json — usa --env-file=.env)
//   node --env-file=.env scripts/seed-projects.js   (equivalente directo)
//
// Pre-requisitos:
//  - `.env` con SUPABASE_URL (o VITE_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY.
//  - Migrations 0001 y 0002 aplicadas (Task 12.2).

import { createClient } from '@supabase/supabase-js';
import { projects } from '../src/data/projects.js';
import { projectToDb } from '../src/lib/projects-mapper.js';

// La URL pública del proyecto también vale para el cliente admin
// (Supabase distingue admin vs anon por la KEY, no por la URL).
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail-fast: si falta cualquiera de las dos, mejor explotar acá con un
// error claro que intentar conectar y morir con un mensaje raro.
if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Faltan env vars. Necesito VITE_SUPABASE_URL (o SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Asegurate de correr con `pnpm seed:projects` (carga .env) o usar `node --env-file=.env`.',
  );
  process.exit(1);
}

// Cliente admin: SIN persistSession (es un script one-shot, no hay
// usuario logueado) y SIN autoRefreshToken (no hay sesión que refrescar).
// Estas dos opciones bajan la sobrecarga y evitan warnings.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Tomamos cada proyecto del array y le agregamos:
//  - order_index = índice del array (preserva el orden actual del sitio)
//  - published = true (los 6 ya están "publicados" hoy, son los que se ven)
// El resto de las columnas las arma `projectToDb` (snake_case + defaults).
const payload = projects.map((p, index) =>
  projectToDb({ ...p, orderIndex: index, published: true }),
);

console.log(`Sembrando ${payload.length} proyectos en Supabase...`);

// upsert + onConflict: 'slug' = "si ya existe una fila con ese slug,
// actualizá esa fila; si no, insertala". Esto hace al script idempotente
// — correrlo 10 veces deja el mismo resultado que correrlo 1 vez.
// .select() al final devuelve las filas resultantes (post-DB) para
// poder loguear lo que efectivamente quedó guardado.
const { data, error } = await supabase
  .from('projects')
  .upsert(payload, { onConflict: 'slug' })
  .select('slug, title, published, order_index');

if (error) {
  console.error('Error al sembrar proyectos:', error);
  process.exit(1);
}

console.log(`\nOK — ${data.length} proyectos sembrados/actualizados:\n`);
// Tabla compacta para inspección visual.
console.table(
  data
    .sort((a, b) => a.order_index - b.order_index)
    .map((row) => ({
      order: row.order_index,
      slug: row.slug,
      title: row.title,
      published: row.published,
    })),
);
