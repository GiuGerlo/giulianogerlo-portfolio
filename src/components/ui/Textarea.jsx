import { cn } from '../../lib/cn.js';

/**
 * Textarea — textarea multilinea compartido del sitio.
 *
 * Misma API que <Input>: label + error + id auto + spread props nativas.
 * Difiere en altura mínima (120px) y `resize: vertical` (el usuario
 * puede agrandar verticalmente pero no horizontal, evita romper layout).
 *
 * Diseñado para el form de contacto (Phase 7) — campo mensaje.
 */

let autoIdCounter = 0;

export default function Textarea({
  label,
  error,
  id,
  className,
  rows = 5,
  ...rest
}) {
  const textareaId = id ?? `textarea-${++autoIdCounter}`;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        {...rest}
        className={cn(
          // min-h-[120px] + resize-y replica el comportamiento del mockup.
          'min-h-[120px] w-full resize-y rounded-md border bg-bg px-3.5 py-2.5 text-sm text-text-primary transition-colors focus:outline-none',
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-border focus:border-accent',
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${textareaId}-error` : undefined}
      />

      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1.5 text-xs text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
