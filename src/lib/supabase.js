/**
 * supabase.js — singleton del cliente Supabase para el frontend.
 *
 * Por qué singleton:
 *  - `createClient()` crea un cliente con su propio listener de auth y su
 *    propia conexión. Si lo llamamos en cada archivo que use Supabase,
 *    multiplicamos listeners y la sesión se vuelve inconsistente.
 *  - Solución estándar: crear UNA instancia y exportarla. Cada import
 *    del proyecto recibe la misma referencia.
 *
 * Por qué el anon key viaja en el bundle:
 *  - La `anon key` es PÚBLICA por diseño (va en el frontend). Lo que
 *    protege la data es RLS (Row Level Security) en la DB: las policies
 *    deciden qué puede ver/mutar cada rol (anon vs authenticated).
 *  - El que NO va al frontend es `SUPABASE_SERVICE_ROLE_KEY`. Esa bypassa
 *    RLS y se usa SOLO server-side en serverless functions y scripts.
 */

import { createClient } from '@supabase/supabase-js';

// Vite expone solo las env vars prefijadas con VITE_ al bundle del browser.
// `import.meta.env` es el equivalente Vite de `process.env` (que no existe
// en el browser).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-fast: si falta config, mejor crashear en el build/dev que ver
// errores opacos cuando un componente intenta usar el cliente en runtime.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el entorno. ' +
      'Revisar .env local o las env vars en Vercel.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // `persistSession`: guarda la sesión en localStorage para que el
    // usuario admin no tenga que pedir magic link en cada visita.
    persistSession: true,
    // `autoRefreshToken`: refresca el JWT antes de que expire (1h por
    // default) para evitar logouts inesperados a mitad de edición.
    autoRefreshToken: true,
    // `detectSessionInUrl`: cuando el usuario hace click en el magic link,
    // vuelve con `?code=...` en la URL. Supabase lo intercambia por una
    // sesión automáticamente al cargar la app.
    detectSessionInUrl: true,
  },
});
