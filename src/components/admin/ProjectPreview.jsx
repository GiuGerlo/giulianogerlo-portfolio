import { Calendar, UserRound, ArrowRight, ExternalLink } from 'lucide-react';

/**
 * ProjectPreview — render en tiempo real del proyecto mientras lo editás.
 *
 * Recibe el snapshot de valores del form (via `useWatch` en el parent)
 * y los renderiza con un look similar al sitio público:
 *  - Card del home (Projects.jsx).
 *  - Resumen / Stack / Fechas / Acciones / Desafíos del detalle
 *    (ProjectDetail.jsx).
 *
 * NO está pensado para ser pixel-perfect — sirve como guía visual rápida
 * mientras editás. El detalle real lo ve el usuario en el sitio público
 * cuando publica.
 *
 * Sticky en desktop: queda fijo al lado del form mientras hacés scroll
 * (mejor UX en formularios largos). En mobile, el preview se renderiza
 * arriba o abajo según el layout del parent.
 */

// Helper local: 'YYYY-MM' → 'MMM YYYY' en español (mismo formato que
// usa ProjectDetail.jsx).
const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function formatMonth(yyyyMm) {
  if (!yyyyMm) return '';
  const [year, month] = yyyyMm.split('-');
  const idx = Number(month) - 1;
  if (idx < 0 || idx > 11) return '';
  return `${MESES[idx]} ${year}`;
}

function formatDateRange(dateStart, dateEnd) {
  const start = formatMonth(dateStart);
  if (!start) return '';
  const end = dateEnd ? formatMonth(dateEnd) : 'Actualidad';
  return `${start} — ${end}`;
}

export default function ProjectPreview({ values }) {
  const {
    title = '',
    category = '',
    myRole = '',
    summary = '',
    description = '',
    stack = [],
    image = '',
    liveUrl = '',
    repoUrl = '',
    dateStart = '',
    dateEnd = '',
    challenges = [],
    published = false,
  } = values ?? {};

  const dateRange = formatDateRange(dateStart, dateEnd);
  const hasActions = Boolean(liveUrl || repoUrl);

  return (
    <aside
      aria-label="Vista previa del proyecto"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">
          // preview
        </h2>
        {/* Badge de estado para que sea claro si esto se publicaría. */}
        {published ? (
          <span className="rounded bg-accent-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
            publicado
          </span>
        ) : (
          <span className="rounded bg-border/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            draft
          </span>
        )}
      </div>

      {/* ── Mini card (look del home) ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-sm">
        {image ? (
          <img
            src={image}
            alt=""
            className="aspect-[16/10] w-full border-b border-border object-cover"
            onError={(e) => {
              // Si la URL no carga (ej. URL inválida tipeada a medio),
              // ocultamos la imagen rota.
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center border-b border-border bg-gradient-to-br from-bg to-accent-bg font-mono text-[13px] text-text-muted">
            [ {title || 'Sin título'} ]
          </div>
        )}

        <div className="flex flex-col p-5">
          <span className="mb-2 inline-block w-fit rounded bg-accent-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
            {category || 'categoría'}
          </span>
          <h3 className="mb-1 text-lg font-semibold">
            {title || 'Título del proyecto'}
          </h3>
          {myRole && (
            <p className="mb-2 font-mono text-[10px] text-text-muted">
              role: {myRole}
            </p>
          )}
          {summary && (
            <p className="mb-3 text-sm leading-relaxed text-text-muted">
              {summary}
            </p>
          )}
          {stack.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-accent">
            Ver caso
            <ArrowRight size={12} aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* ── Bloque "detalle resumido" ── */}
      <div className="rounded-xl border border-border bg-bg-elevated p-5 text-sm">
        {/* Meta row del detalle */}
        {(dateRange || myRole) && (
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-text-muted">
            {dateRange && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} aria-hidden="true" />
                {dateRange}
              </span>
            )}
            {myRole && (
              <span className="inline-flex items-center gap-1">
                <UserRound size={12} aria-hidden="true" />
                {myRole}
              </span>
            )}
          </div>
        )}

        {/* Acciones */}
        {hasActions && (
          <div className="mb-4 flex flex-wrap gap-2 font-mono text-[10px]">
            {liveUrl && (
              <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-1 text-white">
                Sitio live
                <ExternalLink size={10} aria-hidden="true" />
              </span>
            )}
            {repoUrl && (
              <span className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-text-muted">
                Repo
                <ExternalLink size={10} aria-hidden="true" />
              </span>
            )}
          </div>
        )}

        {description && (
          <>
            <h4 className="mb-1 font-semibold">Resumen</h4>
            <p className="mb-4 line-clamp-6 text-text-muted">{description}</p>
          </>
        )}

        {challenges.length > 0 && (
          <>
            <h4 className="mb-1 font-semibold">Desafíos ({challenges.length})</h4>
            <ul className="space-y-1.5">
              {challenges.map((c, i) => (
                <li
                  key={i}
                  className="line-clamp-2 text-xs text-text-muted before:mr-1 before:text-accent before:content-['→']"
                >
                  {c || <em className="opacity-60">(vacío)</em>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
