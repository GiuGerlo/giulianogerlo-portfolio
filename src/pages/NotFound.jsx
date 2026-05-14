// `Link` cambia de URL sin recargar la página (preserva el estado de React).
// Visualmente y semánticamente es un <a> en el HTML final.
import { Link } from 'react-router-dom';

/**
 * Página 404 — se muestra cuando la URL no matchea ninguna ruta definida.
 *
 * La <Route path="*"> en App.jsx la dispara como fallback.
 */
export default function NotFound() {
  return (
    // h-screen + flex column centra todo verticalmente y horizontal.
    // gap-4 = 1rem (16px) entre cada hijo del flex.
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-text-muted">Página no encontrada</p>

      {/* Link va al home. hover:underline = subraya al pasar el mouse. */}
      <Link to="/" className="text-accent hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}
