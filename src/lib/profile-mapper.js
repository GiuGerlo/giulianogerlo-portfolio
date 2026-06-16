/**
 * profile-mapper.js — traducción entre el shape de la DB (snake_case) y el
 * shape que usan los componentes React (camelCase) para la tabla `profile`.
 *
 * Mismo patrón que projects-mapper.js: un mapper bidireccional centraliza el
 * renombrado de columnas, así si mañana cambia una columna tocamos un solo
 * archivo. `dbToProfile` para leer (público + admin), `profileToDb` para
 * escribir (form admin → UPDATE).
 *
 * La tabla es single-row (id=1): no hay arrays ni timestamps de creación,
 * solo texto plano + la URL de imagen (nullable) + updated_at (lo maneja el
 * trigger en Postgres).
 */

/**
 * Convierte la fila DB (snake_case) a objeto Profile (camelCase).
 *
 * @param {object} row - Fila de `supabase.from('profile')`.
 * @returns {object} Objeto Profile en camelCase.
 */
export function dbToProfile(row) {
  return {
    id: row.id,
    aboutImage: row.about_image,    // URL Storage o null
    aboutP1: row.about_p1,
    aboutP2: row.about_p2,
    chipAvailable: row.chip_available,
    chipLocation: row.chip_location,
    chipLanguage: row.chip_language,
    chipEducation: row.chip_education,
    updatedAt: row.updated_at,
  };
}

/**
 * Convierte un objeto Profile (camelCase, del form admin) al shape DB para
 * el UPDATE. Omite `id` y `updatedAt` — los gestiona Postgres (id fijo en 1,
 * updated_at por trigger).
 *
 * @param {object} profile - Objeto Profile camelCase del form admin.
 * @returns {object} Payload listo para `.update()`.
 */
export function profileToDb(profile) {
  return {
    about_image: profile.aboutImage ?? null,
    about_p1: profile.aboutP1 ?? '',
    about_p2: profile.aboutP2 ?? '',
    chip_available: profile.chipAvailable ?? '',
    chip_location: profile.chipLocation ?? '',
    chip_language: profile.chipLanguage ?? '',
    chip_education: profile.chipEducation ?? '',
  };
}
