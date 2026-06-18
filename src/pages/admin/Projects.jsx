import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { supabase } from '../../lib/supabase.js';
import { useAdminProjects } from '../../hooks/useAdminProjects.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import SortableProjectsList from '../../components/admin/SortableProjectsList.jsx';

/**
 * Projects — gestión de proyectos del admin (/admin/proyectos).
 *
 * (Antes vivía en /admin; con el dashboard home, los proyectos pasaron a su
 * propia ruta. La lógica es la misma.)
 *
 * Features:
 *  - Lista TODOS los proyectos (drafts + publicados), ordenados por `order_index`.
 *  - Toggle published/draft inline (optimistic update + UPDATE Supabase).
 *  - Drag-and-drop para reordenar (optimistic + batch UPDATE del `order_index`).
 *  - Botón "Nuevo proyecto" → /admin/projects/new.
 *  - "Editar" por proyecto → /admin/projects/:id.
 *
 * Sobre optimistic updates:
 *  - El usuario espera que la UI reaccione INSTANTÁNEAMENTE al toggle o al drag.
 *    Patrón: mutamos `data` local de inmediato, disparamos el UPDATE en
 *    paralelo, y si falla hacemos `refetch()` para volver al estado server.
 */
export default function Projects() {
  useDocumentTitle('Proyectos — Admin');

  const { data, loading, error, refetch, setData } = useAdminProjects();

  // ID del proyecto cuyo toggle está en curso. Si no hay ninguno, null.
  const [togglingId, setTogglingId] = useState(null);

  // ── Toggle published/draft ───────────────────────────────────────────
  async function handleToggle(project) {
    setTogglingId(project.id);

    const newValue = !project.published;

    // 1) Optimistic: actualiza la lista local sin esperar al server.
    setData((current) =>
      current.map((p) =>
        p.id === project.id ? { ...p, published: newValue } : p,
      ),
    );

    // 2) Persist.
    const { error: err } = await supabase
      .from('projects')
      .update({ published: newValue })
      .eq('id', project.id);

    setTogglingId(null);

    if (err) {
      console.error('[Projects] Toggle published falló:', err);
      await refetch();
      window.alert(
        'No pude guardar el cambio de estado. Tu lista se restauró al estado del servidor.',
      );
    }
  }

  // ── Reorder con drag-and-drop ────────────────────────────────────────
  async function handleReorder(reorderedItems) {
    // 1) Asignamos order_index nuevo por posición.
    const withNewIndexes = reorderedItems.map((p, i) => ({
      ...p,
      orderIndex: i,
    }));

    // 2) Optimistic update local.
    setData(withNewIndexes);

    // 3) Persistimos SOLO las filas cuyo order_index cambió.
    const updates = withNewIndexes.filter((p) => {
      const original = data.find((d) => d.id === p.id);
      return original && original.orderIndex !== p.orderIndex;
    });

    // 4) Ejecutamos los UPDATEs en paralelo.
    const results = await Promise.allSettled(
      updates.map((p) =>
        supabase
          .from('projects')
          .update({ order_index: p.orderIndex })
          .eq('id', p.id),
      ),
    );

    // Si alguno falló, resincronizamos con la DB.
    const failed = results.find(
      (r) => r.status === 'rejected' || r.value?.error,
    );
    if (failed) {
      console.error('[Projects] Reorder falló parcialmente:', failed);
      await refetch();
      window.alert(
        'No pude guardar el nuevo orden. Tu lista se restauró al estado del servidor.',
      );
    }
  }

  // ── Renders por estado ───────────────────────────────────────────────
  return (
    <article className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <SectionHeading
          eyebrow="// admin · proyectos"
          title="Proyectos"
          subtitle="Arrastrá para reordenar. El ojo cambia entre visible y oculto."
        />

        <Link
          to="/admin/projects/new"
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Nuevo proyecto</span>
        </Link>
      </div>

      {loading && (
        <div
          aria-busy="true"
          aria-label="Cargando proyectos"
          className="rounded-xl border border-border bg-bg-elevated p-6 text-center text-sm text-text-muted"
        >
          Cargando proyectos…
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-border bg-bg-elevated p-6 text-center"
        >
          <p className="mb-2 font-medium text-text-primary">
            No pude cargar los proyectos.
          </p>
          <p className="text-sm text-text-muted">
            Recargá la página o probá más tarde.
          </p>
        </div>
      )}

      {!loading && !error && data && data.length === 0 && (
        <div className="rounded-xl border border-border bg-bg-elevated p-6 text-center text-text-muted">
          <p className="mb-2">Todavía no hay proyectos.</p>
          <Link
            to="/admin/projects/new"
            className="font-mono text-sm text-accent hover:underline"
          >
            Crear el primero →
          </Link>
        </div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <SortableProjectsList
          items={data}
          onReorder={handleReorder}
          onToggle={handleToggle}
          isToggling={togglingId}
        />
      )}
    </article>
  );
}
