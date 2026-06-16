import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import RichTextEditor from './RichTextEditor.jsx';

describe('RichTextEditor', () => {
  test('monta y muestra la toolbar de formato', () => {
    render(<RichTextEditor value="" onChange={vi.fn()} label="Bio" />);

    // Toolbar: un botón por marca (aria-label = title).
    expect(screen.getByRole('button', { name: /negrita/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /itálica/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /link/i })).toBeInTheDocument();

    // El label se renderiza.
    expect(screen.getByText('Bio')).toBeInTheDocument();
  });
});
