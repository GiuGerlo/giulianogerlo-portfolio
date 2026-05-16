import Reveal from './Reveal.jsx';

/**
 * SectionHeading — header reutilizable para todas las secciones del Home.
 *
 * Estructura (según mockup):
 *   <div class="eyebrow">// 01 — about</div>     ← mono accent uppercase
 *   <h2 class="title">Sobre mí</h2>              ← bold grande
 *   <p class="subtitle">Texto secundario...</p>  ← muted, opcional
 *
 * Props:
 *  - eyebrow  → texto chico arriba (ej: "// 01 — about"). Opcional.
 *  - title    → string del <h2>. Requerido.
 *  - subtitle → párrafo descriptivo debajo del título. Opcional.
 *  - id       → id del <h2>, útil para anclas (ej: <a href="#about">).
 *
 * No recibe children. Si hace falta layout más complejo, el caller
 * compone manualmente.
 *
 * Animación: el header entero va dentro de un <Reveal> — así TODOS los
 * encabezados de sección aparecen con fade-up al scrollear, sin tener
 * que envolverlos uno por uno en cada sección.
 */
export default function SectionHeading({ eyebrow, title, subtitle, id }) {
  return (
    <Reveal className="mb-14">
      {eyebrow && (
        <div className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          {eyebrow}
        </div>
      )}

      <h2
        id={id}
        className="text-3xl font-bold tracking-tight md:text-4xl"
      >
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 max-w-[600px] text-lg text-text-muted">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
