import { useEffect } from 'react';
// React Router:
//  - useParams → lee el :slug dinámico de la URL.
//  - Navigate  → redirige de forma declarativa (componente, no función).
//  - Link      → navegación interna sin recargar la página.
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  UserRound,
  ExternalLink,
} from 'lucide-react';

import { projects } from '../data/projects.js';

/**
 * ProjectDetail — página de detalle de un proyecto (ruta /proyectos/:slug).
 *
 * Flujo:
 *  1. Lee el slug de la URL y busca el proyecto en src/data/projects.js.
 *  2. Si no existe → redirige a /404 (la cubre la ruta "*" → NotFound).
 *  3. Si existe → renderiza back link, hero, resumen, rol, stack y
 *     —si hay data— galería y desafíos.
 *
 * Secciones condicionales:
 *  - Las URLs (liveUrl/repoUrl) y los arrays (gallery/challenges) hoy
 *    están vacíos para todos los proyectos (ver projects.js). Por eso
 *    esos bloques se renderizan SOLO si tienen contenido — así la
 *    página no muestra secciones vacías hasta que llegue la data real.
 */

// Meses abreviados en español. formatMonth convierte 'YYYY-MM' →
// 'Mes YYYY' (ej. '2025-03' → 'Mar 2025').
const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function formatMonth(yyyyMm) {
  const [year, month] = yyyyMm.split('-');
  // month viene 1-based ('03'); el array es 0-based → -1.
  return `${MESES[Number(month) - 1]} ${year}`;
}

// Rango de fechas del proyecto. Si dateEnd es null, el proyecto sigue
// en curso → 'Actualidad'.
function formatDateRange(dateStart, dateEnd) {
  const start = formatMonth(dateStart);
  const end = dateEnd ? formatMonth(dateEnd) : 'Actualidad';
  return `${start} — ${end}`;
}

// Clases compartidas de los botones de acción (Ver sitio / repo). No uso
// el primitive Button porque ese renderiza un <button>; acá necesito
// <a> reales (links externos). Replico el look de las variantes.
const actionBase =
  'inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all';
const actionPrimary =
  `${actionBase} bg-accent text-white hover:bg-accent-hover`;
const actionSecondary =
  `${actionBase} border border-border text-text-primary hover:border-accent hover:text-accent`;

export default function ProjectDetail() {
  // slug dinámico de la URL. Para /proyectos/clovertecno → slug = 'clovertecno'.
  const { slug } = useParams();

  // Buscamos el proyecto que matchee el slug. Puede ser undefined.
  const project = projects.find((p) => p.slug === slug);

  // Effect: setea el <title> del documento al del proyecto y lo
  // restaura al desmontar. El guard `if (!project)` va ADENTRO del
  // effect —no antes— porque los hooks no pueden ir después de un
  // return condicional (regla de hooks).
  useEffect(() => {
    if (!project) return;
    document.title = `${project.title} — Giuliano Gerlo`;
    return () => {
      document.title = 'Giuliano Gerlo — Full-Stack Developer';
    };
  }, [project]);

  // Slug inexistente → redirección declarativa. `replace` evita que la
  // URL rota quede en el historial (back no vuelve a ella).
  if (!project) return <Navigate to="/404" replace />;

  // Flags de las secciones condicionales.
  const hasActions = Boolean(project.liveUrl || project.repoUrl);
  const hasGallery = project.gallery.length > 0;
  const hasChallenges = project.challenges.length > 0;

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      {/* Back link — vuelve al Home. ArrowLeft de lucide en vez del
          carácter "←" (política del proyecto: íconos vectoriales). */}
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-[13px] text-text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Volver a proyectos
      </Link>

      {/* ── Hero del proyecto ── */}
      <span className="inline-block rounded bg-accent-bg px-2.5 py-1 font-mono text-xs text-accent">
        {project.category}
      </span>

      <h1 className="mt-3 mb-4 text-4xl font-bold tracking-tight md:text-5xl">
        {project.title}
      </h1>

      {/* Meta row: fechas + rol. Mono chico muted, con íconos lucide. */}
      <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} aria-hidden="true" />
          {formatDateRange(project.dateStart, project.dateEnd)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UserRound size={14} aria-hidden="true" />
          {project.myRole}
        </span>
      </div>

      {/* Acciones — solo si hay alguna URL. target/rel para abrir en
          pestaña nueva de forma segura. */}
      {hasActions && (
        <div className="mb-12 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={actionPrimary}
            >
              Ver sitio live
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={actionSecondary}
            >
              Ver repositorio
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      {/* ── Resumen ── */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Resumen</h2>
        <p className="text-text-muted">{project.description}</p>
      </section>

      {/* ── Mi rol ── */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Mi rol</h2>
        <p className="text-text-muted">{project.myRole}</p>
      </section>

      {/* ── Stack técnico ── */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Stack técnico</h2>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-border bg-bg-elevated px-2.5 py-1 font-mono text-xs text-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ── Galería — solo si hay imágenes cargadas ── */}
      {hasGallery && (
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Galería</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {project.gallery.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${project.title} — captura ${i + 1}`}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Desafíos resueltos — solo si hay challenges cargados ── */}
      {hasChallenges && (
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">
            Desafíos resueltos
          </h2>
          <ul>
            {project.challenges.map((challenge) => (
              <li
                key={challenge}
                className="flex gap-2 border-b border-border py-4 text-text-muted last:border-b-0"
              >
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-accent"
                />
                {challenge}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
