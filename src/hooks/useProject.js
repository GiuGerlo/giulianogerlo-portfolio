// useState + useEffect: estados de carga/error/data + efecto para fetch.
import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';
import { dbToProject } from '../lib/projects-mapper.js';

/**
 * useProject — hook que trae UN proyecto publicado por slug.
 *
 * Casos a cubrir:
 *  - slug existe y está publicado → data = Project, loading = false.
 *  - slug no existe (404) → data = null, loading = false, error = null.
 *  - slug existe pero está draft → desde anon RLS lo filtra como si no
 *    existiera, así que cae en el caso 404 (intencional: drafts no se
 *    exponen al público bajo ninguna URL adivinada).
 *  - error de red / Supabase → error != null, data = null.
 *
 * `maybeSingle()` vs `single()`:
 *  - single() exige EXACTAMENTE una fila — 0 filas tira error PGRST116.
 *  - maybeSingle() devuelve { data: null } si no hay filas, sin tirar
 *    error. Encaja con el flujo "slug inexistente" como camino normal.
 *
 * Por qué guardamos `slug` adentro del estado:
 *  - React 19 prohibe llamar setState() dentro de useEffect — la regla
 *    `react-hooks/set-state-in-effect`. Para resetear loading/error
 *    cuando el usuario navega entre detalles (mismo componente, slug
 *    distinto), DERIVAMOS el "stale" en render: si el slug actual no
 *    matchea el slug guardado en el estado, devolvemos `loading: true`
 *    y `data: null` aunque el estado real tenga la data del slug viejo.
 *  - Cuando el effect termina, mete los nuevos valores Y el nuevo slug
 *    juntos en una sola actualización atómica.
 *
 * @param {string|undefined} slug - El slug de la URL (puede ser
 *   undefined en el primer render antes de que useParams lo lea).
 */
export function useProject(slug) {
  // Estado único en vez de 3 piezas separadas: para poder actualizar
  // data + loading + error + slug en UN solo setState atómico.
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    slug: null,
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    (async () => {
      const { data: row, error: err } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (cancelled) return;

      if (err) {
        setState({ data: null, loading: false, error: err, slug });
        return;
      }

      // row puede ser null (slug no encontrado) — el caller decide qué
      // hacer (en ProjectDetail eso dispara <Navigate to="/404" />).
      setState({
        data: row ? dbToProject(row) : null,
        loading: false,
        error: null,
        slug,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Stale check en render: si el slug actual no matchea el del estado
  // (porque el usuario acaba de navegar a otro detalle y el effect
  // todavía no terminó), reportamos loading=true para que el componente
  // muestre el skeleton en vez del contenido del proyecto anterior.
  const isStale = state.slug !== slug;
  return {
    data: isStale ? null : state.data,
    loading: isStale ? true : state.loading,
    error: isStale ? null : state.error,
  };
}
