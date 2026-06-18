import { test, expect } from 'vitest';
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
  // Home compone <Hero />. Asertamos el "$ whoami" del Hero, que es estático
  // (no depende de la DB ni está detrás del skeleton/fetch) → determinístico,
  // sin depender de timing de red (el h1 con el nombre llega async tras cargar
  // site_settings, eso lo cubren los tests de Hero).
  expect(screen.getByText('$ whoami')).toBeInTheDocument();
});

test('renders ProjectDetail with slug on /proyectos/:slug', async () => {
  render(
    <MemoryRouter initialEntries={['/proyectos/clovertecno']}>
      <App />
    </MemoryRouter>
  );
  // ProjectDetail busca el proyecto por slug y renderiza su título como
  // h1 — confirmamos que la ruta matcheó y resolvió el proyecto.
  // findBy* (no getBy*) porque ProjectDetail es lazy: hay que esperar
  // a que se baje su chunk antes de que el h1 exista en el DOM.
  expect(
    await screen.findByRole('heading', { level: 1, name: /clovertecno/i }),
  ).toBeInTheDocument();
});

test('renders 404 on unknown route', async () => {
  render(
    <MemoryRouter initialEntries={['/no-existe']}>
      <App />
    </MemoryRouter>
  );
  // NotFound también es lazy → findBy* espera a que cargue su chunk.
  expect(await screen.findByText('404')).toBeInTheDocument();
});

test('Layout renders Navbar + Footer on every page', () => {
  render(
    <MemoryRouter initialEntries={['/proyectos/clovertecno']}>
      <App />
    </MemoryRouter>
  );
  // Navbar tiene el brand "giuliano.dev". Lo testeamos en /proyectos/...
  // para evitar colisión con el h1 "Giuliano Gerlo" del Hero (que solo
  // está en /). En esta ruta el brand aparece único en Navbar.
  expect(screen.getAllByText(/giuliano/i).length).toBeGreaterThan(0);
  // Footer tiene el copyright con el año actual.
  const year = new Date().getFullYear();
  expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
});
