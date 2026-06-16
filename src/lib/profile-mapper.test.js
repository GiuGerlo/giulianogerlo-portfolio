/**
 * Tests del mapper Supabase ↔ Profile.
 *
 * Garantizan que ningún campo se pierda en la traducción, que los nulls de
 * about_image se preserven, y que profileToDb omita las columnas managed por
 * Postgres (id, updated_at).
 */

import { describe, it, expect } from 'vitest';
import { dbToProfile, profileToDb } from './profile-mapper.js';

// Fixture: fila DB completa con todos los campos llenos.
const dbRow = {
  id: 1,
  about_image: 'https://x.supabase.co/storage/v1/object/public/project-images/about/foto.webp',
  about_p1: 'Soy **Giuliano Gerlo**, dev.',
  about_p2: 'Trabajo en **RAMCC**.',
  chip_available: 'Disponible para proyectos',
  chip_location: 'Rosario, AR',
  chip_language: 'Español',
  chip_education: 'Cursando React Cert · DigitalHouse',
  updated_at: '2026-06-16T12:00:00.000Z',
};

describe('dbToProfile', () => {
  it('renombra snake_case a camelCase', () => {
    const profile = dbToProfile(dbRow);

    expect(profile.aboutImage).toBe(dbRow.about_image);
    expect(profile.aboutP1).toBe('Soy **Giuliano Gerlo**, dev.');
    expect(profile.aboutP2).toBe('Trabajo en **RAMCC**.');
    expect(profile.chipAvailable).toBe('Disponible para proyectos');
    expect(profile.chipLocation).toBe('Rosario, AR');
    expect(profile.chipLanguage).toBe('Español');
    expect(profile.chipEducation).toBe('Cursando React Cert · DigitalHouse');
    expect(profile.updatedAt).toBe('2026-06-16T12:00:00.000Z');
  });

  it('preserva null en about_image', () => {
    const profile = dbToProfile({ ...dbRow, about_image: null });
    expect(profile.aboutImage).toBeNull();
  });
});

describe('profileToDb', () => {
  it('renombra camelCase a snake_case', () => {
    const row = profileToDb(dbToProfile(dbRow));

    expect(row.about_image).toBe(dbRow.about_image);
    expect(row.about_p1).toBe('Soy **Giuliano Gerlo**, dev.');
    expect(row.chip_available).toBe('Disponible para proyectos');
    expect(row.chip_education).toBe('Cursando React Cert · DigitalHouse');
  });

  it('omite id/updatedAt (los gestiona Postgres)', () => {
    const row = profileToDb(dbToProfile(dbRow));

    expect(row).not.toHaveProperty('id');
    expect(row).not.toHaveProperty('updated_at');
  });

  it('usa defaults (string vacío / null) si faltan campos', () => {
    const row = profileToDb({});

    expect(row.about_image).toBeNull();
    expect(row.about_p1).toBe('');
    expect(row.about_p2).toBe('');
    expect(row.chip_available).toBe('');
    expect(row.chip_location).toBe('');
    expect(row.chip_language).toBe('');
    expect(row.chip_education).toBe('');
  });
});

describe('round-trip dbToProfile -> profileToDb', () => {
  it('preserva todos los campos no-managed (excepto id/updatedAt)', () => {
    const row = profileToDb(dbToProfile(dbRow));

    const expected = { ...dbRow };
    delete expected.id;
    delete expected.updated_at;

    expect(row).toEqual(expected);
  });
});
