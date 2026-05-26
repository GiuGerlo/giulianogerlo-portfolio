/**
 * slugify.js — convierte un título a un slug url-friendly.
 *
 * Reglas:
 *  - Pasa todo a minúsculas.
 *  - Saca acentos y diacríticos (á→a, ñ→n, ü→u).
 *  - Reemplaza espacios y separadores por guiones medios.
 *  - Borra caracteres que no sean letras/números/guiones.
 *  - Colapsa guiones múltiples y trim los de los bordes.
 *
 * Ejemplos:
 *  - "Personal Gym Tracker"        → "personal-gym-tracker"
 *  - "Next — Tienda de Ropa"       → "next-tienda-de-ropa"
 *  - "Inmobiliaria NZ — Año 2025"  → "inmobiliaria-nz-ano-2025"
 *
 * NO usa una lib porque el caso es chico y no queremos sumar deps.
 */
export function slugify(input) {
  if (!input) return '';
  return input
    .normalize('NFD') // separa caracteres base de sus diacríticos.
    .replace(/[̀-ͯ]/g, '') // saca los diacríticos.
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '') // solo letras, números, espacios, _ y -.
    .replace(/[\s_-]+/g, '-') // colapsa cualquier separador en un único guión.
    .replace(/^-+|-+$/g, ''); // trim de guiones bordes.
}
