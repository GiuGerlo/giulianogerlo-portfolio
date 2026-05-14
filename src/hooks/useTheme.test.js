import { renderHook, act } from '@testing-library/react';
import { beforeEach, expect, test } from 'vitest';
import { useTheme } from './useTheme.js';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

test('default theme is dark', () => {
  const { result } = renderHook(() => useTheme());
  expect(result.current.theme).toBe('dark');
});

test('toggle switches dark → light', () => {
  const { result } = renderHook(() => useTheme());
  act(() => result.current.toggle());
  expect(result.current.theme).toBe('light');
});

test('persists to localStorage', () => {
  const { result } = renderHook(() => useTheme());
  act(() => result.current.toggle());
  expect(localStorage.getItem('theme')).toBe('light');
});

test('reads existing theme from localStorage on mount', () => {
  localStorage.setItem('theme', 'light');
  const { result } = renderHook(() => useTheme());
  expect(result.current.theme).toBe('light');
});

test('writes data-theme attribute to <html>', () => {
  const { result } = renderHook(() => useTheme());
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  act(() => result.current.toggle());
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});
