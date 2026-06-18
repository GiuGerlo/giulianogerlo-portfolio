// api/github.js — Vercel Serverless Function (proxy de contribuciones GitHub).
//
// GET /api/github            → contribuciones del ÚLTIMO AÑO (rolling).
// GET /api/github?year=2025  → contribuciones del AÑO CALENDARIO 2025.
//
// Respuesta: { weeks, totalContributions, year, years }
//   - weeks: [[{date,count,level,weekday}, …], …]  (columnas tipo GitHub)
//   - year:  el año pedido, o null si es "último año"
//   - years: años con actividad (para el selector de años)
//
// Dos fuentes:
//   1. GraphQL autenticado (GITHUB_TOKEN): incluye contribuciones PRIVADAS →
//      total coincide con el perfil. Único modo de contar lo privado.
//   2. Fallback público (jogruber, sin token): solo lo público. Sin years.
//
// Cacheado por el CDN de Vercel (Cache-Control abajo, varía por query). Node.

const GITHUB_USER = 'GiuGerlo';

// Enum de nivel de GitHub GraphQL → nuestro 0-4.
const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/**
 * calendarToWeeks — el contributionCalendar de GraphQL ya viene agrupado en
 * weeks; mapeamos cada día al shape mínimo (+ weekday para ubicar la celda).
 * Helper puro, exportado para test.
 */
export function calendarToWeeks(calendar) {
  return (calendar?.weeks ?? []).map((w) =>
    (w.contributionDays ?? []).map((d) => ({
      date: d.date,
      count: d.contributionCount ?? 0,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
      weekday: d.weekday ?? new Date(d.date).getUTCDay(),
    })),
  );
}

/**
 * daysToWeeks — agrupa una lista plana de días (fallback jogruber) en semanas
 * que arrancan en domingo. Helper puro, exportado para test.
 */
export function daysToWeeks(days) {
  const weeks = [];
  let current = [];
  for (const d of days) {
    const weekday = new Date(d.date).getUTCDay();
    if (weekday === 0 && current.length) {
      weeks.push(current);
      current = [];
    }
    current.push({ ...d, weekday });
  }
  if (current.length) weeks.push(current);
  return weeks;
}

/**
 * yearRange — devuelve { from, to } ISO para un año calendario, o null si el
 * año no es válido (→ "último año" rolling).
 */
function yearRange(yearParam) {
  const year = Number(yearParam);
  const now = new Date().getUTCFullYear();
  if (!Number.isInteger(year) || year < 2008 || year > now) return null;
  return {
    from: `${year}-01-01T00:00:00Z`,
    to: `${year}-12-31T23:59:59Z`,
    year,
  };
}

/**
 * fetchGraphQL — calendario (rolling o por año) INCLUYENDO privados, + la lista
 * de años con actividad. Lanza si falla (el handler cae al fallback público).
 */
async function fetchGraphQL(token, range, signal) {
  // `viewer` = dueño del token (incluye privados). `allYears` (colección por
  // defecto) da SIEMPRE la lista completa de años para el selector.
  const query = `
    query($from: DateTime, $to: DateTime) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount contributionLevel weekday } }
          }
        }
        allYears: contributionsCollection { contributionYears }
      }
    }`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'giulianogerlo-portfolio',
    },
    body: JSON.stringify({
      query,
      variables: { from: range?.from ?? null, to: range?.to ?? null },
    }),
  });

  if (!res.ok) throw new Error(`GitHub GraphQL respondió ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL: ${json.errors[0].message}`);
  }

  const viewer = json.data?.viewer;
  const calendar = viewer?.contributionsCollection?.contributionCalendar;
  return {
    weeks: calendarToWeeks(calendar),
    total: calendar?.totalContributions ?? 0,
    years: viewer?.allYears?.contributionYears ?? [],
  };
}

/**
 * fetchPublic — fallback sin token (jogruber). Solo público, sin years.
 * Fail-soft: { weeks: [], total: 0, years: [] } si falla.
 */
async function fetchPublic(range, signal) {
  try {
    const y = range?.year ?? 'last';
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=${y}`,
      { signal },
    );
    if (!res.ok) throw new Error(`Contribuciones respondió ${res.status}`);
    const data = await res.json();
    const days = data.contributions ?? [];
    const total =
      data.total?.[range?.year] ??
      data.total?.lastYear ??
      days.reduce((acc, d) => acc + (d.count ?? 0), 0);
    return { weeks: daysToWeeks(days), total, years: [] };
  } catch (err) {
    console.error('[github] fetchPublic falló:', err);
    return { weeks: [], total: 0, years: [] };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const range = yearRange(req.query?.year);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const token = process.env.GITHUB_TOKEN;
    let result;

    if (token) {
      try {
        result = await fetchGraphQL(token, range, controller.signal);
        console.log('[github] vía GraphQL (con token) → total', result.total);
      } catch (err) {
        console.error('[github] GraphQL falló, uso fallback público:', err);
        result = await fetchPublic(range, controller.signal);
      }
    } else {
      console.warn('[github] SIN GITHUB_TOKEN → fallback público');
      result = await fetchPublic(range, controller.signal);
    }

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );

    return res.status(200).json({
      weeks: result.weeks,
      totalContributions: result.total,
      year: range?.year ?? null,
      years: result.years,
    });
  } catch (err) {
    console.error('[github] handler falló:', err);
    return res
      .status(200)
      .json({ weeks: [], totalContributions: 0, year: null, years: [] });
  } finally {
    clearTimeout(timeout);
  }
}
