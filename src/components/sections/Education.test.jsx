import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import Education from './Education.jsx';
import { education } from '../../data/education.js';

describe('Education', () => {
  test('renderiza heading "Educación y certificaciones"', () => {
    render(<Education />);
    expect(
      screen.getByRole('heading', {
        name: /educación y certificaciones/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  test('section tiene id="education" para anclaje #education', () => {
    const { container } = render(<Education />);
    expect(
      container.querySelector('section#education'),
    ).toBeInTheDocument();
  });

  test('renderiza una card por cada item de educación', () => {
    render(<Education />);
    // Cada item tiene un h3; el accessible name incluye el badge si es
    // in-progress, así que matcheamos por substring del title.
    education.forEach((item) => {
      expect(
        screen.getByRole('heading', {
          name: new RegExp(item.title, 'i'),
          level: 3,
        }),
      ).toBeInTheDocument();
    });
  });

  test('item in-progress muestra "Certificado al finalizar" + badge', () => {
    render(<Education />);
    const inProgress = education.filter((i) => i.status === 'in-progress');
    // Asumimos que hay al menos uno para que el test sea significativo.
    expect(inProgress.length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/certificado al finalizar/i).length,
    ).toBe(inProgress.length);
    expect(screen.getAllByText(/en curso/i).length).toBe(inProgress.length);
  });

  test('item con certUrl muestra link "Ver certificado"; sin certUrl no', () => {
    render(<Education />);
    const withCert = education.filter(
      (i) => i.status !== 'in-progress' && Boolean(i.certUrl),
    );
    const links = screen.queryAllByRole('link', {
      name: /ver certificado/i,
    });
    expect(links.length).toBe(withCert.length);
  });
});
