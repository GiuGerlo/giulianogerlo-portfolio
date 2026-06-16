/**
 * ai-skills-mapper.js — snake↔camel para `ai_skills` (AI Integration).
 */

export function dbToAiSkill(row) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    description: row.description,
    items: row.items ?? [],
    orderIndex: row.order_index,
  };
}

export function aiSkillToDb(a) {
  return {
    title: a.title ?? '',
    status: a.status ?? 'active',
    description: a.description ?? '',
    items: a.items ?? [],
  };
}
