// `Routes` y `Route` son los componentes que definen el sistema de rutas.
// Routes es como un switch: mira la URL actual y renderiza UNA Route
// que matchee. Si ninguna matchea, la Route con path="*" actúa de fallback.
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Vercel Web Analytics — registra visitas/page views sin cookies.
import { Analytics } from '@vercel/analytics/react';

// Layout = wrapper con Navbar + Footer + <Outlet /> para el contenido.
import Layout from './components/layout/Layout.jsx';

// Home se importa normal: es la landing, no queremos demorarla.
import Home from './pages/Home.jsx';

// ProjectDetail y NotFound se cargan con lazy(): su código sale del
// bundle inicial y se baja en su propio chunk recién cuando se visita
// esa ruta (code splitting). El <Suspense> que muestra el fallback
// mientras carga vive en Layout.jsx, alrededor del <Outlet />.
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Admin: TODO lazy. El bundle público del sitio NO incluye nada del
// panel — se baja solo cuando un visitante navega a /admin/*.
// Esto es importante para no inflar el JS que carga un usuario casual.
const AdminRoute = lazy(() => import('./components/admin/AdminRoute.jsx'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const Login = lazy(() => import('./pages/admin/Login.jsx'));
const AuthCallback = lazy(() => import('./pages/admin/AuthCallback.jsx'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const ProjectForm = lazy(() => import('./pages/admin/ProjectForm.jsx'));

/**
 * App = árbol de rutas del portfolio.
 *
 * Estructura:
 *  - Bloque público: rutas envueltas en <Layout /> (Navbar + main + Footer).
 *  - Bloque admin: rutas fuera del Layout (no muestran nav pública).
 *    Tiene su propio <Suspense> porque está afuera del que vive en
 *    Layout.jsx.
 *
 * Patrón "layout route" del bloque público: la <Route element={<Layout />}>
 * NO tiene `path`, solo envuelve. React Router renderiza Layout y donde
 * está el <Outlet /> dentro de Layout mete la página matcheada.
 *
 * Rutas públicas:
 *  - "/"                  → Home
 *  - "/proyectos/:slug"   → ProjectDetail
 *  - "*"                  → NotFound
 *
 * Rutas admin (sin layout público, todas lazy):
 *  - "/admin/login"         → Login (form magic link)
 *  - "/admin/auth/callback" → AuthCallback (exchange del token)
 *  - "/admin"               → Dashboard (protegido por AdminRoute)
 */
function App() {
  return (
    <>
      <Routes>
        {/* ── Bloque público ── */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/proyectos/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ── Bloque admin (fuera del Layout público) ──
            Suspense propio: los chunks lazy del admin tardan en bajar
            la primera vez (1-2KB), mostramos un fallback minimal. */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<div className="min-h-screen" />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/admin/auth/callback"
          element={
            <Suspense fallback={<div className="min-h-screen" />}>
              <AuthCallback />
            </Suspense>
          }
        />

        {/* Rutas protegidas: AdminRoute gatea el acceso (sesión + email
            allowlisteado). Dentro, AdminLayout aporta la topbar común
            (link al sitio, email, logout). Cada ruta hija se renderiza
            dentro del <Outlet /> de AdminLayout. */}
        <Route
          element={
            <Suspense fallback={<div className="min-h-screen" />}>
              <AdminRoute />
            </Suspense>
          }
        >
          <Route
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/projects/new" element={<ProjectForm />} />
            <Route path="/admin/projects/:id" element={<ProjectForm />} />
          </Route>
        </Route>
      </Routes>

      {/* Vercel Web Analytics. No renderiza nada visible: inyecta el
          script de tracking. Solo manda datos en producción (en dev y
          en los tests es no-op). */}
      <Analytics />
    </>
  );
}

export default App;
