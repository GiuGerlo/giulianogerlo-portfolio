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
 * Dos clientes:
 *  - `supabaseServer` (ANON key, pública por diseño): para LECTURA. Las tablas
 *    de contenido tienen RLS con `anon SELECT` público (0002/0005/0006), así
 *    que con la anon key alcanza para leer.
 *  - `supabaseAdmin` (SERVICE_ROLE key, SECRETA): para ESCRITURA privilegiada
 *    que debe bypassar RLS — hoy, insertar en `chat_logs` (tabla privada sin
 *    acceso anon). Esta key NUNCA llega al bundle del browser (vive solo en el
 *    serverless). NO la prefijamos con VITE_ justamente para que Vite no la
 *    exponga al cliente.
 *
 * Las env vars VITE_ son las mismas que usa el build del front; Vercel también
 * las expone al runtime de las funciones.
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const serverAuth = { auth: { persistSession: false, autoRefreshToken: false } };

/**
 * Si faltan las env vars NO crasheamos el módulo al importarlo: exportamos
 * `null`. El consumidor (api/chat.js) lo detecta y cae a su fallback (lectura)
 * o saltea el logueo (escritura) en vez de tirar un 500. (createClient con url
 * vacío lanzaría una excepción al cargar el módulo, rompiendo el fail-open.)
 */
export const supabaseServer =
  url && anonKey ? createClient(url, anonKey, serverAuth) : null;

/**
 * Cliente con service_role (bypassa RLS). `null` si falta la key — el logueo
 * de chats es opcional: sin la env var, el chat funciona igual, solo no loguea.
 */
export const supabaseAdmin =
  url && serviceKey ? createClient(url, serviceKey, serverAuth) : null;
