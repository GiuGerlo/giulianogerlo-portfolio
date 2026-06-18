import { describe, test, expect } from 'vitest';

import { calendarToWeeks, daysToWeeks } from './github.js';

describe('calendarToWeeks', () => {
  test('mapea weeks de GraphQL al shape mínimo (+ level enum→0-4)', () => {
    const calendar = {
      weeks: [
        {
          contributionDays: [
            { date: '2026-06-01', contributionCount: 0, contributionLevel: 'NONE', weekday: 1 },
            { date: '2026-06-02', contributionCount: 3, contributionLevel: 'SECOND_QUARTILE', weekday: 2 },
          ],
        },
        {
          contributionDays: [
            { date: '2026-06-07', contributionCount: 9, contributionLevel: 'FOURTH_QUARTILE', weekday: 0 },
          ],
        },
      ],
    };
    const weeks = calendarToWeeks(calendar);
    expect(weeks).toHaveLength(2);
    expect(weeks[0][1]).toEqual({ date: '2026-06-02', count: 3, level: 2, weekday: 2 });
    expect(weeks[1][0].level).toBe(4);
  });

  test('tolera calendar vacío/undefined', () => {
    expect(calendarToWeeks(undefined)).toEqual([]);
    expect(calendarToWeeks({ weeks: [] })).toEqual([]);
  });
});

describe('daysToWeeks', () => {
  test('agrupa días planos en semanas que arrancan en domingo', () => {
    // 2026-06-06 = sábado, 2026-06-07 = domingo → corta semana.
    const days = [
      { date: '2026-06-05', count: 1, level: 1 }, // viernes
      { date: '2026-06-06', count: 0, level: 0 }, // sábado
      { date: '2026-06-07', count: 2, level: 1 }, // domingo → nueva semana
      { date: '2026-06-08', count: 0, level: 0 }, // lunes
    ];
    const weeks = daysToWeeks(days);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].map((d) => d.date)).toEqual(['2026-06-05', '2026-06-06']);
    expect(weeks[1].map((d) => d.date)).toEqual(['2026-06-07', '2026-06-08']);
    // weekday calculado.
    expect(weeks[1][0].weekday).toBe(0);
  });
});
