import { cn } from '../../lib/cn.js';

/**
 * Chip — pill / badge chico usado en about y en cards.
 *
 * Variantes:
 *  - 'default' → fondo elevated, border, texto muted (chip neutro)
 *  - 'dot'     → variante con punto verde adelante. Para señalar estado
 *                activo: "● Disponible para proyectos".
 *
 * Diseñado para tags chicos. Para tags de stack en proyectos (skill-tag
 * del mockup) probablemente vamos a hacer otro componente en Phase 4
 * porque el styling difiere lo suficiente.
 */

const variants = {
  default: 'bg-bg-elevated border-border text-text-muted',
  dot: 'bg-bg-elevated border-border text-text-muted',
};

export default function Chip({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        // Base: pill mono pequeño, padding chico, border redondeado.
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs',
        variants[variant],
        className,
      )}
    >
      {/* El punto va antes del texto, color accent. Solo en variant 'dot'. */}
      {variant === 'dot' && (
        <span aria-hidden="true" className="text-accent">
          ●
        </span>
      )}
      {children}
    </span>
  );
}
