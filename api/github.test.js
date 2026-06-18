import { describe, test, expect } from 'vitest';

import { calendarToContributions } from './github.js';

describe('calendarToContributions', () => {
  test('aplana weeks→days y mapea el enum de nivel a 0-4', () => {
    const calendar = {
      totalContributions: 717,
      weeks: [
        {
          contributionDays: [
            { date: '2026-06-01', contributionCount: 0, contributionLevel: 'NONE' },
            { date: '2026-06-02', contributionCount: 3, contributionLevel: 'SECOND_QUARTILE' },
          ],
        },
        {
          contributionDays: [
            { date: '2026-06-03', contributionCount: 9, contributionLevel: 'FOURTH_QUARTILE' },
          ],
        },
      ],
    };
    const out = calendarToContributions(calendar);
    expect(out).toEqual([
      { date: '2026-06-01', count: 0, level: 0 },
      { date: '2026-06-02', count: 3, level: 2 },
      { date: '2026-06-03', count: 9, level: 4 },
    ]);
  });

  test('tolera calendar vacío/undefined', () => {
    expect(calendarToContributions(undefined)).toEqual([]);
    expect(calendarToContributions({ weeks: [] })).toEqual([]);
  });
});
