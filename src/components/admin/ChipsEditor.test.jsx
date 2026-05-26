import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ChipsEditor from './ChipsEditor.jsx';

describe('ChipsEditor', () => {
  test('renderiza los chips iniciales', () => {
    render(<ChipsEditor value={['React', 'PHP']} onChange={() => {}} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('PHP')).toBeInTheDocument();
  });

  test('agregar via botón llama onChange con el nuevo array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipsEditor value={['React']} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/agregar/i), 'PHP');
    await user.click(screen.getByLabelText('Agregar'));

    expect(onChange).toHaveBeenCalledWith(['React', 'PHP']);
  });

  test('agregar via Enter también funciona', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipsEditor value={[]} onChange={onChange} />);

    const input = screen.getByPlaceholderText(/agregar/i);
    await user.type(input, 'React{Enter}');

    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  test('no permite duplicados case-insensitive', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipsEditor value={['React']} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/agregar/i), 'react');
    await user.click(screen.getByLabelText('Agregar'));

    expect(onChange).not.toHaveBeenCalled();
  });

  test('quitar chip llama onChange con el array sin ese ítem', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipsEditor value={['React', 'PHP']} onChange={onChange} />);

    await user.click(screen.getByLabelText('Quitar React'));

    expect(onChange).toHaveBeenCalledWith(['PHP']);
  });

  test('muestra mensaje de error si error prop tiene valor', () => {
    render(
      <ChipsEditor
        value={[]}
        onChange={() => {}}
        error="Sumá al menos uno"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/sumá al menos uno/i);
  });
});
