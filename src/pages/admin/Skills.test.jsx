import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mockeamos useAdminList: controlamos data + espiamos las mutaciones. Así
// testeamos la UI de CRUD inline sin tocar Supabase.
vi.mock('../../hooks/useAdminList.js', () => ({
  useAdminList: vi.fn(),
}));

import Skills from './Skills.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';

const fixture = [
  { id: 'a', title: 'Frontend', icon: 'Layout', items: ['React', 'CSS'], orderIndex: 0 },
  { id: 'b', title: 'Backend', icon: 'Server', items: ['PHP'], orderIndex: 1 },
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

function renderSkills() {
  return render(
    <MemoryRouter>
      <Skills />
    </MemoryRouter>,
  );
}

describe('Skills (admin)', () => {
  beforeEach(() => {
    useAdminList.mockReset();
  });

  test('lista los grupos existentes', () => {
    mockList();
    renderSkills();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  test('agregar grupo: abre form y create() con los valores', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderSkills();

    await user.click(screen.getByRole('button', { name: /agregar grupo/i }));
    await user.type(screen.getByLabelText(/título/i), 'DevOps');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'DevOps' }),
      );
    });
  });

  test('editar grupo: prefilea y llama update(id, values)', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderSkills();

    await user.click(screen.getAllByRole('button', { name: /editar/i })[0]);
    // El form prefilea el título del primer grupo (Frontend).
    expect(screen.getByLabelText(/título/i)).toHaveValue('Frontend');

    await user.click(screen.getByRole('button', { name: /^guardar$/i }));
    await waitFor(() => {
      expect(api.update).toHaveBeenCalledWith('a', expect.objectContaining({ title: 'Frontend' }));
    });
  });

  test('borrar: abre ConfirmDialog y confirmar llama remove(id)', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderSkills();

    // Click en el botón borrar de la fila → abre el dialog (no borra aún).
    await user.click(screen.getAllByRole('button', { name: /borrar/i })[0]);
    expect(api.remove).not.toHaveBeenCalled();

    // Confirmar dentro del dialog → recién ahí llama remove.
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /borrar/i }));
    await waitFor(() => {
      expect(api.remove).toHaveBeenCalledWith('a');
    });
  });

  test('reorder: bajar el primero llama move(id, 1)', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderSkills();

    await user.click(screen.getAllByRole('button', { name: /bajar/i })[0]);
    expect(api.move).toHaveBeenCalledWith('a', 1);
  });
});
