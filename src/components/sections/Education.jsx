import { ExternalLink } from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
import BorderGlow from '../ui/BorderGlow.jsx';
import { education } from '../../data/education.js';

/**
 * Education — sección 06 del portfolio. Grid de cards de educación formal
 * y certificaciones.
 *
 * Cada card muestra fecha, título, institución y — abajo — el estado del
 * certificado. Hay 3 casos posibles, resueltos con condicionales:
 *
 *   1. status === 'in-progress'  → badge "EN CURSO" al lado del título +
 *      texto muted "Certificado al finalizar". No hay link (todavía no
 *      existe el certificado).
 *   2. certUrl existe            → link "Ver certificado" que abre el
 *      PDF/imagen en pestaña nueva.
 *   3. completed sin certUrl     → no se muestra nada en el slot del
 *      certificado (Giuliano todavía no subió el archivo, ver
 *      TODO-USUARIO.md). La card queda sin link.
 *
 * Por qué la card NO es un `<a>` entera (a diferencia de ProjectCard):
 *   acá el único destino útil es el certificado, y muchas cards todavía
 *   no lo tienen. Hacer toda la card un link a `#` sería un link muerto.
 *   Entonces el único `<a>` es el del certificado, y solo si existe.
 *
 * Grid: `auto-fit minmax(280px,1fr)` — replica mockup.
 */
export default function Education() {
  return (
    <section
      id="education"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="// 06 — education"
          title="Educación y certificaciones"
        />

        {/* Grid auto-fit. gap-4 (16px) matchea mockup. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {education.map((item) => {
            // Flags de los 3 casos. Se calculan una vez acá arriba para
            // que el JSX de abajo quede legible.
            const isInProgress = item.status === 'in-progress';
            const hasCert = Boolean(item.certUrl);

            return (
              // BorderGlow es el contenedor de la card (borde mesh +
              // glow). El contenido va adentro con su padding p-5.
              <BorderGlow key={item.id} className="h-full">
                <div className="flex h-full flex-col p-5">
                  <div className="mb-2 font-mono text-[11px] text-accent">
                    {item.dateLabel}
                  </div>

                  {/* Título + badge "EN CURSO" si aplica. El badge va
                      inline con el título (mono chico sobre accent-bg). */}
                  <h3 className="mb-1 text-[15px] font-semibold">
                    {item.title}
                    {isInProgress && (
                      <span className="ml-1.5 inline-block rounded bg-accent-bg px-1.5 py-0.5 font-mono text-[10px] uppercase text-accent">
                        En curso
                      </span>
                    )}
                  </h3>

                  <div className="text-[13px] text-text-muted">
                    {item.org}
                  </div>

                  {/* Slot del certificado — caso 1, 2 o nada. */}
                  {isInProgress && (
                    <span className="mt-3 font-mono text-xs text-text-muted">
                      Certificado al finalizar
                    </span>
                  )}

                  {!isInProgress && hasCert && (
                    <a
                      href={item.certUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-medium text-accent hover:underline"
                    >
                      Ver certificado
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </div>
    </section>
  );
}
