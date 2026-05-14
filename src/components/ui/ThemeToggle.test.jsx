import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

test('renders a button with aria-label', () => {
  render(<ThemeToggle />);
  const btn = screen.getByRole('button', { name: /tema/i });
  expect(btn).toBeInTheDocument();
});

test('toggles data-theme on click', async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  await user.click(screen.getByRole('button', { name: /tema/i }));
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});

test('persists toggled theme in localStorage', async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);
  await user.click(screen.getByRole('button', { name: /tema/i }));
  expect(localStorage.getItem('theme')).toBe('light');
});
