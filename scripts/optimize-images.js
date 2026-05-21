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
  {
    input: 'projects/clovertecno-1.png',
    output: 'projects/clovertecno-1.webp',
    width: 1280,
  },
  {
    input: 'projects/clovertecno-2.png',
    output: 'projects/clovertecno-2.webp',
    width: 1280,
  },
  {
    input: 'projects/clovertecno-3.png',
    output: 'projects/clovertecno-3.webp',
    width: 1280,
  },
  {
    input: 'projects/clovertecno-4.png',
    output: 'projects/clovertecno-4.webp',
    width: 1280,
  },
  {
    input: 'projects/gym-tracker-1.png',
    output: 'projects/gym-tracker-1.webp',
    width: 1280,
  },
  {
    input: 'projects/gym-tracker-2.png',
    output: 'projects/gym-tracker-2.webp',
    width: 1280,
  },
  {
    input: 'projects/gym-tracker-3.png',
    output: 'projects/gym-tracker-3.webp',
    width: 1280,
  },
  {
    input: 'projects/ramcc-1.png',
    output: 'projects/ramcc-1.webp',
    width: 1280,
  },
  {
    input: 'projects/ramcc-2.png',
    output: 'projects/ramcc-2.webp',
    width: 1280,
  },
  {
    input: 'projects/ramcc-3.png',
    output: 'projects/ramcc-3.webp',
    width: 1280,
  },
  {
    input: 'projects/ramcc-4.png',
    output: 'projects/ramcc-4.webp',
    width: 1280,
  },
  {
    input: 'projects/next-tienda-1.png',
    output: 'projects/next-tienda-1.webp',
    width: 1280,
  },
  {
    input: 'projects/next-tienda-2.png',
    output: 'projects/next-tienda-2.webp',
    width: 1280,
  },
  {
    input: 'projects/next-tienda-3.png',
    output: 'projects/next-tienda-3.webp',
    width: 1280,
  },
  {
    input: 'projects/next-tienda-4.png',
    output: 'projects/next-tienda-4.webp',
    width: 1280,
  },
];

// Procesamos las imágenes en PARALELO con Promise.all: cada conversión
// es I/O-bound (lee del disco, codifica, escribe), independiente de las
// otras. Con `for…of + await` corren una atrás de otra; con Promise.all
// arrancan todas en paralelo y el script termina mucho más rápido.
await Promise.all(
  images.map(async ({ input, output, width }) => {
    // Asegura que exista el subdirectorio de salida (ej: public/projects/).
    await mkdir(dirname(join(outDir, output)), { recursive: true });

    // Screenshots de proyectos → WebP lossless: cero pérdida de calidad
    // (texto y bordes nítidos, sin artefactos). Comprimen bien igual
    // porque son capturas con zonas planas de color.
    // Foto de perfil y otras imágenes → WebP lossy quality 80: una foto
    // no necesita pixel-perfect y lossy la deja mucho más liviana.
    const esScreenshot = output.startsWith('projects/');

    const pipeline = sharp(join(srcDir, input))
      .resize({ width, withoutEnlargement: true })
      .webp(esScreenshot ? { lossless: true } : { quality: 80 });

    const info = await pipeline.toFile(join(outDir, output));
    console.log(
      `${input} -> ${output}  (${info.width}x${info.height}, ` +
        `${(info.size / 1024).toFixed(1)} KB, ` +
        `${esScreenshot ? 'lossless' : 'q80'})`,
    );
  }),
);
