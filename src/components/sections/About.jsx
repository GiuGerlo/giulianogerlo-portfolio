import { MapPin, Languages, GraduationCap } from 'lucide-react';

import SectionHeading from '../ui/SectionHeading.jsx';
import Chip from '../ui/Chip.jsx';

/**
 * About — segunda sección de la home. Bio corta + chips de estado +
 * placeholder de foto.
 *
 * Layout:
 *  - Mobile: 1 columna, foto arriba o abajo según orden DOM (definido
 *    aquí como texto primero, foto después — orden lógico de lectura).
 *  - Desktop (md+): grid 2 columnas. Texto a la izquierda (flex-1) y
 *    foto a la derecha con ancho fijo 280px (matchea mockup).
 *
 * Chips:
 *  - "Disponible para proyectos" → variant 'dot' (punto accent verde,
 *    señala estado activo).
 *  - "Rosario, AR" → MapPin icon.
 *  - "Español" → Languages icon (reemplaza el emoji 🇪🇸 del mockup —
 *    regla del proyecto: NO emojis Unicode).
 *  - "Cursando React Cert · DigitalHouse" → GraduationCap icon.
 *
 * Foto placeholder:
 *  - Cuadrado (aspect-ratio:1, w-full hasta el max del column).
 *  - Background: gradient diagonal accent → bg-elevated (matchea mockup).
 *  - Texto "GG" centrado, blanco, 80px font-weight 700.
 *  - Cuando Giuliano suba foto real, esto se reemplaza por <img />.
 */
export default function About() {
  return (
    <section
      id="about"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="// 01 — about" title="Sobre mí" />

        {/* Grid 2 cols en desktop. items-start para que la foto no
            estire de alto si el texto es más largo. */}
        <div className="grid gap-12 md:grid-cols-[1fr_280px] md:gap-16 md:items-start">
          {/* Columna texto + chips. */}
          <div>
            <p className="mb-4 text-base text-text-muted">
              Soy{' '}
              <strong className="font-semibold text-text-primary">
                Giuliano Gerlo
              </strong>
              , Técnico Superior en Desarrollo de Software egresado del
              Brigadier López (Rosario). Programador con experiencia en
              desarrollo{' '}
              <strong className="font-semibold text-text-primary">
                Full Stack
              </strong>
              , especializado en automatización de procesos, gestión de
              bases de datos y creación de soluciones eficientes.
            </p>

            <p className="mb-6 text-base text-text-muted">
              Actualmente me desempeño como{' '}
              <strong className="font-semibold text-text-primary">
                Asistente de Desarrollo
              </strong>{' '}
              en RAMCC, donde participo en software a medida en front-end
              y back-end. Me interesa la optimización continua de
              sistemas y cada vez más el desarrollo asistido por{' '}
              <strong className="font-semibold text-text-primary">
                IA
              </strong>{' '}
              (Claude Code, MCP, agentes).
            </p>

            {/* Chips con flex-wrap para que se acomoden en varias filas
                en mobile. gap-2 separa horizontal Y verticalmente al
                hacer wrap. */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Chip variant="dot">Disponible para proyectos</Chip>

              <Chip>
                <MapPin size={12} aria-hidden="true" />
                Rosario, AR
              </Chip>

              <Chip>
                <Languages size={12} aria-hidden="true" />
                Español
              </Chip>

              <Chip>
                <GraduationCap size={12} aria-hidden="true" />
                Cursando React Cert · DigitalHouse
              </Chip>
            </div>
          </div>

          {/* Columna foto. aspect-square = cuadrado puro. El gradient
              queda como background fallback (se ve solo mientras
              carga la imagen, o si el src falla).
              IMPORTANTE: en Vite los archivos de /public se sirven
              desde la raíz "/" — NO "public/...". Path final = "/foto-...".
              <img> con h-full w-full object-cover llena el cuadrado y
              recorta si la imagen no es 1:1 (sin distorsionar). */}
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-accent to-bg-elevated md:max-w-[280px]">
            <img
              src="/foto-giulianogerlo.jpg"
              alt="Giuliano Gerlo"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
