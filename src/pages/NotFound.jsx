import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-text-muted">Página no encontrada</p>
      <Link to="/" className="text-accent hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}
