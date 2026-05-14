// Tests de shape — chequean que los datos cumplen las invariantes que el
// resto de la app asume. Si alguien rompe un campo requerido, salta acá
// antes que en runtime con un crash silencioso.

import { describe, test, expect } from 'vitest';
import { projects } from './projects.js';

describe('projects data', () => {
  test('cada proyecto tiene un slug único', () => {
    const slugs = projects.map((p) => p.slug);
    // Set elimina duplicados; si las longitudes coinciden, no hay repetidos.
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('cada proyecto tiene los campos requeridos', () => {
    projects.forEach((p) => {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.summary).toBeTruthy();
      expect(p.stack).toBeInstanceOf(Array);
      expect(p.stack.length).toBeGreaterThan(0);
    });
  });

  test('dateStart usa formato YYYY-MM', () => {
    const re = /^\d{4}-\d{2}$/;
    projects.forEach((p) => {
      expect(p.dateStart).toMatch(re);
      // dateEnd puede ser null (en curso) o también YYYY-MM.
      if (p.dateEnd !== null) {
        expect(p.dateEnd).toMatch(re);
      }
    });
  });

  test('slug es URL-safe (kebab-case, sin espacios)', () => {
    projects.forEach((p) => {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });
});
