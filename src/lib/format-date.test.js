import { describe, test, expect } from 'vitest';

import { formatDateAR, formatDateARLong } from './format-date.js';

/**
 * Notas sobre los tests:
 *  - Usamos timestamps con offset explícito (Z = UTC) para que el
 *    cálculo de hora argentina sea determinístico independiente del
 *    timezone del runner.
 *  - Argentina es UTC-3 (sin DST). `2026-05-26T20:27:06Z` (UTC) =
 *    `2026-05-26 17:27` (hora argentina).
 */

describe('formatDateAR', () => {
  test('convierte ISO UTC a hora argentina (UTC-3) en formato corto', () => {
    // 20:27 UTC → 17:27 Argentina (UTC-3).
    const out = formatDateAR('2026-05-26T20:27:06Z');
    expect(out).toContain('26/05/2026');
    expect(out).toContain('17:27');
  });

  test('cruza la frontera del día si UTC es madrugada', () => {
    // 01:00 UTC del 26 → 22:00 Argentina del 25.
    const out = formatDateAR('2026-05-26T01:00:00Z');
    expect(out).toContain('25/05/2026');
    expect(out).toContain('22:00');
  });

  test('null/undefined/string vacío devuelve ""', () => {
    expect(formatDateAR(null)).toBe('');
    expect(formatDateAR(undefined)).toBe('');
    expect(formatDateAR('')).toBe('');
  });
});

describe('formatDateARLong', () => {
  test('usa nombre del mes en español rioplatense', () => {
    const out = formatDateARLong('2026-05-26T20:27:06Z');
    // Mayo escrito completo (locale es-AR). Tolerante a variación de
    // espacios/comas según versión Intl.
    expect(out.toLowerCase()).toContain('mayo');
    expect(out).toContain('2026');
    expect(out).toContain('17:27');
  });

  test('null devuelve ""', () => {
    expect(formatDateARLong(null)).toBe('');
  });
});
