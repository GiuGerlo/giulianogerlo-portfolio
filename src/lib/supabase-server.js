/**
 * supabase-server.js — cliente Supabase para CÓDIGO DE SERVIDOR (serverless
 * functions de `api/`, scripts de Node). NO usar en componentes React.
 *
 * Por qué NO reusamos src/lib/supabase.js:
 *  - Aquel lee la config de `import.meta.env` (la API de Vite), que SOLO existe
 *    cuando el bundler procesa el código del browser. En Node (`process.env`)
 *    `import.meta.env` es undefined → el cliente del front crashea acá.
 *  - Aquel activa `persistSession`/`autoRefreshToken` (auth de browser con
 *    localStorage). En un serverless no hay browser ni sesión que persistir:
 *    lo apagamos.
 *
 * Auth: usamos la ANON key (pública por diseño). Las tablas tienen RLS con
 * `anon SELECT` público (migrations 0002/0005/0006), así que con leer alcanza
 * — NO se usa la service_role key (esa bypassa RLS, es para escrituras
 * privilegiadas).
 *
 * Las env vars siguen prefijadas con VITE_ porque son las mismas que necesita
 * el build del front; Vercel también las expone al runtime de las funciones.
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

/**
 * Si faltan las env vars NO crasheamos el módulo al importarlo: exportamos
 * `null`. El consumidor (api/chat.js) lo detecta y cae a su fallback estático
 * en vez de tirar un 500. (createClient con url vacío lanzaría una excepción
 * al cargar el módulo, rompiendo el fail-open.)
 */
export const supabaseServer =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
