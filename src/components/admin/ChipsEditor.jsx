import { useId, useState } from 'react';
import { X, Plus } from 'lucide-react';

import { cn } from '../../lib/cn.js';

/**
 * ChipsEditor — editor para arrays de strings (stack, gallery, etc).
 *
 * Props (controlado):
 *  - value: string[] — el array actual.
 *  - onChange: (next: string[]) => void — handler cuando cambia el array.
 *  - label: string — label arriba del editor.
 *  - placeholder: string — texto del input "agregar nuevo".
 *  - error: string | undefined — mensaje de validación.
 *  - suggestions: string[] — opcional, valores que el browser sugiere
 *    via <datalist> mientras el usuario tipea (autocomplete nativo).
 *    Útil para Stack: muestra techs ya usadas en otros proyectos.
 *
 * UI:
 *  - Lista de chips con el valor + botón X para borrar c/u.
 *  - Input + botón "+" para agregar uno nuevo.
 *  - Enter en el input también agrega (UX común en chip editors).
 *
 * Patrón "controlled" puro: el componente NO mantiene el array, solo
 * el draft del input que se está tipeando. El array vive en el parent
 * (react-hook-form via Controller), garantizando una sola fuente de verdad.
 */
export default function ChipsEditor({
  value = [],
  onChange,
  label,
  placeholder = 'Agregar…',
  error,
  suggestions = [],
}) {
  // useId genera un id único estable para vincular <input list> con
  // <datalist id>. Sin esto, dos ChipsEditor en la misma página
  // compartirían el datalist.
  const datalistId = useId();
  // Estado SOLO del input "agregar nuevo". El array de chips lo controla
  // el parent vía onChange.
  const [draft, setDraft] = useState('');

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

  function remove(index) {
    // filter por índice (en vez de por valor) — soporta strings iguales
    // si en algún momento permitimos duplicados.
    onChange(value.filter((_, i) => i !== index));
  }

  // Enter agrega el chip. preventDefault evita que el form-parent haga submit.
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      {/* Lista de chips actuales. Si está vacío, no renderiza la línea
          de chips para que el input quede más cerca del label. */}
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((chip, i) => (
            <li
              key={`${chip}-${i}`}
              className="inline-flex items-center gap-1 rounded border border-border bg-bg-elevated px-2 py-1 font-mono text-[11px] text-text-muted"
            >
              <span className="break-all">{chip}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Quitar ${chip}`}
                className="rounded p-0.5 transition-colors hover:bg-red-500/20 hover:text-red-500"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Input + botón + de agregar. */}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          // Conecta el input al datalist (si hay suggestions). El browser
          // muestra las opciones que matchean lo tipeado.
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

      {/* Datalist con las sugerencias. Excluimos los valores que ya
          están en `value` (no tiene sentido sugerir un chip que ya
          existe en este proyecto). */}
      {suggestions.length > 0 && (
        <datalist id={datalistId}>
          {suggestions
            .filter(
              (s) =>
                !value.some((v) => v.toLowerCase() === s.toLowerCase()),
            )
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
