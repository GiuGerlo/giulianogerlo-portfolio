import { cn } from '../../lib/cn.js';

/**
 * Input — input de texto compartido del sitio.
 *
 * Props propias:
 *  - label    → texto del <label>. Si se pasa, se renderiza el label
 *               linkeado al input vía htmlFor/id (a11y).
 *  - error    → mensaje de error a mostrar debajo del input. Si existe,
 *               el border del input cambia a rojo y se muestra el texto.
 *  - id       → id del input. Auto-generado si no se pasa (necesario
 *               para que label htmlFor matchee).
 *
 * Resto de props (type, placeholder, value, onChange, name, required,
 * autoComplete, etc.) se reenvían al <input> nativo vía spread.
 *
 * type default 'text' — para email/password el caller pasa `type="email"`.
 */

// Counter para IDs auto-generados. Funciona porque el módulo se evalúa
// 1 vez. Si en SSR esto traería problemas de hidratación, se cambiaría
// a useId() de React 18+ — para nuestro caso (SPA Vite) es suficiente.
let autoIdCounter = 0;

export default function Input({
  label,
  error,
  id,
  className,
  type = 'text',
  ...rest
}) {
  // Si el caller no pasó id, generamos uno. Necesario para el htmlFor
  // del <label> (sin esto, click en label no enfocaría el input).
  const inputId = id ?? `input-${++autoIdCounter}`;

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

      <input
        id={inputId}
        type={type}
        {...rest}
        className={cn(
          'w-full rounded-md border bg-bg px-3.5 py-2.5 text-sm text-text-primary transition-colors focus:outline-none',
          // Border rojo si hay error, gris default si no, accent en focus.
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-border focus:border-accent',
          className,
        )}
        // a11y: vincula el mensaje de error al input para screen readers.
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-xs text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
