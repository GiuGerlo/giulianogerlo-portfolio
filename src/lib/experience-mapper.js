/**
 * experience-mapper.js — snake↔camel para `experience` (timeline).
 */

export function dbToExperience(row) {
  return {
    id: row.id,
    dateLabel: row.date_label,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    role: row.role,
    company: row.company,
    description: row.description,
    current: row.current,
    projectSlug: row.project_slug,
    orderIndex: row.order_index,
  };
}

export function experienceToDb(e) {
  return {
    date_label: e.dateLabel ?? '',
    date_start: e.dateStart || null,
    date_end: e.dateEnd || null,
    role: e.role ?? '',
    company: e.company ?? '',
    description: e.description ?? '',
    current: e.current ?? false,
    project_slug: e.projectSlug || null,
  };
}
