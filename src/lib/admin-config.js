/**
 * admin-config.js — constantes compartidas para el módulo admin.
 *
 * ADMIN_EMAIL: el ÚNICO email permitido para acceder a /admin/*.
 *
 * Por qué hardcodeado (y no en env var):
 *  - Es el mismo valor que está en las policies RLS de Supabase
 *    (migration 0002): `auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'`.
 *  - Si vive en env var, hay 2 lugares de verdad y se pueden desincronizar.
 *  - El email del owner del portfolio es público por diseño (está en
 *    la página de contacto). No hay nada que esconder.
 *  - Defensa en profundidad: aunque alguien obtuviera una sesión válida
 *    de otro email (lo cual ya está bloqueado por "shouldCreateUser:
 *    false" + signups disabled), igual no podría mutar nada (RLS),
 *    ni siquiera ver el dashboard (este chequeo en AdminRoute).
 */
export const ADMIN_EMAIL = 'ggiuliano526@gmail.com';
