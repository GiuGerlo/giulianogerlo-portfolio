import { MapPin } from 'lucide-react';

import Button from '../ui/Button.jsx';
import DarkVeil from '../ui/DarkVeil.jsx';

/**
 * Hero — primera sección de la home. Saludo + CTAs sobre fondo animado.
 *
 * Composición:
 *  - Fondo: <DarkVeil /> WebGL — shader CPPN procedural animado.
 *  - Overlay oscuro semi-transparente encima del veil para que el
 *    fondo no compita con el texto.
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
  return (
    <section
      id="hero"
      className="relative overflow-hidden px-4 py-24 text-center md:py-32"
    >
      {/* Fondo WebGL — cubre toda la sección (inset-0 = top/right/
          bottom/left:0). z-0 para que quede DETRÁS del contenido.
          aria-hidden porque es decoración pura. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
      >
        <DarkVeil
          // hueShift en grados rota el color del CPPN. Tuneable.
          // 0 = colores originales (azul/rojo). Probá 80-140 para verdes,
          // 200-260 para morados. Para portfolio verde accent: ~110.
          hueShift={110}
          speed={0.45}
          // Granito sutil para textura — alto = muy ruidoso.
          noiseIntensity={0.02}
          // Scanlines apagadas (visuales tipo CRT). 0 = off.
          scanlineIntensity={0}
          scanlineFrequency={0}
          // Warp leve para vida — 0 = imagen estable, 0.05 = ondulación
          // sutil del CPPN, valores altos distorsionan mucho.
          warpAmount={0.04}
        />
      </div>

      {/* Overlay oscuro encima del veil. Baja el brillo del fondo para
          que el texto blanco/muted contraste sin necesidad de
          text-shadow. Opacity tuneada para ver el veil pero no que
          tape el texto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-bg/55"
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
