import { describe, test, expect } from 'vitest';

import { computeChatInsights, normalizeQuestion } from './chat-insights.js';

describe('normalizeQuestion', () => {
  test('baja a minúsculas, saca signos y espacios extra', () => {
    expect(normalizeQuestion('  ¿Sabe React?  ')).toBe('sabe react');
    expect(normalizeQuestion('SABE   react!!')).toBe('sabe   react'.replace(/\s+/g, ' '));
    expect(normalizeQuestion('¿Sabe react?')).toBe('sabe react');
  });
});

describe('computeChatInsights', () => {
  const conv = (id, startedAt, messages) => ({
    id,
    startedAt,
    lastAt: startedAt,
    turns: messages.map((m, i) => ({ id: `${id}-${i}`, message: m, reply: 'r', createdAt: startedAt })),
  });

  test('totales y promedio', () => {
    const data = [
      conv('a', '2026-06-15T10:00:00Z', ['¿Sabe React?', '¿Y Laravel?']),
      conv('b', '2026-06-16T10:00:00Z', ['Sabe react?']),
    ];
    const out = computeChatInsights(data);
    expect(out.totalConversations).toBe(2);
    expect(out.totalMessages).toBe(3);
    expect(out.avgMessages).toBe(1.5);
  });

  test('agrupa preguntas iguales con distinta forma', () => {
    const data = [
      conv('a', '2026-06-15T10:00:00Z', ['¿Sabe React?']),
      conv('b', '2026-06-16T10:00:00Z', ['sabe react']),
      conv('c', '2026-06-17T10:00:00Z', ['Otra pregunta']),
    ];
    const out = computeChatInsights(data);
    expect(out.topQuestions[0].count).toBe(2); // las dos "sabe react"
    expect(out.topQuestions).toHaveLength(2);
  });

  test('weekly devuelve 8 semanas', () => {
    const out = computeChatInsights([]);
    expect(out.weekly).toHaveLength(8);
    expect(out.weekly.every((w) => w.count === 0)).toBe(true);
  });

  test('tolera lista vacía/undefined', () => {
    expect(computeChatInsights(undefined).totalConversations).toBe(0);
  });
});
