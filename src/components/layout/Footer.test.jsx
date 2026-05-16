import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer.jsx';

// Footer usa <Link> de React Router (el logo navega al Home), así que
// necesita un Router de contexto. MemoryRouter lo provee sin tocar el
// browser real.
function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

test('muestra el logo {gg}.dev como imagen', () => {
  renderFooter();
  // El brand del Footer ahora es <img>. Buscamos por alt accesible.
  const logo = screen.getByAltText('Giuliano Gerlo');
  expect(logo).toBeInTheDocument();
});

test('muestra el año actual en el copyright', () => {
  renderFooter();
  const year = new Date().getFullYear();
  expect(
    screen.getByText(new RegExp(`${year} Giuliano Gerlo`, 'i'))
  ).toBeInTheDocument();
});

test('renderiza links GitHub, LinkedIn y Email accesibles', () => {
  renderFooter();
  expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument();
});

test('el link de email usa mailto:', () => {
  renderFooter();
  const email = screen.getByRole('link', { name: /email/i });
  expect(email.getAttribute('href')).toMatch(/^mailto:/);
});

test('renderiza los 5 links de navegación', () => {
  renderFooter();
  ['Sobre mí', 'Skills', 'Proyectos', 'Experiencia', 'Contacto'].forEach((label) => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
