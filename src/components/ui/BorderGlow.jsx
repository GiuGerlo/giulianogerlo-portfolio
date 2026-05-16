// BorderGlow — card con borde mesh-gradient + glow direccional que
// sigue al cursor cerca de los bordes (reactbits.dev, variante JS+CSS).
//
// La lógica visual vive casi toda en BorderGlow.css. Este componente
// solo:
//  1. Calcula, en cada pointermove, qué tan cerca del borde está el
//     cursor (--edge-proximity) y en qué ángulo (--cursor-angle).
//  2. Escribe esas dos CSS vars en el nodo → el CSS hace el resto.
//
// Defaults tuneados para ESTE proyecto: verde de marca + fondo que
// sigue el theme (var(--bg-elevated)). El componente original de
// reactbits venía con una paleta violeta/rosa/celeste.

import { useRef, useCallback, useEffect } from 'react';
import './BorderGlow.css';

// parseHSL — extrae {h, s, l} de un string "H S L" (ej. "147 69 55").
function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

// buildGlowVars — genera las 7 CSS vars del glow (misma tinta, distintas
// opacidades) que el box-shadow del CSS espera. `intensity` multiplica.
function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(
      opacities[i] * intensity,
      100,
    )}%)`;
  }
  return vars;
}

// Posiciones fijas de los 7 radial-gradients del mesh. COLOR_MAP dice
// qué color (0/1/2 del array `colors`) usa cada posición.
const GRADIENT_POSITIONS = [
  '80% 55%',
  '69% 34%',
  '8% 6%',
  '41% 38%',
  '86% 85%',
  '82% 18%',
  '51% 4%',
];
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

// buildGradientVars — arma las 7 CSS vars de radial-gradient + la base,
// distribuyendo los 3 colores del array según COLOR_MAP.
function buildGradientVars(colors) {
  const vars = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] =
      `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

// Easings para la animación de intro (solo si animated=true).
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInCubic(x) {
  return x * x * x;
}

// animateValue — tween genérico sobre requestAnimationFrame. Llama
// onUpdate(valor) cada frame entre start y end durante `duration` ms.
function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

/**
 * BorderGlow — wrapper de card con efecto glow.
 *
 * @param {ReactNode} children          Contenido de la card.
 * @param {string}    className         Clases extra para el wrapper.
 * @param {number}    edgeSensitivity   Cuán cerca del borde aparece el glow (0-100).
 * @param {string}    glowColor         Color del glow en HSL "H S L".
 * @param {string}    backgroundColor   Fondo de la card (acepta var() de CSS).
 * @param {number}    borderRadius      Radio de las esquinas en px.
 * @param {number}    glowRadius        Cuánto se extiende el glow afuera de la card.
 * @param {number}    glowIntensity     Multiplicador de opacidad del glow.
 * @param {number}    coneSpread        Ancho del cono direccional (%).
 * @param {boolean}   animated          Animación de barrido al montar.
 * @param {string[]}  colors            3 hex para el degradé mesh del borde.
 * @param {number}    fillOpacity       Opacidad del relleno mesh interno.
 */
export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '147 69 55', // verde de marca (#3ddc84 en HSL)
  backgroundColor = 'var(--bg-elevated)',
  borderRadius = 14,
  glowRadius = 36,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#3ddc84', '#06a352', '#04773b'], // verde claro → medio → oscuro
  fillOpacity = 0.5,
}) {
  // ref del nodo card. Necesitamos el DOM real para leer geometría
  // (getBoundingClientRect) y escribir CSS vars.
  const cardRef = useRef(null);

  // Throttle del pointermove: el mouse dispara el evento muchas veces
  // por frame. Guardamos la última posición y agendamos UN solo
  // requestAnimationFrame — así el cálculo (que incluye un
  // getBoundingClientRect, que fuerza reflow) corre máximo una vez por
  // frame, no una vez por evento.
  const moveFrame = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Centro del elemento (mitad de width/height).
  const getCenterOfElement = useCallback((el) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  // Proximidad al borde: 0 = centro, 1 = pegado al borde.
  const getEdgeProximity = useCallback(
    (el, x, y) => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    },
    [getCenterOfElement],
  );

  // Ángulo del cursor respecto al centro (en grados, 0 = arriba).
  const getCursorAngle = useCallback(
    (el, x, y) => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      if (dx === 0 && dy === 0) return 0;
      const radians = Math.atan2(dy, dx);
      let degrees = radians * (180 / Math.PI) + 90;
      if (degrees < 0) degrees += 360;
      return degrees;
    },
    [getCenterOfElement],
  );

  // Handler de pointermove: traduce la posición del cursor a las dos
  // CSS vars que consume BorderGlow.css. Throttleado a 1 cálculo/frame.
  const handlePointerMove = useCallback(
    (e) => {
      // Guardamos siempre la última posición del cursor.
      lastPointer.current = { x: e.clientX, y: e.clientY };

      // Si ya hay un frame agendado, no agendamos otro: cuando corra,
      // usará la posición más reciente que dejamos arriba.
      if (moveFrame.current) return;

      moveFrame.current = requestAnimationFrame(() => {
        moveFrame.current = 0;
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = lastPointer.current.x - rect.left;
        const y = lastPointer.current.y - rect.top;

        const edge = getEdgeProximity(card, x, y);
        const angle = getCursorAngle(card, x, y);

        card.style.setProperty(
          '--edge-proximity',
          `${(edge * 100).toFixed(3)}`,
        );
        card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
      });
    },
    [getEdgeProximity, getCursorAngle],
  );

  // Cleanup: cancelar el rAF pendiente si la card se desmonta con un
  // frame en cola (evita que corra sobre un nodo ya removido).
  useEffect(() => {
    return () => {
      if (moveFrame.current) cancelAnimationFrame(moveFrame.current);
    };
  }, []);

  // Animación de intro opcional: un barrido del glow alrededor del
  // borde al montar. Solo corre si `animated` es true.
  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    animateValue({
      duration: 500,
      onUpdate: (v) => card.style.setProperty('--edge-proximity', v),
    });
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (v) => {
        card.style.setProperty(
          '--cursor-angle',
          `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
        );
      },
    });
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (v) => {
        card.style.setProperty(
          '--cursor-angle',
          `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
        );
      },
    });
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (v) => card.style.setProperty('--edge-proximity', v),
      onEnd: () => card.classList.remove('sweep-active'),
    });
  }, [animated]);

  const glowVars = buildGlowVars(glowColor, glowIntensity);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...glowVars,
        ...buildGradientVars(colors),
      }}
    >
      {/* Capa del glow externo. El CSS la posiciona con inset negativo. */}
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
