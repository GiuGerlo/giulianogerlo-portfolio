import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useChatLogs.js', () => ({
  useChatLogs: vi.fn(),
}));

import Chats from './Chats.jsx';
import { useChatLogs } from '../../hooks/useChatLogs.js';

const conversation = {
  id: '11111111-1111-4111-8111-111111111111',
  startedAt: '2026-06-18T10:00:00Z',
  lastAt: '2026-06-18T10:01:00Z',
  turns: [
    {
      id: 'a',
      message: '¿Sabe React?',
      reply: 'Sí, está cursando una certificación.',
      createdAt: '2026-06-18T10:00:00Z',
    },
  ],
};

function renderChats() {
  return render(
    <MemoryRouter>
      <Chats />
    </MemoryRouter>,
  );
}

describe('Chats (admin)', () => {
  beforeEach(() => {
    useChatLogs.mockReset();
  });

  test('loading: aria-busy', () => {
    useChatLogs.mockReturnValue({ data: null, loading: true, error: null, remove: vi.fn() });
    const { container } = renderChats();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  test('error: alert', () => {
    useChatLogs.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'x' },
      remove: vi.fn(),
    });
    renderChats();
    expect(screen.getByRole('alert')).toHaveTextContent(/no pude cargar/i);
  });

  test('vacío: muestra mensaje sin chats', () => {
    useChatLogs.mockReturnValue({ data: [], loading: false, error: null, remove: vi.fn() });
    renderChats();
    expect(screen.getByText(/todavía no hay chats/i)).toBeInTheDocument();
  });

  test('data: renderiza la pregunta y la respuesta de la conversación', () => {
    useChatLogs.mockReturnValue({
      data: [conversation],
      loading: false,
      error: null,
      remove: vi.fn(),
    });
    renderChats();
    // La pregunta aparece en el turno y también en "Preguntas frecuentes".
    expect(screen.getAllByText('¿Sabe React?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/está cursando una certificación/i)).toBeInTheDocument();
    // El panel de insights muestra la métrica de conversaciones.
    expect(screen.getByText(/^conversaciones$/i)).toBeInTheDocument();
  });

  test('borrar: confirma y llama remove con el id de la conversación', async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    useChatLogs.mockReturnValue({
      data: [conversation],
      loading: false,
      error: null,
      remove,
    });

    const user = userEvent.setup();
    renderChats();

    await user.click(screen.getByRole('button', { name: /borrar conversación/i }));
    // El ConfirmDialog abre con su propio botón "Borrar".
    const confirmBtn = await screen.findByRole('button', { name: /^borrar$/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith(conversation.id);
    });
  });
});
