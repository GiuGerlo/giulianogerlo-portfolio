import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button.jsx';

describe('Button', () => {
  test('renderiza children', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: /click me/i }),
    ).toBeInTheDocument();
  });

  test('dispara onClick al hacer click', async () => {
    const user = userEvent.setup();
    // vi.fn() = mock de Vitest. Permite asertar cuántas veces se llamó
    // y con qué args.
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hola</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('aplica clases default + variant primary', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-accent');
  });

  test('variant secondary cambia las clases', () => {
    render(<Button variant="secondary">Sec</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('border-border');
    // Secondary no tiene fondo accent — chequeamos tokens exactos
    // (split por espacios), no substring, porque la base incluye
    // 'disabled:hover:bg-accent' que matchearía como substring.
    const tokens = btn.className.split(/\s+/);
    expect(tokens).not.toContain('bg-accent');
  });

  test('className del caller overrideea defaults vía twMerge', () => {
    // Default tiene px-5 — el caller pasa px-8 → twMerge resuelve a px-8.
    render(<Button className="px-8">X</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('px-8');
    expect(btn.className).not.toContain('px-5');
  });

  test('respeta disabled prop nativo', () => {
    render(<Button disabled>X</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
