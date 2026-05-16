import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Contact from './Contact.jsx';

// Mock del widget de Turnstile. El componente real carga un script de
// Cloudflare que no funciona en jsdom (entorno de tests). Lo reemplazamos
// por un <button>: clickearlo simula que el visitante "pasó" el anti-bot
// y dispara onSuccess con un token falso. Así los tests controlan cuándo
// hay token y cuándo no, sin depender de la red.
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }) => (
    <button type="button" onClick={() => onSuccess('test-turnstile-token')}>
      mock-turnstile
    </button>
  ),
}));

// Helper — clickea el mock de Turnstile para entregar un token. Lo usan
// los tests que necesitan el botón Enviar habilitado.
async function pasarTurnstile(user) {
  await user.click(
    screen.getByRole('button', { name: /mock-turnstile/i }),
  );
}

describe('Contact', () => {
  test('renderiza heading "Hablemos"', () => {
    render(<Contact />);
    expect(
      screen.getByRole('heading', { name: /^hablemos$/i, level: 2 }),
    ).toBeInTheDocument();
  });

  test('section tiene id="contact" para anclaje #contact', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('section#contact')).toBeInTheDocument();
  });

  test('renderiza los 3 campos del formulario + botón submit', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /enviar mensaje/i }),
    ).toBeInTheDocument();
  });

  test('Turnstile: botón Enviar deshabilitado hasta pasar el widget', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    // Sin token: el botón arranca deshabilitado.
    const enviar = screen.getByRole('button', { name: /enviar mensaje/i });
    expect(enviar).toBeDisabled();

    // Tras pasar el widget anti-bot, el botón se habilita.
    await pasarTurnstile(user);
    expect(enviar).toBeEnabled();
  });

  // Helper — completa los 3 campos del form con valores válidos.
  async function completarForm(user) {
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez');
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com');
    await user.type(
      screen.getByLabelText(/mensaje/i),
      'Hola, quiero contactarte por un proyecto.',
    );
  }

  test('submit válido: postea a /api/contact y muestra éxito', async () => {
    const user = userEvent.setup();
    // No hay backend en los tests: mockeamos fetch para que devuelva
    // una respuesta 200 ok, como haría api/contact.js en producción.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<Contact />);
    await pasarTurnstile(user);
    await completarForm(user);
    await user.click(
      screen.getByRole('button', { name: /enviar mensaje/i }),
    );

    // fetch fue llamado al endpoint correcto con método POST.
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    );
    // El mensaje de éxito aparece tras la respuesta.
    expect(
      await screen.findByText(/mensaje enviado/i),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  test('submit con error del backend: muestra el mensaje de error', async () => {
    const user = userEvent.setup();
    // El backend responde con un error (ej: Turnstile falló).
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'La verificación anti-bot falló.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<Contact />);
    await pasarTurnstile(user);
    await completarForm(user);
    await user.click(
      screen.getByRole('button', { name: /enviar mensaje/i }),
    );

    // El mensaje de error del backend se muestra en el form.
    expect(
      await screen.findByText(/anti-bot falló/i),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  test('submit inválido: muestra errores de validación por campo', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    // Pasamos el anti-bot (sino el botón está disabled y no se puede
    // disparar el submit) y enviamos el form vacío → zod falla.
    await pasarTurnstile(user);
    await user.click(
      screen.getByRole('button', { name: /enviar mensaje/i }),
    );

    // Cada error es un <p role="alert"> debajo del campo.
    const errores = await screen.findAllByRole('alert');
    expect(errores.length).toBeGreaterThan(0);
  });

  test('email obfuscado: oculto hasta el click', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    // Antes del click: la dirección real NO está en el DOM.
    expect(
      screen.getByText(/click para ver email/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('ggiuliano526@gmail.com'),
    ).not.toBeInTheDocument();

    // Click en la card de email → se revela la dirección.
    await user.click(screen.getByText(/click para ver email/i));

    expect(
      screen.getByText('ggiuliano526@gmail.com'),
    ).toBeInTheDocument();
  });

  test('honeypot: campo trampa "website" existe pero está oculto', () => {
    const { container } = render(<Contact />);

    // El input trampa existe en el DOM (un bot lo encuentra y lo llena).
    const honeypot = container.querySelector('#website');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute('tabindex', '-1');

    // Su contenedor está fuera de pantalla y marcado aria-hidden — un
    // humano (o lector de pantalla) nunca lo ve.
    const wrapper = honeypot.closest('[aria-hidden="true"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveStyle({ left: '-9999px' });
  });

  test('renderiza los links de contacto directo', () => {
    render(<Contact />);
    // WhatsApp, LinkedIn y GitHub son <a> con href real.
    expect(
      screen.getByRole('link', { name: /whatsapp/i }),
    ).toHaveAttribute('href', 'https://wa.me/5493468536422');
    expect(
      screen.getByRole('link', { name: /linkedin/i }),
    ).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
    expect(
      screen.getByRole('link', { name: /github/i }),
    ).toHaveAttribute('href', 'https://github.com/GiuGerlo');
  });
});
