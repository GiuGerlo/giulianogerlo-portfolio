import { useTheme } from '../../hooks/useTheme.js';

/**
 * Logo — wrapper de la imagen de marca del sitio.
 *
 * Swappea el archivo según el theme actual:
 *  - dark   → /logo-original.png    (fondo negro, texto blanco + .dev verde)
 *  - light  → /logo-secundario.png  (fondo blanco, texto negro + .dev verde)
 *
 * Como ambos PNG tienen fondo OPACO que matchea el bg del theme,
 * el "rectángulo" de fondo se confunde con el header — visualmente
 * parece transparente. Si en algún momento se reexportan como PNG
 * con alpha transparente, este componente sigue funcionando igual.
 *
 * Los archivos viven en `public/` → se sirven en `/logo-*.png` (Vite
 * no los procesa, los entrega tal cual al cliente). `public/` es el
 * lugar correcto para assets que NO necesitan transformación (favicons,
 * robots.txt, logos sin import).
 *
 * Props:
 *  - className → clases extras (ej. tamaño custom). Default h-9.
 */
export default function Logo({ className = 'h-9 w-auto' }) {
  // Hook custom: lee el theme actual del DOM/localStorage.
  // Se re-renderiza automáticamente cuando el usuario togglea el tema.
  const { theme } = useTheme();

  // Path al PNG correcto según el theme. Sin imports — Vite sirve
  // `public/` desde la raíz, así que `/logo-*.png` funciona en dev
  // y en build.
  const src =
    theme === 'dark' ? '/logo-original.png' : '/logo-secundario.png';

  return (
    <img
      src={src}
      alt="Giuliano Gerlo"
      className={className}
      // Evita layout shift mientras carga (CLS).
      width={1000}
      height={1000}
      // Hint al browser para que cargue rápido (es above-the-fold,
      // está en el Navbar pegado arriba).
      loading="eager"
      decoding="async"
    />
  );
}
