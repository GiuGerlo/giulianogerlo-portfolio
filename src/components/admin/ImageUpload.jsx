import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, ImageOff, GripVertical } from 'lucide-react';

// dnd-kit: mismo stack que el reorder de proyectos del dashboard.
//  - DndContext: provider del drag-and-drop.
//  - sensors: qué inputs activan el drag (puntero + teclado).
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
//  - SortableContext: define los items reorderables.
//  - rectSortingStrategy: estrategia para GRILLAS (la galería es un grid).
//    Distinta de verticalListSortingStrategy que usa el dashboard (lista).
//  - arrayMove: helper que reordena el array sin mutarlo.
//  - useSortable: hook por-item que devuelve los props de drag.
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
// CSS.Transform traduce el transform que calcula dnd-kit a string CSS.
import { CSS } from '@dnd-kit/utilities';

import { cn } from '../../lib/cn.js';
import {
  uploadImage,
  removeImage,
  ACCEPTED_MIME,
  MAX_SIZE_BYTES,
} from '../../lib/storage.js';

/**
 * ImageUpload — dropzone para subir imágenes a Supabase Storage.
 *
 * Maneja DOS modos según `multiple`:
 *  - multiple=false (portada): `value` es un string (URL o ''). Subir una
 *    imagen REEMPLAZA la anterior.
 *  - multiple=true (galería): `value` es un string[] de URLs. Subir AGREGA
 *    al final, y las imágenes se pueden REORDENAR con drag-and-drop (el
 *    orden del array = orden en que se muestran en el sitio público).
 *
 * Props (controlado — el valor vive en el parent vía react-hook-form):
 *  - value: string | string[] — URL(s) actuales.
 *  - onChange: (next) => void — recibe string (single) o string[] (multiple).
 *  - multiple: boolean — modo galería. Default false.
 *  - slug: string — slug del proyecto, para nombrar el archivo en el bucket.
 *  - label: string — label arriba del componente.
 *  - error: string — mensaje de validación de react-hook-form (zod).
 *
 * Validación de mime + tamaño: la hace react-dropzone (props `accept` +
 * `maxSize`) Y de nuevo `uploadImage` en storage.js (defensa en profundidad).
 * Los archivos rechazados disparan `onDropRejected` → mensaje local.
 *
 * Cleanup: al quitar una imagen que vive en NUESTRO bucket, se borra del
 * Storage (removeImage). URLs externas / paths relativos viejos solo se
 * desasocian (removeImage es no-op para esos).
 */
export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  slug,
  label,
  error,
}) {
  // Estados locales:
  //  - uploading: hay al menos un upload en curso → mostramos spinner y
  //    deshabilitamos el dropzone.
  //  - localError: error de upload o de archivo rechazado (distinto del
  //    `error` de validación zod que viene por props).
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Normalizamos `value` a un array para iterar las previews de forma
  // uniforme, sin importar el modo. En single, el array tiene 0 o 1 item.
  const urls = multiple ? (value ?? []) : value ? [value] : [];

  // Sensores del drag (idénticos al SortableProjectsList del dashboard):
  //  - PointerSensor con distance=5: el drag arranca recién al mover 5px,
  //    así un click en el botón X no dispara un drag fantasma. Cubre touch
  //    también (pointer events), clave para reordenar en mobile.
  //  - KeyboardSensor: reorder accesible con teclado (tab al handle +
  //    space para levantar + flechas para mover).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── Subida ───────────────────────────────────────────────────────────
  async function handleDrop(acceptedFiles) {
    if (acceptedFiles.length === 0) return;
    setLocalError(null);
    setUploading(true);

    try {
      // Subimos en paralelo (Promise.all). Cada uploadImage devuelve la
      // URL pública. Si una falla, el catch corta todo y avisa.
      const uploaded = await Promise.all(
        acceptedFiles.map((file) => uploadImage(file, slug)),
      );

      if (multiple) {
        // Galería: agregamos las nuevas al final de las existentes.
        onChange([...(value ?? []), ...uploaded]);
      } else {
        // Portada: si ya había una imagen en NUESTRO bucket, la borramos
        // (cleanup) antes de reemplazarla. Solo subimos la primera.
        if (value) await removeImage(value);
        onChange(uploaded[0]);
      }
    } catch (err) {
      setLocalError(err.message ?? 'No pude subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  // react-dropzone llama esto cuando un archivo NO pasa accept/maxSize.
  function handleDropRejected(fileRejections) {
    // Tomamos el primer error del primer archivo rechazado para el mensaje.
    const code = fileRejections[0]?.errors[0]?.code;
    if (code === 'file-too-large') {
      setLocalError('La imagen supera los 2 MB.');
    } else if (code === 'file-invalid-type') {
      setLocalError('Formato no permitido. Usá JPG, PNG o WebP.');
    } else {
      setLocalError('Archivo no válido.');
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_MIME,
    maxSize: MAX_SIZE_BYTES,
    multiple,
    disabled: uploading,
    onDrop: handleDrop,
    onDropRejected: handleDropRejected,
  });

  // ── Quitar imagen ────────────────────────────────────────────────────
  async function handleRemove(url) {
    // Desasociamos primero del valor (UX inmediata), después intentamos
    // borrar del bucket. removeImage es no-op para URLs que no son nuestras.
    if (multiple) {
      onChange((value ?? []).filter((u) => u !== url));
    } else {
      onChange('');
    }
    await removeImage(url);
  }

  // ── Reordenar galería ──────────────────────────────────────────────────
  // dnd-kit dispara esto al soltar. `active` = item arrastrado, `over` =
  // item sobre el que cayó. arrayMove reordena y onChange persiste el
  // nuevo orden en el form (el array se guarda tal cual en la DB → así
  // se muestra en el sitio público).
  function handleReorder(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = urls.indexOf(active.id);
    const newIndex = urls.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(urls, oldIndex, newIndex));
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      {/* Previews de las imágenes actuales.
          - multiple: grid sortable (drag-and-drop para reordenar).
          - single: una sola card, sin sorting. */}
      {urls.length > 0 &&
        (multiple ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleReorder}
          >
            <SortableContext items={urls} strategy={rectSortingStrategy}>
              <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {urls.map((url) => (
                  <SortableThumb
                    key={url}
                    url={url}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="mb-3 grid grid-cols-1 gap-3">
            <Thumb url={urls[0]} onRemove={handleRemove} />
          </ul>
        ))}

      {/* Hint de reorder: solo si hay más de una imagen en la galería. */}
      {multiple && urls.length > 1 && (
        <p className="mb-3 -mt-1 text-xs text-text-muted">
          Arrastrá las imágenes para cambiar el orden en que aparecen.
        </p>
      )}

      {/* Dropzone. En single mode lo escondemos si ya hay una imagen
          (primero hay que quitarla para reemplazar). En multiple siempre
          se muestra para seguir agregando. */}
      {(multiple || urls.length === 0) && (
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
            isDragActive
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-accent/60',
            uploading && 'pointer-events-none opacity-60',
            error && 'border-red-500',
          )}
        >
          {/* input nativo oculto que react-dropzone maneja. */}
          <input {...getInputProps()} />

          {uploading ? (
            <>
              <Loader2
                size={22}
                className="animate-spin text-accent"
                aria-hidden="true"
              />
              <span className="text-sm text-text-muted">Subiendo…</span>
            </>
          ) : (
            <>
              <UploadCloud
                size={22}
                className="text-text-muted"
                aria-hidden="true"
              />
              <span className="text-sm text-text-primary">
                {isDragActive
                  ? 'Soltá la imagen acá'
                  : 'Arrastrá una imagen o hacé click'}
              </span>
              <span className="text-xs text-text-muted">
                JPG, PNG o WebP · máx. 2 MB
              </span>
            </>
          )}
        </div>
      )}

      {/* Error local (upload o archivo rechazado). */}
      {localError && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {localError}
        </p>
      )}

      {/* Error de validación zod (ej. galería requerida). */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Thumb — preview de UNA imagen (presentacional puro).
 *
 * Recibe `ref`/`style` como props normales (React 19 permite pasar `ref`
 * a componentes función sin forwardRef). En modo sortable, SortableThumb
 * le pasa `ref` (nodo a trackear), `style` (transform del drag) y
 * `handleProps` (los listeners que hacen draggable al grip).
 *
 * Props:
 *  - url: string — URL de la imagen.
 *  - onRemove: (url) => void — handler del botón X.
 *  - ref, style: del drag (opcionales; solo en sortable).
 *  - handleProps: props del drag handle (opcional; solo en sortable).
 *  - isDragging: para bajar opacidad del item levantado (opcional).
 */
function Thumb({ url, onRemove, ref, style, handleProps, isDragging }) {
  return (
    <li
      ref={ref}
      style={style}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-bg',
        isDragging && 'opacity-60',
      )}
    >
      {/* aspect-video da una caja consistente sin importar el ratio de la
          imagen. object-cover recorta para llenar. */}
      <img
        src={url}
        alt=""
        className="aspect-video w-full object-cover"
        // Si la URL está rota (404), escondemos la imagen y mostramos el
        // placeholder (el div hermano inmediatamente siguiente).
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.removeAttribute('hidden');
        }}
      />
      <div
        hidden
        className="flex aspect-video w-full items-center justify-center bg-bg-elevated text-text-muted"
      >
        <ImageOff size={20} aria-hidden="true" />
      </div>

      {/* Drag handle (solo si handleProps existe = modo sortable). Los
          listeners van SOLO acá, no en toda la card, para no pelear con
          el botón X. cursor-grab da el feedback visual de "arrastrable". */}
      {handleProps && (
        <button
          type="button"
          {...handleProps}
          aria-label="Reordenar imagen (arrastrá o usá las flechas)"
          className="absolute left-1.5 top-1.5 cursor-grab touch-none rounded-md bg-bg/80 p-1.5 text-text-primary backdrop-blur transition-colors hover:bg-accent hover:text-white active:cursor-grabbing"
        >
          <GripVertical size={14} aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        onClick={() => onRemove(url)}
        aria-label="Quitar imagen"
        className="absolute right-1.5 top-1.5 rounded-md bg-bg/80 p-1.5 text-text-primary backdrop-blur transition-colors hover:bg-red-500 hover:text-white"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </li>
  );
}

/**
 * SortableThumb — envuelve Thumb con useSortable (un thumbnail de la
 * galería que se puede arrastrar). El `id` es la URL (única por el random
 * del nombre de archivo → sirve como key estable para dnd-kit).
 */
function SortableThumb({ url, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  // transform/transition vienen de dnd-kit; los aplicamos al <li> para
  // que la animación de reordenamiento sea fluida. zIndex sube el item
  // levantado por encima del resto mientras se arrastra.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <Thumb
      url={url}
      onRemove={onRemove}
      ref={setNodeRef}
      style={style}
      handleProps={{ ...attributes, ...listeners }}
      isDragging={isDragging}
    />
  );
}
