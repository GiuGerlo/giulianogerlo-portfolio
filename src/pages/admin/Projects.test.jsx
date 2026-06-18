import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mocks ANTES de importar Projects (vi.mock se hoistea):
//  - useAdminProjects: controlamos data/loading/error/refetch/setData.
//  - supabase: interceptamos las UPDATE.
vi.mock('../../hooks/useAdminProjects.js', () => ({
  useAdminProjects: vi.fn(),
}));

vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import Projects from './Projects.jsx';
import { useAdminProjects } from '../../hooks/useAdminProjects.js';
import { supabase } from '../../lib/supabase.js';

// Fixture mínima: 2 proyectos en orden.
const fixtureProjects = [
  {
    id: 'aaa',
    slug: 'gym-tracker',
    title: 'Gym Tracker',
    category: 'Full-Stack',
    image: null,
    orderIndex: 0,
    published: true,
    updatedAt: '2026-05-26T20:27:06Z',
  },
  {
    id: 'bbb',
    slug: 'next-tienda',
    title: 'Next Tienda',
    category: 'E-commerce',
    image: null,
    orderIndex: 1,
    published: false,
    updatedAt: '2026-05-26T20:30:00Z',
  },
];

function renderProjects() {
  return render(
    <MemoryRouter>
      <Projects />
    </MemoryRouter>,
  );
}

describe('Projects (admin)', () => {
  beforeEach(() => {
    useAdminProjects.mockReset();
    supabase.from.mockReset();
  });

  test('loading: muestra "Cargando proyectos…" con aria-busy', () => {
    useAdminProjects.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });
    const { container } = renderProjects();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  test('error: muestra alert', () => {
    useAdminProjects.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'fail' },
      refetch: vi.fn(),
      setData: vi.fn(),
    });
    renderProjects();
    expect(screen.getByRole('alert')).toHaveTextContent(/no pude cargar/i);
  });

  test('data vacía: muestra CTA de crear primero', () => {
    useAdminProjects.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });
    renderProjects();
    expect(screen.getByText(/todavía no hay proyectos/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /crear el primero/i }),
    ).toBeInTheDocument();
  });

  test('data con proyectos: renderiza un item por proyecto con título y badge de estado', () => {
    useAdminProjects.mockReturnValue({
      data: fixtureProjects,
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });
    renderProjects();
    expect(screen.getByText('Gym Tracker')).toBeInTheDocument();
    expect(screen.getByText('Next Tienda')).toBeInTheDocument();
    expect(screen.getByText(/publicado/i)).toBeInTheDocument();
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /editar Gym Tracker/i }),
    ).toHaveAttribute('href', '/admin/projects/aaa');
  });

  test('toggle published: optimistic update + UPDATE a supabase', async () => {
    const setData = vi.fn();
    useAdminProjects.mockReturnValue({
      data: fixtureProjects,
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData,
    });

    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    supabase.from.mockReturnValue({ update: updateMock });

    const user = userEvent.setup();
    renderProjects();

    const toggleBtn = screen.getByRole('button', {
      name: /ocultar Gym Tracker/i,
    });
    await user.click(toggleBtn);

    expect(setData).toHaveBeenCalled();

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(updateMock).toHaveBeenCalledWith({ published: false });
      expect(eqMock).toHaveBeenCalledWith('id', 'aaa');
    });
  });
});
