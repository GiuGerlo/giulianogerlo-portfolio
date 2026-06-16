import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAdminList.js', () => ({
  useAdminList: vi.fn(),
}));

// El dropdown de projectSlug usa useAdminProjects; lo mockeamos con 1 proyecto.
vi.mock('../../hooks/useAdminProjects.js', () => ({
  useAdminProjects: () => ({
    data: [{ id: 'p1', slug: 'ramcc', title: 'RAMCC' }],
    loading: false,
    error: null,
  }),
}));

import Experience from './Experience.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';

const fixture = [
  { id: 'a', dateLabel: 'NOV 2024', dateStart: '2024-11', dateEnd: null, role: 'Dev', company: 'RAMCC', description: 'd', current: true, projectSlug: 'ramcc', orderIndex: 0 },
  { id: 'b', dateLabel: 'JUL 2025', dateStart: '2025-07', dateEnd: '2025-09', role: 'Colab', company: 'X', description: 'd2', current: false, projectSlug: null, orderIndex: 1 },
];

function mockList(overrides = {}) {
  const api = {
    data: fixture,
    loading: false,
    error: null,
    busy: false,
    create: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockResolvedValue({ error: null }),
    remove: vi.fn().mockResolvedValue({ error: null }),
    move: vi.fn().mockResolvedValue({ error: null }),
    reload: vi.fn(),
    ...overrides,
  };
  useAdminList.mockReturnValue(api);
  return api;
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Experience />
    </MemoryRouter>,
  );
}

describe('Experience (admin)', () => {
  beforeEach(() => {
    useAdminList.mockReset();
  });

  test('lista las experiencias con badge "actual"', () => {
    mockList();
    renderPage();
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('Colab')).toBeInTheDocument();
    expect(screen.getByText(/actual/i)).toBeInTheDocument();
  });

  test('editar: prefilea y el select de proyecto ofrece los proyectos', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /editar/i })[0]);
    expect(screen.getByLabelText(/rol/i)).toHaveValue('Dev');
    // El select de proyecto tiene la opción del proyecto mockeado.
    expect(screen.getByRole('option', { name: 'RAMCC' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^guardar$/i }));
    await waitFor(() => {
      expect(api.update).toHaveBeenCalledWith('a', expect.objectContaining({ role: 'Dev' }));
    });
  });

  test('borrar: dialog → confirmar llama remove(id)', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /borrar/i })[0]);
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /borrar/i }));
    await waitFor(() => expect(api.remove).toHaveBeenCalledWith('a'));
  });
});
