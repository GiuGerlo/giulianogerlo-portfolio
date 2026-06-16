// Hook admin genérico de CRUD + reorder para las tablas-lista de contenido
// (skill_groups, ai_skills, experience, education). Evita 4 hooks casi
// idénticos. Estrategia: refetch después de cada mutación → estado siempre
// consistente con la DB (las listas son cortas, el refetch es barato).
import { useState, useEffect, useCallback } from 'react';

import { supabase } from '../lib/supabase.js';

/**
 * useAdminList — fetch + helpers de mutación para una tabla-lista.
 *
 * @param {string} table - tabla Supabase.
 * @param {{dbTo:(row)=>object, toDb:(obj)=>object}} mapper
 * @returns {{
 *   data: object[]|null, loading: boolean, error: object|null, busy: boolean,
 *   reload: ()=>Promise<void>,
 *   create: (values)=>Promise<{error:any}>,
 *   update: (id, values)=>Promise<{error:any}>,
 *   remove: (id)=>Promise<{error:any}>,
 *   move: (id, dir)=>Promise<{error:any}>,
 * }}
 */
export function useAdminList(table, { dbTo, toDb }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false); // hay una mutación en curso

  // fetch ordenado por order_index. useCallback para reusarlo como `reload`.
  const reload = useCallback(async () => {
    const { data: rows, error: err } = await supabase
      .from(table)
      .select('*')
      .order('order_index', { ascending: true });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    setData(rows.map(dbTo));
    setError(null);
    setLoading(false);
  }, [table, dbTo]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await reload();
      if (cancelled) return; // (reload ya setea estado; flag por consistencia)
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // create: order_index = max + 1 → el nuevo va al final.
  const create = useCallback(
    async (values) => {
      setBusy(true);
      const maxIdx = (data ?? []).reduce((m, r) => Math.max(m, r.orderIndex), -1);
      const payload = { ...toDb(values), order_index: maxIdx + 1 };
      const { error: err } = await supabase.from(table).insert(payload);
      if (!err) await reload();
      setBusy(false);
      return { error: err };
    },
    [table, toDb, data, reload],
  );

  const update = useCallback(
    async (id, values) => {
      setBusy(true);
      const { error: err } = await supabase
        .from(table)
        .update(toDb(values))
        .eq('id', id);
      if (!err) await reload();
      setBusy(false);
      return { error: err };
    },
    [table, toDb, reload],
  );

  const remove = useCallback(
    async (id) => {
      setBusy(true);
      const { error: err } = await supabase.from(table).delete().eq('id', id);
      if (!err) await reload();
      setBusy(false);
      return { error: err };
    },
    [table, reload],
  );

  // move: intercambia order_index con el vecino (dir -1 = subir, +1 = bajar).
  const move = useCallback(
    async (id, dir) => {
      const list = data ?? [];
      const i = list.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i === -1 || j < 0 || j >= list.length) return { error: null }; // borde
      setBusy(true);
      const a = list[i];
      const b = list[j];
      // Dos updates: swap de order_index. Si el primero falla, no seguimos.
      const r1 = await supabase.from(table).update({ order_index: b.orderIndex }).eq('id', a.id);
      const r2 = r1.error
        ? r1
        : await supabase.from(table).update({ order_index: a.orderIndex }).eq('id', b.id);
      if (!r2.error) await reload();
      setBusy(false);
      return { error: r2.error };
    },
    [table, data, reload],
  );

  return { data, loading, error, busy, reload, create, update, remove, move };
}
