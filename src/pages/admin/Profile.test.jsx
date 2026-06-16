import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mocks ANTES de importar Profile (vi.mock se hoistea):
//  - useProfile: controlamos data/loading/error.
//  - supabase: interceptamos el UPDATE.
vi.mock('../../hooks/useProfile.js', () => ({
  useProfile: vi.fn(),
}));

vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// RichTextEditor usa TipTap (ProseMirror), pesado y flaky en jsdom. Acá nos
// interesa la lógica de Profile (load/submit), no el editor interno → lo
// reemplazamos por un <textarea> controlado simple que respeta value/onChange.
vi.mock('../../components/admin/RichTextEditor.jsx', () => ({
  default: ({ value, onChange, label }) => (
    <textarea
      aria-label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

import Profile from './Profile.jsx';
import { useProfile } from '../../hooks/useProfile.js';
import { supabase } from '../../lib/supabase.js';

const fixtureProfile = {
  id: 1,
  aboutImage: null,
  aboutP1: 'Soy **Giuliano**.',
  aboutP2: 'Trabajo en RAMCC.',
  chipAvailable: 'Disponible para proyectos',
  chipLocation: 'Rosario, AR',
  chipLanguage: 'Español',
  chipEducation: 'Cursando React Cert',
};

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );
}

describe('Profile (admin)', () => {
  beforeEach(() => {
    useProfile.mockReset();
    supabase.from.mockReset();
  });

  test('loading: muestra contenedor con aria-busy', () => {
    useProfile.mockReturnValue({ data: null, loading: true, error: null });
    const { container } = renderProfile();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  test('error: muestra alert', () => {
    useProfile.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'fail' },
    });
    renderProfile();
    expect(screen.getByRole('alert')).toHaveTextContent(/no pude cargar/i);
  });

  test('data: popula los campos del form con la fila', async () => {
    useProfile.mockReturnValue({
      data: fixtureProfile,
      loading: false,
      error: null,
    });
    renderProfile();

    // reset() corre en un effect → esperamos a que los valores aparezcan.
    await waitFor(() => {
      expect(screen.getByLabelText(/párrafo 1/i)).toHaveValue('Soy **Giuliano**.');
    });
    expect(screen.getByLabelText(/ubicación/i)).toHaveValue('Rosario, AR');
    expect(screen.getByLabelText(/idioma/i)).toHaveValue('Español');
  });

  test('submit: UPDATE a supabase con eq(id, 1)', async () => {
    useProfile.mockReturnValue({
      data: fixtureProfile,
      loading: false,
      error: null,
    });

    // Chain: supabase.from('profile').update(...).eq('id', 1) → OK.
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    supabase.from.mockReturnValue({ update: updateMock });

    const user = userEvent.setup();
    renderProfile();

    // Esperamos a que el form esté populado antes de guardar.
    await waitFor(() => {
      expect(screen.getByLabelText(/ubicación/i)).toHaveValue('Rosario, AR');
    });

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profile');
      expect(eqMock).toHaveBeenCalledWith('id', 1);
    });

    // El payload va en snake_case (profileToDb).
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        about_p1: 'Soy **Giuliano**.',
        chip_location: 'Rosario, AR',
      }),
    );

    // Feedback "Guardado".
    expect(await screen.findByText(/cambios guardados/i)).toBeInTheDocument();
  });
});
