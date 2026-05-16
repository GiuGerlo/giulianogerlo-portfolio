import { MapPin } from 'lucide-react';

import { useTheme } from '../../hooks/useTheme.js';
import Button from '../ui/Button.jsx';
import Plasma from '../ui/Plasma.jsx';

/**
 * Hero — primera sección de la home. Saludo + CTAs sobre fondo animado.
 *
 * Composición:
 *  - Fondo: <Plasma /> WebGL — shader plasma procedural animado,
 *    tintado con el verde de marca.
 *  - Overlay semi-transparente encima del plasma para que el fondo
 *    no compita con el texto.
 *  - Contenido: "$ whoami" + h1 + rol + ubicación + 2 CTAs.
 *
 * Los CTAs hacen scroll suave a las secciones objetivo. En Phase 6.2
 * vamos a sumar Lenis para smooth scroll global; por ahora basta con
 * scrollIntoView nativo con behavior: 'smooth'.
 */

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function Hero() {
  // Tomamos el theme solo para tunear la opacidad del overlay. El
  // plasma verde se ve bien en ambos themes; lo que cambia es cuánto
  // lo atenuamos para que el texto contraste:
  //  - dark: overlay sutil (55%), el plasma se nota más.
  //  - light: overlay más opaco (80%) para que el verde no compita
  //    con el texto oscuro sobre fondo claro.
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const overlayClass = isDark ? 'bg-bg/55' : 'bg-bg/80';

  return (
    <section
      id="hero"
      className="relative overflow-hidden px-4 py-24 text-center md:py-32"
    >
      {/* Fondo WebGL — cubre toda la sección (inset-0 = top/right/
          bottom/left:0). z-0 para que quede DETRÁS del contenido.
          aria-hidden porque es decoración pura. */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        {/* Plasma tintado con el verde de marca (#06a352, la variante
            brillante del accent — el #04773b base queda muy oscuro
            para un fondo). mouseInteractive en false: el plasma está
            detrás del contenido (z-20), el mouse nunca lo alcanza, así
            que activarlo solo gastaría un listener al pedo. */}
        <Plasma
          color="#06a352"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={0.8}
          mouseInteractive={false}
        />
      </div>

      {/* Overlay encima del plasma. Baja el brillo del fondo para que
          el texto contraste. Opacity ajustada por theme. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-[1] ${overlayClass}`}
      />

      {/* Fade inferior — degradé de transparente al color de fondo.
          Sin esto el plasma termina en una línea horizontal dura
          contra la sección siguiente; el fade lo funde de forma
          suave. h-40 cubre la franja inferior del Hero. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-b from-transparent to-bg"
      />

      {/* Container con z-20 — queda por encima del veil y del overlay. */}
      <div className="relative z-20 mx-auto max-w-[900px]">
        <div className="mb-6 font-mono text-sm text-accent">$ whoami</div>

        {/* clamp(min, vw, max) para escalado fluido entre mobile y
            desktop sin breakpoints intermedios. */}
        <h1 className="mb-5 text-[clamp(2.5rem,8vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
          Giuliano Gerlo
        </h1>

        <p className="mb-3 text-lg text-text-muted md:text-2xl">
          Full-Stack Developer · React · PHP · MySQL
        </p>

        <p className="mb-10 inline-flex items-center gap-1.5 font-mono text-sm text-text-muted">
          {/* MapPin de lucide-react. aria-hidden porque el texto ya
              describe la ubicación; el ícono es decoración semántica
              redundante para screen readers. */}
          <MapPin size={14} aria-hidden="true" />
          Rosario, Santa Fe — Argentina
        </p>

        {/* CTAs. flex-wrap para que en mobile bajen una abajo de la
            otra sin romper el centrado. */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => scrollToSection('projects')}>
            Ver proyectos →
          </Button>
          <Button
            variant="secondary"
            onClick={() => scrollToSection('contact')}
          >
            Contactarme
          </Button>
        </div>
      </div>
    </section>
  );
}
