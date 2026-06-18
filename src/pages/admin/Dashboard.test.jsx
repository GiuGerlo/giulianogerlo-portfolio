import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useDashboardStats.js', () => ({
  useDashboardStats: vi.fn(),
}));
vi.mock('../../hooks/useSiteSettings.js', () => ({
  useSiteSettings: vi.fn(),
}));
vi.mock('../../hooks/useProfile.js', () => ({
  useProfile: vi.fn(),
}));
vi.mock('../../hooks/useChatLogs.js', () => ({
  useChatLogs: vi.fn(),
}));

import Dashboard from './Dashboard.jsx';
import { useDashboardStats } from '../../hooks/useDashboardStats.js';
import { useSiteSettings } from '../../hooks/useSiteSettings.js';
import { useProfile } from '../../hooks/useProfile.js';
import { useChatLogs } from '../../hooks/useChatLogs.js';

const STATS = {
  projectsPublished: 5,
  projectsTotal: 6,
  experience: 6,
  skillGroups: 5,
  aiSkills: 6,
  education: 4,
  chatsTotal: 12,
  chats7d: 3,
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard (home)', () => {
  beforeEach(() => {
    useDashboardStats.mockReset();
    useSiteSettings.mockReset();
    useProfile.mockReset();
    useChatLogs.mockReset();
    // Defaults razonables; cada test puede pisarlos.
    useSiteSettings.mockReturnValue({ data: { cvUrl: '' }, loading: false, error: null });
    useProfile.mockReturnValue({ data: { aboutImage: null }, loading: false, error: null });
    useChatLogs.mockReturnValue({ data: [], loading: false, error: null, remove: vi.fn() });
  });

  test('loading: muestra skeletons de stats', () => {
    useDashboardStats.mockReturnValue({ stats: null, loading: true });
    const { container } = renderDashboard();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('stats: muestra proyectos publicados/total y chats', () => {
    useDashboardStats.mockReturnValue({ stats: STATS, loading: false });
    renderDashboard();
    expect(screen.getByText('5/6')).toBeInTheDocument(); // proyectos
    expect(screen.getByText('12')).toBeInTheDocument(); // chats total
    expect(screen.getByText(/3 en los últimos 7 días/i)).toBeInTheDocument();
  });

  test('accesos rápidos: link a proyectos y a chats', () => {
    useDashboardStats.mockReturnValue({ stats: STATS, loading: false });
    renderDashboard();
    expect(
      screen.getByRole('link', { name: /^proyectos$/i }),
    ).toHaveAttribute('href', '/admin/proyectos');
    expect(screen.getByRole('link', { name: /nuevo proyecto/i })).toHaveAttribute(
      'href',
      '/admin/projects/new',
    );
  });

  test('estado del sitio: avisa borradores sin publicar', () => {
    useDashboardStats.mockReturnValue({ stats: STATS, loading: false });
    renderDashboard();
    // 6 total - 5 publicados = 1 borrador.
    expect(screen.getByText(/1 proyecto\(s\) en borrador/i)).toBeInTheDocument();
  });

  test('últimos chats: muestra el preview de la conversación', () => {
    useDashboardStats.mockReturnValue({ stats: STATS, loading: false });
    useChatLogs.mockReturnValue({
      data: [
        {
          id: 'c1',
          startedAt: '2026-06-18T10:00:00Z',
          lastAt: '2026-06-18T10:00:00Z',
          turns: [{ id: 't1', message: '¿Sabe Laravel?', reply: 'Sí.', createdAt: '2026-06-18T10:00:00Z' }],
        },
      ],
      loading: false,
      error: null,
      remove: vi.fn(),
    });
    renderDashboard();
    expect(screen.getByText('¿Sabe Laravel?')).toBeInTheDocument();
  });
});
