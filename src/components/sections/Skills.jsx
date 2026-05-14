import {
  Layout,
  Server,
  Database,
  Wrench,
  Heart,
} from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
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
 *   `grid-cols-[repeat(auto-fit,minmax(240px,1fr))]` replica el mockup.
 *   auto-fit acomoda tantas columnas como entren con mínimo 240px cada
 *   una. En mobile (~360px viewport) entra 1 col; en tablet 2; en
 *   desktop 3+. Sin breakpoints manuales: el grid se adapta solo.
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

        {/* Grid auto-fit: tantas cols como entren con minmax(240px, 1fr).
            gap-5 (20px) matchea mockup. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {skillGroups.map((group) => {
            // Resolver ícono por nombre. Si la data tiene un nombre que
            // no está mapeado, dejamos null — el render salta el ícono
            // en vez de explotar.
            const Icon = ICONS[group.icon] ?? null;

            return (
              <article
                key={group.id}
                className="rounded-lg border border-border bg-bg-elevated p-6 transition-colors hover:border-accent"
              >
                {/* Cuadrado 36x36 con bg accent-bg (verde tenue) e ícono
                    accent. inline-flex centra el SVG dentro. */}
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
                    (matchea .skill-tag del mockup: 11px mono, px-2 py-1,
                    border-radius 4px). Si después se reusa este styling
                    en más lados, extraer a primitive Tag.jsx. */}
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
