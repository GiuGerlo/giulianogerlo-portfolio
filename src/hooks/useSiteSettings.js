// Hook público de la fila singleton site_settings (Hero/Footer/CV/redes).
import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';
import { dbToSiteSettings } from '../lib/site-settings-mapper.js';

/**
 * useSiteSettings — trae la fila única id=1 de `site_settings`. Mismo patrón
 * que useProfile (singleton con `.eq('id',1).single()`). Devuelve
 * `{ data, loading, error }`; el consumidor degrada elegante a su FALLBACK
 * hardcodeado si data null / error.
 */
export function useSiteSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: row, error: err } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (cancelled) return;

      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      setData(dbToSiteSettings(row));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
