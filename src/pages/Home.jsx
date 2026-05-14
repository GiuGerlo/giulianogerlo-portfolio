// TEMPORAL: importamos Navbar solo para preview visual mientras desarrollamos.
// En Task 1.5 esto se mueve al componente Layout (que envuelve TODAS las
// rutas vía <Outlet />), y se elimina de acá.
import Navbar from '../components/layout/Navbar.jsx';

/**
 * Página Home — placeholder.
 *
 * En Phase 4 se va a poblar con las 8 secciones del portfolio (Hero,
 * About, Skills, AI, Projects, Experience, Education, Contact).
 *
 * El fragmento <>...</> (React Fragment) permite devolver múltiples
 * elementos sin agregar un <div> envoltorio extra al DOM.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <div className="p-8">Home page</div>
    </>
  );
}
