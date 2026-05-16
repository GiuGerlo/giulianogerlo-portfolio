// `motion/react` es la API de la librería Motion (ex Framer Motion).
// `motion.div` es un <div> normal pero "animable" — acepta props como
// `initial`, `whileInView`, `transition`.
import { motion } from 'motion/react';

/**
 * Reveal — wrapper que hace aparecer su contenido con un fade + subida
 * suave cuando entra en pantalla al scrollear.
 *
 * Props de Motion que usamos:
 *  - `initial`      → estado ANTES de animar (invisible, 24px más abajo).
 *  - `whileInView`  → estado AL entrar en el viewport (visible, en su lugar).
 *  - `viewport`     → cuándo se considera "en vista":
 *      · once: true       → anima una sola vez (no se repite al volver).
 *      · margin: '-100px' → dispara 100px ANTES de que toque el borde,
 *                            así la animación arranca un toque antes.
 *  - `transition`   → duración + delay + curva de easing.
 *
 * `delay` permite escalonar (stagger) varias cards: si renderizás una
 * lista, pasale `delay={i * 0.06}` y van apareciendo una atrás de otra.
 *
 * `className` se reenvía al motion.div — útil cuando el Reveal es un
 * grid item y necesita, por ejemplo, `h-full` para estirarse.
 *
 * Reduced motion: Motion respeta `prefers-reduced-motion` del SO de
 * fábrica — si el usuario lo tiene activo, no anima.
 */
export default function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
