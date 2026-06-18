// api/github.js — Vercel Serverless Function (proxy de la API de GitHub).
//
// GET /api/github → { repos, contributions, totalContributions }
//
// Por qué un proxy y no fetch directo desde el browser:
//   - Permite usar un GITHUB_TOKEN (secreto, 5000 req/h) sin exponerlo al
//     cliente. Sin token funciona igual (API unauth, 60 req/h por IP).
//   - El CDN de Vercel cachea la respuesta (Cache-Control abajo) → no se pega
//     a GitHub en cada visita.
//   - Unifica dos fuentes (repos + contribuciones) en un solo endpoint.
//
// Corre en Node (usa process.env y el fetch global de Node 18+).

const GITHUB_USER = 'GiuGerlo';

// Cuántos repos destacados devolvemos.
const FEATURED_COUNT = 6;

/**
 * mapRepo — pasa una fila cruda de la API de GitHub al shape mínimo que la UI
 * necesita (camelCase, solo lo que se renderiza).
 */
export function mapRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    topics: repo.topics ?? [],
    pushedAt: repo.pushed_at,
  };
}

/**
 * pickFeatured — de TODOS los repos públicos elige los "destacados":
 * descarta forks/archived, ordena por estrellas (desc) y, a igualdad, por
 * último push (desc), y corta a FEATURED_COUNT.
 */
export function pickFeatured(repos) {
  return repos
    .filter((r) => !r.fork && !r.archived && !r.private)
    .sort((a, b) => {
      const stars = (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0);
      if (stars !== 0) return stars;
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    })
    .slice(0, FEATURED_COUNT)
    .map(mapRepo);
}

/**
 * fetchRepos — trae los repos públicos. Fail-soft: si falla, devuelve [].
 * GitHub EXIGE User-Agent; sin él responde 403.
 */
async function fetchRepos(signal) {
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'giulianogerlo-portfolio',
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
      { headers, signal },
    );
    if (!res.ok) throw new Error(`GitHub repos respondió ${res.status}`);
    const data = await res.json();
    return pickFeatured(data);
  } catch (err) {
    console.error('[github] fetchRepos falló:', err);
    return [];
  }
}

/**
 * fetchContributions — trae el calendario de contribuciones del último año
 * desde la API pública de jogruber (no necesita token). Fail-soft: si falla,
 * devuelve { contributions: [], total: 0 }.
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
    // `total` puede venir como objeto { lastYear: N } o por año; si no, sumamos.
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

  // Corta toda la operación a los 10s para no colgar la función.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const [repos, contrib] = await Promise.all([
      fetchRepos(controller.signal),
      fetchContributions(controller.signal),
    ]);

    // El CDN de Vercel cachea 1h y sirve "stale" mientras revalida en background
    // → cero impacto de rate limit aunque haya muchas visitas.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );

    return res.status(200).json({
      repos,
      contributions: contrib.contributions,
      totalContributions: contrib.total,
    });
  } catch (err) {
    console.error('[github] handler falló:', err);
    // Fail-soft total: 200 con data vacía → la sección se esconde sola.
    return res
      .status(200)
      .json({ repos: [], contributions: [], totalContributions: 0 });
  } finally {
    clearTimeout(timeout);
  }
}
