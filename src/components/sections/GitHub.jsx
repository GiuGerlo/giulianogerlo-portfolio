import { AlertTriangle } from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
import BorderGlow from '../ui/BorderGlow.jsx';
import Reveal from '../ui/Reveal.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { useGitHub } from '../../hooks/useGitHub.js';

/**
 * GitHub — sección "Actividad en GitHub": el grid de contribuciones del último
 * año, dibujado desde la data JSON con los colores del tema (escala del accent).
 *
 * La data viene de useGitHub() → proxy serverless (no corre en `pnpm dev`, sí
 * en `vercel dev`/prod). Estados: loading → skeleton; sin data en dev → aviso;
 * sin data en prod → la sección se esconde.
 */

// Mapa nivel (0-4) → clase de color. accent/border son CSS vars → theme-aware.
const LEVEL_CLASS = [
  'bg-border/40', // 0 — sin actividad
  'bg-accent/30', // 1
  'bg-accent/50', // 2
  'bg-accent/70', // 3
  'bg-accent', // 4 — máxima
];

/**
 * ContributionsGrid — dibuja el calendario. `days` = [{date, count, level}]
 * ordenado por fecha asc. Para que las columnas (semanas) queden alineadas por
 * día de la semana, padeamos el arranque con celdas vacías según el weekday del
 * primer día. grid-flow-col + grid-rows-7 → llena de arriba a abajo por columna.
 */
function ContributionsGrid({ days, total }) {
  const firstWeekday = days.length ? new Date(days[0].date).getDay() : 0;
  const padding = Array.from({ length: firstWeekday });

  return (
    <div>
      <div className="mb-3 font-mono text-xs text-text-muted">
        {total} contribuciones en el último año
      </div>

      {/* overflow-x-auto: el calendario es ancho (~53 semanas); en mobile
          scrollea horizontal con la barra fina del tema. */}
      <div className="scroll-slim overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {padding.map((_, i) => (
            <div key={`pad-${i}`} className="size-3" aria-hidden="true" />
          ))}
          {days.map((d) => (
            <div
              key={d.date}
              title={`${d.count} contribuciones el ${d.date}`}
              className={`size-3 rounded-[2px] ${LEVEL_CLASS[d.level] ?? LEVEL_CLASS[0]}`}
            />
          ))}
        </div>
      </div>

      {/* Leyenda menos → más. */}
      <div className="mt-2 flex items-center justify-end gap-1 font-mono text-[10px] text-text-muted">
        <span>menos</span>
        {LEVEL_CLASS.map((cls, i) => (
          <span key={i} className={`size-3 rounded-[2px] ${cls}`} aria-hidden="true" />
        ))}
        <span>más</span>
      </div>
    </div>
  );
}

export default function GitHub() {
  const { data, loading, isLocalDev } = useGitHub();

  const contributions = data?.contributions ?? [];
  const hasData = contributions.length > 0;

  // Prod: si falló o no hay nada, escondemos la sección. En dev la dejamos para
  // mostrar el aviso.
  if (!loading && !hasData && !isLocalDev) return null;

  return (
    <section id="github" className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="// github"
          title="Actividad en GitHub"
          subtitle="Contribuciones del último año en mis repos."
        />

        {loading ? (
          <Skeleton className="h-44 rounded-xl" />
        ) : !hasData ? (
          // Sin data en dev (plain `pnpm dev` no sirve /api/*). Para verla en
          // local hay que correr `vercel dev` (que sí levanta las funciones).
          <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated p-6 text-sm text-text-muted">
            <AlertTriangle size={20} aria-hidden="true" className="text-yellow-500" />
            Para ver esta sección en local corré <code className="font-mono">vercel dev</code> (la API <code className="font-mono">/api/github</code> no corre con <code className="font-mono">pnpm dev</code>). En producción se ve siempre.
          </div>
        ) : (
          <Reveal>
            <BorderGlow borderRadius={20}>
              <div className="p-6 md:p-8">
                <ContributionsGrid
                  days={contributions}
                  total={data?.totalContributions ?? 0}
                />
              </div>
            </BorderGlow>
          </Reveal>
        )}
      </div>
    </section>
  );
}
