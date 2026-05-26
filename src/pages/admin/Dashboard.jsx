import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { supabase } from '../../lib/supabase.js';
import { useAdminProjects } from '../../hooks/useAdminProjects.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import SortableProjectsList from '../../components/admin/SortableProjectsList.jsx';

/**
 * Dashboard — landing del panel admin (/admin).
 *
 * Features:
 *  - Lista TODOS los proyectos (drafts + publicados), ordenados por
 *    `order_index`.
 *  - Toggle published/draft inline (optimistic update + UPDATE Supabase).
 *  - Drag-and-drop para reordenar (optimistic + batch UPDATE del
 *    `order_index` de cada item afectado).
 *  - Botón "Nuevo proyecto" → /admin/projects/new (Task 12.8).
 *  - "Editar" por proyecto → /admin/projects/:id (Task 12.8).
 *
 * Sobre optimistic updates:
 *  - El usuario espera que la UI reaccione INSTANTÁNEAMENTE al toggle
 *    o al drag — esperar al server feels lento. Patrón:
 *      1. Mutamos `data` local de inmediato (setData del hook).
 *      2. Disparamos el UPDATE a Supabase en paralelo.
 *      3. Si falla, hacemos `refetch()` para volver al estado server.
 *  - Riesgo: si dos pestañas mutan a la vez, una sobreescribe a la otra.
 *    Para v1 con un solo admin es aceptable; si pasa a multi-admin, se
 *    suma optimistic locking (`updated_at` check).
 *
 * Sobre el batch update del reorder:
 *  - Después de un drag, recalculamos `order_index` por POSICIÓN
 *    (0,1,2,3...). Mandamos un UPDATE por cada fila que cambió.
 *  - Supabase JS no soporta transacciones desde el browser. Si una
 *    falla, refetch() resincroniza desde la DB.
 */
export default function Dashboard() {
  useDocumentTitle('Panel admin — Giuliano Gerlo');

  const { data, loading, error, refetch, setData } = useAdminProjects();

  // ID del proyecto cuyo toggle está en curso. Si no hay ninguno, null.
  // Sirve para deshabilitar SOLO ese botón mientras se persiste.
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
      console.error('[Dashboard] Toggle published falló:', err);
      // Volvé al estado server. refetch sobreescribe el optimistic update.
      await refetch();
      // Avisamos al usuario sin libs de toast (todavía no tenemos).
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

    // 3) Persistimos SOLO las filas cuyo order_index cambió respecto a
    //    su valor original (microoptimización: si moviste el item 3
    //    una posición, no hace falta actualizar los items 0/1).
    //    Comparamos con `data` (estado server pre-reorder).
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
      console.error('[Dashboard] Reorder falló parcialmente:', failed);
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
          eyebrow="// admin"
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
