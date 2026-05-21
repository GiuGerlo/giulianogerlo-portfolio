// `motion/react` es la API de la librería Motion (ex Framer Motion).
// LazyMotion + m (en vez de motion) baja ~30kb del bundle: en lugar de
// importar TODAS las features de animación de fábrica, cargamos solo
// las DOM (`domAnimation`) y el componente reducido `m`. Tree-shaking
// efectivo: el bundle final solo trae la animación que realmente usamos.
//   `m.div`        → equivalente a `motion.div` pero "lite".
//   `LazyMotion`   → provee las features al árbol que envuelve.
//   `domAnimation` → set de features para animar nodos DOM (sin layout
//                    animations ni drag — que no usamos en Reveal).
import { LazyMotion, domAnimation, m } from 'motion/react';

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
    // LazyMotion `strict` no — varios Reveal en el árbol comparten el
    // mismo set de features (idempotente). Para optimizar más, se puede
    // subir LazyMotion al root (App.jsx) y dejar solo <m.div> acá.
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
