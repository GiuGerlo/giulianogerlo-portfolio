// `Routes` y `Route` son los componentes que definen el sistema de rutas.
// Routes es como un switch: mira la URL actual y renderiza UNA Route
// que matchee. Si ninguna matchea, la Route con path="*" actúa de fallback.
import { Routes, Route } from 'react-router-dom';

// Páginas (componentes de ruta entera).
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * App = árbol de rutas del portfolio.
 *
 * Actualmente:
 *  - "/"  → Home
 *  - "*"  → NotFound (cualquier URL no definida)
 *
 * En Task 1.5 se va a sumar una <Route element={<Layout />}> envolviendo
 * estas rutas para compartir Navbar + Footer entre todas las páginas.
 * También se agregará "/proyectos/:slug".
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
