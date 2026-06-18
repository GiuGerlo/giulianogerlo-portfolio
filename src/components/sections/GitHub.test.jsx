import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../hooks/useGitHub.js', () => ({
  useGitHub: vi.fn(),
}));

import GitHub from './GitHub.jsx';
import { useGitHub } from '../../hooks/useGitHub.js';

const DATA = {
  repos: [
    {
      id: 1,
      name: 'mi-portfolio',
      description: 'sitio personal',
      url: 'https://github.com/GiuGerlo/mi-portfolio',
      language: 'JavaScript',
      stars: 3,
      forks: 1,
      topics: [],
    },
  ],
  contributions: [
    { date: '2026-06-01', count: 2, level: 1 },
    { date: '2026-06-02', count: 0, level: 0 },
  ],
  totalContributions: 42,
};

describe('GitHub (sección)', () => {
  beforeEach(() => {
    useGitHub.mockReset();
  });

  test('dev: muestra aviso de que se ve en producción', () => {
    useGitHub.mockReturnValue({ data: null, loading: false, error: null, isLocalDev: true });
    render(<GitHub />);
    expect(screen.getByText(/vercel dev/i)).toBeInTheDocument();
  });

  test('loading: muestra skeletons', () => {
    useGitHub.mockReturnValue({ data: null, loading: true, error: null, isLocalDev: false });
    const { container } = render(<GitHub />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('data: renderiza repo y total de contribuciones', () => {
    useGitHub.mockReturnValue({ data: DATA, loading: false, error: null, isLocalDev: false });
    render(<GitHub />);
    expect(screen.getByText('mi-portfolio')).toBeInTheDocument();
    expect(screen.getByText(/42 contribuciones/i)).toBeInTheDocument();
  });

  test('prod sin data: esconde la sección (no renderiza)', () => {
    useGitHub.mockReturnValue({
      data: { repos: [], contributions: [], totalContributions: 0 },
      loading: false,
      error: null,
      isLocalDev: false,
    });
    const { container } = render(<GitHub />);
    expect(container.querySelector('section#github')).not.toBeInTheDocument();
  });
});
