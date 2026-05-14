// `Outlet` es el "hueco" donde React Router inserta el componente hijo
// de la ruta matcheada. Lo usamos para compartir layout (Navbar + Footer)
// entre todas las páginas sin repetir el JSX en cada una.
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

/**
 * Layout — wrapper común de todas las páginas del sitio.
 *
 * En App.jsx se usa como "layout route" (sin path), envolviendo a las
 * rutas hijas. React Router renderiza este componente y donde está el
 * <Outlet /> mete la página correspondiente (Home, ProjectDetail, etc.).
 *
 * El <main> tiene min-h-screen para que en páginas con poco contenido
 * el Footer no se "pegue" arriba (queda al final del viewport).
 */
export default function Layout() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
