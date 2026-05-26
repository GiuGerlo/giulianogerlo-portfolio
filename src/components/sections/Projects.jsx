import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import ProjectCardSkeleton from './ProjectCardSkeleton.jsx';

// Hook nuevo: trae los proyectos publicados desde Supabase (runtime fetch).
// Antes Projects importaba el array `projects` directo del bundle —
// ahora el contenido vive en DB y se carga al montar.
import { useProjects } from '../../hooks/useProjects.js';

/**
 * Projects — sección 04 del portfolio. Grid de cards de proyectos.
 *
 * Estados que renderiza (en orden de prioridad):
 *  1. `loading` → 3 skeletons de card (mantienen el alto, evitan jump).
 *  2. `error`   → mensaje de error con CTA a recargar.
 *  3. `data` con 0 elementos → mensaje "pronto vienen proyectos".
 *  4. `data` con elementos → grid normal de cards.
 *
 * Cada card es ENTERA un link a la página de detalle (/proyectos/:slug).
 * Por eso usamos `<Link>` de react-router-dom como contenedor: navega
 * sin recargar la página (client-side routing).
 *
 * Decisión — la card es UN solo link, no varios:
 *   Anidar <a> dentro de <a> es HTML inválido. Solución: la card completa
 *   linkea al detalle, y los links a sitio live / repo viven en la página
 *   de detalle. Acá la card muestra solo el afford "Ver caso" como texto.
 *
 * Imagen del proyecto:
 *   Si `project.image` existe renderiza el screenshot; si es null
 *   (proyecto sin asset todavía) muestra un placeholder con gradiente
 *   y el título en mono.
 *
 * Grid responsive:
 *   `repeat(auto-fit,minmax(340px,1fr))` — cards de mínimo 340px;
 *   auto-fit acomoda 1 col en mobile, 2-3 en desktop.
 */
export default function Projects() {
  // Hook custom: { data, loading, error }. data === null mientras loading.
  const { data: projects, loading, error } = useProjects();

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

        {/* ── Estado 1: loading — 3 skeletons como placeholder. ── */}
        {loading && (
          <div
            // aria-busy le avisa a lectores de pantalla que el contenido
            // está cargando. aria-label da el mensaje accesible.
            aria-busy="true"
            aria-label="Cargando proyectos"
            className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5"
          >
            {/* Array.from({ length: 3 }) crea un array vacío de 3
                slots para mapearlo a skeletons. Usamos el índice como
                key — es ok porque la lista es estática y nunca se
                reordena. */}
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Estado 2: error de fetch. ── */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-border bg-bg-elevated p-6 text-center text-text-muted"
          >
            <p className="mb-2 font-medium text-text-primary">
              No pude cargar los proyectos.
            </p>
            <p className="text-sm">
              Revisá tu conexión y recargá la página.
            </p>
          </div>
        )}

        {/* ── Estado 3: data vacía (sin proyectos publicados). ── */}
        {!loading && !error && projects && projects.length === 0 && (
          <div className="rounded-xl border border-border bg-bg-elevated p-6 text-center text-text-muted">
            <p>Pronto vienen proyectos nuevos.</p>
          </div>
        )}

        {/* ── Estado 4: data con elementos — grid real de cards. ── */}
        {!loading && !error && projects && projects.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
            {projects.map((project, index) => (
              // Reveal: fade-up al scrollear, escalonado por index.
              // h-full → la card estira a la altura de la fila.
              <Reveal
                key={project.slug}
                delay={index * 0.06}
                className="h-full"
              >
                {/* flex flex-col + h-full → la card ocupa toda la altura
                    disponible; así todas las cards de la fila quedan parejas. */}
                <Link
                  to={`/proyectos/${project.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent"
                >
                  {/* Imagen del proyecto. Si `project.image` existe renderizamos
                      el screenshot; si es null, placeholder con gradiente +
                      título en mono. aspect-[16/10] → proporción de los
                      screenshots (1280x800), imagen sin recorte. */}
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={`Captura del proyecto ${project.title}`}
                      loading="lazy"
                      className="aspect-[16/10] w-full border-b border-border object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center border-b border-border bg-gradient-to-br from-bg to-accent-bg font-mono text-[13px] text-text-muted">
                      [ {project.title} ]
                    </div>
                  )}

                  {/* Body de la card. p-6 (24px). flex flex-1 flex-col →
                      ocupa el alto restante después de la imagen; permite
                      empujar el "Ver caso" al fondo con mt-auto. */}
                  <div className="flex flex-1 flex-col p-6">
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
                        flecha. mt-auto → al fondo, alineado entre cards. */}
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent">
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
        )}
      </div>
    </section>
  );
}
