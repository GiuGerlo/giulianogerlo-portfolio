import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../hooks/useGitHub.js', () => ({
  useGitHub: vi.fn(),
}));

import GitHub from './GitHub.jsx';
import { useGitHub } from '../../hooks/useGitHub.js';

const DATA = {
  weeks: [
    [
      { date: '2026-06-01', count: 0, level: 0, weekday: 1 },
      { date: '2026-06-02', count: 3, level: 2, weekday: 2 },
    ],
  ],
  totalContributions: 720,
  year: null,
  years: [2026, 2025, 2024],
};

describe('GitHub (sección)', () => {
  beforeEach(() => {
    useGitHub.mockReset();
  });

  test('dev sin data: muestra aviso de vercel dev', () => {
    useGitHub.mockReturnValue({ data: null, loading: false, error: null, isLocalDev: true });
    render(<GitHub />);
    expect(screen.getByText(/vercel dev/i)).toBeInTheDocument();
  });

  test('loading inicial: muestra skeleton', () => {
    useGitHub.mockReturnValue({ data: null, loading: true, error: null, isLocalDev: false });
    const { container } = render(<GitHub />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('data: muestra total y tabs de años', () => {
    useGitHub.mockReturnValue({ data: DATA, loading: false, error: null, isLocalDev: false });
    render(<GitHub />);
    expect(screen.getByText(/720 contribuciones en el último año/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /último año/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2025' })).toBeInTheDocument();
  });

  test('prod sin data: esconde la sección', () => {
    useGitHub.mockReturnValue({
      data: { weeks: [], totalContributions: 0, year: null, years: [] },
      loading: false,
      error: null,
      isLocalDev: false,
    });
    const { container } = render(<GitHub />);
    expect(container.querySelector('section#github')).not.toBeInTheDocument();
  });
});
