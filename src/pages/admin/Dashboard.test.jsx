import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mocks ANTES de importar Dashboard (vi.mock se hoistea):
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

import Dashboard from './Dashboard.jsx';
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

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard', () => {
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
    const { container } = renderDashboard();
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
    renderDashboard();
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
    renderDashboard();
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
    renderDashboard();
    // Títulos
    expect(screen.getByText('Gym Tracker')).toBeInTheDocument();
    expect(screen.getByText('Next Tienda')).toBeInTheDocument();
    // Badges
    expect(screen.getByText(/publicado/i)).toBeInTheDocument();
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
    // Link "Editar" por proyecto.
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

    // Mock chain: supabase.from('projects').update(...).eq(...) → resolves OK.
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    supabase.from.mockReturnValue({ update: updateMock });

    const user = userEvent.setup();
    renderDashboard();

    // Click en el toggle del proyecto publicado → debería ir a draft.
    const toggleBtn = screen.getByRole('button', {
      name: /ocultar Gym Tracker/i,
    });
    await user.click(toggleBtn);

    // setData fue llamado para optimistic update.
    expect(setData).toHaveBeenCalled();

    // Supabase fue llamado con la update correcta.
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(updateMock).toHaveBeenCalledWith({ published: false });
      expect(eqMock).toHaveBeenCalledWith('id', 'aaa');
    });
  });
});
