// Íconos no-brand de lucide. El Mail SÍ existe en v1 (solo se sacaron brand icons).
import { Mail, MapPin } from 'lucide-react';

// `Link` de React Router para anchors que también funcionan desde rutas hijas.
// Para links dentro del Home usamos <a href="/#x"> nativo igual que en Navbar.
import { socials } from '../../data/socials.js';

/**
 * Helper interno (mismo patrón que en Navbar): renderiza un símbolo del
 * sprite SVG global. Lo duplicamos por ahora — en una refactor posterior
 * podríamos extraerlo a src/components/ui/Icon.jsx para no repetir.
 */
function Icon({ id, size = 16 }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

// Mismos links del Navbar — para nav rápido en el footer.
const navLinks = [
  { to: '/#about',      label: 'Sobre mí' },
  { to: '/#skills',     label: 'Skills' },
  { to: '/#projects',   label: 'Proyectos' },
  { to: '/#experience', label: 'Experiencia' },
  { to: '/#contact',    label: 'Contacto' },
];

export default function Footer() {
  // `new Date().getFullYear()` se calcula en cada render → siempre actualizado.
  // Cuando llegue 2027, el copyright del footer dice 2027 sin tocar nada.
  const year = new Date().getFullYear();

  return (
    // <footer> = elemento semántico HTML.
    // mt-24 = margin-top grande para separarlo del contenido principal.
    // border-t = línea fina arriba.
    <footer className="mt-24 border-t border-border bg-bg ">

      {/* Container centrado mismo ancho que Navbar.
          py-12 → padding vertical generoso. */}
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">

        {/* Grid principal de 3 columnas en md+, 1 columna stack en mobile.
            gap-10 separa entre columnas (horizontal en md+, vertical al stackear).
            text-center md:text-left → en mobile todo el texto centrado, en md+ alineado a izquierda. */}
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">

          {/* Columna 1 — Brand + tagline + ubicación. */}
          <div className="space-y-3">
            <p className="font-mono text-lg font-semibold">
              giuliano<span className="text-accent">.dev</span>
            </p>
            <p className="text-sm text-text-muted">
              Full-Stack Developer enfocado en construir productos
              robustos con PHP/Laravel, React y workflows asistidos con IA.
            </p>
            {/* `inline-flex` no toma `text-align`, por eso para centrar
                la ubicación en mobile envolvemos en un <p> con flex justify. */}
            <p className="flex items-center justify-center gap-2 text-sm text-text-muted md:justify-start">
              <MapPin size={14} />
              {socials.location}
            </p>
          </div>

          {/* Columna 2 — Nav rápido. Replica los links del Navbar para que
              alguien que scrolleó hasta abajo no tenga que volver arriba. */}
          <nav aria-label="Navegación del pie">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-primary">
              Navegación
            </h2>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={link.to}
                    className="text-sm text-text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 3 — Redes + contacto rápido. */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-primary">
              Redes
            </h2>

            {/* Fila de íconos: GitHub, LinkedIn, mailto.
                justify-center en mobile, justify-start en md+ (queda alineado a izquierda). */}
            <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
              <a
                href={socials.github}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Icon id="github-icon" />
              </a>
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Icon id="linkedin-icon" />
              </a>
              {/* mailto: hace que el click abra el cliente de mail del usuario.
                  En Phase 4.8 vamos a sumar email obfuscation para anti-scraping,
                  por ahora queda como link directo. */}
              <a
                href={`mailto:${socials.email}`}
                aria-label="Email"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Línea separadora antes del copyright. */}
        <div className="mt-10 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-text-muted sm:flex-row">
            <p>© {year} Giuliano Gerlo. Todos los derechos reservados.</p>
            <p>
              Hecho con <span className="text-accent">React</span> +{' '}
              <span className="text-accent">Tailwind</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
