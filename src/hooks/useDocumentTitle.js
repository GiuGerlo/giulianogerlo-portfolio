// `useEffect` corre código DESPUÉS del render (side effects sobre el
// "mundo exterior" — acá, el <title> del documento).
import { useEffect } from 'react';

// Título por defecto del sitio — el mismo que está hardcodeado en
// index.html. Cuando una página que seteó su propio título se desmonta,
// restauramos a este valor para no dejar un título "pegado" de la
// página anterior.
const DEFAULT_TITLE = 'Giuliano Gerlo — Full-Stack Developer';

/**
 * useDocumentTitle — custom hook que setea el `document.title` de la
 * página y lo restaura al default cuando el componente se desmonta.
 *
 * Por qué hace falta: este portfolio es una SPA (single-page app). El
 * browser carga el HTML UNA vez; React cambia el contenido sin recargar.
 * El `<title>` de index.html queda fijo salvo que alguien lo cambie por
 * JS. Este hook le da a cada página la responsabilidad de su propio
 * título (relevante para SEO, para la pestaña del browser y para el
 * historial).
 *
 * @param {string|null|undefined} title - Título a setear. Si es falsy
 *   (null/'' /undefined), el hook NO toca el título — útil para casos
 *   donde el dato todavía no está listo (ej. ProjectDetail antes de
 *   resolver el proyecto).
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    // Sin título → no hacemos nada (ni seteamos ni restauramos).
    if (!title) return;

    document.title = title;

    // Cleanup: corre al desmontar el componente (o antes de re-correr
    // el effect si `title` cambia). Restaura el default para que la
    // próxima página no herede este título.
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
