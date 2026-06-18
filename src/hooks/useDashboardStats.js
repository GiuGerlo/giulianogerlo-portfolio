// Hook de conteos para el dashboard del admin. Usa `head: true` + `count:
// 'exact'` → Supabase devuelve solo el número de filas, sin bajar data.
import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase.js';

// Helper: cuenta filas de una tabla (con un builder opcional para filtrar).
async function countOf(table, build) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (build) query = build(query);
  const { count, error } = await query;
  if (error) {
    console.error(`[useDashboardStats] count ${table} falló:`, error);
    return 0;
  }
  return count ?? 0;
}

/**
 * useDashboardStats — { stats, loading }
 *  stats: { projectsPublished, projectsTotal, experience, skillGroups,
 *           aiSkills, education, chatsTotal, chats7d }
 *
 * Todos los counts viajan en paralelo (Promise.all). Si alguno falla, ese
 * contador queda en 0 (no rompe el dashboard).
 */
export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Fecha de hace 7 días en ISO, para los chats recientes.
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const [
        projectsPublished,
        projectsTotal,
        experience,
        skillGroups,
        aiSkills,
        education,
        chatsTotal,
        chats7d,
      ] = await Promise.all([
        countOf('projects', (q) => q.eq('published', true)),
        countOf('projects'),
        countOf('experience'),
        countOf('skill_groups'),
        countOf('ai_skills'),
        countOf('education'),
        countOf('chat_logs'),
        countOf('chat_logs', (q) => q.gte('created_at', sevenDaysAgo)),
      ]);

      if (cancelled) return;

      setStats({
        projectsPublished,
        projectsTotal,
        experience,
        skillGroups,
        aiSkills,
        education,
        chatsTotal,
        chats7d,
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}
