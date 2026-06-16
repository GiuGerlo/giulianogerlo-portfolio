import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAdminList.js', () => ({
  useAdminList: vi.fn(),
}));

import AiSkills from './AiSkills.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';

const fixture = [
  { id: 'a', title: 'mcp_servers', status: 'active', description: 'MCP desc', items: [], orderIndex: 0 },
  { id: 'b', title: 'agent_sdk', status: 'exploring', description: 'Agentes', items: ['x'], orderIndex: 1 },
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
      <AiSkills />
    </MemoryRouter>,
  );
}

describe('AiSkills (admin)', () => {
  beforeEach(() => {
    useAdminList.mockReset();
  });

  test('lista las skills existentes con su estado', () => {
    mockList();
    renderPage();
    expect(screen.getByText('mcp_servers')).toBeInTheDocument();
    expect(screen.getByText('agent_sdk')).toBeInTheDocument();
    expect(screen.getByText('exploring')).toBeInTheDocument();
  });

  test('agregar: create() con title + status', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /agregar skill/i }));
    await user.type(screen.getByLabelText(/título/i), 'prompt_engineering');
    await user.selectOptions(screen.getByLabelText(/estado/i), 'exploring');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'prompt_engineering', status: 'exploring' }),
      );
    });
  });

  test('borrar: dialog → confirmar llama remove(id)', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /borrar/i })[0]);
    expect(api.remove).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /borrar/i }));
    await waitFor(() => expect(api.remove).toHaveBeenCalledWith('a'));
  });
});
