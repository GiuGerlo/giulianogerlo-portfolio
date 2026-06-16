import { Outlet, Link, NavLink } from 'react-router-dom';
import { LogOut, Home as HomeIcon } from 'lucide-react';

import { cn } from '../../lib/cn.js';

import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * AdminLayout — barra superior común para todas las páginas del panel
 * admin (Dashboard, ProjectForm, etc.).
 *
 * Renderiza una topbar fija con:
 *  - Link al sitio público (Home).
 *  - Email del usuario logueado.
 *  - Botón "Cerrar sesión".
 *
 * Y debajo, un <Outlet /> donde React Router inyecta la ruta hija.
 *
 * Se usa como layout route anidada DENTRO de <AdminRoute />:
 *
 *   <Route element={<AdminRoute />}>
 *     <Route element={<AdminLayout />}>
 *       <Route path="/admin" element={<Dashboard />} />
 *     </Route>
 *   </Route>
 *
 * El logout no necesita navegar a mano: useAuth detecta el SIGNED_OUT y
 * AdminRoute (que está más arriba) redirige a /admin/login solo.
 */
// Links de la nav del panel. `end` solo en /admin (sino prefija las hijas).
// Se va completando a medida que se suman secciones editables (Phase 13 cont.).
const NAV_ITEMS = [
  { to: '/admin', label: 'Proyectos', end: true },
  { to: '/admin/perfil', label: 'Perfil' },
  { to: '/admin/sitio', label: 'Sitio' },
  { to: '/admin/skills', label: 'Skills' },
];

export default function AdminLayout() {
  const { session } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Topbar — sticky para que esté siempre visible durante el scroll.
          backdrop-blur + bg semi-transparente le da look "elevated". */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg-elevated/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          {/* Brand + link al sitio público. */}
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-sm text-text-muted transition-colors hover:text-accent"
          >
            <HomeIcon size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Volver al sitio</span>
          </Link>

          {/* Nav interna del panel: links a cada sección editable. NavLink
              agrega `isActive` solo → resaltamos la sección actual en accent.
              `end` en Proyectos (/admin) evita que matchee las rutas hijas.
              flex-wrap porque son varios links (entran en 1-2 filas). */}
          <nav className="flex flex-wrap items-center gap-1 font-mono text-xs">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-muted hover:text-accent',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User info + logout. El email se trunca en pantallas chicas. */}
          <div className="flex items-center gap-3">
            <span
              className="hidden max-w-[180px] truncate font-mono text-xs text-text-muted md:inline"
              title={session?.user?.email ?? ''}
            >
              {session?.user?.email ?? ''}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
              aria-label="Cerrar sesión"
            >
              <LogOut size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
