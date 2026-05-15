import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import AISection from './AISection.jsx';
import { aiSkills } from '../../data/skills.js';

describe('AISection', () => {
  test('renderiza heading "AI-Augmented Development"', () => {
    render(<AISection />);
    expect(
      screen.getByRole('heading', {
        name: /ai-augmented development/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  test('section tiene id="ai" para anclaje #ai', () => {
    const { container } = render(<AISection />);
    expect(container.querySelector('section#ai')).toBeInTheDocument();
  });

  test('renderiza un feature por cada skill de IA', () => {
    render(<AISection />);
    // Cada skill tiene un h4 con su title (mono accent).
    aiSkills.forEach((skill) => {
      expect(
        screen.getByRole('heading', { name: skill.title, level: 4 }),
      ).toBeInTheDocument();
    });
  });

  test('renderiza chips de items[] cuando la entry los tiene', () => {
    render(<AISection />);
    // Solo ai_dev_tooling tiene items hoy. Cualquier entry con items
    // debe rendear el wrapper con su data-testid.
    aiSkills
      .filter((s) => s.items && s.items.length > 0)
      .forEach((skill) => {
        expect(
          screen.getByTestId(`ai-skill-items-${skill.id}`),
        ).toBeInTheDocument();
      });
  });

  test('muestra herramientas individuales del entry ai_dev_tooling', () => {
    render(<AISection />);
    // Sample de items consolidados — si la data cambia este test falla
    // explícitamente, marcando ruptura del contrato visual.
    expect(screen.getByText('Claude Code')).toBeInTheDocument();
    expect(screen.getByText('OpenAI Codex')).toBeInTheDocument();
    expect(screen.getByText('GitHub Copilot')).toBeInTheDocument();
    expect(screen.getByText('OpenCode')).toBeInTheDocument();
    expect(screen.getByText('Claude Skills')).toBeInTheDocument();
    expect(screen.getByText('Claude Plugins')).toBeInTheDocument();
  });
});
