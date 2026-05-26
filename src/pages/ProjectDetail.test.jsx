import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mockeamos useProject ANTES de importar ProjectDetail. vi.mock se
// hoistea automáticamente al tope del módulo.
// Por qué: queremos testear ProjectDetail con data controlada,
// independiente del fetch real a Supabase.
vi.mock('../hooks/useProject.js', () => ({
  useProject: vi.fn(),
}));

import ProjectDetail from './ProjectDetail.jsx';
import { useProject } from '../hooks/useProject.js';
import { projects as fixtureProjects } from '../data/projects.js';

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
  beforeEach(() => {
    useProject.mockReset();
  });

  test('slug válido: renderiza el título del proyecto como h1', () => {
    const sample = fixtureProjects[0];
    useProject.mockReturnValue({ data: sample, loading: false, error: null });
    renderAt(`/proyectos/${sample.slug}`);
    expect(
      screen.getByRole('heading', { name: sample.title, level: 1 }),
    ).toBeInTheDocument();
  });

  test('slug válido: muestra resumen, rol y stack', () => {
    const sample = fixtureProjects[0];
    useProject.mockReturnValue({ data: sample, loading: false, error: null });
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
    // useProject termina de cargar y devuelve data: null (caso 404).
    useProject.mockReturnValue({ data: null, loading: false, error: null });
    renderAt('/proyectos/este-slug-no-existe');
    // ProjectDetail hace <Navigate to="/404" /> → cae en la ruta "*".
    expect(screen.getByText('FALLBACK 404')).toBeInTheDocument();
  });

  test('estado loading: muestra skeleton con aria-busy', () => {
    useProject.mockReturnValue({ data: null, loading: true, error: null });
    const { container } = renderAt('/proyectos/whatever');
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  test('estado error: muestra mensaje de error sin redirigir', () => {
    useProject.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'network failure' },
    });
    renderAt('/proyectos/whatever');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/no pude cargar el proyecto/i);
  });
});
