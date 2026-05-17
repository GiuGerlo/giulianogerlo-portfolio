// scripts/generate-sitemap.js
//
// Genera public/sitemap.xml a partir de las rutas del sitio. El sitemap
// le dice a Google qué URLs existen y deben indexarse.
//
// Corre como parte del build (ver "build" en package.json). Se regenera
// solo: si se agrega un proyecto a src/data/projects.js, la próxima
// build mete su URL en el sitemap sin tocar este script.
//
// Es un script de Node (no del browser): usa el módulo `node:fs` para
// escribir el archivo.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// projects.js es ESM puro (sin imports de React ni del browser), así que
// Node lo puede importar directo.
import { projects } from '../src/data/projects.js';

// Dominio del sitio. Tiene que coincidir con el canonical de index.html.
const SITE_URL = 'https://giulianogerlo.vercel.app';

// __dirname no existe en módulos ESM; lo reconstruimos desde la URL de
// este archivo para resolver la ruta de salida de forma absoluta.
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = join(scriptDir, '..', 'public', 'sitemap.xml');

// Fecha de hoy en formato YYYY-MM-DD para el <lastmod> de cada URL.
const today = new Date().toISOString().split('T')[0];

// Rutas del sitio: el Home + la página de detalle de cada proyecto.
// El Home tiene prioridad máxima (1.0); las de proyectos, 0.8.
const routes = [
  { loc: '/', priority: '1.0' },
  ...projects.map((project) => ({
    loc: `/proyectos/${project.slug}`,
    priority: '0.8',
  })),
];

// Arma un bloque <url> por cada ruta.
const urlEntries = routes
  .map(
    ({ loc, priority }) => `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

writeFileSync(outputPath, xml, 'utf8');
console.log(`sitemap.xml generado — ${routes.length} URLs.`);
