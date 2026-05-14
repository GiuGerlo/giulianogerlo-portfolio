// `clsx` toma cualquier combinación de strings, arrays, objetos { 'clase': bool }
// y devuelve un string de clases. Maneja condicionales sin if/else en JSX.
import { clsx } from 'clsx';

// `tailwind-merge` resuelve conflictos de clases Tailwind: si pasás
// "px-2 px-4", el output final es "px-4" (la última gana). Sin él,
// quedarían las dos en el HTML y el navegador aplicaría la de mayor
// especificidad, que en Tailwind v4 puede ser impredecible.
import { twMerge } from 'tailwind-merge';

/**
 * cn() — combinador de clases CSS para componentes Tailwind.
 *
 * Uso típico:
 *   cn('base', condicional && 'extra', props.className)
 *
 * Pipeline:
 *   1. clsx aplana inputs heterogéneos a string plano
 *   2. twMerge dedupea/resuelve conflictos de utilities Tailwind
 *
 * Esto permite que un componente tenga clases default y que el caller
 * pueda overrideearlas via prop `className` sin pisarse con las default.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
