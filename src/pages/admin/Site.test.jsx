import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useSiteSettings.js', () => ({
  useSiteSettings: vi.fn(),
}));

vi.mock('../../lib/supabase.js', () => ({
  supabase: { from: vi.fn() },
}));

// DocumentUpload usa react-dropzone + storage; lo reemplazamos por un stub
// controlado para testear la lógica de Site (load/submit), no el upload.
vi.mock('../../components/admin/DocumentUpload.jsx', () => ({
  default: ({ value, onChange, label }) => (
    <input
      aria-label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

import Site from './Site.jsx';
import { useSiteSettings } from '../../hooks/useSiteSettings.js';
import { supabase } from '../../lib/supabase.js';

const fixture = {
  id: 1,
  heroName: 'Giuliano Gerlo',
  heroTagline: 'Full-Stack',
  heroLocation: 'Rosario',
  footerTagline: 'tagline',
  cvUrl: '',
  socialGithub: 'https://github.com/GiuGerlo',
  socialLinkedin: 'https://linkedin.com/in/x',
  socialEmail: 'mail@x.com',
  socialWhatsapp: '549',
  socialLocation: 'Rosario, AR',
};

function renderSite() {
  return render(
    <MemoryRouter>
      <Site />
    </MemoryRouter>,
  );
}

describe('Site (admin)', () => {
  beforeEach(() => {
    useSiteSettings.mockReset();
    supabase.from.mockReset();
  });

  test('loading: aria-busy', () => {
    useSiteSettings.mockReturnValue({ data: null, loading: true, error: null });
    const { container } = renderSite();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  test('error: alert', () => {
    useSiteSettings.mockReturnValue({ data: null, loading: false, error: { message: 'x' } });
    renderSite();
    expect(screen.getByRole('alert')).toHaveTextContent(/no pude cargar/i);
  });

  test('data: popula los campos', async () => {
    useSiteSettings.mockReturnValue({ data: fixture, loading: false, error: null });
    renderSite();
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toHaveValue('Giuliano Gerlo');
    });
    expect(screen.getByLabelText(/whatsapp/i)).toHaveValue('549');
  });

  test('submit: UPDATE con eq(id, 1) y payload snake_case', async () => {
    useSiteSettings.mockReturnValue({ data: fixture, loading: false, error: null });
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    supabase.from.mockReturnValue({ update: updateMock });

    const user = userEvent.setup();
    renderSite();

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toHaveValue('Giuliano Gerlo');
    });

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('site_settings');
      expect(eqMock).toHaveBeenCalledWith('id', 1);
    });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hero_name: 'Giuliano Gerlo',
        social_whatsapp: '549',
      }),
    );
    expect(await screen.findByText(/cambios guardados/i)).toBeInTheDocument();
  });
});
