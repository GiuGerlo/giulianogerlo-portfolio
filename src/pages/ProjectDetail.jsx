// useState → guarda qué imagen de la galería está abierta en el lightbox.
import { useState } from 'react';

// React Router:
//  - useParams → lee el :slug dinámico de la URL.
//  - Navigate  → redirige de forma declarativa (componente, no función).
//  - Link      → navegación interna sin recargar la página.
import { useParams, Navigate, Link } from 'react-router-dom';

// Custom hook que gestiona el <title> de la pestaña.
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
// Hook nuevo: trae el proyecto por slug desde Supabase. Devuelve
// { data, loading, error }.
import { useProject } from '../hooks/useProject.js';

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  UserRound,
  ExternalLink,
} from 'lucide-react';

import Lightbox from '../components/ui/Lightbox.jsx';

/**
 * ProjectDetail — página de detalle de un proyecto (ruta /proyectos/:slug).
 *
 * Flujo:
 *  1. Lee el slug de la URL.
 *  2. Llama `useProject(slug)`. Mientras carga: skeleton.
 *  3. Si terminó de cargar y NO encontró proyecto (data === null) →
 *     redirige a /404. Esto cubre dos casos: slug inexistente y slug
 *     existente pero draft (RLS lo filtra como invisible para anon).
 *  4. Si hubo error de red → mensaje de error in-place.
 *  5. Si hay data → render normal.
 *
 * Secciones condicionales:
 *  - Las URLs (liveUrl/repoUrl) y los arrays (gallery/challenges) pueden
 *    estar vacíos en proyectos viejos. Esos bloques se renderizan SOLO
 *    si tienen contenido — la página no muestra secciones vacías.
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

  // Fetch del proyecto. Mientras `loading` es true, data es null.
  // Si el slug no existe, al terminar de cargar data sigue siendo null.
  const { data: project, loading, error } = useProject(slug);

  // Setea el <title> de la pestaña con el nombre del proyecto. Se llama
  // SIEMPRE (antes de cualquier return condicional) para respetar la
  // regla de hooks. Si todavía no hay proyecto, pasamos null y el hook
  // no toca el título.
  useDocumentTitle(project ? `${project.title} — Giuliano Gerlo` : null);

  // Estado del lightbox de la galería: null = cerrado, número = índice
  // de la imagen abierta. Se declara ANTES de cualquier return condicional
  // para respetar la regla de hooks (siempre se ejecutan en el mismo orden).
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // ── Estado: loading ── (skeleton mínimo: estructura visible pero sin texto)
  if (loading) {
    return (
      <article
        aria-busy="true"
        aria-label="Cargando proyecto"
        className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16"
      >
        <div className="mb-8 h-4 w-40 rounded bg-border/60" />
        <div className="mb-3 h-5 w-32 rounded bg-border/60" />
        <div className="mb-4 h-10 w-3/4 rounded bg-border/60" />
        <div className="mb-8 h-4 w-1/2 rounded bg-border/40" />
        <div className="mb-2 h-4 w-full rounded bg-border/40" />
        <div className="mb-2 h-4 w-5/6 rounded bg-border/40" />
        <div className="h-4 w-4/6 rounded bg-border/40" />
      </article>
    );
  }

  // ── Estado: error de red ── (no redirige a 404; el usuario puede recargar)
  if (error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <Link
          to="/"
          className="mb-8 flex w-fit items-center gap-1.5 font-mono text-[13px] text-text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Volver a proyectos
        </Link>
        <div
          role="alert"
          className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted"
        >
          <p className="mb-2 font-medium text-text-primary">
            No pude cargar el proyecto.
          </p>
          <p className="text-sm">
            Revisá tu conexión y recargá la página.
          </p>
        </div>
      </article>
    );
  }

  // ── Estado: terminó el fetch pero proyecto no existe (404).
  // `replace` evita que la URL rota quede en el historial (back no
  // vuelve a ella).
  if (!project) return <Navigate to="/404" replace />;

  // Flags de las secciones condicionales.
  const hasActions = Boolean(project.liveUrl || project.repoUrl);
  const hasGallery = project.gallery.length > 0;
  const hasChallenges = project.challenges.length > 0;

  // Handlers del lightbox. prev/next usan el operador módulo (%) para
  // dar la vuelta: después de la última imagen vuelve a la primera y
  // viceversa (wrap-around). El `+ length` antes del % evita índices
  // negativos al retroceder desde la imagen 0.
  function closeLightbox() {
    setLightboxIndex(null);
  }
  function prevImage() {
    setLightboxIndex(
      (i) => (i - 1 + project.gallery.length) % project.gallery.length,
    );
  }
  function nextImage() {
    setLightboxIndex((i) => (i + 1) % project.gallery.length);
  }

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      {/* Back link — vuelve al Home. ArrowLeft de lucide en vez del
          carácter "←" (política del proyecto: íconos vectoriales). */}
      <Link
        to="/"
        className="mb-8 flex w-fit items-center gap-1.5 font-mono text-[13px] text-text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Volver a proyectos
      </Link>

      {/* ── Hero del proyecto ── */}
      <span className="inline-block rounded bg-accent-bg px-2.5 py-1 font-mono text-xs text-accent">
        {project.category}
      </span>

      <h1 className="mt-3 mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
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
              // Cada thumbnail es un <button> (no un <img> suelto): así
              // es accesible por teclado y semánticamente correcto para
              // un elemento clickeable. Al click abre el lightbox en
              // esa imagen seteando su índice.
              <button
                key={src}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Ampliar captura ${i + 1} de ${project.title}`}
                className="group block overflow-hidden rounded-lg border border-border transition-colors hover:border-accent"
              >
                <img
                  src={src}
                  alt={`${project.title} — captura ${i + 1}`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
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

      {/* Lightbox de la galería. Renderiza el overlay solo cuando
          lightboxIndex es un número; si es null, no muestra nada. */}
      <Lightbox
        images={project.gallery}
        index={lightboxIndex}
        title={project.title}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />
    </article>
  );
}
