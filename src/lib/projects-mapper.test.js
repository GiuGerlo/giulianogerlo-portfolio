/**
 * Tests del mapper Supabase ↔ Project.
 *
 * Objetivo: garantizar que ninguna columna se pierde en la traducción,
 * que los arrays sobreviven el round-trip, y que los nulls de columnas
 * opcionales se preservan.
 */

import { describe, it, expect } from 'vitest';
import { dbToProject, projectToDb } from './projects-mapper.js';

/**
 * Fixture: fila DB completa, todos los campos llenos. Sirve como
 * baseline para chequear renombrados y passthrough de arrays.
 */
const dbRowComplete = {
  id: '0c8a1f3e-aaaa-4bbb-cccc-1234567890ab',
  slug: 'gym-tracker',
  title: 'Personal Gym Tracker',
  category: 'Full-Stack · Fitness',
  role: 'Full-Stack Developer',
  my_role: 'Full-Stack Developer',
  summary: 'App de seguimiento de entrenamiento.',
  description: 'Descripción larga.',
  stack: ['React', 'PHP', 'MariaDB'],
  image: '/projects/gym-tracker-1.webp',
  gallery: ['/projects/gym-tracker-1.webp', '/projects/gym-tracker-2.webp'],
  live_url: 'https://example.com',
  repo_url: 'https://github.com/x/y',
  date_start: '2026-02',
  date_end: '2026-03',
  challenges: ['CI/CD propio', 'Multi-usuario'],
  published: true,
  order_index: 0,
  created_at: '2026-05-21T10:00:00.000Z',
  updated_at: '2026-05-21T10:30:00.000Z',
};

describe('dbToProject', () => {
  it('renombra snake_case a camelCase', () => {
    const project = dbToProject(dbRowComplete);

    expect(project.myRole).toBe('Full-Stack Developer');
    expect(project.liveUrl).toBe('https://example.com');
    expect(project.repoUrl).toBe('https://github.com/x/y');
    expect(project.dateStart).toBe('2026-02');
    expect(project.dateEnd).toBe('2026-03');
    expect(project.orderIndex).toBe(0);
    expect(project.createdAt).toBe('2026-05-21T10:00:00.000Z');
    expect(project.updatedAt).toBe('2026-05-21T10:30:00.000Z');
  });

  it('preserva arrays tal cual (passthrough)', () => {
    const project = dbToProject(dbRowComplete);

    expect(project.stack).toEqual(['React', 'PHP', 'MariaDB']);
    expect(project.gallery).toEqual([
      '/projects/gym-tracker-1.webp',
      '/projects/gym-tracker-2.webp',
    ]);
    expect(project.challenges).toEqual(['CI/CD propio', 'Multi-usuario']);
  });

  it('preserva nulls en columnas opcionales', () => {
    const dbRowSparse = {
      ...dbRowComplete,
      image: null,
      live_url: null,
      repo_url: null,
      date_end: null,
    };

    const project = dbToProject(dbRowSparse);

    expect(project.image).toBeNull();
    expect(project.liveUrl).toBeNull();
    expect(project.repoUrl).toBeNull();
    expect(project.dateEnd).toBeNull();
  });

  it('devuelve arrays vacíos si la columna llega como null/undefined', () => {
    const row = { ...dbRowComplete, stack: null, gallery: undefined, challenges: null };
    const project = dbToProject(row);

    expect(project.stack).toEqual([]);
    expect(project.gallery).toEqual([]);
    expect(project.challenges).toEqual([]);
  });
});

describe('projectToDb', () => {
  it('renombra camelCase a snake_case', () => {
    const project = {
      slug: 'foo',
      title: 'Foo',
      category: 'Web',
      role: 'Dev',
      myRole: 'Dev',
      summary: 's',
      description: 'd',
      stack: ['JS'],
      challenges: ['c1'],
      gallery: [],
      image: '/img.webp',
      liveUrl: 'https://a',
      repoUrl: 'https://b',
      dateStart: '2026-01',
      dateEnd: '2026-02',
      published: true,
      orderIndex: 3,
    };

    const row = projectToDb(project);

    expect(row.my_role).toBe('Dev');
    expect(row.live_url).toBe('https://a');
    expect(row.repo_url).toBe('https://b');
    expect(row.date_start).toBe('2026-01');
    expect(row.date_end).toBe('2026-02');
    expect(row.order_index).toBe(3);
  });

  it('omite id/createdAt/updatedAt (los gestiona Postgres)', () => {
    const project = {
      ...dbToProject(dbRowComplete),
    };

    const row = projectToDb(project);

    expect(row).not.toHaveProperty('id');
    expect(row).not.toHaveProperty('created_at');
    expect(row).not.toHaveProperty('updated_at');
  });

  it('usa defaults razonables si faltan campos opcionales', () => {
    const minimal = {
      slug: 'x',
      title: 't',
      category: 'c',
      role: 'r',
      myRole: 'r',
      summary: 's',
      description: 'd',
      dateStart: '2026-01',
    };

    const row = projectToDb(minimal);

    expect(row.stack).toEqual([]);
    expect(row.gallery).toEqual([]);
    expect(row.challenges).toEqual([]);
    expect(row.image).toBeNull();
    expect(row.live_url).toBeNull();
    expect(row.repo_url).toBeNull();
    expect(row.date_end).toBeNull();
    expect(row.published).toBe(false);
    expect(row.order_index).toBe(0);
  });
});

describe('round-trip dbToProject -> projectToDb', () => {
  it('preserva todos los campos no-managed (excepto id/timestamps)', () => {
    const project = dbToProject(dbRowComplete);
    const row = projectToDb(project);

    // Construyo expected: copia de la fila DB sin las claves managed por
    // Postgres (id, created_at, updated_at) que `projectToDb` no devuelve.
    const expectedRow = { ...dbRowComplete };
    delete expectedRow.id;
    delete expectedRow.created_at;
    delete expectedRow.updated_at;

    expect(row).toEqual(expectedRow);
  });
});
