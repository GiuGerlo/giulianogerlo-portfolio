import { describe, test, expect, vi, beforeEach } from 'vitest';

// api/chat.js instancia un cliente Redis (Upstash) al importarse. Sin env vars
// el constructor real falla, así que lo stubeamos — estos tests no ejercitan
// el rate-limit.
vi.mock('@upstash/redis', () => ({
  Redis: class {
    incr() {
      return Promise.resolve(1);
    }
    expire() {
      return Promise.resolve();
    }
  },
}));

// Mock de supabase-server:
//  - supabaseServer = null → fetchContent cae al fallback estático sin error.
//  - supabaseAdmin = stub con insert() capturado → testeamos logChat sin DB real.
//    insertMock devuelve { error: null } por default; un test lo pisa para
//    simular fallo y verificar que logChat NO tira.
const { insertMock } = vi.hoisted(() => ({
  insertMock: vi.fn(() => Promise.resolve({ error: null })),
}));

vi.mock('../src/lib/supabase-server.js', () => ({
  supabaseServer: null,
  supabaseAdmin: { from: () => ({ insert: insertMock }) },
}));

import { fetchContent, buildContext, logChat } from './chat.js';
import { projects } from '../src/data/projects.js';
import { experience } from '../src/data/experience.js';

describe('buildContext', () => {
  test('serializa el contenido y tolera ambos shapes (desc y description)', () => {
    const content = {
      projects: [
        {
          title: 'Proyecto X',
          category: 'web',
          dateStart: '2025',
          dateEnd: null,
          myRole: 'Dev',
          description: 'descripción del proyecto',
          stack: ['React'],
          challenges: [],
        },
      ],
      // experience con shape ESTÁTICO (desc)
      experience: [
        { role: 'Dev', company: 'ACME', dateLabel: '2025', desc: 'exp-shape-estatico' },
      ],
      skillGroups: [{ title: 'Frontend', items: ['React'] }],
      // aiSkills con shape DB (description)
      aiSkills: [{ title: 'mcp_servers', description: 'ai-shape-db', items: [] }],
      education: [{ title: 'Tec Sup', org: 'Escuela', dateLabel: '2024' }],
      chatbotContext: 'Edad: 22 años.',
    };

    const out = buildContext(content);

    expect(out).toContain('## Proyectos');
    expect(out).toContain('exp-shape-estatico'); // desc (estático)
    expect(out).toContain('ai-shape-db'); // description (DB)
    expect(out).toContain('Edad: 22 años.'); // chatbotContext inyectado
  });
});

describe('fetchContent (fallback)', () => {
  test('sin Supabase devuelve el bundle estático + bio serializado', async () => {
    const content = await fetchContent();

    // Cae a los arrays estáticos importados (misma referencia).
    expect(content.projects).toBe(projects);
    expect(content.experience).toBe(experience);
    // bio serializado a prosa.
    expect(content.chatbotContext).toContain('Edad');
  });
});

describe('logChat', () => {
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  beforeEach(() => {
    insertMock.mockClear();
    insertMock.mockResolvedValue({ error: null });
  });

  test('inserta con el conversation_id cuando es un uuid válido', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    await logChat({ conversationId: id, message: 'hola', reply: 'chau' });

    expect(insertMock).toHaveBeenCalledWith({
      conversation_id: id,
      message: 'hola',
      reply: 'chau',
    });
  });

  test('genera un uuid si el conversationId es inválido/ausente', async () => {
    await logChat({ conversationId: 'no-es-uuid', message: 'm', reply: 'r' });

    const arg = insertMock.mock.calls[0][0];
    expect(arg.conversation_id).toMatch(UUID_RE);
  });

  test('no tira si el insert devuelve error', async () => {
    insertMock.mockResolvedValue({ error: { message: 'boom' } });
    await expect(
      logChat({
        conversationId: '11111111-1111-4111-8111-111111111111',
        message: 'm',
        reply: 'r',
      }),
    ).resolves.toBeUndefined();
  });
});
