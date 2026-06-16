import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAdminList.js', () => ({
  useAdminList: vi.fn(),
}));

// DocumentUpload usa react-dropzone/storage; stub controlado.
vi.mock('../../components/admin/DocumentUpload.jsx', () => ({
  default: ({ value, onChange, label }) => (
    <input aria-label={label} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  ),
}));

import Education from './Education.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';

const fixture = [
  { id: 'a', dateLabel: '2022 — 2024', title: 'Técnico Superior', org: 'Brigadier López', status: 'completed', certUrl: '/certs/x.pdf', orderIndex: 0 },
  { id: 'b', dateLabel: 'JUN 2025 — JUN 2026', title: 'React Developer', org: 'DigitalHouse', status: 'in-progress', certUrl: null, orderIndex: 1 },
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
      <Education />
    </MemoryRouter>,
  );
}

describe('Education (admin)', () => {
  beforeEach(() => {
    useAdminList.mockReset();
  });

  test('lista items con badge "en curso" y link al cert', () => {
    mockList();
    renderPage();
    expect(screen.getByText('Técnico Superior')).toBeInTheDocument();
    expect(screen.getByText(/en curso/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver certificado/i })).toBeInTheDocument();
  });

  test('agregar: create() con title + status', async () => {
    const api = mockList();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /agregar/i }));
    await user.type(screen.getByLabelText(/título/i), 'Curso JS');
    await user.selectOptions(screen.getByLabelText(/estado/i), 'in-progress');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Curso JS', status: 'in-progress' }),
      );
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
