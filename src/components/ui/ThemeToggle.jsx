// Lucide-react exporta cada ícono como un componente React independiente.
// Importamos SOLO los que usamos → tree-shaking elimina el resto del bundle.
import { Moon, Sun } from 'lucide-react';

// Hook custom propio: encapsula la lógica de leer/escribir el tema.
import { useTheme } from '../../hooks/useTheme.js';

/**
 * Botón pequeño que alterna entre dark y light.
 *
 * Detalles UX:
 *  - El ícono representa "lo que pasarás a ser al clickear", NO el estado
 *    actual. Si estás en dark mostramos un Sol (click → light). Si estás
 *    en light mostramos una Luna (click → dark). Convención común y más
 *    intuitiva que mostrar el estado actual.
 *  - aria-label + title → accesibilidad: el screen reader lo lee, y al
 *    hacer hover aparece tooltip nativo del browser.
 */
export default function ThemeToggle() {
  // Destructuramos el return del hook: theme (string) + toggle (función).
  const { theme, toggle } = useTheme();

  // "Component as variable": Icon es la REFERENCIA al componente.
  // Después lo renderizamos con <Icon ... /> abajo. Patrón muy útil
  // para elegir cuál componente mostrar según un estado.
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      title="Cambiar tema"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-primary transition-colors hover:border-accent hover:text-accent"
    >
      <Icon size={16} />
    </button>
  );
}
