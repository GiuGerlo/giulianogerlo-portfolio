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
 * fileToWebp — convierte un File de imagen a WebP y lo achica a `maxWidth`,
 * usando la canvas API NATIVA del navegador (sin dependencias).
 *
 * Por qué client-side y no `sharp`: sharp es Node puro (solo el script
 * `optimize-images.js`), no corre en el browser. La canvas API sí, y de
 * paso resizea y descarta los metadatos EXIF (privacidad).
 *
 * Robustez (clave): si CUALQUIER paso falla —navegador sin canvas (jsdom en
 * los tests), `toBlob` no soporta webp, imagen corrupta— devuelve el archivo
 * ORIGINAL sin tirar. Así el upload nunca se rompe por la optimización.
 *
 * @param {File} file - imagen original (ya validada por mime+tamaño).
 * @param {{maxWidth?: number, quality?: number}} opts
 * @returns {Promise<File>} archivo WebP nuevo, o el original si no se pudo.
 */
export async function fileToWebp(file, { maxWidth = 1600, quality = 0.82 } = {}) {
  try {
    // Guard temprano: si no hay canvas 2d (jsdom/entorno sin DOM gráfico),
    // getContext devuelve null. Salimos ACÁ, antes de crear cualquier
    // promesa de carga de imagen (que en jsdom nunca resolvería → colgaría).
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return file;

    // Cargamos el archivo en un <img> via blob URL. La promesa resuelve en
    // onload y rechaza en onerror (imagen corrupta) → el catch externo
    // devuelve el original.
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });

      // Escala manteniendo proporción, sin agrandar (withoutEnlargement).
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // toBlob es callback-based → lo envolvemos en promesa. Devuelve null
      // si el navegador no sabe codificar webp.
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/webp', quality),
      );
      if (!blob) return file;

      // Reempaquetamos el Blob como File con nombre .webp y el type correcto.
      const name = file.name ? file.name.replace(/\.[^.]+$/, '.webp') : 'image.webp';
      return new File([blob], name, { type: 'image/webp' });
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    // Cualquier fallo → archivo original (el upload sigue funcionando).
    return file;
  }
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
 * @param {{maxWidth?: number, quality?: number}} [opts] - opciones de
 *   conversión a WebP (ver fileToWebp). Default: 1600px / quality 0.82.
 * @returns {Promise<string>} URL pública (servida por el CDN de Supabase).
 * @throws {Error} con mensaje legible si la validación o el upload fallan.
 *
 * Validamos mime + tamaño sobre el archivo ORIGINAL (además del `accept` del
 * dropzone) porque el dropzone solo filtra el picker — un archivo arrastrado
 * o un mime spoofeado podría colarse. Defensa en profundidad.
 *
 * Después de validar, convertimos a WebP + resize (fileToWebp). Si la
 * conversión no es posible, fileToWebp devuelve el original → subimos eso.
 * El nombre del archivo usa la extensión del resultado (.webp si convirtió).
 */
export async function uploadImage(file, slug, opts) {
  if (!ACCEPTED_MIME[file.type]) {
    throw new Error('Formato no permitido. Usá JPG, PNG o WebP.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('La imagen supera los 2 MB.');
  }

  // Optimización: WebP + resize. Cae al original si no se puede.
  const finalFile = await fileToWebp(file, opts);

  const fileName = buildFileName(slug, finalFile.type);

  // upload() sube el archivo. `cacheControl` le dice al CDN cuánto cachear
  // (1 año). `upsert: false` → si por casualidad el nombre ya existe, falla
  // en vez de pisar (no debería pasar por el random, pero es la opción segura).
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, finalFile, { cacheControl: '31536000', upsert: false });

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
