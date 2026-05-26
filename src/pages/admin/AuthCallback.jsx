import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { supabase } from '../../lib/supabase.js';

/**
 * AuthCallback — página /admin/auth/callback.
 *
 * Qué hace:
 *  - El magic link en el email lleva al usuario acá con `?code=...` (PKCE)
 *    o con tokens en el hash (#access_token=...). El cliente Supabase
 *    está configurado con `detectSessionInUrl: true`, así que detecta
 *    eso automáticamente al cargar el módulo y dispara el exchange.
 *  - Nuestro trabajo acá es solo ESPERAR a que `useAuth()` reporte la
 *    sesión nueva y redirigir a /admin.
 *
 * Estados visibles:
 *  - "Validando…" (default): spinner mientras corre el exchange.
 *  - Sesión lista → <Navigate to="/admin" /> (entra al Dashboard).
 *  - Error / timeout → mensaje + link para reintentar login.
 *
 * Por qué el timeout (5s):
 *  - Si la URL no trae código válido (link expirado, copy-paste roto,
 *    link clickeado dos veces, etc), Supabase no emite SIGNED_IN y nos
 *    quedaríamos en loading infinito. El timeout nos saca del limbo.
 */
export default function AuthCallback() {
  useDocumentTitle('Validando sesión — Giuliano Gerlo');

  const { session, loading } = useAuth();

  // Flag local que se prende si pasaron 5s sin sesión. Triggerea el
  // estado de error visible.
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Si ya hay sesión, no agendamos timeout (no hace falta).
    if (session) return;

    // Setear timeout solo una vez al montar. Si la sesión llega antes
    // del timeout, el cleanup lo cancela y no se ejecuta nunca.
    const timeoutId = setTimeout(() => {
      setTimedOut(true);
    }, 5000);

    return () => clearTimeout(timeoutId);
    // session como dep: si se setea antes de los 5s, el effect re-corre,
    // el cleanup cancela el timeout y el early return arriba evita
    // agendar uno nuevo. Resultado: timeout solo dispara si NUNCA llega
    // la sesión.
  }, [session]);

  // ── Sesión OK → al panel ──
  if (session) {
    return <Navigate to="/admin" replace />;
  }

  // ── Sin sesión y se acabó el plazo: error ──
  if (timedOut && !loading) {
    // Limpiamos cualquier resto de URL con hash/code que pueda haber
    // quedado, por prolijidad — el cliente ya hizo lo suyo.
    // Forzamos un signOut por las dudas (sesión parcial inválida).
    supabase.auth.signOut().catch(() => {});

    return (
      <article className="mx-auto max-w-md px-4 py-16 md:px-8">
        <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center">
          <AlertCircle
            size={48}
            aria-hidden="true"
            className="mx-auto mb-4 text-red-500"
          />
          <h1 className="mb-2 text-2xl font-semibold">
            No pude validar el link
          </h1>
          <p className="mb-4 text-sm text-text-muted">
            El link puede estar vencido o haber sido usado dos veces.
            Pedí uno nuevo.
          </p>
          <Link
            to="/admin/login"
            className="inline-block font-mono text-sm text-accent hover:underline"
          >
            Volver al login
          </Link>
        </div>
      </article>
    );
  }

  // ── Validando ── (default mientras se ejecuta el exchange).
  return (
    <article
      aria-busy="true"
      aria-label="Validando sesión"
      className="mx-auto max-w-md px-4 py-16 text-center md:px-8"
    >
      <Loader2
        size={32}
        aria-hidden="true"
        className="mx-auto mb-4 animate-spin text-accent"
      />
      <p className="text-sm text-text-muted">Validando tu sesión…</p>
    </article>
  );
}
