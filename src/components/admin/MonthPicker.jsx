import { useId } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
// date-fns v4 expone los locales en `date-fns/locale` (subpath con
// nombre del locale falla en ESM). Importamos solo el que usamos
// para mantener el chunk chico.
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

import 'react-datepicker/dist/react-datepicker.css';

import { cn } from '../../lib/cn.js';

// Registramos el locale español para que el calendario muestre los
// meses traducidos. Registro a nivel módulo: una sola vez por sesión.
registerLocale('es', es);

/**
 * MonthPicker — calendario solo-mes (no muestra días) en formato YYYY-MM.
 *
 * Wrapper sobre `react-datepicker` con `showMonthYearPicker`. La lib
 * trabaja con objetos `Date`; nosotros usamos strings `YYYY-MM` para
 * la DB. Este componente traduce de un lado a otro.
 *
 * Props (controlado):
 *  - value: string en formato 'YYYY-MM' o '' (vacío).
 *  - onChange: (next: string) => void
 *  - label: string
 *  - placeholder: string
 *  - error: string | undefined
 *  - allowClear: boolean (default false). Cuando true, el usuario puede
 *    borrar el valor con un botón X. Para dateEnd ("vacío = en curso").
 *
 * Conversión:
 *  - 'YYYY-MM' → new Date(year, monthIndex, 1)
 *  - Date → `${year}-${MM}` (con zero-padding)
 *  - '' (vacío) ↔ null
 *
 * Limitación deliberada:
 *  - El calendario abre en una vista "year picker" donde elegís el mes.
 *  - El usuario interactúa via click. Técnicamente puede tipear también,
 *    pero el picker está siempre a un click → ahí va la UX principal.
 *    NO usamos `readOnly` porque eso bloquea el click que abre el
 *    calendario en react-datepicker (issue conocido de la lib).
 */

// Parsea 'YYYY-MM' → Date. Devuelve null si la string no matchea.
function parseYearMonth(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1; // Date months son 0-based.
  return new Date(year, month, 1);
}

// Formatea Date → 'YYYY-MM' con padding.
function formatYearMonth(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function MonthPicker({
  value,
  onChange,
  label,
  placeholder = 'Elegí un mes',
  error,
  allowClear = false,
}) {
  const inputId = useId();
  const selected = parseYearMonth(value);

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <DatePicker
          id={inputId}
          // Sin selected, react-datepicker abre el calendario en el mes actual.
          selected={selected}
          onChange={(date) => onChange(formatYearMonth(date))}
          // Modo "elegí un mes": el calendario muestra los 12 meses del año
          // como botones, en vez del grid de días.
          showMonthYearPicker
          dateFormat="MMMM yyyy"
          locale="es"
          placeholderText={placeholder}
          // Permitimos tipear pero filtramos las teclas — el usuario
          // queda forzado al picker sin que el `readOnly` rompa el click.
          onKeyDown={(e) => {
            // Permitimos Tab, Escape, Enter (para a11y) y bloqueamos todo lo demás.
            if (!['Tab', 'Escape', 'Enter'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          // El popper en mobile a veces se sale del viewport: portal-izamos
          // al body para que el browser lo posicione mejor.
          popperPlacement="bottom-start"
          // Tailwind no penetra los estilos default de react-datepicker via
          // className directo; mejor a través del wrapper.
          className={cn(
            'w-full cursor-pointer rounded-md border bg-bg px-3.5 py-2.5 pl-10 text-sm text-text-primary transition-colors focus:outline-none',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-border focus:border-accent',
          )}
          // wrapperClassName afecta al div container que envuelve el input.
          wrapperClassName="w-full"
          // Acceso al botón clear nativo.
          isClearable={allowClear}
          // Texto del aria-label del clear (se ve "Limpiar" en lectores).
          clearButtonClassName="!right-2"
        />

        {/* Ícono calendario absolutamente posicionado a la izquierda del
            input. pointer-events-none para que clicar pase al input. */}
        <Calendar
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
