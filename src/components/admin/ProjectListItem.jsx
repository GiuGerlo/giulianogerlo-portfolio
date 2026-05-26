// Hook de @dnd-kit que conecta este componente al sistema de sortable.
// Devuelve refs y handlers para hacerlo arrastrable + estilos animados.
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { GripVertical, Eye, EyeOff, Pencil } from 'lucide-react';

import { formatDateAR } from '../../lib/format-date.js';

/**
 * ProjectListItem — fila de un proyecto en el listado del Dashboard.
 *
 * Responsabilidades:
 *  - Mostrar thumbnail + título + categoría + estado + última edición.
 *  - Handle de drag (ícono GripVertical) para reordenar via dnd-kit.
 *  - Botón toggle publicado/draft.
 *  - Link "Editar" (placeholder hasta Task 12.8 — ProjectForm).
 *
 * Props:
 *  - project: objeto Project (camelCase, viene de useAdminProjects).
 *  - onToggle: (project) => void — callback para alternar `published`.
 *  - isToggling: boolean — si está en mid-update, deshabilita el toggle.
 *
 * Sobre @dnd-kit:
 *  - `useSortable({ id })` engancha este item al contexto Sortable
 *    superior. Devuelve refs/handlers y un `transform` que aplicamos
 *    como inline-style mientras se arrastra (animación nativa).
 *  - `attributes` + `listeners` SOLO se aplican al "handle" (ícono),
 *    no al li entero — así el resto del item sigue siendo clickeable
 *    (botones, links) sin disparar drag accidental.
 *  - isDragging cambia el look del item mientras lo movés (opacidad,
 *    shadow).
 */
export default function ProjectListItem({ project, onToggle, isToggling }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  // dnd-kit usa CSS transforms para mover el item — más performante
  // que tocar top/left. CSS.Transform.toString() arma el string que
  // espera la prop `style`.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-border bg-bg-elevated p-3 ${
        isDragging ? 'z-10 opacity-60 shadow-lg' : ''
      }`}
    >
      {/* Handle de drag — único elemento con attributes+listeners. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reordenar ${project.title}`}
        // touch-none evita que en mobile el browser interprete el drag
        // como scroll de página.
        className="flex-shrink-0 cursor-grab touch-none rounded p-1 text-text-muted transition-colors hover:bg-bg hover:text-accent active:cursor-grabbing"
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      {/* Thumbnail */}
      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border">
        {project.image ? (
          <img
            src={project.image}
            alt=""
            // alt vacío porque el título está al lado — evita lectura redundante.
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg to-accent-bg font-mono text-[10px] text-text-muted">
            —
          </div>
        )}
      </div>

      {/* Info principal — flex-1 para ocupar el espacio sobrante. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{project.title}</h3>
          {/* Badge de estado */}
          {project.published ? (
            <span className="flex-shrink-0 rounded bg-accent-bg px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              publicado
            </span>
          ) : (
            <span className="flex-shrink-0 rounded bg-border/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              draft
            </span>
          )}
        </div>
        <p className="truncate font-mono text-[11px] text-text-muted">
          {project.slug} · #{project.orderIndex}
        </p>
        <p className="font-mono text-[10px] text-text-muted">
          Editado: {formatDateAR(project.updatedAt) || '—'}
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-shrink-0 items-center gap-1">
        {/* Toggle publicado */}
        <button
          type="button"
          onClick={() => onToggle(project)}
          disabled={isToggling}
          aria-label={
            project.published
              ? `Ocultar ${project.title}`
              : `Publicar ${project.title}`
          }
          title={project.published ? 'Cambiar a draft' : 'Publicar'}
          className="rounded-md border border-border p-2 text-text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {project.published ? (
            <Eye size={14} aria-hidden="true" />
          ) : (
            <EyeOff size={14} aria-hidden="true" />
          )}
        </button>

        {/* Editar — placeholder hasta Task 12.8. */}
        <Link
          to={`/admin/projects/${project.id}`}
          aria-label={`Editar ${project.title}`}
          title="Editar"
          className="rounded-md border border-border p-2 text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Pencil size={14} aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}
