// `useState` es el hook básico de React para guardar estado local del componente.
// Lo usamos para saber si el menú mobile está abierto o cerrado.
import { useState } from 'react';

// Íconos del menú hamburguesa. Estos NO son brand icons → sí están en lucide.
import { Menu, X } from 'lucide-react';

// NavLink se comporta como un <a> normal pero, si la URL matchea su `to`,
// agrega automáticamente una clase "active" al elemento. Útil para el logo:
// cuando navegás por la app y volvés a "/", se podría marcar como activo.
import { NavLink } from 'react-router-dom';

// El toggle de tema vive como componente independiente — lo armamos en Task 1.2.
import ThemeToggle from '../ui/ThemeToggle.jsx';

// Logo de marca — swappea PNG según theme actual.
import Logo from '../ui/Logo.jsx';

// "Single source of truth" para datos de contacto / redes.
import { socials } from '../../data/socials.js';

// Helper de scroll suave (Lenis). Mismo motor que el resto del sitio.
import { lenisScrollTo } from '../../hooks/useLenis.js';

/**
 * Lista de links del menú principal.
 *
 * Los `to` apuntan a anchors HTML dentro del Home (`/#about`...). Son
 * anchors estándar (<a>) — sirven de fallback y para navegar al Home
 * desde otra ruta. Pero cuando ya estás EN el Home, interceptamos el
 * click (ver handleNavClick) y scrolleamos con Lenis para que la
 * transición sea suave, igual que el resto del scroll del sitio.
 *
 * Tenerlos como array (en vez de 5 <li> hardcodeados) permite que para
 * sumar/quitar una sección solo modifiquemos este array.
 */
const links = [
  { to: '/#about',      label: 'Sobre mí' },
  { to: '/#skills',     label: 'Skills' },
  { to: '/#projects',   label: 'Proyectos' },
  { to: '/#experience', label: 'Experiencia' },
  { to: '/#contact',    label: 'Contacto' },
];

/**
 * Helper interno: renderiza un ícono del sprite SVG global (public/icons.svg).
 *
 * Patrón <svg><use href="/icons.svg#xxx" /></svg>:
 *  - 1 solo request HTTP para TODOS los íconos del sitio.
 *  - El browser cachea el sprite → cambio de página no re-descarga.
 *  - Los <symbol> internos con fill="currentColor" toman el color CSS del
 *    padre → themean automático con clases Tailwind (hover, dark mode...).
 *
 * `aria-hidden` indica al lector de pantalla que ignore el ícono decorativo
 * — el texto accesible lo provee el <a> padre vía aria-label.
 */
function Icon({ id, size = 16 }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

export default function Navbar() {
  // Estado del menú mobile: cerrado por default.
  // `useState` devuelve [valor, setter]. Lo destructuramos en `open` y `setOpen`.
  const [open, setOpen] = useState(false);

  // Función para cerrar el menú al hacer click en un link.
  // Si no la usáramos, el menú quedaría abierto tras navegar — mala UX.
  const closeMenu = () => setOpen(false);

  // Click en un link del navbar.
  //  - Si estamos en el Home: prevenimos el salto nativo del <a> y
  //    scrolleamos con Lenis (suave) a la sección.
  //  - Si estamos en otra ruta: NO prevenimos → el <a href="/#..."> hace
  //    su trabajo y navega al Home posicionado en esa sección.
  const handleNavClick = (event, to) => {
    closeMenu();
    if (window.location.pathname !== '/') return;
    event.preventDefault();
    // 'to' viene como '/#about' → nos quedamos con '#about'.
    lenisScrollTo(to.slice(to.indexOf('#')));
  };

  return (
    // <header> = elemento semántico HTML para el encabezado del sitio.
    // - sticky top-0 z-50:  queda pegado arriba al scrollear, sobre todo lo demás.
    // - bg-bg/70:           color de fondo con 70% de opacidad (alpha en v4).
    // - backdrop-blur-sm:   efecto "vidrio esmerilado" leve. Se usa el
    //   nivel `sm` (no `md`) a propósito: el backdrop-filter re-desenfoca
    //   el fondo en cada frame de scroll — `sm` baja bastante ese costo
    //   manteniendo algo del efecto vidrio.
    // - border-b:           línea fina abajo separando del contenido.
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-sm">

      {/* Contenedor interno: max-width 1200px centrado.
          mx-auto = margin-left/right: auto (centra horizontal).
          px-4 sm:px-6 lg:px-8 → padding lateral progresivo según viewport. */}
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo. NavLink a "/" → click te lleva al home. El onClick
            cierra el menú mobile y fuerza el scroll al tope: si ya
            estás en "/", el pathname no cambia y ScrollToTop no se
            dispara solo. */}
        <NavLink
          to="/"
          onClick={() => {
            closeMenu();
            window.scrollTo(0, 0);
          }}
          aria-label="Inicio"
        >
          <Logo className="h-8 w-auto md:h-9" />
        </NavLink>

        {/* Menú desktop: oculto en mobile (hidden), visible en md+ (≥768px).
            Los links manejan su propio hover → texto gris → verde con transición. */}
        <ul className="hidden gap-7 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <a
                href={link.to}
                onClick={(event) => handleNavClick(event, link.to)}
                className="text-sm font-medium text-text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Bloque derecho: íconos sociales + theme toggle + hamburguesa. */}
        <div className="flex items-center gap-2">

          {/* GitHub.
              - target="_blank":               abre en nueva pestaña.
              - rel="noreferrer noopener":     seguridad anti tabnabbing.
              - aria-label:                    nombre accesible (solo hay ícono). */}
          <a
            href={socials.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon id="github-icon" />
          </a>

          {/* LinkedIn (mismo patrón). */}
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon id="linkedin-icon" />
          </a>

          {/* Botón dark/light. */}
          <ThemeToggle />

          {/* Hamburguesa: solo visible en mobile (md:hidden = oculto en ≥768px).
              Click alterna `open`. El ícono cambia entre Menu (☰) y X (✕). */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-primary transition-colors hover:border-accent hover:text-accent md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Menú mobile (drawer): solo visible en <md cuando `open === true`.
          Render condicional con &&: si la izquierda es falsy, no renderiza nada. */}
      {open && (
        <ul className="flex flex-col gap-1 border-t border-border bg-bg px-4 py-3 md:hidden">
          {links.map((link) => (
            <li key={link.to}>
              <a
                href={link.to}
                onClick={(event) => handleNavClick(event, link.to)}
                className="block rounded-md px-3 py-2 text-base font-medium text-text-muted transition-colors hover:bg-bg-elevated hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
