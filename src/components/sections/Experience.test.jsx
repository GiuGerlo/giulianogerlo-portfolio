import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Experience from './Experience.jsx';
import { experience } from '../../data/experience.js';

/**
 * Helper — Experience usa <Link> (items con projectSlug), así que
 * necesita un Router como contexto. MemoryRouter = router para tests.
 */
function renderExperience() {
  return render(
    <MemoryRouter>
      <Experience />
    </MemoryRouter>,
  );
}

describe('Experience', () => {
  test('renderiza heading "Experiencia"', () => {
    renderExperience();
    expect(
      screen.getByRole('heading', { name: /^experiencia$/i, level: 2 }),
    ).toBeInTheDocument();
  });

  test('section tiene id="experience" para anclaje #experience', () => {
    const { container } = renderExperience();
    expect(
      container.querySelector('section#experience'),
    ).toBeInTheDocument();
  });

  test('renderiza un item por cada experiencia', () => {
    renderExperience();
    // Cada item tiene un h3 con su role.
    experience.forEach((item) => {
      expect(
        screen.getByRole('heading', { name: item.role, level: 3 }),
      ).toBeInTheDocument();
    });
  });

  test('el item con current:true recibe punto sólido (bg-accent)', () => {
    renderExperience();
    // El punto del timeline tiene data-testid timeline-dot-<id>.
    // Item current → bg-accent + ring (halo). Item normal → bg-bg.
    experience.forEach((item) => {
      const dot = screen.getByTestId(`timeline-dot-${item.id}`);
      if (item.current) {
        expect(dot).toHaveClass('bg-accent');
      } else {
        expect(dot).toHaveClass('bg-bg');
      }
    });
  });

  test('muestra el dateLabel de cada experiencia', () => {
    renderExperience();
    // getAllByText: dos items comparten "NOV 2024 — ACTUALIDAD", así que
    // verificamos que aparezca al menos una vez por cada item esperado.
    experience.forEach((item) => {
      expect(screen.getAllByText(item.dateLabel).length).toBeGreaterThan(0);
    });
  });

  test('item con projectSlug linkea a /proyectos/:slug; sin slug no linkea', () => {
    renderExperience();
    experience.forEach((item) => {
      // El <h3> del rol; subimos al <a> más cercano si existe.
      const link = screen
        .getByRole('heading', { name: item.role, level: 3 })
        .closest('a');
      if (item.projectSlug) {
        expect(link).toHaveAttribute(
          'href',
          `/proyectos/${item.projectSlug}`,
        );
      } else {
        // Item sin projectSlug no debe estar dentro de un <a>.
        expect(link).toBeNull();
      }
    });
  });
});
