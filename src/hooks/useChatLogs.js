// Hook de lectura del registro de chats (admin). Trae chat_logs, los agrupa
// por conversación y expone un borrado por conversación.
import { useState, useEffect, useCallback } from 'react';

import { supabase } from '../lib/supabase.js';
import { dbToChatLog } from '../lib/chat-logs-mapper.js';

// Tope de filas que traemos. Cada conversación son varias filas (1 por turno);
// 1000 alcanza de sobra para un portfolio. Si algún día crece, se pagina.
const MAX_ROWS = 1000;

/**
 * groupByConversation — de filas planas (ordenadas por fecha desc) a un array
 * de conversaciones:
 *   [{ id, startedAt, lastAt, turns: [{ id, message, reply, createdAt }] }]
 *
 * - Las conversaciones se ordenan por su último mensaje (más reciente primero).
 * - Los turnos DENTRO de cada conversación van cronológicos (asc) para leer el
 *   hilo de arriba hacia abajo.
 */
function groupByConversation(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.conversationId)) {
      map.set(row.conversationId, []);
    }
    map.get(row.conversationId).push(row);
  }

  const conversations = [];
  for (const [id, turns] of map) {
    // Vienen desc (más nuevo primero) → invertimos a cronológico.
    const chrono = [...turns].reverse();
    conversations.push({
      id,
      startedAt: chrono[0].createdAt,
      lastAt: chrono[chrono.length - 1].createdAt,
      turns: chrono,
    });
  }

  // Conversaciones: la del mensaje más reciente arriba.
  conversations.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
  return conversations;
}

/**
 * useChatLogs — { data, loading, error, refetch, remove }
 *  - data: array de conversaciones agrupadas (o null mientras carga).
 *  - remove(conversationId): borra TODAS las filas de esa conversación
 *    (RLS admin-delete) y refetchea.
 */
export function useChatLogs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS);

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    setData(groupByConversation(rows.map(dbToChatLog)));
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchLogs();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchLogs]);

  const remove = useCallback(
    async (conversationId) => {
      const { error: err } = await supabase
        .from('chat_logs')
        .delete()
        .eq('conversation_id', conversationId);

      if (err) {
        console.error('[useChatLogs] borrar conversación falló:', err);
        return { error: err };
      }
      await fetchLogs();
      return { error: null };
    },
    [fetchLogs],
  );

  return { data, loading, error, refetch: fetchLogs, remove };
}
