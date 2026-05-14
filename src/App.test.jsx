import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

// Smoke tests del routing.
// MemoryRouter nos permite "fingir" una URL inicial sin tocar el
// browser real (no hay window.location en jsdom). `initialEntries` es
// el historial inicial — el último elemento es la URL "actual".

test('renders Home on /', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Home page/i)).toBeInTheDocument();
});

test('renders ProjectDetail with slug on /proyectos/:slug', () => {
  render(
    <MemoryRouter initialEntries={['/proyectos/clovertecno']}>
      <App />
    </MemoryRouter>
  );
  // El slug se muestra dinámicamente — confirmamos que la ruta matchea
  // y que useParams() leyó correctamente el segmento de URL.
  expect(screen.getByText(/Proyecto: clovertecno/i)).toBeInTheDocument();
});

test('renders 404 on unknown route', () => {
  render(
    <MemoryRouter initialEntries={['/no-existe']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText('404')).toBeInTheDocument();
});

test('Layout renders Navbar + Footer on every page', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  // Navbar tiene el brand "giuliano.dev" como link al home.
  // getAllByText porque también puede aparecer en el Footer.
  expect(screen.getAllByText(/giuliano/i).length).toBeGreaterThan(0);
  // Footer tiene el copyright con el año actual.
  const year = new Date().getFullYear();
  expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
});
