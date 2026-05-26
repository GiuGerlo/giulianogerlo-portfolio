import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { ADMIN_EMAIL } from '../../lib/admin-config.js';

/**
 * AdminRoute — wrapper para las rutas protegidas bajo /admin/*.
 *
 * Funciona como "layout route" sin layout visual: simplemente gatea el
 * acceso a sus children (renderizados por <Outlet />). Usage en App.jsx:
 *
 *   <Route element={<AdminRoute />}>
 *     <Route path="/admin" element={<Dashboard />} />
 *     <Route path="/admin/projects/:id" element={<ProjectForm />} />
 *   </Route>
 *
 * Lógica:
 *  1. Si todavía no resolvimos la sesión (loading) → spinner mínimo.
 *     Por qué importa: sin esto, en el primer render `session` es null
 *     y el Navigate dispararía un redirect a /admin/login aunque el
 *     usuario SÍ tenga sesión válida en localStorage (que getSession
 *     todavía no terminó de leer).
 *  2. Sin sesión → redirect a /admin/login (replace para no contaminar
 *     el historial).
 *  3. Sesión de otro email (no ADMIN_EMAIL) → redirect a /admin/login.
 *     Defensa en profundidad: aunque signups están deshabilitados, si
 *     alguien obtuviera una sesión válida con otro email, no entra.
 *  4. Sesión válida del admin → renderiza <Outlet /> (las rutas hijas).
 */
export default function AdminRoute() {
  const { session, loading } = useAuth();

  // Estado loading: spinner muy minimal.
  // Por qué un spinner y no skeleton: este wrapper es invisible cuando
  // todo va bien; solo aparece la fracción de segundo que tarda
  // getSession() en resolver desde localStorage. Un skeleton acá sería
  // demasiado pomposo.
  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Verificando sesión"
        className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted"
      >
        Verificando sesión…
      </div>
    );
  }

  // Sin sesión o email no autorizado → fuera.
  // `replace` evita que /admin quede en el back stack del browser.
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/admin/login" replace />;
  }

  // Auth OK → renderiza las rutas anidadas.
  return <Outlet />;
}
