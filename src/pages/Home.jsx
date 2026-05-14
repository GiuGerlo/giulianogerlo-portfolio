/**
 * Página Home — placeholder.
 *
 * Navbar y Footer ya no se renderizan acá: viven en Layout (envuelve
 * todas las rutas vía <Outlet />). Esta página solo expone su contenido.
 *
 * En Phase 4 se va a poblar con las 8 secciones del portfolio (Hero,
 * About, Skills, AI, Projects, Experience, Education, Contact).
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
      Home page
    </div>
  );
}
