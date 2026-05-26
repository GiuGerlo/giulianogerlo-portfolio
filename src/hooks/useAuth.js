import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';

/**
 * useAuth — hook que expone el estado de auth del usuario con Supabase.
 *
 * Devuelve: { session, loading }
 *  - session: objeto Session de Supabase (con user, access_token, etc.)
 *             o null si no hay sesión.
 *  - loading: true mientras se resuelve el primer chequeo de sesión.
 *
 * Por qué un hook centralizado:
 *  - Cualquier componente que quiera saber "¿hay un usuario logueado?"
 *    (AdminRoute, Login, Dashboard, Navbar futuro) consume este hook.
 *  - Si cambia la sesión (login nuevo, logout, token expirado y
 *    refresheado), todos los consumidores se re-renderean automático
 *    porque Supabase emite eventos via `onAuthStateChange`.
 *
 * Patrón del effect:
 *  1. Pedimos la sesión actual con `getSession()` (lee de localStorage).
 *  2. Nos suscribimos a `onAuthStateChange` para reaccionar a cambios
 *     (login, logout, refresh de token, etc.).
 *  3. Cleanup: desuscribir cuando el componente se desmonta — evita
 *     listeners zombies que terminen seteando estado en componentes
 *     ya desmontados.
 *
 * Sobre setState dentro del effect (regla react-hooks/set-state-in-effect):
 *  - Esa regla se preocupa por setState SINCRÓNICOS en el cuerpo del
 *    effect (lo que dispararía re-render en loop). Acá los setState
 *    viven dentro de callbacks ASYNC (promise.then) o de callbacks
 *    invocados por Supabase fuera del flujo de render — no aplica.
 */
export function useAuth() {
  const [state, setState] = useState({ session: null, loading: true });

  useEffect(() => {
    // Bandera para no setear estado si el componente se desmontó antes
    // de que la promise inicial resolviera (evita warning + leak).
    let cancelled = false;

    // 1) Estado inicial: leemos la sesión persistida en localStorage.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setState({ session, loading: false });
    });

    // 2) Listener de cambios. Se dispara en login, logout, refresh, etc.
    //    `_event` es el tipo de cambio (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).
    //    No lo usamos por nombre; reaccionamos solo al nuevo `session`.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({ session, loading: false });
      },
    );

    // 3) Cleanup al desmontar.
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
