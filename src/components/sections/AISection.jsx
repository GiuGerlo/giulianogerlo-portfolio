import { aiSkills } from '../../data/skills.js';

/**
 * AISection — sección 03 del portfolio. Bloque destacado con las skills de
 * IA agrupadas como features individuales (border-left accent verde).
 *
 * Difiere visualmente del resto de las secciones: en vez de heading +
 * grilla de cards, todo el contenido vive dentro de UN bloque grande
 * (`<article>`) con:
 *  - background bg-elevated (un escalón más claro que la página).
 *  - border + border-radius (16px = rounded-2xl).
 *  - padding interno grande (56px desktop, 32px mobile).
 *  - glow radial verde tenue arriba a la derecha (decorativo).
 *
 * Por eso NO uso el primitive SectionHeading: ese tiene `mb-14` y un layout
 * pensado para encabezar una sección "transparente". Acá el eyebrow + title +
 * subtitle van dentro del bloque sin esos márgenes.
 *
 * Features grid:
 *  - `auto-fit minmax(220px, 1fr)` — replica mockup. Cada feature mínimo
 *    220px de ancho; en mobile 1 col, desktop 2-3 cols según viewport.
 *  - Cada feature: `border-left-2 border-accent` (línea verde a la izq),
 *    `pl-4`, h4 mono 13px accent, párrafo muted.
 *
 * Render de `items[]` (opcional):
 *  - Algunas entries de aiSkills agrupan varias herramientas (ej. el entry
 *    `ai_dev_tooling` lista Claude Code, Codex, Copilot, etc.). Si la
 *    entry tiene `items[]`, los renderizamos como tags chicos mono debajo
 *    del párrafo (mismo styling que skill-tag de Skills).
 *  - Si NO tiene items, solo se renderiza la descripción.
 *
 * Glow radial decorativo:
 *  - `<div>` absolute con bg-[radial-gradient(...)] — arbitrary value de
 *    Tailwind. Posicionado top:-100, right:-100, 400x400, rounded-full,
 *    pointer-events-none (no bloquea clicks), aria-hidden.
 *  - Va ANTES del contenido relativo en el DOM para que quede atrás (z-0
 *    implícito); el inner usa `relative` para subir al z-10 implícito y
 *    quedar arriba del glow.
 */
export default function AISection() {
  return (
    <section
      id="ai"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Bloque destacado. overflow-hidden recorta el glow radial que
            se sale del borde superior/derecho. */}
        <article className="relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-8 md:p-14">
          {/* Glow radial decorativo arriba-derecha. aria-hidden + pointer-
              events-none = puramente visual. La sintaxis
              `bg-[radial-gradient(...)]` es "arbitrary value" de Tailwind:
              cuando no hay utility nativa, se mete el CSS literal entre
              corchetes (underscores reemplazan los espacios). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[100px] -right-[100px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_rgba(4,119,59,0.15),_transparent_70%)]"
          />

          {/* Inner relative para subir al stacking context arriba del glow. */}
          <div className="relative">
            <div className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
              // 03 — AI integration
            </div>

            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              AI-Augmented Development
            </h2>

            <p className="mt-3 max-w-[600px] text-lg text-text-muted">
              Aprovecho IA para acelerar desarrollo, automatizar tareas
              repetitivas y construir agentes a medida.
            </p>

            {/* Grid de features. mt-10 (40px) matchea mockup. */}
            <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
              {aiSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="border-l-2 border-accent pl-4"
                >
                  <h4 className="mb-1.5 font-mono text-[13px] text-accent">
                    {skill.title}
                  </h4>
                  <p className="text-sm text-text-muted">{skill.desc}</p>

                  {/* items[] opcional. Si la entry agrupa herramientas
                      (ej. ai_dev_tooling), las muestro como tags chicos.
                      Mismo styling que skill-tag de Skills section. */}
                  {skill.items && skill.items.length > 0 && (
                    <div
                      data-testid={`ai-skill-items-${skill.id}`}
                      className="mt-3 flex flex-wrap gap-1.5"
                    >
                      {skill.items.map((item) => (
                        <span
                          key={item}
                          className="rounded border border-border bg-bg px-2 py-1 font-mono text-[11px] text-text-muted"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
