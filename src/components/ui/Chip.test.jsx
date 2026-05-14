import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Chip from './Chip.jsx';

describe('Chip', () => {
  test('renderiza children', () => {
    render(<Chip>Disponible</Chip>);
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  test('variant default no muestra punto', () => {
    const { container } = render(<Chip>Texto</Chip>);
    // Buscamos el punto "●" — debería NO existir en variant default.
    expect(container.textContent).not.toContain('●');
  });

  test('variant dot muestra punto verde antes del texto', () => {
    const { container } = render(<Chip variant="dot">Activo</Chip>);
    expect(container.textContent).toContain('●');
  });
});
