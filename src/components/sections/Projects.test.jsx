import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mockeamos el hook useProjects ANTES de importar Projects. vi.mock se
// hoistea automáticamente, así que vale escribirlo después del import
// — Vitest lo mueve arriba en compile-time.
// Por qué mockear el hook (y no a Supabase): el hook es una unidad de
// integración por su cuenta; lo que nos interesa testear acá es que
// Projects.jsx renderiza correcto los 4 estados (loading/error/empty/data).
vi.mock('../../hooks/useProjects.js', () => ({
  useProjects: vi.fn(),
}));

import Projects from './Projects.jsx';
import { useProjects } from '../../hooks/useProjects.js';
import { projects as fixtureProjects } from '../../data/projects.js';

/**
 * Helper — Projects usa <Link> de react-router-dom, así que necesita un
 * Router como contexto. MemoryRouter = router para tests (historial en
 * memoria, no toca window.history).
 */
function renderProjects() {
  return render(
    <MemoryRouter>
      <Projects />
    </MemoryRouter>,
  );
}

describe('Projects', () => {
  // Reseteo del mock entre tests: cada uno setea su propio retorno.
  beforeEach(() => {
    useProjects.mockReset();
  });

  test('renderiza heading "Proyectos destacados"', () => {
    useProjects.mockReturnValue({
      data: fixtureProjects,
      loading: false,
      error: null,
    });
    renderProjects();
    expect(
      screen.getByRole('heading', {
        name: /proyectos destacados/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  test('section tiene id="projects" para anclaje #projects', () => {
    useProjects.mockReturnValue({
      data: fixtureProjects,
      loading: false,
      error: null,
    });
    const { container } = renderProjects();
    expect(container.querySelector('section#projects')).toBeInTheDocument();
  });

  test('renderiza una card por cada proyecto', () => {
    useProjects.mockReturnValue({
      data: fixtureProjects,
      loading: false,
      error: null,
    });
    renderProjects();
    // Cada proyecto tiene un h3 con su title.
    fixtureProjects.forEach((project) => {
      expect(
        screen.getByRole('heading', { name: project.title, level: 3 }),
      ).toBeInTheDocument();
    });
  });

  test('cada card linkea a /proyectos/:slug', () => {
    useProjects.mockReturnValue({
      data: fixtureProjects,
      loading: false,
      error: null,
    });
    renderProjects();
    // El <Link> renderiza un <a> con href. Verificamos que apunte a la
    // página de detalle correcta por slug.
    fixtureProjects.forEach((project) => {
      const link = screen
        .getByRole('heading', { name: project.title, level: 3 })
        .closest('a');
      expect(link).toHaveAttribute('href', `/proyectos/${project.slug}`);
    });
  });

  test('muestra el stack técnico de cada proyecto', () => {
    useProjects.mockReturnValue({
      data: fixtureProjects,
      loading: false,
      error: null,
    });
    renderProjects();
    // Sample de tecnologías presentes en > 1 proyecto: usamos
    // getAllByText con length > 0 (getByText falla si hay duplicados).
    expect(screen.getAllByText('PHP').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MySQL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mercado Pago').length).toBeGreaterThan(0);
  });

  // ── Tests nuevos: los estados loading/error/empty del hook ──

  test('estado loading: muestra contenedor con aria-busy', () => {
    useProjects.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
    const { container } = renderProjects();
    // El contenedor de skeletons tiene aria-busy="true".
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  test('estado error: muestra mensaje de error con role="alert"', () => {
    useProjects.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'network failure' },
    });
    renderProjects();
    // role="alert" lo anuncian los lectores de pantalla.
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/no pude cargar los proyectos/i);
  });

  test('estado data vacía: muestra mensaje "pronto vienen proyectos"', () => {
    useProjects.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });
    renderProjects();
    expect(screen.getByText(/pronto vienen proyectos/i)).toBeInTheDocument();
  });
});
