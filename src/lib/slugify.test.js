import { describe, test, expect } from 'vitest';
import { slugify } from './slugify.js';

describe('slugify', () => {
  test('convierte espacios en guiones', () => {
    expect(slugify('Hola Mundo')).toBe('hola-mundo');
  });

  test('saca acentos y diacríticos', () => {
    expect(slugify('Año Nuevo')).toBe('ano-nuevo');
    expect(slugify('Café Olé')).toBe('cafe-ole');
  });

  test('saca caracteres especiales', () => {
    expect(slugify('Next — Tienda de Ropa')).toBe('next-tienda-de-ropa');
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  test('colapsa separadores múltiples', () => {
    expect(slugify('hola   mundo')).toBe('hola-mundo');
    expect(slugify('hola__mundo')).toBe('hola-mundo');
    expect(slugify('hola---mundo')).toBe('hola-mundo');
  });

  test('trim de guiones bordes', () => {
    expect(slugify('-hola-')).toBe('hola');
    expect(slugify('  hola  ')).toBe('hola');
  });

  test('string vacío o falsy → string vacío', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});
