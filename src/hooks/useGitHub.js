// Hook que trae los datos de GitHub desde el proxy serverless /api/github.
import { useState, useEffect } from 'react';

// `import.meta.env.DEV` es true en `pnpm dev` y `vercel dev`. NO saltea el
// fetch (la función /api/github SÍ corre bajo `vercel dev`). Solo se expone
// para mostrar un aviso si el fetch falla en local (plain `pnpm dev`).
const IS_LOCAL_DEV = import.meta.env.DEV;

/**
 * useGitHub — trae las contribuciones. Refetchea cuando cambia `year`.
 * @param {number|null} year - año calendario, o null para "último año".
 * @returns {{ data, loading, error, isLocalDev }}
 *   data: { weeks, totalContributions, year, years } | null
 */
export function useGitHub(year = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const url = year ? `/api/github?year=${year}` : '/api/github';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`/api/github respondió ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('[useGitHub] fetch falló:', err);
        setError(err);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year]);

  return { data, loading, error, isLocalDev: IS_LOCAL_DEV };
}
