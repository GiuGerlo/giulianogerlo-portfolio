import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ParagraphsEditor from './ParagraphsEditor.jsx';

describe('ParagraphsEditor', () => {
  test('renderiza un textarea por cada item del array', () => {
    render(
      <ParagraphsEditor
        value={['Primer desafío.', 'Segundo desafío.']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('Primer desafío.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Segundo desafío.')).toBeInTheDocument();
  });

  test('botón Agregar appendea un string vacío', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ParagraphsEditor value={['A']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /agregar/i }));

    expect(onChange).toHaveBeenCalledWith(['A', '']);
  });

  test('mover hacia abajo intercambia los items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ParagraphsEditor value={['A', 'B']} onChange={onChange} />);

    // Primer item (A) está en posición 0. "Bajar" lo lleva a posición 1.
    const downButtons = screen.getAllByRole('button', { name: /bajar/i });
    await user.click(downButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['B', 'A']);
  });

  test('borrar quita el item del array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ParagraphsEditor value={['A', 'B']} onChange={onChange} />);

    const deleteButtons = screen.getAllByRole('button', {
      name: /borrar desafío/i,
    });
    await user.click(deleteButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['B']);
  });
});
