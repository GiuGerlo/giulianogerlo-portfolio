import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import Navbar from './Navbar.jsx';

// Reset de localStorage + atributo data-theme antes de cada test.
// Hace falta porque Navbar contiene ThemeToggle (useTheme escribe en ambos).
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

/**
 * Helper para no repetir el wrap con Router en cada test.
 * MemoryRouter = versión de BrowserRouter para tests; el historial vive
 * en memoria, no en window.history.
 */
function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

test('muestra el logo {gg}.dev como imagen', () => {
  renderNavbar();
  // El logo dejó de ser texto y pasó a ser <img>. Lo buscamos por su
  // alt accesible. El src apunta a /logo-original.svg o /logo-secundario.svg
  // según theme (default 'dark' en tests → logo-original).
  const logo = screen.getByAltText('Giuliano Gerlo');
  expect(logo).toBeInTheDocument();
  expect(logo.getAttribute('src')).toMatch(/logo-(original|secundario)\.svg/);
});

test('renderiza los 5 links del menú desktop', () => {
  renderNavbar();
  const labels = ['Sobre mí', 'Skills', 'Proyectos', 'Experiencia', 'Contacto'];
  // El desktop menu siempre está en el DOM (solo oculto visualmente en mobile vía CSS).
  // En JSDOM no se aplica media queries, así que los elementos están todos presentes.
  // Como ahora hay 2 instancias (desktop + drawer cerrado), validamos por al menos 1.
  labels.forEach((label) => {
    expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
  });
});

test('incluye links a GitHub y LinkedIn con target=_blank y rel anti-tabnabbing', () => {
  renderNavbar();
  const github   = screen.getByRole('link', { name: /github/i });
  const linkedin = screen.getByRole('link', { name: /linkedin/i });
  expect(github).toHaveAttribute('target', '_blank');
  expect(linkedin).toHaveAttribute('target', '_blank');
  expect(github.getAttribute('rel')).toMatch(/noopener/);
  expect(linkedin.getAttribute('rel')).toMatch(/noopener/);
});

test('incluye el botón de cambio de tema', () => {
  renderNavbar();
  expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument();
});

test('el menú hamburguesa empieza cerrado y se abre al click', async () => {
  const user = userEvent.setup();
  renderNavbar();
  // Al inicio el botón se llama "Abrir menú" y aria-expanded=false.
  const burger = screen.getByRole('button', { name: /abrir menú/i });
  expect(burger).toHaveAttribute('aria-expanded', 'false');

  // Click → debería pasar a "Cerrar menú" y aria-expanded=true.
  await user.click(burger);
  const closeBtn = screen.getByRole('button', { name: /cerrar menú/i });
  expect(closeBtn).toHaveAttribute('aria-expanded', 'true');
});
