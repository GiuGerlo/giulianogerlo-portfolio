import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import ProjectDetail from './ProjectDetail.jsx';
import { projects } from '../data/projects.js';

/**
 * Helper: monta ProjectDetail dentro de un router en memoria, en la
 * ruta que se le pase. Incluye una ruta "*" de fallback para poder
 * detectar la redirección a /404 cuando el slug no existe.
 */
function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/proyectos/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<div>FALLBACK 404</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProjectDetail', () => {
  test('slug válido: renderiza el título del proyecto como h1', () => {
    const sample = projects[0];
    renderAt(`/proyectos/${sample.slug}`);
    expect(
      screen.getByRole('heading', { name: sample.title, level: 1 }),
    ).toBeInTheDocument();
  });

  test('slug válido: muestra resumen, rol y stack', () => {
    const sample = projects[0];
    renderAt(`/proyectos/${sample.slug}`);
    // Secciones fijas (siempre presentes).
    expect(
      screen.getByRole('heading', { name: /resumen/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /mi rol/i, level: 2 }),
    ).toBeInTheDocument();
    // Un tech del stack aparece como tag.
    expect(screen.getByText(sample.stack[0])).toBeInTheDocument();
  });

  test('slug inexistente: redirige a /404 (ruta fallback)', () => {
    renderAt('/proyectos/este-slug-no-existe');
    // ProjectDetail hace <Navigate to="/404" /> → cae en la ruta "*".
    expect(screen.getByText('FALLBACK 404')).toBeInTheDocument();
  });
});
