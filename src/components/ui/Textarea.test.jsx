import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Textarea from './Textarea.jsx';

describe('Textarea', () => {
  test('renderiza label + textarea linkeados', () => {
    render(<Textarea label="Mensaje" />);
    // getByLabelText busca un control linkeado a un label con ese texto.
    // Si el htmlFor/id no matchea, falla. Cubre el wire-up de a11y.
    const ta = screen.getByLabelText('Mensaje');
    expect(ta.tagName).toBe('TEXTAREA');
  });

  test('respeta rows prop', () => {
    render(<Textarea label="X" rows={10} />);
    expect(screen.getByLabelText('X')).toHaveAttribute('rows', '10');
  });

  test('muestra error', () => {
    render(<Textarea label="X" error="Demasiado corto" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Demasiado corto');
  });
});
