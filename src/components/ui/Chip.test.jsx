import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Chip from './Chip.jsx';

describe('Chip', () => {
  test('renderiza children', () => {
    render(<Chip>Disponible</Chip>);
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  test('variant default no muestra punto', () => {
    // El punto se renderiza como <span data-testid="chip-dot">.
    // En variant default no debe existir.
    render(<Chip>Texto</Chip>);
    expect(screen.queryByTestId('chip-dot')).not.toBeInTheDocument();
  });

  test('variant dot muestra punto verde antes del texto', () => {
    render(<Chip variant="dot">Activo</Chip>);
    expect(screen.getByTestId('chip-dot')).toBeInTheDocument();
  });
});
