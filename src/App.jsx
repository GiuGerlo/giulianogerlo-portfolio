// `Routes` y `Route` son los componentes que definen el sistema de rutas.
// Routes es como un switch: mira la URL actual y renderiza UNA Route
// que matchee. Si ninguna matchea, la Route con path="*" actúa de fallback.
import { Routes, Route } from 'react-router-dom';

// Layout = wrapper con Navbar + Footer + <Outlet /> para el contenido.
import Layout from './components/layout/Layout.jsx';

// Páginas (componentes de ruta entera).
import Home from './pages/Home.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * App = árbol de rutas del portfolio.
 *
 * Patrón "layout route": la <Route element={<Layout />}> NO tiene `path`,
 * solo envuelve. React Router primero renderiza Layout (Navbar + main +
 * Footer), y donde está el <Outlet /> dentro de Layout mete la página
 * matcheada (Home / ProjectDetail / NotFound).
 *
 * Esto evita repetir <Navbar /> y <Footer /> en cada página.
 *
 * Rutas:
 *  - "/"                  → Home
 *  - "/proyectos/:slug"   → ProjectDetail (slug = parámetro dinámico)
 *  - "*"                  → NotFound (cualquier URL no definida)
 */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
