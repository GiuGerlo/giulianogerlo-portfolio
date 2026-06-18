// api/github.js — Vercel Serverless Function (proxy de contribuciones GitHub).
//
// GET /api/github → { contributions, totalContributions }
//
// Dos fuentes:
//   1. GraphQL de GitHub autenticado (si hay GITHUB_TOKEN): el
//      contributionsCollection del DUEÑO del token incluye las contribuciones
//      PRIVADAS → el total coincide con el del perfil (ej. 717). Es la única
//      forma de contar lo privado.
//   2. Fallback público (API de jogruber, sin token): solo cuenta lo PÚBLICO
//      (número más bajo). Se usa si no hay token o si GraphQL falla.
//
// El CDN de Vercel cachea la respuesta (Cache-Control abajo). Corre en Node.

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
 * calendarToContributions — aplana el contributionCalendar de GraphQL
 * (weeks → days) a [{ date, count, level }]. Helper puro, exportado para test.
 */
export function calendarToContributions(calendar) {
  const days = [];
  for (const week of calendar?.weeks ?? []) {
    for (const d of week.contributionDays ?? []) {
      days.push({
        date: d.date,
        count: d.contributionCount ?? 0,
        level: LEVEL_MAP[d.contributionLevel] ?? 0,
      });
    }
  }
  return days;
}

/**
 * fetchContributionsGraphQL — total + calendario INCLUYENDO privados, vía la
 * API GraphQL autenticada. Lanza si falla (el handler cae al fallback público).
 */
async function fetchContributionsGraphQL(token, signal) {
  // `viewer` = el dueño del token. Es la forma confiable de incluir las
  // contribuciones PRIVADAS (querying `user(login)` a veces solo trae públicas
  // aunque seas vos). El token tiene que ser de GITHUB_USER.
  const query = `
    query {
      viewer {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount contributionLevel } }
          }
        }
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
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`GitHub GraphQL respondió ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL: ${json.errors[0].message}`);
  }

  const calendar =
    json.data?.viewer?.contributionsCollection?.contributionCalendar;
  return {
    contributions: calendarToContributions(calendar),
    total: calendar?.totalContributions ?? 0,
  };
}

/**
 * fetchContributionsPublic — fallback sin token (API de jogruber). Solo cuenta
 * contribuciones públicas. Fail-soft: si falla, { contributions: [], total: 0 }.
 */
async function fetchContributionsPublic(signal) {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
      { signal },
    );
    if (!res.ok) throw new Error(`Contribuciones respondió ${res.status}`);
    const data = await res.json();
    const contributions = data.contributions ?? [];
    const total =
      data.total?.lastYear ??
      contributions.reduce((acc, d) => acc + (d.count ?? 0), 0);
    return { contributions, total };
  } catch (err) {
    console.error('[github] fetchContributionsPublic falló:', err);
    return { contributions: [], total: 0 };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const token = process.env.GITHUB_TOKEN;
    let result;

    if (token) {
      // Con token: GraphQL (incluye privados). Si falla, caemos al público.
      try {
        result = await fetchContributionsGraphQL(token, controller.signal);
        console.log('[github] vía GraphQL (con token) → total', result.total);
      } catch (err) {
        console.error('[github] GraphQL falló, uso fallback público:', err);
        result = await fetchContributionsPublic(controller.signal);
      }
    } else {
      console.warn('[github] SIN GITHUB_TOKEN → fallback público (solo conteo público)');
      result = await fetchContributionsPublic(controller.signal);
    }

    // El CDN de Vercel cachea 1h y sirve "stale" mientras revalida.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );

    return res
      .status(200)
      .json({ contributions: result.contributions, totalContributions: result.total });
  } catch (err) {
    console.error('[github] handler falló:', err);
    return res.status(200).json({ contributions: [], totalContributions: 0 });
  } finally {
    clearTimeout(timeout);
  }
}
