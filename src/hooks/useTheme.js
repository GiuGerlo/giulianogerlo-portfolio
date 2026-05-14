// `useState` guarda valor local del componente / hook.
// `useEffect` corre código DESPUÉS del render (side effects, IO, DOM, etc).
import { useEffect, useState } from 'react';

// Clave bajo la cual guardamos el tema en localStorage del browser.
// Centralizada como constante para no repetir el string mágico.
const STORAGE_KEY = 'theme';

/**
 * Calcula el tema inicial al montar.
 *
 * Lógica:
 *  1. Si estamos en SSR (no hay window) → 'dark' (default seguro).
 *  2. Si el usuario ya eligió antes → recupera de localStorage.
 *  3. Caso default → 'dark'.
 *
 * Esta función se pasa como argumento a `useState(getInitialTheme)`.
 * IMPORTANTE: se pasa SIN paréntesis. Así React la corre UNA sola vez
 * al montar (lazy init). Si la pasaras como `useState(getInitialTheme())`
 * la ejecutarías en cada render → desperdicio.
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  return 'dark';
}

/**
 * Custom hook para gestionar el tema dark/light.
 *
 * Un "custom hook" es solo una función cuyo nombre empieza con `use` y
 * que adentro usa otros hooks. Permite REUTILIZAR lógica con hooks entre
 * componentes (cualquiera puede llamar `const { theme, toggle } = useTheme()`).
 *
 * @returns {{ theme: 'dark'|'light', toggle: () => void }}
 */
export function useTheme() {
  // Estado local. La función se pasa por referencia para lazy init.
  const [theme, setTheme] = useState(getInitialTheme);

  /**
   * Sincroniza el tema con el "mundo exterior" (DOM + localStorage).
   *
   * `useEffect` corre DESPUÉS del render. El array `[theme]` le dice a React:
   * "corré este effect tras el primer render, y cada vez que `theme` cambie".
   *  - [] vacío → corre solo al montar.
   *  - sin array → corre en cada render (mal, casi nunca querés esto).
   */
  useEffect(() => {
    // Setea el atributo en <html> → activa la variante `dark:` de Tailwind
    // y aplica las CSS vars correspondientes en index.css.
    document.documentElement.setAttribute('data-theme', theme);
    // Persiste la elección → al recargar, getInitialTheme la recupera.
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  /**
   * Toggle: alterna entre 'dark' y 'light'.
   *
   * Usamos el "functional updater" `setTheme((t) => ...)` en vez de
   * `setTheme(theme === 'dark' ? 'light' : 'dark')` para garantizar que
   * leemos el valor MÁS RECIENTE (no el del closure de cuando se creó).
   * Importante si se llamara varias veces seguidas.
   */
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
