import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mockeamos el módulo entero de supabase para interceptar signInWithOtp.
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}));

import Login from './Login.jsx';
import { supabase } from '../../lib/supabase.js';
import { ADMIN_EMAIL } from '../../lib/admin-config.js';

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    supabase.auth.signInWithOtp.mockReset();
  });

  test('renderiza el form con campo email y botón submit', () => {
    renderLogin();
    expect(
      screen.getByRole('heading', { name: /acceso al panel/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /mandar link mágico/i }),
    ).toBeInTheDocument();
  });

  test('email no admin: muestra error de validación, no llama supabase', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'otro@dominio.com');
    await user.click(
      screen.getByRole('button', { name: /mandar link mágico/i }),
    );

    expect(
      await screen.findByText(/este email no tiene acceso/i),
    ).toBeInTheDocument();
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  test('email admin válido: llama signInWithOtp y muestra "Revisá tu mail"', async () => {
    const user = userEvent.setup();
    supabase.auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), ADMIN_EMAIL);
    await user.click(
      screen.getByRole('button', { name: /mandar link mágico/i }),
    );

    // Supabase fue llamado con email + opciones esperadas.
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: ADMIN_EMAIL,
        options: expect.objectContaining({ shouldCreateUser: false }),
      }),
    );

    // Pantalla de confirmación.
    expect(
      await screen.findByRole('heading', { name: /revisá tu mail/i, level: 1 }),
    ).toBeInTheDocument();
  });

  test('signInWithOtp falla: muestra mensaje de error', async () => {
    const user = userEvent.setup();
    supabase.auth.signInWithOtp.mockResolvedValue({
      data: null,
      error: { message: 'rate limited' },
    });
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), ADMIN_EMAIL);
    await user.click(
      screen.getByRole('button', { name: /mandar link mágico/i }),
    );

    expect(
      await screen.findByText(/no pude enviar el link/i),
    ).toBeInTheDocument();
  });
});
