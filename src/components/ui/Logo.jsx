import { useTheme } from '../../hooks/useTheme.js';

/**
 * Logo — wrapper de la imagen de marca del sitio ({gg}.dev).
 *
 * Swappea el archivo SVG según el theme actual:
 *  - dark   → /logo-original.svg    (texto blanco + .dev verde)
 *  - light  → /logo-secundario.svg  (texto negro  + .dev verde)
 *
 * Son SVG vectoriales recortados al ras del wordmark (viewBox 600x144,
 * proporción ~4.17:1). Al estar recortados y ser vectoriales:
 *  - se ven nítidos a cualquier tamaño,
 *  - el caller solo fija el ALTO (`h-*`) y el ancho va `w-auto`
 *    respetando la proporción natural — sin `object-cover` ni anchos
 *    mágicos como cuando el logo era un PNG cuadrado con relleno.
 *
 * Props:
 *  - className → fija el alto (ej. 'h-9 w-auto'). Default para navbar.
 */
export default function Logo({ className = 'h-9 w-auto' }) {
  // Hook custom: lee el theme actual del DOM/localStorage.
  // Se re-renderiza automáticamente cuando el usuario togglea el tema.
  const { theme } = useTheme();

  // Path al SVG correcto según el theme. Sin imports — Vite sirve
  // `public/` desde la raíz, así que `/logo-*.svg` funciona en dev
  // y en build.
  const src =
    theme === 'dark' ? '/logo-original.svg' : '/logo-secundario.svg';

  return (
    <img
      src={src}
      alt="Giuliano Gerlo"
      className={className}
      // Dimensiones reales del SVG (viewBox). Evitan layout shift
      // mientras carga (CLS); el tamaño en pantalla lo fija className.
      width={600}
      height={144}
      // Hint al browser para que cargue rápido (es above-the-fold,
      // está en el Navbar pegado arriba).
      loading="eager"
      decoding="async"
    />
  );
}
