// Hook que trae los datos de GitHub desde el proxy serverless /api/github.
import { useState, useEffect } from 'react';

// `import.meta.env.DEV` es true en `pnpm dev` Y en `vercel dev` (ambos usan
// Vite en modo dev). NO lo usamos para saltear el fetch — la función
// /api/github SÍ corre bajo `vercel dev`. Solo lo exponemos para que, si el
// fetch falla en local (plain `pnpm dev`, que no sirve /api/*), la sección
// muestre un aviso explicativo en vez de esconderse en silencio.
const IS_LOCAL_DEV = import.meta.env.DEV;

/**
 * useGitHub — { data, loading, error, isLocalDev }
 *  data: { repos, contributions, totalContributions } | null
 */
export function useGitHub() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/github');
        if (!res.ok) throw new Error(`/api/github respondió ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setData(json);
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
  }, []);

  return { data, loading, error, isLocalDev: IS_LOCAL_DEV };
}
