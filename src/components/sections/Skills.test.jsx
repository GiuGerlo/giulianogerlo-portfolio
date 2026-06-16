import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { skillGroups } from '../../data/skills.js';

// Skills lee de la DB vía useSkillGroups. Lo mockeamos devolviendo los grupos
// del data file (mismo shape: id/title/icon/items) → las assertions de
// títulos/íconos/items se mantienen sin tocar la DB real.
vi.mock('../../hooks/useSkillGroups.js', () => ({
  useSkillGroups: () => ({ data: skillGroups, loading: false, error: null }),
}));

import Skills from './Skills.jsx';

describe('Skills', () => {
  test('renderiza heading "Stack técnico"', () => {
    render(<Skills />);
    expect(
      screen.getByRole('heading', { name: /stack técnico/i, level: 2 }),
    ).toBeInTheDocument();
  });

  test('section tiene id="skills" para anclaje #skills', () => {
    const { container } = render(<Skills />);
    expect(container.querySelector('section#skills')).toBeInTheDocument();
  });

  test('renderiza una card por cada grupo de skills', () => {
    render(<Skills />);
    // Cada grupo tiene un h3 con su title. Chequeamos todos.
    skillGroups.forEach((group) => {
      expect(
        screen.getByRole('heading', { name: group.title, level: 3 }),
      ).toBeInTheDocument();
    });
  });

  test('renderiza ícono por grupo (lookup por nombre)', () => {
    render(<Skills />);
    // Los íconos de los 5 grupos default (Layout/Server/Database/Wrench/
    // Heart) están en el ICONS map → cada wrapper tiene data-testid.
    skillGroups.forEach((group) => {
      expect(
        screen.getByTestId(`skill-icon-${group.id}`),
      ).toBeInTheDocument();
    });
  });

  test('muestra los items de cada grupo como tags', () => {
    render(<Skills />);
    // Sample de items de distintos grupos. Si la data cambia, este test
    // falla — explícito a propósito (data + UI quedan acopladas en
    // este contrato visual).
    expect(screen.getByText('HTML')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
    expect(screen.getByText('MySQL')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('Trabajo en equipo')).toBeInTheDocument();
  });
});
