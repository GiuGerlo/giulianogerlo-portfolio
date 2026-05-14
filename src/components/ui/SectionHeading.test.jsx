import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionHeading from './SectionHeading.jsx';

describe('SectionHeading', () => {
  test('renderiza title como h2', () => {
    render(<SectionHeading title="Sobre mí" />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Sobre mí');
  });

  test('renderiza eyebrow cuando se pasa', () => {
    render(<SectionHeading eyebrow="// 01 — about" title="X" />);
    expect(screen.getByText('// 01 — about')).toBeInTheDocument();
  });

  test('no renderiza eyebrow si no se pasa', () => {
    render(<SectionHeading title="X" />);
    expect(screen.queryByText(/—/)).not.toBeInTheDocument();
  });

  test('renderiza subtitle cuando se pasa', () => {
    render(<SectionHeading title="X" subtitle="Texto descriptivo" />);
    expect(screen.getByText('Texto descriptivo')).toBeInTheDocument();
  });

  test('aplica id al h2 para anclas', () => {
    render(<SectionHeading title="X" id="about" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'about',
    );
  });
});
