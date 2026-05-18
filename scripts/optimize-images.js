// scripts/optimize-images.js
//
// Optimiza las imágenes raster del portfolio: las reduce de tamaño y
// genera una versión .webp (formato moderno, ~30% más liviano que
// JPG/PNG con la misma calidad visual).
//
// Flujo de carpetas:
//  - images-src/  → los "masters" (PNG/JPG originales). Quedan en el
//                   repo, NO se sirven ni se deployan. Sirven para
//                   re-optimizar a otro tamaño cuando haga falta.
//  - public/      → solo los .webp generados. Es lo único que termina
//                   en dist/ y se deploya.
//
// NO corre en el build — es un paso manual de preparación de assets.
// Se corre a mano cuando se agregan imágenes nuevas:  pnpm optimize:images
//
// Para sumar una imagen: poner el master en images-src/, agregar una
// entrada a la lista `images` de abajo con el ancho que corresponda,
// y volver a correr el script.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';

const scriptDir = dirname(fileURLToPath(import.meta.url));
// Carpeta de masters (no servida) y carpeta de salida (servida).
const srcDir = join(scriptDir, '..', 'images-src');
const outDir = join(scriptDir, '..', 'public');

// Imágenes a optimizar.
//  - input  → master dentro de images-src/.
//  - output → .webp generado dentro de public/.
//  - width  → ancho máximo de salida; la altura se ajusta sola para
//             mantener la proporción. withoutEnlargement evita agrandar
//             una imagen que ya sea más chica que `width`.
const images = [
  // Foto de perfil. Se muestra en un cuadrado de ~280px; 600px de ancho
  // cubre pantallas retina (2x) sin pasarse.
  {
    input: 'foto-giulianogerlo.jpg',
    output: 'foto-giulianogerlo.webp',
    width: 600,
  },
  // Screenshots de proyectos. Se muestran en cards y galería; 1280px de
  // ancho cubre el render más grande con margen para pantallas retina.
  {
    input: 'projects/inmobiliaria-nz-1.png',
    output: 'projects/inmobiliaria-nz-1.webp',
    width: 1280,
  },
  {
    input: 'projects/inmobiliaria-nz-2.png',
    output: 'projects/inmobiliaria-nz-2.webp',
    width: 1280,
  },
  {
    input: 'projects/inmobiliaria-nz-3.png',
    output: 'projects/inmobiliaria-nz-3.webp',
    width: 1280,
  },
  {
    input: 'projects/inmobiliaria-nz-4.png',
    output: 'projects/inmobiliaria-nz-4.webp',
    width: 1280,
  },
];

for (const { input, output, width } of images) {
  // Asegura que exista el subdirectorio de salida (ej: public/projects/).
  await mkdir(dirname(join(outDir, output)), { recursive: true });

  const info = await sharp(join(srcDir, input))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(outDir, output));
  console.log(
    `${input} -> ${output}  (${info.width}x${info.height}, ` +
      `${(info.size / 1024).toFixed(1)} KB)`,
  );
}
