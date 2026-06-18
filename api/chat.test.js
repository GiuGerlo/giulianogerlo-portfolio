import { describe, test, expect, vi } from 'vitest';

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

// supabaseServer = null simula "Supabase no configurado" → fetchContent debe
// caer a su fallback estático sin tirar error.
vi.mock('../src/lib/supabase-server.js', () => ({ supabaseServer: null }));

import { fetchContent, buildContext } from './chat.js';
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
