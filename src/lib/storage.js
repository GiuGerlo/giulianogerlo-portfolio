/**
 * storage.js — helpers para subir/borrar imágenes en Supabase Storage.
 *
 * Toda la lógica de Storage vive acá (no en los componentes) para tener
 * UNA sola fuente de verdad sobre: nombre del bucket, validaciones
 * (mime + tamaño), convención de nombres de archivo y parseo de URLs
 * públicas. Los componentes solo llaman `uploadImage` / `removeImage`.
 *
 * Bucket: `project-images` (público de lectura, escritura autenticada).
 * Las policies de RLS sobre `storage.objects` (migrations 0001/0002) ya
 * gatean que solo el admin logueado pueda subir/borrar.
 */

import { supabase } from './supabase.js';

// Nombre del bucket creado en la migration 0001. Constante única: si
// algún día cambia, se toca solo acá.
export const BUCKET = 'project-images';

// Tamaño máximo por imagen: 2 MB. react-dropzone espera bytes.
export const MAX_SIZE_BYTES = 2 * 1024 * 1024;

// Mime types aceptados, en el formato que react-dropzone pide para su
// prop `accept`: { 'mime/type': ['.ext', ...] }. Sirve doble:
//  - react-dropzone lo usa para filtrar el file picker del SO.
//  - Lo reusamos para validar manualmente en `uploadImage` (defensa
//    extra: el `accept` del dropzone es solo un hint del browser, no
//    una garantía dura).
export const ACCEPTED_MIME = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

// Fragmento que aparece en TODA URL pública de nuestro bucket:
//   https://<proj>.supabase.co/storage/v1/object/public/project-images/<path>
// Lo usamos para distinguir una imagen que vive en NUESTRO Storage (y por
// ende hay que borrar del bucket al desasociarla) de una URL externa o un
// path relativo viejo (ej. `/projects/gym-1.webp` de los proyectos seedeados).
const PUBLIC_URL_MARKER = `/storage/v1/object/public/${BUCKET}/`;

/**
 * extFromMime — devuelve la extensión canónica para un mime aceptado.
 * Usamos la PRIMERA extensión del mapa (jpeg → '.jpg') en vez de confiar
 * en el nombre original del archivo (que puede venir raro o sin extensión).
 */
function extFromMime(mime) {
  const exts = ACCEPTED_MIME[mime];
  return exts ? exts[0] : '';
}

/**
 * buildFileName — nombre único para evitar colisiones en el bucket.
 * Formato: `${slug}-${timestamp}-${random}${ext}`.
 *  - slug    → para reconocer a qué proyecto pertenece la imagen.
 *  - timestamp + random → garantizan unicidad aunque se suban dos
 *    imágenes del mismo proyecto en el mismo milisegundo.
 */
function buildFileName(slug, mime) {
  // Si todavía no hay slug (modo crear, antes de tipear el título),
  // usamos 'project' como prefijo. Igual el nombre es único por el
  // timestamp + random.
  const safeSlug = (slug || 'project').trim();
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${safeSlug}-${stamp}-${random}${extFromMime(mime)}`;
}

/**
 * uploadImage — sube UN archivo al bucket y devuelve su URL pública.
 *
 * @param {File} file - archivo del input/dropzone.
 * @param {string} slug - slug del proyecto (para el nombre del archivo).
 * @returns {Promise<string>} URL pública (servida por el CDN de Supabase).
 * @throws {Error} con mensaje legible si la validación o el upload fallan.
 *
 * Validamos mime + tamaño acá de nuevo (además del `accept` del dropzone)
 * porque el dropzone solo filtra el picker — un archivo arrastrado o un
 * mime spoofeado podría colarse. Defensa en profundidad.
 */
export async function uploadImage(file, slug) {
  if (!ACCEPTED_MIME[file.type]) {
    throw new Error('Formato no permitido. Usá JPG, PNG o WebP.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('La imagen supera los 2 MB.');
  }

  const fileName = buildFileName(slug, file.type);

  // upload() sube el archivo. `cacheControl` le dice al CDN cuánto cachear
  // (1 año). `upsert: false` → si por casualidad el nombre ya existe, falla
  // en vez de pisar (no debería pasar por el random, pero es la opción segura).
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '31536000', upsert: false });

  if (error) {
    console.error('[storage] upload falló:', error);
    throw new Error('No pude subir la imagen. Probá de nuevo.');
  }

  // getPublicUrl NO hace request — solo construye la URL determinísticamente
  // a partir del path. Por eso no es async.
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * pathFromPublicUrl — extrae el path interno del bucket desde una URL
 * pública. Devuelve null si la URL NO pertenece a nuestro bucket (URL
 * externa, path relativo viejo, string vacío, etc.).
 */
function pathFromPublicUrl(url) {
  if (typeof url !== 'string') return null;
  const idx = url.indexOf(PUBLIC_URL_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + PUBLIC_URL_MARKER.length);
}

/**
 * removeImage — borra del bucket la imagen que apunta `url`.
 *
 * Es NO-OP silencioso si la URL no es de nuestro Storage (ej. los paths
 * relativos `/projects/*.webp` de los proyectos seedeados, que viven en
 * `public/` y no en el bucket). Así el caller puede llamar `removeImage`
 * sobre cualquier valor sin chequear el origen.
 *
 * No tira si el remove falla: el cleanup del bucket es best-effort. Lo
 * importante es desasociar la imagen del proyecto (eso lo hace el caller
 * vía onChange); que quede un huérfano en el bucket no rompe nada.
 */
export async function removeImage(url) {
  const path = pathFromPublicUrl(url);
  if (!path) return; // URL externa o path relativo: nada que borrar.

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    // Logueamos pero no propagamos: que falle el cleanup no debe bloquear
    // al usuario que solo quería sacar la imagen del proyecto.
    console.error('[storage] remove falló (huérfano en bucket):', error);
  }
}
