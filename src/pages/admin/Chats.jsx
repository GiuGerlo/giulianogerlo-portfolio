import { useState } from 'react';
import { MessageCircle, Trash2, User, Bot } from 'lucide-react';

import { useChatLogs } from '../../hooks/useChatLogs.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { computeChatInsights } from '../../lib/chat-insights.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

/**
 * Chats (admin) — registro de las conversaciones del chatbot. Lectura +
 * borrado por conversación. Las conversaciones vienen agrupadas por
 * `conversation_id` desde useChatLogs (más reciente arriba; turnos
 * cronológicos dentro de cada una).
 */

// Formateador de fecha/hora en español rioplatense. Se crea una vez (módulo).
const fmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function Chats() {
  useDocumentTitle('Chats — Admin');

  const { data, loading, error, remove } = useChatLogs();

  // Conversación pendiente de borrar (para el ConfirmDialog).
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    setBusy(true);
    await remove(target.id);
    setBusy(false);
  }

  if (loading) {
    return (
      <article
        aria-busy="true"
        aria-label="Cargando chats"
        className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16"
      >
        <div className="mb-8 h-10 w-3/4 rounded bg-border/60" />
        <div className="mb-3 h-32 rounded bg-border/40" />
        <div className="h-32 rounded bg-border/40" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="font-medium text-text-primary">No pude cargar los chats.</p>
          <p className="text-sm">Recargá la página.</p>
        </div>
      </article>
    );
  }

  const conversations = data ?? [];

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        eyebrow="// chats"
        title="Conversaciones del chatbot"
        subtitle="Lo que preguntan los visitantes al asistente. Agrupado por conversación."
      />

      {/* Panel de insights (solo si hay data). */}
      {conversations.length > 0 && <Insights conversations={conversations} />}

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-elevated p-6 text-center text-text-muted">
          <MessageCircle size={24} aria-hidden="true" className="mx-auto mb-2 text-text-muted" />
          <p>Todavía no hay chats registrados.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className="rounded-xl border border-border bg-bg-elevated p-4"
            >
              {/* Header: fecha de inicio + nº de turnos + borrar. */}
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-2">
                <span className="font-mono text-xs text-text-muted">
                  {fmt.format(new Date(conv.startedAt))} · {conv.turns.length}{' '}
                  {conv.turns.length === 1 ? 'mensaje' : 'mensajes'}
                </span>
                <button
                  type="button"
                  onClick={() => setPendingDelete(conv)}
                  disabled={busy}
                  aria-label="Borrar conversación"
                  title="Borrar conversación"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-40"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Turnos: pregunta del visitante + respuesta del bot. */}
              <div className="space-y-3">
                {conv.turns.map((turn) => (
                  <div key={turn.id} className="space-y-2">
                    <div className="flex gap-2">
                      <User size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                      <p className="whitespace-pre-wrap text-sm text-text-primary">
                        {turn.message}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Bot size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-text-muted" />
                      <p className="whitespace-pre-wrap text-sm text-text-muted">
                        {turn.reply}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Borrar conversación"
        message="¿Borrar toda esta conversación? Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </article>
  );
}

/**
 * Insights — panel de métricas arriba del listado: totales, conversaciones por
 * semana (mini-barras) y preguntas más frecuentes. Todo derivado de las
 * conversaciones ya traídas (computeChatInsights, sin queries nuevas).
 */
function Insights({ conversations }) {
  const { totalConversations, totalMessages, avgMessages, weekly, topQuestions } =
    computeChatInsights(conversations);

  // Máximo para escalar las barras (mín 1 para no dividir por cero).
  const maxWeek = Math.max(1, ...weekly.map((w) => w.count));

  return (
    <section className="mb-8 grid gap-4 lg:grid-cols-3">
      {/* Métricas. */}
      <div className="grid grid-cols-3 gap-3 lg:col-span-1 lg:grid-cols-1">
        <Metric label="Conversaciones" value={totalConversations} />
        <Metric label="Mensajes" value={totalMessages} />
        <Metric label="Prom. / charla" value={avgMessages} />
      </div>

      {/* Conversaciones por semana. */}
      <div className="rounded-xl border border-border bg-bg-elevated p-5 lg:col-span-2">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
          Conversaciones por semana
        </h2>
        <div className="flex h-24 items-end gap-2">
          {weekly.map((w) => (
            <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-accent/70"
                  style={{ height: `${(w.count / maxWeek) * 100}%` }}
                  title={`${w.count} conversación(es)`}
                />
              </div>
              <span className="font-mono text-[10px] text-text-muted">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preguntas frecuentes. */}
      {topQuestions.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-elevated p-5 lg:col-span-3">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Preguntas más frecuentes
          </h2>
          <ul className="space-y-2">
            {topQuestions.map((q) => (
              <li key={q.question} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-text-primary" title={q.question}>
                  {q.question}
                </span>
                <span className="shrink-0 rounded-full bg-accent-bg px-2 py-0.5 font-mono text-xs text-accent">
                  {q.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4">
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
      <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </p>
    </div>
  );
}
