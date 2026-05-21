// React: useEffect para registrar/limpiar listeners de teclado y el
// bloqueo de scroll mientras el lightbox está abierto. useEffectEvent
// (React 19+) "captura" las últimas props sin que sean reactivas — así
// el effect NO se re-suscribe cada vez que el padre re-renderiza.
import { useEffect, useEffectEvent } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Lightbox — visor de imágenes a pantalla completa para la galería de
 * un proyecto.
 *
 * Es un componente CONTROLADO: no tiene estado propio. El padre
 * (ProjectDetail) le pasa qué imagen mostrar y los callbacks de
 * navegación. Así la lógica de estado vive en un solo lugar.
 *
 * Props:
 *  - images  → array de URLs de la galería completa.
 *  - index   → índice de la imagen visible. Si es null, el lightbox
 *              está cerrado y el componente no renderiza nada.
 *  - title   → nombre del proyecto, para los alt de las imágenes.
 *  - onClose → cierra el lightbox.
 *  - onPrev  → muestra la imagen anterior (con wrap-around).
 *  - onNext  → muestra la imagen siguiente (con wrap-around).
 */
export default function Lightbox({ images, index, title, onClose, onPrev, onNext }) {
  // El lightbox está abierto solo cuando index es un número.
  const isOpen = index !== null;

  // Effect Events — leen siempre el último callback del padre sin ser
  // deps reactivas del effect. Sin esto, cada render del padre cambia
  // las refs de onClose/onPrev/onNext y el effect remueve/agrega el
  // listener global, lo que rompe el evento Escape mientras se reabre.
  const handleClose = useEffectEvent(() => onClose());
  const handlePrev = useEffectEvent(() => onPrev());
  const handleNext = useEffectEvent(() => onNext());

  // Effect de teclado + bloqueo de scroll del body.
  //  - Escape cierra; flechas navegan.
  //  - overflow:hidden en el body evita que la página de atrás scrollee.
  //  - El return del effect es la limpieza: saca el listener y restaura
  //    el scroll. Corre al cerrar o al desmontar.
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e) {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    }

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrado → no renderiza nada.
  if (!isOpen) return null;

  // Solo mostramos las flechas de navegación si hay más de una imagen.
  const hasMultiple = images.length > 1;

  return (
    // Overlay full-screen. Click en el fondo cierra. role/aria para
    // accesibilidad: se anuncia como diálogo modal. El soporte de
    // teclado lo provee el listener global de Escape (useEffect arriba),
    // que cierra el diálogo desde cualquier foco — no hace falta un
    // onKeyDown en el overlay. react-doctor lo marca como warning; lo
    // aceptamos porque la accesibilidad real ya está cubierta.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${title}`}
    >
      {/* Botón cerrar — esquina superior derecha. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar galería"
        className="absolute right-4 top-4 rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={24} aria-hidden="true" />
      </button>

      {/* Flecha anterior. stopPropagation evita que el click cierre el
          lightbox (el click llegaría al overlay de atrás). */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Imagen anterior"
          className="absolute left-4 rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft size={32} aria-hidden="true" />
        </button>
      )}

      {/* Imagen. stopPropagation para que clickearla no cierre. El
          teclado interactúa con los botones (X / flechas), la imagen
          es decorativa dentro del diálogo. react-doctor marca warning,
          aceptado. */}
      <img
        src={images[index]}
        alt={`${title} — captura ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
      />

      {/* Flecha siguiente. */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Imagen siguiente"
          className="absolute right-4 rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronRight size={32} aria-hidden="true" />
        </button>
      )}

      {/* Contador "2 / 3" — abajo centrado. */}
      {hasMultiple && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white/80">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
}
