import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Projects from './Projects.jsx';
import { projects } from '../../data/projects.js';

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
  test('renderiza heading "Proyectos destacados"', () => {
    renderProjects();
    expect(
      screen.getByRole('heading', {
        name: /proyectos destacados/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  test('section tiene id="projects" para anclaje #projects', () => {
    const { container } = renderProjects();
    expect(container.querySelector('section#projects')).toBeInTheDocument();
  });

  test('renderiza una card por cada proyecto', () => {
    renderProjects();
    // Cada proyecto tiene un h3 con su title.
    projects.forEach((project) => {
      expect(
        screen.getByRole('heading', { name: project.title, level: 3 }),
      ).toBeInTheDocument();
    });
  });

  test('cada card linkea a /proyectos/:slug', () => {
    renderProjects();
    // El <Link> renderiza un <a> con href. Verificamos que apunte a la
    // página de detalle correcta por slug.
    projects.forEach((project) => {
      const link = screen
        .getByRole('heading', { name: project.title, level: 3 })
        .closest('a');
      expect(link).toHaveAttribute('href', `/proyectos/${project.slug}`);
    });
  });

  test('muestra el stack técnico de cada proyecto', () => {
    renderProjects();
    // Sample de tecnologías — si la data cambia, el test falla explícito.
    // PHP aparece en varios proyectos (Clovertecno, RAMCC, etc.) → usamos
    // getAllByText y verificamos que haya al menos una ocurrencia.
    // Varias tecnologías aparecen en > 1 proyecto, por eso usamos
    // getAllByText con length > 0 en vez de getByText (que falla si hay
    // duplicados). Sample de tags que están presentes en algún stack.
    expect(screen.getAllByText('PHP').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MySQL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mercado Pago').length).toBeGreaterThan(0);
  });
});
