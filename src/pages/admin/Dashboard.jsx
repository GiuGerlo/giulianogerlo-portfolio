import { LogOut } from 'lucide-react';

import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import Button from '../../components/ui/Button.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';

/**
 * Dashboard — landing del panel admin (/admin).
 *
 * STUB de Task 12.6: confirma que el wrapper AdminRoute + auth funciona.
 * En Task 12.7 se reemplaza por la lista real de proyectos con drag-drop
 * reorder y toggle published/draft.
 *
 * Botón "Cerrar sesión" llama supabase.auth.signOut(). useAuth detecta
 * el SIGNED_OUT y AdminRoute redirige a /admin/login automáticamente.
 */
export default function Dashboard() {
  useDocumentTitle('Panel admin — Giuliano Gerlo');

  const { session } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    // No hace falta navigate manual: useAuth dispara el cambio de sesión
    // y AdminRoute redirige a /admin/login solo.
  }

  return (
    <article className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        eyebrow="// admin"
        title="Panel"
        subtitle={`Logueado como ${session?.user?.email ?? '...'}.`}
      />

      <div className="rounded-xl border border-border bg-bg-elevated p-6">
        <p className="mb-4 text-sm text-text-muted">
          Acá va a vivir el listado de proyectos con drag-and-drop,
          toggle de publicado y CRUD. Por ahora es solo el stub para
          confirmar que el login admin funciona.
        </p>

        <Button variant="secondary" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          Cerrar sesión
        </Button>
      </div>
    </article>
  );
}
