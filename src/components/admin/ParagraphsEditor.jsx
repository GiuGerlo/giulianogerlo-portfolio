import { X, Plus, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * ParagraphsEditor — editor para arrays de textos LARGOS (challenges).
 *
 * Por qué un editor distinto a ChipsEditor:
 *  - Los "challenges" son párrafos enteros (2-5 líneas), no labels cortos.
 *    Un chip con un párrafo se rompe visualmente.
 *  - Acá cada item es un <Textarea /> aparte con botones de reorder
 *    (arriba/abajo) y borrar.
 *
 * Props (controlado):
 *  - value: string[] — array actual.
 *  - onChange: (next: string[]) => void
 *  - label, placeholder, error: igual que ChipsEditor.
 *
 * Acciones por item:
 *  - Editar inline (cada textarea actualiza onChange).
 *  - Subir/bajar posición.
 *  - Borrar.
 *
 * Agregar nuevo: botón "+ Agregar desafío" al final que appendea un
 * string vacío. El textarea aparece listo para escribir.
 */
export default function ParagraphsEditor({
  value = [],
  onChange,
  label,
  placeholder = 'Describí el desafío…',
  error,
}) {
  function update(index, newText) {
    onChange(value.map((v, i) => (i === index ? newText : v)));
  }

  function remove(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= value.length) return;
    const next = [...value];
    // Swap clásico via destructuring assignment.
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  }

  function append() {
    onChange([...value, '']);
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      <ul className="mb-2 flex flex-col gap-2">
        {value.map((text, i) => (
          <li
            key={i}
            className="rounded-md border border-border bg-bg-elevated p-2"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase text-text-muted">
                #{i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                  className="rounded p-1 text-text-muted transition-colors hover:bg-bg hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowUp size={12} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label="Bajar"
                  className="rounded p-1 text-text-muted transition-colors hover:bg-bg hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowDown size={12} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Borrar desafío"
                  className="rounded p-1 text-text-muted transition-colors hover:bg-red-500/20 hover:text-red-500"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Textarea raw (no usamos el primitive ui/Textarea porque
                ese mete mb-4 + label propio; acá vivimos dentro de una
                fila chiquita y queremos cero spacing extra). */}
            <textarea
              value={text}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="min-h-[80px] w-full resize-y rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none"
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={append}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <Plus size={14} aria-hidden="true" />
        Agregar
      </button>

      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
