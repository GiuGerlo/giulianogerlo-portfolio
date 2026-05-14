import { MapPin } from 'lucide-react';

import { useTheme } from '../../hooks/useTheme.js';
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
  // Tomamos el theme actual para tunear el veil. En dark queda lindo
  // con verde brillante. En light el mismo verde lavado por el overlay
  // claro queda gris/sucio → cambiamos hueShift + subimos overlay para
  // un look más limpio.
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Props del veil por theme.
  // Dark: verde aurora vibrante (hueShift 110), overlay sutil 55%.
  // Light: hueShift 215 → tonos azul/violeta lavanda suaves sobre
  // fondo claro. Overlay más opaco (75%) para que el veil sea solo
  // un acento sutil, no protagonice.
  const veilProps = isDark
    ? { hueShift: 110, speed: 0.45, noiseIntensity: 0.02, warpAmount: 0.04 }
    : { hueShift: 215, speed: 0.35, noiseIntensity: 0.015, warpAmount: 0.03 };

  const overlayClass = isDark ? 'bg-bg/55' : 'bg-bg/75';

  return (
    <section
      id="hero"
      className="relative overflow-hidden px-4 py-24 text-center md:py-32"
    >
      {/* Fondo WebGL — cubre toda la sección (inset-0 = top/right/
          bottom/left:0). z-0 para que quede DETRÁS del contenido.
          aria-hidden porque es decoración pura.
          key={theme} fuerza remount del DarkVeil al cambiar theme,
          para que el useEffect del shader se reinicialice con los
          nuevos uniforms. Sin esto, el canvas seguiría con los
          valores del theme anterior hasta que el RAF loop reaplique. */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <DarkVeil
          key={theme}
          hueShift={veilProps.hueShift}
          speed={veilProps.speed}
          noiseIntensity={veilProps.noiseIntensity}
          scanlineIntensity={0}
          scanlineFrequency={0}
          warpAmount={veilProps.warpAmount}
        />
      </div>

      {/* Overlay encima del veil. Baja el brillo del fondo para que
          el texto contraste. Opacity ajustada por theme. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-[1] ${overlayClass}`}
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
