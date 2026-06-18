/**
 * chat-insights.js — métricas derivadas de las conversaciones del chatbot.
 *
 * Función PURA: recibe las conversaciones agrupadas (las que devuelve
 * useChatLogs) y calcula métricas para el panel del admin. Sin queries: trabaja
 * sobre la data ya traída.
 *
 * Conversación: { id, startedAt, lastAt, turns: [{ message, reply, createdAt }] }
 */

const WEEKS_BACK = 8;

/**
 * normalizeQuestion — para agrupar "preguntas iguales" con distinta forma:
 * minúsculas, sin espacios extra, sin signos de pregunta/exclamación ni
 * puntuación al inicio/final.
 */
export function normalizeQuestion(text) {
  return (text ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[¿¡\s]+/, '')
    .replace(/[?!.,;:\s]+$/, '');
}

// Lunes 00:00 UTC de la semana de `date` (clave de agrupación semanal).
function weekStart(date) {
  const d = new Date(date);
  const dayMon0 = (d.getUTCDay() + 6) % 7; // 0 = lunes
  d.setUTCDate(d.getUTCDate() - dayMon0);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * computeChatInsights — devuelve:
 *   { totalConversations, totalMessages, avgMessages,
 *     weekly: [{ label, count }],        // últimas WEEKS_BACK semanas (asc)
 *     topQuestions: [{ question, count }] } // preguntas más repetidas
 */
export function computeChatInsights(conversations) {
  const convs = conversations ?? [];

  const totalConversations = convs.length;
  const totalMessages = convs.reduce((acc, c) => acc + (c.turns?.length ?? 0), 0);
  const avgMessages = totalConversations
    ? Math.round((totalMessages / totalConversations) * 10) / 10
    : 0;

  // ── Conversaciones por semana (últimas WEEKS_BACK) ──
  const counts = new Map(); // weekStartISO → count
  for (const c of convs) {
    const key = weekStart(c.startedAt).toISOString();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const weekly = [];
  const thisWeek = weekStart(new Date());
  for (let i = WEEKS_BACK - 1; i >= 0; i--) {
    const d = new Date(thisWeek);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const key = d.toISOString();
    const label = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    weekly.push({ label, count: counts.get(key) ?? 0 });
  }

  // ── Preguntas frecuentes (frecuencia por texto normalizado) ──
  const freq = new Map(); // normalizado → { count, sample }
  for (const c of convs) {
    for (const t of c.turns ?? []) {
      const norm = normalizeQuestion(t.message);
      if (!norm) continue;
      const cur = freq.get(norm) ?? { count: 0, sample: t.message };
      cur.count += 1;
      freq.set(norm, cur);
    }
  }
  const topQuestions = [...freq.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((x) => ({ question: x.sample, count: x.count }));

  return { totalConversations, totalMessages, avgMessages, weekly, topQuestions };
}
