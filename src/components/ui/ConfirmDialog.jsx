import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'motion/react';

import Button from './Button.jsx';

/**
 * ConfirmDialog — modal de confirmación reusable (reemplaza window.confirm,
 * que se ve feo y no es estilable).
 *
 * Controlado: el parent maneja `open` y qué hacer en confirmar/cancelar.
 *
 * Props:
 *  - open: boolean — si se muestra.
 *  - title, message: textos.
 *  - confirmLabel / cancelLabel: textos de los botones.
 *  - danger: boolean — pinta el botón de confirmar en rojo (acción destructiva).
 *  - onConfirm / onCancel: handlers.
 *
 * Accesibilidad / UX:
 *  - role="alertdialog" + aria-modal + aria-labelledby/­describedby.
 *  - Esc cancela; click en el backdrop cancela; foco al botón confirmar al abrir.
 *  - Se renderiza en un portal a document.body para no quedar atrapado en el
 *    stacking context del padre.
 *  - Animación con Motion (fade del backdrop + scale del panel), con
 *    AnimatePresence para animar también la salida.
 */
export default function ConfirmDialog({
  open,
  title = '¿Confirmás?',
  message,
  confirmLabel = 'Borrar',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Esc cancela.
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    // Foco al botón confirmar (en el próximo frame, tras montar).
    const t = setTimeout(() => confirmRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <LazyMotion features={domAnimation}>
          {/* Backdrop: click afuera cancela. */}
          <m.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
          >
            {/* Panel: stopPropagation para que el click adentro no cierre. */}
            <m.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby={message ? 'confirm-message' : undefined}
              className="w-full max-w-sm rounded-xl border border-border bg-bg-elevated p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="confirm-title" className="mb-2 text-base font-semibold text-text-primary">
                {title}
              </h2>
              {message && (
                <p id="confirm-message" className="mb-5 text-sm text-text-muted">
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>
                  {cancelLabel}
                </Button>
                <Button
                  ref={confirmRef}
                  type="button"
                  variant="primary"
                  onClick={onConfirm}
                  className={danger ? 'border-red-500 bg-red-500 hover:bg-red-600' : undefined}
                >
                  {confirmLabel}
                </Button>
              </div>
            </m.div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>,
    document.body,
  );
}
