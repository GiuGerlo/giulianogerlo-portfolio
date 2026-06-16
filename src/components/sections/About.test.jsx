import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mockeamos useProfile ANTES de importar About (vi.mock se hoistea). Así
// testeamos el render de los estados sin tocar Supabase real.
vi.mock('../../hooks/useProfile.js', () => ({
  useProfile: vi.fn(),
}));

import About from './About.jsx';
import { useProfile } from '../../hooks/useProfile.js';

describe('About', () => {
  beforeEach(() => {
    useProfile.mockReset();
  });

  // ── Fallback: loading / error / sin fila → contenido hardcodeado ──
  describe('fallback (sin data de DB)', () => {
    beforeEach(() => {
      useProfile.mockReturnValue({ data: null, loading: true, error: null });
    });

    test('renderiza heading "Sobre mí"', () => {
      render(<About />);
      expect(
        screen.getByRole('heading', { name: /sobre mí/i, level: 2 }),
      ).toBeInTheDocument();
    });

    test('section tiene id="about" para anclaje #about', () => {
      const { container } = render(<About />);
      expect(container.querySelector('section#about')).toBeInTheDocument();
    });

    test('muestra los 4 chips de estado del fallback', () => {
      render(<About />);
      expect(screen.getByText(/Disponible para proyectos/i)).toBeInTheDocument();
      expect(screen.getByText(/Rosario, AR/i)).toBeInTheDocument();
      expect(screen.getByText(/Español/i)).toBeInTheDocument();
      expect(screen.getByText(/Cursando React Cert/i)).toBeInTheDocument();
    });

    test('chip "Disponible" usa variant dot (punto verde)', () => {
      render(<About />);
      expect(screen.getAllByTestId('chip-dot')).toHaveLength(1);
    });
  });

  // ── Data de DB: usa los valores de la fila, no el fallback ──
  describe('con data de DB', () => {
    test('renderiza los párrafos y chips de la DB (markdown → strong)', () => {
      useProfile.mockReturnValue({
        data: {
          id: 1,
          aboutImage: null,
          aboutP1: 'Bio editada con **negrita** desde admin.',
          aboutP2: 'Segundo párrafo.',
          chipAvailable: 'Abierto a charlas',
          chipLocation: 'Buenos Aires, AR',
          chipLanguage: 'Inglés',
          chipEducation: 'Curso X',
        },
        loading: false,
        error: null,
      });
      render(<About />);

      // El texto de la DB aparece (no el del fallback).
      expect(screen.getByText(/Bio editada con/i)).toBeInTheDocument();
      expect(screen.getByText(/Buenos Aires, AR/i)).toBeInTheDocument();
      // **negrita** se renderiza como <strong>.
      expect(screen.getByText('negrita').tagName).toBe('STRONG');
    });

    test('chip vacío en DB → no se renderiza', () => {
      useProfile.mockReturnValue({
        data: {
          id: 1,
          aboutImage: null,
          aboutP1: 'p1',
          aboutP2: 'p2',
          chipAvailable: '',
          chipLocation: 'Rosario, AR',
          chipLanguage: '',
          chipEducation: '',
        },
        loading: false,
        error: null,
      });
      render(<About />);

      // Solo location tiene texto → no hay chip-dot (available vacío).
      expect(screen.queryByTestId('chip-dot')).not.toBeInTheDocument();
      expect(screen.getByText(/Rosario, AR/i)).toBeInTheDocument();
    });

    test('aboutImage presente → renderiza <img> con esa URL', () => {
      const url = 'https://x.supabase.co/storage/.../about/foto.webp';
      useProfile.mockReturnValue({
        data: {
          id: 1,
          aboutImage: url,
          aboutP1: 'p1',
          aboutP2: 'p2',
          chipAvailable: '',
          chipLocation: '',
          chipLanguage: '',
          chipEducation: '',
        },
        loading: false,
        error: null,
      });
      render(<About />);

      const img = screen.getByRole('img', { name: /giuliano gerlo/i });
      expect(img).toHaveAttribute('src', url);
    });
  });
});
