// Hook genérico de lectura pública de una tabla-lista de contenido.
import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';

/**
 * usePublicList — trae TODAS las filas de una tabla ordenadas por
 * `order_index`, mapeadas a camelCase. Base compartida de los hooks públicos
 * de skill_groups / ai_skills / experience / education (espejo de useProjects
 * pero sin filtro `published`).
 *
 * @param {string} table - nombre de la tabla Supabase.
 * @param {(row:object)=>object} mapper - dbToX del mapper correspondiente.
 * @returns {{data: object[]|null, loading: boolean, error: object|null}}
 */
export function usePublicList(table, mapper) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: rows, error: err } = await supabase
        .from(table)
        .select('*')
        .order('order_index', { ascending: true });

      if (cancelled) return;

      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      setData(rows.map(mapper));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [table, mapper]);

  return { data, loading, error };
}
