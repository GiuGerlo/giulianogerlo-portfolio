import { Link } from 'react-router-dom';

import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import { experience } from '../../data/experience.js';

/**
 * Experience — sección 05 del portfolio. Timeline vertical de experiencia
 * laboral, del trabajo más reciente al más antiguo.
 *
 * Anatomía del timeline:
 *   - Una LÍNEA vertical recorre toda la columna izquierda.
 *   - Cada item tiene un PUNTO sobre esa línea.
 *   - El item `current: true` (trabajo en curso) recibe punto SÓLIDO
 *     verde + halo (anillo verde tenue). El resto: punto hueco.
 *
 * Cómo se arma con Tailwind (el mockup usaba `::before` de CSS):
 *   - `<div>` contenedor con `relative` + `pl-8` (32px) — deja lugar a
 *     la izquierda para la línea y los puntos.
 *   - La línea es un `<div>` `absolute` finito (`w-0.5`) pegado a la izq.
 *   - Cada item es `relative`; su punto es un `<span>` `absolute` con
 *     `-left-8` (sale 32px hacia la izquierda, justo sobre la línea).
 *
 * Items clickeables:
 *   - Si el item tiene `projectSlug`, su contenido se envuelve en un
 *     `<Link>` a /proyectos/<slug>. Hover → el rol se pinta de accent.
 *   - Si NO tiene `projectSlug` (ej. roles que agrupan varios proyectos),
 *     el contenido va en un `<div>` plano, sin link.
 *   - El PUNTO queda siempre fuera del link: es decorativo y está en
 *     posición absoluta, no forma parte del área clickeable útil.
 */
export default function Experience() {
  return (
    <section
      id="experience"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="// 05 — experience"
          title="Experiencia"
        />

        {/* Contenedor del timeline. pl-8 (32px) deja espacio para la
            línea + puntos que viven en posición absoluta a la izq. */}
        <div className="relative pl-8">
          {/* Línea vertical. Va de top-2 a bottom-2 para no sobresalir
              de los puntos del primer/último item. left-2 (8px) la
              alinea con el centro de los puntos. aria-hidden: decorativa. */}
          <div
            aria-hidden="true"
            className="absolute left-2 top-2 bottom-2 w-0.5 bg-border"
          />

          {experience.map((item, index) => {
            // Contenido de la card — idéntico linkee o no. Lo definimos
            // una vez y abajo decidimos en qué contenedor lo metemos.
            // group-hover en el <h3>: cuando el item es link, al pasar
            // el mouse el rol se pinta de accent (feedback de "clickeable").
            const content = (
              <>
                <div className="mb-1 font-mono text-xs text-accent">
                  {item.dateLabel}
                </div>

                <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-accent">
                  {item.role}
                </h3>

                <div className="mb-2 text-sm text-text-muted">
                  {item.company}
                </div>

                <p className="text-sm leading-relaxed text-text-muted">
                  {item.desc}
                </p>
              </>
            );

            // Último item: sin padding-bottom. No uso la variante
            // `last:` de Tailwind porque ahora cada item está envuelto
            // en su propio <Reveal> → siempre sería "último hijo" de su
            // wrapper y `last:pb-0` aplicaría a todos. Lo resolvemos por
            // index contra el largo del array.
            const isLast = index === experience.length - 1;

            return (
              // Reveal: fade-up al scrollear, escalonado por index.
              <Reveal key={item.id} delay={index * 0.06}>
              <div
                className={isLast ? 'relative' : 'relative pb-10'}
              >
                {/* Punto del timeline. -left-8 lo saca 32px a la izq para
                    caer sobre la línea. Hueco por defecto (bg-bg + borde
                    accent); si es el trabajo actual → sólido + halo. */}
                <span
                  aria-hidden="true"
                  data-testid={`timeline-dot-${item.id}`}
                  className={
                    item.current
                      ? 'absolute -left-8 top-1.5 h-[18px] w-[18px] rounded-full border-2 border-accent bg-accent ring-4 ring-accent-bg'
                      : 'absolute -left-8 top-1.5 h-[18px] w-[18px] rounded-full border-2 border-accent bg-bg'
                  }
                />

                {/* Si hay projectSlug → Link al detalle. Si no → div plano.
                    `group` habilita el group-hover del <h3>. */}
                {item.projectSlug ? (
                  <Link
                    to={`/proyectos/${item.projectSlug}`}
                    className="group block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div>{content}</div>
                )}
              </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
