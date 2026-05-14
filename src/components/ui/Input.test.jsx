import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input.jsx';

describe('Input', () => {
  test('renderiza label linkeado al input vía htmlFor', () => {
    render(<Input label="Nombre" />);
    const input = screen.getByLabelText('Nombre');
    // El test pasa si htmlFor del label coincide con id del input.
    expect(input).toBeInTheDocument();
  });

  test('reenvía onChange al input nativo', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Email" onChange={onChange} />);
    await user.type(screen.getByLabelText('Email'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  test('muestra error y marca aria-invalid', () => {
    render(<Input label="X" error="Campo requerido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Campo requerido');
    expect(screen.getByLabelText('X')).toHaveAttribute('aria-invalid', 'true');
  });

  test('type prop default es text, customizable', () => {
    const { rerender } = render(<Input label="X" />);
    expect(screen.getByLabelText('X')).toHaveAttribute('type', 'text');
    rerender(<Input label="X" type="email" />);
    expect(screen.getByLabelText('X')).toHaveAttribute('type', 'email');
  });
});
