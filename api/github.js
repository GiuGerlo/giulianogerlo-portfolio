// api/github.js — Vercel Serverless Function (proxy de contribuciones GitHub).
//
// GET /api/github → { contributions, totalContributions }
//
// Por qué un proxy y no fetch directo desde el browser:
//   - El CDN de Vercel cachea la respuesta (Cache-Control abajo) → no se pega
//     a la API externa en cada visita.
//   - Centraliza el origen de datos (si mañana cambia la fuente, se toca acá).
//
// Fuente: API pública de jogruber, que lee el calendario de contribuciones
// PÚBLICO de GitHub. Para que incluya las contribuciones privadas (y el total
// coincida con el del perfil), hay que activar en GitHub:
//   Settings → Profile → "Include private contributions on my profile".
// No usa token.
//
// Corre en Node (usa el fetch global de Node 18+).

const GITHUB_USER = 'GiuGerlo';

/**
 * fetchContributions — calendario de contribuciones del último año.
 * Fail-soft: si falla, devuelve { contributions: [], total: 0 }.
 */
async function fetchContributions(signal) {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
      { signal },
    );
    if (!res.ok) throw new Error(`Contribuciones respondió ${res.status}`);
    const data = await res.json();
    const contributions = data.contributions ?? [];
    // `total` puede venir como { lastYear: N } o por año; si no, sumamos.
    const total =
      data.total?.lastYear ??
      contributions.reduce((acc, d) => acc + (d.count ?? 0), 0);
    return { contributions, total };
  } catch (err) {
    console.error('[github] fetchContributions falló:', err);
    return { contributions: [], total: 0 };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  // Corta la operación a los 10s para no colgar la función.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const { contributions, total } = await fetchContributions(controller.signal);

    // El CDN de Vercel cachea 1h y sirve "stale" mientras revalida → sin
    // impacto aunque haya muchas visitas.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );

    return res.status(200).json({ contributions, totalContributions: total });
  } catch (err) {
    console.error('[github] handler falló:', err);
    // Fail-soft total: 200 con data vacía → la sección se esconde sola.
    return res.status(200).json({ contributions: [], totalContributions: 0 });
  } finally {
    clearTimeout(timeout);
  }
}
