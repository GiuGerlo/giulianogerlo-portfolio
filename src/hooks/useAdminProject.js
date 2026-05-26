import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';
import { dbToProject } from '../lib/projects-mapper.js';

/**
 * useAdminProject — hook para fetch de UN proyecto por id (admin mode).
 *
 * Diferencias con `useProject` (público):
 *  - Busca por `id` (uuid), no por slug — el form admin recibe el id
 *    del URL `/admin/projects/:id`.
 *  - NO filtra por `published = true` — admin necesita editar drafts.
 *  - Acepta `id` undefined (modo "crear nuevo"): devuelve estado
 *    "nada que cargar" sin disparar fetch.
 *
 * Devuelve: { data, loading, error }
 *  - id undefined → { null, false, null } (create mode, todo listo).
 *  - id válido, fetch en curso → { null, true, null }.
 *  - id válido, fetch ok → { project, false, null }.
 *  - id válido, no encontrado → { null, false, null }.
 *  - id válido, error de red → { null, false, error }.
 *
 * Sobre el "stale check" en render:
 *  - React 19 prohibe setState sincrónico en effect. Si el usuario
 *    navega entre /admin/projects/abc y /admin/projects/xyz, el effect
 *    nuevo todavía no terminó cuando el componente ya re-renderizó con
 *    el id nuevo. DERIVAMOS loading=true comparando state.id contra el
 *    id de la URL, en lugar de setearlo dentro del effect.
 *
 * @param {string|undefined} id - UUID del proyecto.
 */
export function useAdminProject(id) {
  // Estado guarda también el `id` para detectar staleness sin setState
  // adicional en el effect.
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    id: null,
  });

  useEffect(() => {
    // Sin id (create mode) → no hay nada que fetchear. No tocamos
    // state — todos los setState están dentro del callback async abajo.
    if (!id) return;

    let cancelled = false;

    (async () => {
      const { data: row, error: err } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (cancelled) return;

      if (err) {
        setState({ data: null, loading: false, error: err, id });
        return;
      }

      setState({
        data: row ? dbToProject(row) : null,
        loading: false,
        error: null,
        id,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Create mode: short-circuit con todo en "nada cargado".
  if (!id) {
    return { data: null, loading: false, error: null };
  }

  // Edit mode: si el id de la URL cambió y el effect aún no terminó,
  // reportamos loading=true para que el form no muestre data vieja.
  const isStale = state.id !== id;
  return {
    data: isStale ? null : state.data,
    loading: isStale ? true : state.loading,
    error: isStale ? null : state.error,
  };
}
