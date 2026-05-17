import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle.js';

const DEFAULT_TITLE = 'Giuliano Gerlo — Full-Stack Developer';

beforeEach(() => {
  document.title = DEFAULT_TITLE;
});

test('setea el document.title con el valor pasado', () => {
  renderHook(() => useDocumentTitle('Proyecto X — Giuliano Gerlo'));
  expect(document.title).toBe('Proyecto X — Giuliano Gerlo');
});

test('restaura el título por defecto al desmontar', () => {
  const { unmount } = renderHook(() =>
    useDocumentTitle('Proyecto X — Giuliano Gerlo'),
  );
  unmount();
  expect(document.title).toBe(DEFAULT_TITLE);
});

test('título falsy (null) no toca el document.title', () => {
  document.title = 'Algo previo';
  renderHook(() => useDocumentTitle(null));
  expect(document.title).toBe('Algo previo');
});
