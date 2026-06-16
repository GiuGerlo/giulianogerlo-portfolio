/**
 * education-mapper.js — snake↔camel para `education` (educación + certs).
 */

export function dbToEducation(row) {
  return {
    id: row.id,
    dateLabel: row.date_label,
    title: row.title,
    org: row.org,
    status: row.status,
    certUrl: row.cert_url,
    orderIndex: row.order_index,
  };
}

export function educationToDb(e) {
  return {
    date_label: e.dateLabel ?? '',
    title: e.title ?? '',
    org: e.org ?? '',
    status: e.status ?? 'completed',
    cert_url: e.certUrl || null,
  };
}
