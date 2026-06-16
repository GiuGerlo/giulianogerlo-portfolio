import { useId, useState } from 'react';
import { X, Plus } from 'lucide-react';

// dnd-kit: mismo stack que el reorder de la galería (ImageUpload) y del
// dashboard. Acá lo usamos para reordenar los chips arrastrándolos.
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '../../lib/cn.js';

/**
 * ChipsEditor — editor para arrays de strings (stack, tecnologías, etc).
 *
 * Props (controlado):
 *  - value: string[] — el array actual.
 *  - onChange: (next: string[]) => void — handler cuando cambia el array.
 *  - label, placeholder, error, suggestions (datalist) — ver más abajo.
 *
 * UI:
 *  - Lista de chips con el valor + botón X para borrar c/u.
 *  - Los chips se REORDENAN arrastrándolos (el orden del array = orden en
 *    que se muestran en el sitio). El click en la X no dispara drag gracias
 *    al `distance` del PointerSensor.
 *  - Input + botón "+" para agregar uno nuevo (Enter también agrega).
 *
 * Patrón "controlled" puro: el array vive en el parent (react-hook-form via
 * Controller). El `id` sortable de cada chip es su propio string (los chips
 * son únicos: `add` evita duplicados case-insensitive).
 */
export default function ChipsEditor({
  value = [],
  onChange,
  label,
  placeholder = 'Agregar…',
  error,
  suggestions = [],
}) {
  const datalistId = useId();
  const [draft, setDraft] = useState('');

  // Sensores del drag: distance 6px → un click en la X no arranca un drag
  // fantasma. KeyboardSensor para reorder accesible con teclado.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    // Evita duplicados (case-insensitive).
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setDraft('');
  }

  function remove(chip) {
    onChange(value.filter((v) => v !== chip));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  // Reorder al soltar: arrayMove sobre los índices del array.
  function handleReorder(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(active.id);
    const newIndex = value.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleReorder}
        >
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <ul className="mb-2 flex flex-wrap gap-1.5">
              {value.map((chip) => (
                <SortableChip key={chip} chip={chip} onRemove={remove} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Input + botón + de agregar. */}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          list={suggestions.length > 0 ? datalistId : undefined}
          className={cn(
            'flex-1 rounded-md border bg-bg px-3 py-2 text-sm text-text-primary transition-colors focus:outline-none',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-border focus:border-accent',
          )}
        />
        <button
          type="button"
          onClick={add}
          aria-label="Agregar"
          className="flex items-center justify-center rounded-md border border-border px-3 text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>

      {suggestions.length > 0 && (
        <datalist id={datalistId}>
          {suggestions
            .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * SortableChip — un chip arrastrable. Los listeners de drag van en el texto
 * (cursor-grab); la X queda fuera de ellos para que el click la dispare sin
 * iniciar un drag.
 */
function SortableChip({ chip, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chip });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'inline-flex items-center gap-1 rounded border border-border bg-bg-elevated px-2 py-1 font-mono text-[11px] text-text-muted',
        isDragging && 'opacity-60',
      )}
    >
      {/* Texto = handle de drag. touch-none evita que el scroll táctil
          robe el gesto en mobile. */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none break-all active:cursor-grabbing"
      >
        {chip}
      </span>
      <button
        type="button"
        onClick={() => onRemove(chip)}
        aria-label={`Quitar ${chip}`}
        className="rounded p-0.5 transition-colors hover:bg-red-500/20 hover:text-red-500"
      >
        <X size={12} aria-hidden="true" />
      </button>
    </li>
  );
}
