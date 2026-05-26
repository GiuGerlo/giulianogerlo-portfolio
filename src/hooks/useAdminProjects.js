import { useState, useEffect, useCallback } from 'react';

import { supabase } from '../lib/supabase.js';
import { dbToProject } from '../lib/projects-mapper.js';

/**
 * useAdminProjects — hook análogo a `useProjects` pero para el panel admin.
 *
 * Diferencias con useProjects (público):
 *  1. NO filtra por `published = true` — el admin necesita ver drafts.
 *  2. Expone una función `refetch()` para volver a traer la lista
 *     después de un cambio (toggle published, delete, etc.).
 *  3. Expone `setData` para que el caller pueda hacer optimistic updates
 *     (modificar el estado local sin esperar al server).
 *
 * Devuelve: { data, loading, error, refetch, setData }
 *
 * Sobre por qué duplicamos lógica de fetch en el effect inicial y en
 * refetch:
 *  - React 19 prohibe llamar setState sincrónico dentro de useEffect
 *    (regla `react-hooks/set-state-in-effect`). ESLint NO sigue calls
 *    a funciones async — si el effect llama `refetch()` y refetch
 *    eventualmente setea estado, marca error igual.
 *  - Solución: el fetch inicial vive INLINE en useEffect (todos los
 *    setState dentro del callback async, no sincrónicos en el body).
 *    refetch() es una función separada para callers externos.
 *  - Sí, hay duplicación de 6 líneas — es el precio de la regla.
 */
export function useAdminProjects() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // refetch para callers externos (Dashboard cuando falla un toggle, etc).
  // Estable entre renders gracias a useCallback con deps=[].
  // No setea loading=true: en refetches no queremos blink (la UI ya
  // muestra el estado optimistic actualizado).
  const refetch = useCallback(async () => {
    const { data: rows, error: err } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (err) {
      setError(err);
      return;
    }

    setData(rows.map(dbToProject));
    setError(null);
  }, []);

  // Fetch inicial al montar. Inline para que ESLint vea que no hay
  // setState sincrónico — todos los setStates viven dentro del callback
  // async (después del await), no en el cuerpo del effect.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: rows, error: err } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });

      if (cancelled) return;

      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      setData(rows.map(dbToProject));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, refetch, setData };
}
