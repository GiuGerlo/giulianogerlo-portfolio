import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';

/**
 * useProjectSuggestions — fetch liviano de valores ya usados para
 * autocompletar campos en ProjectForm (Categoría, Stack).
 *
 * Por qué un hook aparte de useAdminProjects:
 *  - `useAdminProjects` trae TODAS las columnas de cada proyecto (pesado).
 *  - Acá solo necesitamos `category` y `stack`. Una query slim alcanza.
 *  - Se monta en paralelo al fetch del proyecto en edit mode; el form
 *    no espera por las sugerencias (si todavía no llegan, los datalists
 *    aparecen vacíos y listo — degradación elegante).
 *
 * Devuelve: { categories, techs }
 *  - categories: string[] de categorías únicas (ordenadas alfabéticamente).
 *  - techs: string[] de tecnologías únicas (todos los stacks aplanados).
 *
 * Reactividad: NO se refetchea automáticamente cuando se crea/edita un
 * proyecto. Las sugerencias quedan "frescas hasta el próximo F5". Es
 * aceptable para UX de autocomplete; no es data crítica.
 */
export function useProjectSuggestions() {
  const [data, setData] = useState({ categories: [], techs: [] });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: rows, error } = await supabase
        .from('projects')
        .select('category, stack');

      if (cancelled || error || !rows) return;

      // Categorías: dedup + sort ascendente.
      const categorySet = new Set();
      // Techs: aplanamos todos los stacks en un solo set.
      const techSet = new Set();

      for (const row of rows) {
        if (row.category) categorySet.add(row.category);
        if (Array.isArray(row.stack)) {
          for (const tech of row.stack) techSet.add(tech);
        }
      }

      setData({
        categories: [...categorySet].sort((a, b) => a.localeCompare(b)),
        techs: [...techSet].sort((a, b) => a.localeCompare(b)),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
