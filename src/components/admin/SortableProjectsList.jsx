// DndContext = provider del sistema de drag-and-drop. Sus props sensors
// definen QUÉ inputs activan el drag (puntero, teclado, touch).
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
// SortableContext = define los items reorderable y su estrategia visual.
// arrayMove es helper para reordenar arrays cuando cambia la posición.
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import ProjectListItem from './ProjectListItem.jsx';

/**
 * SortableProjectsList — wrapper @dnd-kit que renderiza una lista
 * verticalmente sortable de proyectos.
 *
 * Props:
 *  - items: array de Project (en el orden ACTUAL).
 *  - onReorder: (newItems) => void — callback con el array reordenado.
 *    Acá NO hablamos con Supabase: el caller (Dashboard) decide cuándo
 *    persistir (típicamente: optimistic update local + UPDATE en DB).
 *  - onToggle, isToggling: passthrough a ProjectListItem.
 *
 * Sensores:
 *  - PointerSensor con activationConstraint.distance=5: el drag solo
 *    arranca después de mover el puntero 5px. Sin esto, un click
 *    cualquiera en el handle dispararía un "drag de 0px" molesto.
 *  - KeyboardSensor: navegación con teclado (tab al handle + space para
 *    levantar + arrows para mover + space para soltar). Accesible.
 *
 * Por qué `closestCenter`: la estrategia que mejor encaja en listas
 * verticales (mide el centro del item arrastrado contra los demás).
 */
export default function SortableProjectsList({
  items,
  onReorder,
  onToggle,
  isToggling,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handler que dispara dnd-kit cuando soltás el item.
  // `active` = el item arrastrado, `over` = el item sobre el que cayó.
  function handleDragEnd(event) {
    const { active, over } = event;
    // Si soltaste fuera de un drop zone, no hay nada que hacer.
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // arrayMove devuelve un NUEVO array con el item movido — no muta el
    // original (importante para que React detecte el cambio de ref).
    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* SortableContext recibe los IDs en el orden actual; dnd-kit los
          usa para calcular animaciones y posiciones target. */}
      <SortableContext
        items={items.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-2">
          {items.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              onToggle={onToggle}
              isToggling={isToggling === project.id}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
