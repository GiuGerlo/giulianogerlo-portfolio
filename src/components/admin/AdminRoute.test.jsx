import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mockeamos useAuth para controlar el estado de sesión en cada test
// sin tocar Supabase real.
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

import AdminRoute from './AdminRoute.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { ADMIN_EMAIL } from '../../lib/admin-config.js';

/**
 * Helper: monta AdminRoute con una ruta hija "/admin" que renderiza un
 * marcador "DASHBOARD". También una ruta "/admin/login" con marcador
 * "LOGIN" para verificar redirects.
 */
function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>DASHBOARD</div>} />
        </Route>
        <Route path="/admin/login" element={<div>LOGIN</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    useAuth.mockReset();
  });

  test('loading: muestra "Verificando sesión…" con aria-busy', () => {
    useAuth.mockReturnValue({ session: null, loading: true });
    const { container } = renderAt('/admin');
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument();
  });

  test('sin sesión: redirige a /admin/login', () => {
    useAuth.mockReturnValue({ session: null, loading: false });
    renderAt('/admin');
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument();
  });

  test('sesión con email NO admin: redirige a /admin/login', () => {
    useAuth.mockReturnValue({
      session: { user: { email: 'otro@dominio.com' } },
      loading: false,
    });
    renderAt('/admin');
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument();
  });

  test('sesión con email admin: renderiza la ruta hija', () => {
    useAuth.mockReturnValue({
      session: { user: { email: ADMIN_EMAIL } },
      loading: false,
    });
    renderAt('/admin');
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
  });
});
