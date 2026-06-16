/**
 * skill-groups-mapper.js — snake↔camel para `skill_groups` (Stack Técnico).
 * `xToDb` omite id/order_index/timestamps: order_index lo maneja el hook
 * admin (create/move); el resto Postgres.
 */

export function dbToSkillGroup(row) {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    items: row.items ?? [],
    orderIndex: row.order_index,
  };
}

export function skillGroupToDb(g) {
  return {
    title: g.title ?? '',
    icon: g.icon ?? '',
    items: g.items ?? [],
  };
}
