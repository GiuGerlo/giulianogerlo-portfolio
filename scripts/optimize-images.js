// scripts/optimize-images.js
//
// Optimiza las imágenes raster de public/: las reduce de tamaño y genera
// una versión .webp (formato moderno, ~30% más liviano que JPG/PNG con
// la misma calidad visual).
//
// NO corre en el build — es un paso manual de preparación de assets.
// Se corre a mano cuando se agregan imágenes nuevas:  pnpm optimize:images
//
// Cuando lleguen los screenshots de los proyectos, se suman a la lista
// `images` de abajo con el ancho que corresponda y se vuelve a correr.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(scriptDir, '..', 'public');

// Imágenes a optimizar.
//  - input  → archivo fuente (el "master", queda en el repo).
//  - output → .webp generado.
//  - width  → ancho máximo de salida; la altura se ajusta sola para
//             mantener la proporción. withoutEnlargement evita agrandar
//             una imagen que ya sea más chica que `width`.
//
// La foto se muestra en un cuadrado de ~280px; 600px de ancho cubre
// pantallas retina (2x) sin pasarse.
const images = [
  {
    input: 'foto-giulianogerlo.jpg',
    output: 'foto-giulianogerlo.webp',
    width: 600,
  },
];

for (const { input, output, width } of images) {
  const info = await sharp(join(publicDir, input))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(publicDir, output));
  console.log(
    `${input} -> ${output}  (${info.width}x${info.height}, ` +
      `${(info.size / 1024).toFixed(1)} KB)`,
  );
}
