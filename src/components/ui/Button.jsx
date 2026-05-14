import { cn } from '../../lib/cn.js';

/**
 * Button — primitive UI compartido para botones del sitio.
 *
 * 3 variantes visuales:
 *  - 'primary'   → fondo verde accent, texto blanco (CTAs principales)
 *  - 'secondary' → border + texto, hover invierte (acciones secundarias)
 *  - 'ghost'     → solo texto muted con hover accent (terciario / nav)
 *
 * Props extra (onClick, type, disabled, aria-label, etc.) se reenvían
 * al <button> nativo vía spread `{...rest}`. Esto evita tener que
 * declarar cada prop manualmente y mantiene el componente delgado.
 *
 * El prop `className` permite al caller agregar/overrideear clases.
 * Va al final del cn() para ganarle a las default (twMerge resuelve
 * conflictos de utilities Tailwind tipo "px-2 px-4" → "px-4").
 */

// Mapa variant → clases Tailwind. Fuera del componente para que no se
// recree en cada render (microoptimización + lectura más limpia).
const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(4,119,59,0.3)]',
  secondary:
    'border border-border text-text-primary hover:border-accent hover:text-accent',
  ghost: 'text-text-muted hover:text-accent',
};

export default function Button({
  variant = 'primary',
  className,
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        // Clases base — aplican a todas las variantes.
        'inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all',
        // Clases específicas de la variante elegida.
        variants[variant],
        // Estilo disabled: bajamos opacidad, cursor "prohibido", y
        // neutralizamos hover (sin esto, el hover seguía aplicando
        // shadow/cambio de color sobre un botón inactivo).
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent disabled:hover:shadow-none disabled:hover:border-border disabled:hover:text-text-primary',
        // Override del caller (puede ser undefined; cn() lo ignora).
        className,
      )}
    >
      {children}
    </button>
  );
}
