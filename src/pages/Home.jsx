// TEMPORAL: importamos Navbar y Footer solo para preview visual mientras
// desarrollamos. En Task 1.5 esto se mueve al componente Layout (que
// envuelve TODAS las rutas vía <Outlet />), y se elimina de acá.
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

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
      {/* min-h-screen acá fuerza que el footer se vea abajo aunque la
          página esté casi vacía. En Task 1.5 esto va al <main> del Layout. */}
      <main className="min-h-[60vh] p-8">Home page</main>
      <Footer />
    </>
  );
}
