import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import About from './About.jsx';

describe('About', () => {
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

  test('muestra los 4 chips de estado', () => {
    render(<About />);
    expect(screen.getByText(/Disponible para proyectos/i)).toBeInTheDocument();
    expect(screen.getByText(/Rosario, AR/i)).toBeInTheDocument();
    expect(screen.getByText(/Español/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Cursando React Cert/i),
    ).toBeInTheDocument();
  });

  test('chip "Disponible" usa variant dot (punto verde)', () => {
    render(<About />);
    // El punto del Chip variant dot lleva data-testid="chip-dot".
    // Debe existir exactamente uno (solo el chip Disponible).
    expect(screen.getAllByTestId('chip-dot')).toHaveLength(1);
  });
});
