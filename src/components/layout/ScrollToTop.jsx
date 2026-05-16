import { useEffect } from 'react';
// useLocation devuelve el objeto de ubicación actual de React Router.
import { useLocation } from 'react-router-dom';
import { lenisScrollTo } from '../../hooks/useLenis.js';

/**
 * ScrollToTop — sube el scroll al tope cada vez que cambia la ruta.
 *
 * Problema que resuelve: en una SPA el navegador NO resetea el scroll
 * al "cambiar de página" (no hay recarga real). Si hacés click en una
 * card de la sección Proyectos —que está abajo en el Home— y navegás
 * al detalle, la página nueva aparece scrolleada igual de abajo. Este
 * componente escucha el cambio de `pathname` y manda el scroll a (0,0).
 *
 * No renderiza nada (`return null`) — es solo un efecto. Va dentro del
 * Router (en Layout) para tener acceso a useLocation.
 */
export default function ScrollToTop() {
  // Solo nos interesa `pathname`: cambia cuando navegás a otra ruta.
  const { pathname } = useLocation();

  // Effect: cada vez que pathname cambia, scrolleamos al tope.
  // `immediate: true` → salto instantáneo (sin animación de inercia):
  // al cambiar de página querés aparecer arriba, no ver el scroll
  // deslizarse. lenisScrollTo cae a window.scrollTo si Lenis no está.
  useEffect(() => {
    lenisScrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
