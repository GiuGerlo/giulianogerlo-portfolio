import { useEffect } from 'react';
import Lenis from 'lenis';
// CSS recomendado por Lenis (ajustes de height/scroll-behavior para que
// el scroll suave funcione bien). Vite lo bundlea como cualquier CSS.
import 'lenis/dist/lenis.css';

/**
 * useLenis — activa scroll suave global con la librería Lenis.
 *
 * Lenis "intercepta" el scroll nativo (rueda del mouse, touch) y lo
 * interpola: en vez de saltar de golpe, el scroll se desliza con
 * inercia. Mejora la sensación al recorrer el sitio.
 *
 * Cómo funciona:
 *  - `new Lenis()` engancha los listeners de scroll.
 *  - Lenis necesita un "tick" por frame: lo alimentamos con un loop de
 *    requestAnimationFrame que llama `lenis.raf(time)`.
 *  - Cleanup: se cancela el loop y se destruye la instancia.
 *
 * prefers-reduced-motion: si el usuario pidió "reducir movimiento", NO
 * activamos Lenis — queda el scroll nativo. El guard `typeof` es por
 * jsdom (tests): no implementa matchMedia.
 *
 * Se llama una sola vez, en Layout (envuelve todas las páginas).
 */

// Instancia activa de Lenis, a nivel módulo. Sirve para que helpers
// que NO son componentes React (ej. el scrollToSection del Hero)
// puedan pedirle a Lenis que scrollee. Es null si Lenis no está
// montado (reduced-motion, o antes del primer render).
let lenisInstance = null;

/**
 * lenisScrollTo — scrollea a un destino usando Lenis si está activo.
 *
 * @param {string|number|HTMLElement} target  Selector ('#projects'),
 *        offset en px (0), o un elemento.
 * @param {object} [options]  Opciones de Lenis.scrollTo (ej. { immediate: true }).
 *
 * Si Lenis no está montado, cae a scroll nativo equivalente — así el
 * sitio sigue funcionando con prefers-reduced-motion activo.
 */
export function lenisScrollTo(target, options) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, options);
    return;
  }

  // Fallback sin Lenis.
  if (typeof target === 'number') {
    window.scrollTo(0, target);
    return;
  }
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function useLenis() {
  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const lenis = new Lenis();
    lenisInstance = lenis;

    // Loop de animación. Guardamos el id para poder cancelarlo.
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
