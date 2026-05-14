import { describe, test, expect } from 'vitest';
import { skillGroups, aiSkills } from './skills.js';

describe('skillGroups data', () => {
  test('cada grupo tiene id único', () => {
    const ids = skillGroups.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('cada grupo tiene al menos 1 item', () => {
    skillGroups.forEach((g) => {
      expect(g.items.length).toBeGreaterThan(0);
    });
  });
});

describe('aiSkills data', () => {
  test('cada skill tiene id único', () => {
    const ids = aiSkills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('status es active o exploring', () => {
    aiSkills.forEach((s) => {
      expect(['active', 'exploring']).toContain(s.status);
    });
  });
});
