import { useRef, useLayoutEffect } from 'react';
// Anime.js v4 — `animate` corre la animación; `stagger` genera un delay
// escalonado (cada elemento arranca un poco después del anterior).
import { animate, stagger } from 'animejs';

/**
 * AnimatedName — renderiza un texto y, al montar, hace entrar cada
 * carácter en cascada: cada letra aparece con un fade + una subida
 * corta, una atrás de otra (efecto "typewriter" / stagger de chars).
 *
 * Cómo funciona:
 *  1. El texto se parte en caracteres; cada uno va en su propio <span>
 *     `inline-block` (las transforms tipo translateY NO aplican a
 *     elementos inline puros — necesitan inline-block o block).
 *  2. En `useLayoutEffect` (corre ANTES del paint → sin parpadeo)
 *     llamamos `animate(...)` sobre todos los chars. Anime aplica el
 *     primer keyframe (opacity 0) de una, así no se ve el texto
 *     "completo" un frame antes de animar.
 *  3. `delay: stagger(45)` → cada char arranca 45ms después del previo.
 *
 * Accesibilidad:
 *  - El <span> contenedor lleva `aria-label` con el texto completo, y
 *    cada char va `aria-hidden`. Así el lector de pantalla lee
 *    "Giuliano Gerlo" de corrido, no letra por letra.
 *
 * prefers-reduced-motion:
 *  - Si el usuario lo tiene activo, NO animamos: los chars se
 *    renderizan visibles tal cual (no seteamos opacity:0 en CSS, así
 *    que sin anime el texto simplemente se ve). El guard `typeof` es
 *    por jsdom (tests): no implementa matchMedia.
 *
 * Props:
 *  - text       → string a animar.
 *  - className  → clases para el <span> contenedor.
 */
export default function AnimatedName({ text, className }) {
  // ref del <span> contenedor — desde ahí buscamos los chars.
  const ref = useRef(null);

  useLayoutEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const chars = ref.current?.querySelectorAll('[data-char]');
    if (!chars || chars.length === 0) return;

    const animation = animate(chars, {
      opacity: [0, 1],
      translateY: ['0.45em', '0em'],
      duration: 700,
      delay: stagger(45),
      ease: 'out(3)',
    });

    // Cleanup: si el componente se desmonta a mitad de animación,
    // la cancelamos para no dejar un loop colgado.
    return () => animation.cancel?.();
  }, [text]);

  return (
    <span ref={ref} aria-label={text} className={className}>
      {text.split('').map((char, index) => (
        <span
          // El índice como key es seguro: la lista de chars es estática
          // (no se reordena ni filtra).
          key={index}
          data-char
          aria-hidden="true"
          // inline-block → habilita translateY. whitespace-pre →
          // preserva el ancho del carácter espacio.
          className="inline-block whitespace-pre"
        >
          {char}
        </span>
      ))}
    </span>
  );
}
