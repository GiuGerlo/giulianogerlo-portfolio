import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Footer from './Footer.jsx';

test('muestra el brand "giuliano.dev"', () => {
  render(<Footer />);
  const brand = screen.getByText((_, el) => el?.textContent === 'giuliano.dev');
  expect(brand).toBeInTheDocument();
});

test('muestra el año actual en el copyright', () => {
  render(<Footer />);
  const year = new Date().getFullYear();
  expect(
    screen.getByText(new RegExp(`${year} Giuliano Gerlo`, 'i'))
  ).toBeInTheDocument();
});

test('renderiza links GitHub, LinkedIn y Email accesibles', () => {
  render(<Footer />);
  expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument();
});

test('el link de email usa mailto:', () => {
  render(<Footer />);
  const email = screen.getByRole('link', { name: /email/i });
  expect(email.getAttribute('href')).toMatch(/^mailto:/);
});

test('renderiza los 5 links de navegación', () => {
  render(<Footer />);
  ['Sobre mí', 'Skills', 'Proyectos', 'Experiencia', 'Contacto'].forEach((label) => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
