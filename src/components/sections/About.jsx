import { MapPin, Languages, GraduationCap } from 'lucide-react';
// react-markdown convierte el texto markdown (con **negritas**) a JSX. NO
// renderiza HTML crudo por default (sin rehype-raw) → no hay XSS aunque el
// texto venga de la DB. Mismo uso que en Chat.jsx para el output del bot.
import ReactMarkdown from 'react-markdown';

import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Chip from '../ui/Chip.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { useProfile } from '../../hooks/useProfile.js';

/**
 * FALLBACK — contenido hardcodeado que iguala el seed de la DB
 * (migration 0004). Se usa mientras el fetch carga, si falla, o si no hay
 * fila. Garantiza que el About NUNCA se vea roto o vacío. Los párrafos van
 * en markdown (negritas con **...**) — los renderiza react-markdown.
 */
const FALLBACK = {
  aboutImage: null,
  aboutP1:
    'Soy **Giuliano Gerlo**, Técnico Superior en Desarrollo de Software egresado del Brigadier López (Rosario). Programador con experiencia en desarrollo **Full Stack**, especializado en automatización de procesos, gestión de bases de datos y creación de soluciones eficientes.',
  aboutP2:
    'Actualmente me desempeño como **Asistente de Desarrollo** en RAMCC, donde participo en software a medida en front-end y back-end. Me interesa la optimización continua de sistemas y cada vez más el desarrollo asistido por **IA** (Claude Code, MCP, agentes).',
  chipAvailable: 'Disponible para proyectos',
  chipLocation: 'Rosario, AR',
  chipLanguage: 'Español',
  chipEducation: 'Cursando React Cert · DigitalHouse',
};

/**
 * About — segunda sección de la home. Bio + chips de estado + foto.
 *
 * Phase 13: el contenido ahora es editable desde /admin (tabla `profile`,
 * fila única). El componente lee runtime con useProfile() y degrada elegante:
 *  - loading / error / sin fila → muestra FALLBACK (idéntico al seed).
 *  - fila cargada OK → usa los valores de la DB; un campo vacío se respeta
 *    (chip vacío = oculto, porque el admin lo borró a propósito).
 *
 * Layout (sin cambios):
 *  - Mobile: 1 columna. Desktop (md+): grid 2 cols, texto izq + foto der 280px.
 *
 * Chips → cada uno mapea a su ícono lucide en código (los íconos no se editan,
 * solo el texto):
 *  - available → variant 'dot' (punto accent verde, estado activo).
 *  - location  → MapPin. language → Languages. education → GraduationCap.
 */
export default function About() {
  // Hook custom: trae la fila id=1 de Supabase. { data, loading, error }.
  const { data, loading } = useProfile();

  // Skeleton mientras carga (sin flash del contenido viejo). El FALLBACK
  // estático queda solo para el caso de error real o sin fila.
  const profile = data ?? FALLBACK;

  return (
    <section
      id="about"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="// 01 — about" title="Sobre mí" />

        {/* Grid 2 cols en desktop. items-start para que la foto no
            estire de alto si el texto es más largo. Envuelto en
            <Reveal> → aparece con fade-up al scrollear. */}
        <Reveal>
        {loading ? (
          <div
            aria-busy="true"
            aria-label="Cargando sobre mí"
            className="grid gap-12 md:grid-cols-[1fr_280px] md:gap-16 md:items-start"
          >
            {/* Columna texto: líneas + chips placeholder. */}
            <div>
              <Skeleton className="mb-3 h-4 w-full" />
              <Skeleton className="mb-3 h-4 w-11/12" />
              <Skeleton className="mb-6 h-4 w-4/5" />
              <Skeleton className="mb-3 h-4 w-full" />
              <Skeleton className="mb-8 h-4 w-3/4" />
              <div className="mt-6 flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-28 rounded-full" />
                ))}
              </div>
            </div>
            {/* Columna foto: cuadrado placeholder. */}
            <Skeleton className="aspect-square w-full rounded-xl md:max-w-[280px]" />
          </div>
        ) : (
        <div className="grid gap-12 md:grid-cols-[1fr_280px] md:gap-16 md:items-start">
          {/* Columna texto + chips. */}
          <div>
            {/* Párrafos en markdown. El wrapper div lleva el estilo del
                párrafo; react-markdown genera un <p> interno (sin margin
                propio por el preflight de Tailwind) y las **negritas** se
                vuelven <strong>, que estilamos con el selector arbitrario
                [&_strong]. */}
            {profile.aboutP1 && (
              <div className="mb-4 text-base text-text-muted [&_a]:text-accent [&_a]:underline [&_em]:italic [&_strong]:font-semibold [&_strong]:text-text-primary">
                <ReactMarkdown>{profile.aboutP1}</ReactMarkdown>
              </div>
            )}

            {profile.aboutP2 && (
              <div className="mb-6 text-base text-text-muted [&_a]:text-accent [&_a]:underline [&_em]:italic [&_strong]:font-semibold [&_strong]:text-text-primary">
                <ReactMarkdown>{profile.aboutP2}</ReactMarkdown>
              </div>
            )}

            {/* Chips con flex-wrap para que se acomoden en varias filas
                en mobile. gap-2 separa horizontal Y verticalmente al wrap.
                Cada chip se renderiza solo si su campo no está vacío. */}
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.chipAvailable && (
                <Chip variant="dot">{profile.chipAvailable}</Chip>
              )}

              {profile.chipLocation && (
                <Chip>
                  <MapPin size={12} aria-hidden="true" />
                  {profile.chipLocation}
                </Chip>
              )}

              {profile.chipLanguage && (
                <Chip>
                  <Languages size={12} aria-hidden="true" />
                  {profile.chipLanguage}
                </Chip>
              )}

              {profile.chipEducation && (
                <Chip>
                  <GraduationCap size={12} aria-hidden="true" />
                  {profile.chipEducation}
                </Chip>
              )}
            </div>
          </div>

          {/* Columna foto. aspect-square = cuadrado puro. El gradient queda
              como background fallback (se ve mientras carga / si el src falla). */}
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-accent to-bg-elevated md:max-w-[280px]">
            {profile.aboutImage ? (
              // Foto subida desde /admin (URL de Supabase Storage). object-cover
              // llena el cuadrado y recorta si no es 1:1, sin distorsionar.
              <img
                src={profile.aboutImage}
                alt="Giuliano Gerlo"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              // Sin foto en DB → <picture> estático de /public. El browser elige
              // el .webp (liviano) y cae al .jpg si no lo soporta. width/height
              // reales (600x800) evitan el salto de layout (CLS) al cargar.
              <picture>
                <source srcSet="/foto-giulianogerlo.webp" type="image/webp" />
                <img
                  src="/foto-giulianogerlo.jpg"
                  alt="Giuliano Gerlo"
                  width={600}
                  height={800}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </picture>
            )}
          </div>
        </div>
        )}
        </Reveal>
      </div>
    </section>
  );
}
