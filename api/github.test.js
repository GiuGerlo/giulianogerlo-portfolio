import { describe, test, expect } from 'vitest';

import { mapRepo, pickFeatured } from './github.js';

describe('mapRepo', () => {
  test('mapea la fila cruda al shape mínimo en camelCase', () => {
    const out = mapRepo({
      id: 1,
      name: 'portfolio',
      description: 'mi sitio',
      html_url: 'https://github.com/GiuGerlo/portfolio',
      language: 'JavaScript',
      stargazers_count: 5,
      forks_count: 2,
      topics: ['react'],
      pushed_at: '2026-06-01T00:00:00Z',
    });
    expect(out).toEqual({
      id: 1,
      name: 'portfolio',
      description: 'mi sitio',
      url: 'https://github.com/GiuGerlo/portfolio',
      language: 'JavaScript',
      stars: 5,
      forks: 2,
      topics: ['react'],
      pushedAt: '2026-06-01T00:00:00Z',
    });
  });

  test('defaults seguros si faltan campos', () => {
    const out = mapRepo({ id: 2, name: 'x', html_url: 'u' });
    expect(out.stars).toBe(0);
    expect(out.forks).toBe(0);
    expect(out.topics).toEqual([]);
  });
});

describe('pickFeatured', () => {
  const base = (over) => ({
    id: Math.random(),
    name: 'r',
    html_url: 'u',
    fork: false,
    archived: false,
    private: false,
    stargazers_count: 0,
    pushed_at: '2026-01-01T00:00:00Z',
    ...over,
  });

  test('descarta forks, archived y private', () => {
    const repos = [
      base({ name: 'ok' }),
      base({ name: 'fork', fork: true }),
      base({ name: 'arch', archived: true }),
      base({ name: 'priv', private: true }),
    ];
    const out = pickFeatured(repos);
    expect(out.map((r) => r.name)).toEqual(['ok']);
  });

  test('ordena por estrellas desc, luego por pushed desc', () => {
    const repos = [
      base({ name: 'a', stargazers_count: 1 }),
      base({ name: 'b', stargazers_count: 10 }),
      base({ name: 'c', stargazers_count: 10, pushed_at: '2026-06-01T00:00:00Z' }),
    ];
    const out = pickFeatured(repos);
    // b y c tienen 10 estrellas; c tiene push más reciente → c antes que b.
    expect(out.map((r) => r.name)).toEqual(['c', 'b', 'a']);
  });

  test('corta a 6 destacados', () => {
    const repos = Array.from({ length: 10 }, (_, i) =>
      base({ name: `r${i}`, stargazers_count: i }),
    );
    expect(pickFeatured(repos)).toHaveLength(6);
  });
});
