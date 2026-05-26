/**
 * format-date.js — helpers para mostrar timestamps de Supabase en
 * hora argentina.
 *
 * Por qué este archivo:
 *  - La DB guarda `timestamptz` en UTC (estándar correcto). El dashboard
 *    de Supabase también muestra UTC. Pero un humano en Argentina quiere
 *    ver "26/5/2026, 17:27", no "2026-05-26 20:27:06+00".
 *  - Regla del proyecto: guardar UTC, mostrar local. Toda la UI del
 *    admin usa estos helpers; nadie formatea fechas en components.
 *
 * Sobre `Intl.DateTimeFormat`:
 *  - API nativa del browser, sin libs de fechas (zero deps).
 *  - El parámetro `timeZone: 'America/Argentina/Buenos_Aires'` le dice
 *    que convierta el instante UTC a esa zona antes de formatear.
 *  - Cacheamos los formatters como const a nivel de módulo — crearlos
 *    es caro y la config es estática.
 */

// Formato compacto para listados: "26/05/2026, 17:27"
const listFormatter = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

// Formato largo para detalles: "26 de mayo de 2026, 17:27"
const fullFormatter = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/**
 * Formato compacto. Pensado para tablas/listados donde hay poco espacio.
 *
 * @param {string|null|undefined} isoString - Timestamp ISO 8601 (el shape
 *   que devuelve Supabase). Si es null/undefined, devuelve string vacío.
 * @returns {string} Ej: "26/05/2026, 17:27" o "" si no hay fecha.
 */
export function formatDateAR(isoString) {
  if (!isoString) return '';
  // `new Date(iso)` parsea respetando el offset embebido (Z o +00).
  return listFormatter.format(new Date(isoString));
}

/**
 * Formato largo. Pensado para vistas de detalle / metadata destacada.
 *
 * @param {string|null|undefined} isoString
 * @returns {string} Ej: "26 de mayo de 2026, 17:27"
 */
export function formatDateARLong(isoString) {
  if (!isoString) return '';
  return fullFormatter.format(new Date(isoString));
}
