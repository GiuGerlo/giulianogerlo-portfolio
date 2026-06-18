import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
import BorderGlow from '../ui/BorderGlow.jsx';
import Reveal from '../ui/Reveal.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { cn } from '../../lib/cn.js';
import { useGitHub } from '../../hooks/useGitHub.js';

/**
 * GitHub — sección "Actividad en GitHub": calendario de contribuciones estilo
 * GitHub (con etiquetas de mes y de día), themed con los tokens del sitio, +
 * un selector de años (último año por default, o un año calendario puntual).
 *
 * Data: useGitHub(year) → proxy serverless (no corre en `pnpm dev`, sí en
 * `vercel dev`/prod). Estados: loading inicial → skeleton; sin data en dev →
 * aviso; sin data en prod → la sección se esconde.
 */

// Nivel (0-4) → clase de color. accent/border son CSS vars → theme-aware.
const LEVEL_CLASS = [
  'bg-border/40',
  'bg-accent/30',
  'bg-accent/50',
  'bg-accent/70',
  'bg-accent',
];

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
// Etiquetas de día (col izquierda). Solo se muestran Lun/Mié/Vie como GitHub.
const WEEKDAYS = ['', 'Lun', '', 'Mié', '', 'Vie', ''];

// Mes a mostrar arriba de una columna: el del primer día de la semana, solo si
// cambió respecto a la semana anterior (→ etiqueta al inicio de cada mes).
function monthLabel(weeks, i) {
  const first = weeks[i]?.[0];
  if (!first) return '';
  const month = new Date(first.date).getUTCMonth();
  const prev = weeks[i - 1]?.[0];
  const prevMonth = prev ? new Date(prev.date).getUTCMonth() : null;
  return month !== prevMonth ? MONTHS[month] : '';
}

function ContributionsGrid({ weeks }) {
  return (
    <div className="scroll-slim overflow-x-auto pb-2">
      <div className="inline-flex flex-col gap-1">
        {/* Fila de meses. El primer hueco (w-8) alinea con la columna de días. */}
        <div className="flex gap-1">
          <div className="w-8 shrink-0" aria-hidden="true" />
          {weeks.map((_, i) => (
            <div
              key={i}
              className="w-3 shrink-0 whitespace-nowrap font-mono text-[10px] text-text-muted"
            >
              {monthLabel(weeks, i)}
            </div>
          ))}
        </div>

        {/* Etiquetas de día + columnas (una por semana). */}
        <div className="flex gap-1">
          <div className="flex w-8 shrink-0 flex-col gap-1 pr-1 text-right">
            {WEEKDAYS.map((label, wd) => (
              <div
                key={wd}
                className="flex h-3 items-center justify-end font-mono text-[9px] leading-none text-text-muted"
              >
                {label}
              </div>
            ))}
          </div>

          {weeks.map((week, i) => (
            <div key={i} className="flex shrink-0 flex-col gap-1">
              {Array.from({ length: 7 }).map((_, wd) => {
                const day = week.find((d) => d.weekday === wd);
                if (!day) return <div key={wd} className="size-3" aria-hidden="true" />;
                return (
                  <div
                    key={wd}
                    title={`${day.count} contribuciones el ${day.date}`}
                    className={`size-3 rounded-[2px] ${LEVEL_CLASS[day.level] ?? LEVEL_CLASS[0]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tab del selector de años.
function YearTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md px-3 py-1 font-mono text-xs transition-colors',
        active
          ? 'bg-accent text-white'
          : 'border border-border text-text-muted hover:border-accent hover:text-accent',
      )}
    >
      {children}
    </button>
  );
}

export default function GitHub() {
  // null = "último año" (rolling); un número = año calendario.
  const [year, setYear] = useState(null);
  const { data, loading, isLocalDev } = useGitHub(year);

  const weeks = data?.weeks ?? [];
  const years = data?.years ?? [];
  const hasData = weeks.length > 0;
  const total = data?.totalContributions ?? 0;

  // Loading inicial (sin data previa todavía).
  const firstLoad = loading && !data;

  // Prod sin data → escondemos la sección. En dev la dejamos para el aviso.
  if (!loading && !hasData && !isLocalDev) return null;

  return (
    <section id="github" className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="// github"
          title="Actividad en GitHub"
          subtitle="Mis contribuciones a lo largo del tiempo. Cambiá de año para ver la actividad histórica."
        />

        {firstLoad ? (
          <Skeleton className="h-52 rounded-xl" />
        ) : !hasData ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated p-6 text-sm text-text-muted">
            <AlertTriangle size={20} aria-hidden="true" className="text-yellow-500" />
            Para ver esta sección en local corré <code className="font-mono">vercel dev</code> (la API <code className="font-mono">/api/github</code> no corre con <code className="font-mono">pnpm dev</code>). En producción se ve siempre.
          </div>
        ) : (
          <Reveal>
            <BorderGlow borderRadius={20}>
              <div className="p-6 md:p-8">
                {/* Selector de años. */}
                {years.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    <YearTab active={year === null} onClick={() => setYear(null)}>
                      Último año
                    </YearTab>
                    {years.map((y) => (
                      <YearTab key={y} active={year === y} onClick={() => setYear(y)}>
                        {y}
                      </YearTab>
                    ))}
                  </div>
                )}

                {/* Total + grid. Mientras refetchea un año, atenuamos el grid. */}
                <div className="mb-3 font-mono text-xs text-text-muted">
                  {total} contribuciones {year ? `en ${year}` : 'en el último año'}
                </div>

                <div className={cn('transition-opacity', loading && 'opacity-50')}>
                  <ContributionsGrid weeks={weeks} />
                </div>

                {/* Leyenda menos → más. */}
                <div className="mt-2 flex items-center justify-end gap-1 font-mono text-[10px] text-text-muted">
                  <span>menos</span>
                  {LEVEL_CLASS.map((clsName, i) => (
                    <span key={i} className={`size-3 rounded-[2px] ${clsName}`} aria-hidden="true" />
                  ))}
                  <span>más</span>
                </div>
              </div>
            </BorderGlow>
          </Reveal>
        )}
      </div>
    </section>
  );
}
