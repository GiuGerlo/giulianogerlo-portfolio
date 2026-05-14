import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero.jsx';

describe('Hero', () => {
  test('renderiza nombre como h1', () => {
    render(<Hero />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Giuliano Gerlo');
  });

  test('muestra prompt $ whoami', () => {
    render(<Hero />);
    expect(screen.getByText('$ whoami')).toBeInTheDocument();
  });

  test('muestra rol y ubicación', () => {
    render(<Hero />);
    expect(screen.getByText(/Full-Stack Developer/)).toBeInTheDocument();
    expect(screen.getByText(/Rosario/)).toBeInTheDocument();
  });

  test('tiene 2 CTAs', () => {
    render(<Hero />);
    expect(
      screen.getByRole('button', { name: /Ver proyectos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Contactarme/i }),
    ).toBeInTheDocument();
  });
});
