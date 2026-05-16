import {
  Layout,
  Server,
  Database,
  Wrench,
  Heart,
} from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
import BorderGlow from '../ui/BorderGlow.jsx';
import Reveal from '../ui/Reveal.jsx';
import { skillGroups } from '../../data/skills.js';

/**
 * Skills — sección 02 del portfolio. Muestra el stack técnico agrupado en
 * cards (Frontend, Backend, Base de datos, DevOps, Soft Skills).
 *
 * Decisión de diseño — íconos por nombre string:
 *   src/data/skills.js guarda el ícono como string (`icon: 'Layout'`) en
 *   vez de importar el componente lucide directamente. Razón: queremos
 *   que los datos sean serializables (en el futuro podrían venir de un
 *   JSON, un CMS, una API). Acá hacemos el lookup `ICONS[group.icon]`
 *   para mapear del string al componente real.
 *
 *   El objeto ICONS lista explícitamente los íconos que usa la data —
 *   esto permite que el bundler (Vite) haga tree-shaking y NO incluya
 *   los ~1000 íconos de lucide-react en el bundle final. Importar
 *   dinámicamente con `lucide-react[name]` no es opción: lucide no
 *   exporta un default con todos.
 *
 *   Si después se agrega un nuevo grupo con otro ícono → sumar el
 *   import arriba + entry en ICONS.
 *
 * Layout — grid responsive:
 *   Son 5 grupos y los queremos en UNA fila en desktop, así que el
 *   grid es de columnas fijas por breakpoint (no auto-fit):
 *   1 col en mobile, 2 en tablet (sm), 5 en desktop (lg).
 *
 * Cards con glow:
 *   Cada grupo va dentro de un <BorderGlow> — card con borde mesh
 *   verde + glow que sigue al cursor cerca de los bordes. Reemplaza
 *   el `<article>` con border/hover plano que había antes.
 */

// Lookup string → componente lucide. Mantener sincronizado con los
// `icon:` de skillGroups en src/data/skills.js.
const ICONS = {
  Layout,
  Server,
  Database,
  Wrench,
  Heart,
};

export default function Skills() {
  return (
    <section
      id="skills"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="// 02 — skills"
          title="Stack técnico"
          subtitle="Herramientas que uso día a día para construir aplicaciones web completas."
        />

        {/* Grid: 1 col mobile · 2 cols tablet · 5 cols desktop (una
            fila con los 5 grupos). gap-5 (20px) matchea mockup. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {skillGroups.map((group, index) => {
            // Resolver ícono por nombre. Si la data tiene un nombre que
            // no está mapeado, dejamos null — el render salta el ícono
            // en vez de explotar.
            const Icon = ICONS[group.icon] ?? null;

            return (
              // Reveal: fade-up al scrollear. delay escalonado por
              // index → las 5 cards aparecen una atrás de otra.
              // BorderGlow adentro: el contenedor de la card (borde
              // mesh + glow). El contenido real va con su padding.
              <Reveal
                key={group.id}
                delay={index * 0.06}
                className="h-full"
              >
                <BorderGlow className="h-full">
                {/* flex h-full flex-col → el contenido ocupa toda la
                    card; las 5 cards de la fila quedan parejas. */}
                <div className="flex h-full flex-col p-6">
                  {/* Cuadrado 36x36 con bg accent-bg (verde tenue) e
                      ícono accent. inline-flex centra el SVG dentro. */}
                  {Icon && (
                    <div
                      data-testid={`skill-icon-${group.id}`}
                      className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-bg text-accent"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </div>
                  )}

                  <h3 className="mb-3 text-base font-semibold">
                    {group.title}
                  </h3>

                  {/* Skill tags. NO uso el primitive Chip porque ese es
                      pill redondo grande; estos son squared más chicos
                      (matchea .skill-tag del mockup: 11px mono, px-2
                      py-1, border-radius 4px). Si después se reusa este
                      styling en más lados, extraer a primitive Tag.jsx. */}
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded border border-border bg-bg px-2 py-1 font-mono text-[11px] text-text-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                </BorderGlow>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
