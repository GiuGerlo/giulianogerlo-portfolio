// useState + useEffect: estado de carga/error/data + fetch al montar.
import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';
import { dbToProfile } from '../lib/profile-mapper.js';

/**
 * useProfile — trae la fila única del perfil (id=1) desde Supabase, ya
 * convertida a camelCase (shape Profile).
 *
 * Espejo de useProjects pero más simple: la tabla `profile` es single-row,
 * así que en vez de `.order()` + array usamos `.eq('id', 1).single()`.
 *
 * `.single()` le dice a supabase-js "espero exactamente 1 fila": devuelve el
 * objeto directo (no un array) y marca error si hay 0 o más de 1. La RLS
 * `public read profile` deja a anon leer la fila siempre (no hay concepto
 * "published" como en projects).
 *
 * Shape de retorno: { data, loading, error }
 *  - data: objeto Profile (camelCase) o null mientras carga / si falló.
 *  - loading: true hasta que termina el primer fetch.
 *  - error: el error de Supabase si algo falló, sino null.
 *
 * El consumidor (About.jsx) hace degradación elegante: si error/loading o
 * data null → muestra el contenido hardcodeado de fallback.
 */
export function useProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Bandera para abortar setState si el componente se desmonta antes de
    // que llegue la respuesta (evita leaks / warning de set state).
    let cancelled = false;

    (async () => {
      const { data: row, error: err } = await supabase
        .from('profile')
        .select('*')
        .eq('id', 1)
        .single();

      if (cancelled) return;

      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      // Mapeo snake_case → camelCase.
      setData(dbToProfile(row));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
