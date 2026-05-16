import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Contact from './Contact.jsx';

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

  test('submit válido: corre onSubmit (console.log, UI only)', async () => {
    const user = userEvent.setup();
    // Espiamos console.log para verificar que el handler corre.
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<Contact />);

    // Completamos los 3 campos con valores válidos según el schema.
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez');
    await user.type(
      screen.getByLabelText(/email/i),
      'juan@example.com',
    );
    await user.type(
      screen.getByLabelText(/mensaje/i),
      'Hola, quiero contactarte por un proyecto.',
    );
    await user.click(
      screen.getByRole('button', { name: /enviar mensaje/i }),
    );

    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  test('submit inválido: muestra errores de validación por campo', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    // Submit con el form vacío → zod falla → se muestran los errores.
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
