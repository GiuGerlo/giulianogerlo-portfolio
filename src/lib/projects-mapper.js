/**
 * projects-mapper.js — traducción entre el shape de la DB (snake_case)
 * y el shape que usan los componentes React (camelCase).
 *
 * Por qué un mapper en vez de usar las columnas DB tal cual:
 *  - JSX y JS idiomático usan camelCase (`dateStart`, `liveUrl`). Postgres
 *    convención es snake_case (`date_start`, `live_url`). Mezclar ambos
 *    en componentes es confuso y propenso a typos.
 *  - Centralizar la traducción acá: si mañana renombramos una columna,
 *    tocamos UN solo archivo y los componentes quedan intactos.
 *  - Un solo mapper bidireccional (KISS): `dbToProject` para leer,
 *    `projectToDb` para escribir. Devolvemos todos los campos en camelCase
 *    — el sitio público ignora los que no usa, el admin los necesita.
 *
 * Sobre arrays (`stack`, `gallery`, `challenges`):
 *  - Postgres `text[]` se serializa como JS array nativo por
 *    `@supabase/supabase-js`. No hay que parsear nada — passthrough.
 */

/**
 * Convierte una fila DB (snake_case) a un objeto Project (camelCase).
 * Devuelve TODOS los campos (incluyendo id, published, orderIndex,
 * timestamps) — el consumidor decide qué usa.
 *
 * @param {object} row - Fila tal como viene de `supabase.from('projects')`.
 * @returns {object} Objeto Project en camelCase.
 */
export function dbToProject(row) {
  return {
    // Identificadores y meta
    id: row.id,
    slug: row.slug,

    // Texto descriptivo
    title: row.title,
    category: row.category,
    role: row.role,
    myRole: row.my_role,
    summary: row.summary,
    description: row.description,

    // Arrays — passthrough directo
    stack: row.stack ?? [],
    challenges: row.challenges ?? [],
    gallery: row.gallery ?? [],

    // Media y links (pueden ser null)
    image: row.image,
    liveUrl: row.live_url,
    repoUrl: row.repo_url,

    // Fechas
    dateStart: row.date_start,
    dateEnd: row.date_end,

    // Flags admin
    published: row.published,
    orderIndex: row.order_index,

    // Timestamps (solo lectura, los maneja Postgres)
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convierte un objeto Project (camelCase, del form admin) al shape de
 * la DB (snake_case) para INSERT/UPDATE.
 *
 * Omite `id`, `createdAt`, `updatedAt` — los gestiona Postgres
 * (default en INSERT, trigger en UPDATE).
 *
 * @param {object} project - Objeto Project camelCase del form admin.
 * @returns {object} Payload listo para `.insert()` o `.update()`.
 */
export function projectToDb(project) {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    role: project.role,
    my_role: project.myRole,
    summary: project.summary,
    description: project.description,
    stack: project.stack ?? [],
    challenges: project.challenges ?? [],
    gallery: project.gallery ?? [],
    image: project.image ?? null,
    live_url: project.liveUrl ?? null,
    repo_url: project.repoUrl ?? null,
    date_start: project.dateStart,
    date_end: project.dateEnd ?? null,
    published: project.published ?? false,
    order_index: project.orderIndex ?? 0,
  };
}
