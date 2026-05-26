// useState + useEffect: estados de carga/error/data + efecto para fetch al montar.
import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';
import { dbToProject } from '../lib/projects-mapper.js';

/**
 * useProjects — hook que trae los proyectos PUBLICADOS desde Supabase,
 * ya ordenados por `order_index` y convertidos a camelCase (shape Project).
 *
 * Por qué existe:
 *  - Antes el componente `Projects` importaba el array `projects` directo
 *    del bundle (`src/data/projects.js`), o sea: cambios = redeploy.
 *  - Phase 12 desacopla el contenido: ahora el sitio lee runtime desde
 *    DB; el admin (futuro) lo edita sin tocar código.
 *
 * Shape de retorno: { data, loading, error }
 *  - data: array de Project (camelCase) o `null` mientras carga.
 *  - loading: true hasta que termina el primer fetch.
 *  - error: el error de Supabase (objeto) si algo falló, sino null.
 *
 * Patrón típico de "fetch on mount" en React 19:
 *  - useEffect con dependency [] (corre 1 vez al montar el componente).
 *  - Flag `cancelled` para no setear estado si el componente se desmonta
 *    antes de que llegue la respuesta (evita warning "set state on
 *    unmounted component" y leaks).
 *  - El effect lanza una async IIFE porque useEffect no acepta async
 *    callbacks directamente (devolverían una Promise, no la función
 *    cleanup que React espera).
 *
 * RLS:
 *  - La policy `public read published` (migration 0001) filtra a
 *    `published = true` para el rol `anon`. El filtro `.eq('published',
 *    true)` acá es redundante pero explícito — actúa como documentación
 *    y como red de seguridad si algún día se invoca el hook con sesión
 *    `authenticated` (que vería los drafts).
 */
export function useProjects() {
  // `data` arranca en null para distinguir "todavía no cargó" de "cargó
  // un array vacío". loading arranca en true.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Bandera local al efecto para abortar setState si el componente
    // se desmonta antes de que el fetch termine.
    let cancelled = false;

    (async () => {
      // .select('*') trae todas las columnas. .eq filtra. .order ordena
      // server-side (más eficiente que sort client). ascending: true =
      // 0, 1, 2... (orden curado por el admin).
      const { data: rows, error: err } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('order_index', { ascending: true });

      if (cancelled) return;

      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      // Mapeo snake_case → camelCase para que los componentes consuman
      // el mismo shape que tenían cuando la data vivía en projects.js.
      setData(rows.map(dbToProject));
      setLoading(false);
    })();

    // Cleanup: corre cuando el componente se desmonta o cuando React
    // re-corre el effect (no aplica acá porque deps = []).
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
