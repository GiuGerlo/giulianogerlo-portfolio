import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import { projects } from '../../data/projects.js';

/**
 * Projects — sección 04 del portfolio. Grid de cards de proyectos.
 *
 * Cada card es ENTERA un link a la página de detalle (/proyectos/:slug).
 * Por eso usamos `<Link>` de react-router-dom como contenedor: navega
 * sin recargar la página (client-side routing).
 *
 * Decisión — la card es UN solo link, no varios:
 *   El mockup mostraba 3 links por card ("Ver caso", "Sitio live", "Repo").
 *   Anidar <a> dentro de <a> es HTML inválido. Solución: la card completa
 *   linkea al detalle, y los links a sitio live / repo viven en la página
 *   de detalle (ahí no hay anidamiento). Acá la card muestra solo el
 *   afford "Ver caso" como texto (no como <a> aparte).
 *
 * Imagen del proyecto:
 *   `project.image` hoy es null para todos (faltan los screenshots, ver
 *   TODO-USUARIO.md). Mientras tanto renderizamos un placeholder: un
 *   bloque con gradiente y el título en mono. Cuando Giuliano pase los
 *   assets, se cambia el placeholder por un <img src={project.image}>.
 *
 * Grid responsive:
 *   `repeat(auto-fit,minmax(340px,1fr))` — replica mockup. Cards de
 *   mínimo 340px; auto-fit acomoda 1 col en mobile, 2-3 en desktop.
 */
export default function Projects() {
  return (
    <section
      id="projects"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="// 04 — projects"
          title="Proyectos destacados"
          subtitle="Selección de proyectos en los que colaboré como desarrollador."
        />

        {/* Grid auto-fit. gap-5 (20px) matchea mockup. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
          {projects.map((project, index) => (
            // Reveal: fade-up al scrollear, escalonado por index.
            <Reveal key={project.slug} delay={index * 0.06}>
            <Link
              to={`/proyectos/${project.slug}`}
              className="group block overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent"
            >
              {/* Placeholder de imagen — gradiente bg → accent-bg con el
                  título en mono. Se reemplaza por <img> cuando haya
                  screenshots reales. h-[180px] matchea mockup. */}
              <div className="flex h-[180px] items-center justify-center border-b border-border bg-gradient-to-br from-bg to-accent-bg font-mono text-[13px] text-text-muted">
                [ {project.title} ]
              </div>

              {/* Body de la card. p-6 (24px). */}
              <div className="p-6">
                {/* Tag de categoría — mono chico, accent sobre accent-bg. */}
                <span className="mb-3 inline-block rounded bg-accent-bg px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
                  {project.category}
                </span>

                <h3 className="mb-2 text-xl font-semibold">
                  {project.title}
                </h3>

                {/* Rol — mono muted, prefijo "role:" estilo código. */}
                <p className="mb-3 font-mono text-[11px] text-text-muted">
                  role: {project.myRole}
                </p>

                <p className="mb-4 text-sm leading-relaxed text-text-muted">
                  {project.summary}
                </p>

                {/* Stack tags — mismo styling que skill-tag de Skills. */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border bg-bg px-2 py-1 font-mono text-[11px] text-text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Afford "Ver caso". NO es un <a> (la card entera ya es
                    link) — es texto + ícono. group-hover desplaza la
                    flecha a la derecha como feedback visual. */}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Ver caso
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
