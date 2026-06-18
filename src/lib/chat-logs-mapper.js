/**
 * chat-logs-mapper.js — snake↔camel para `chat_logs` (registro del chatbot).
 * Solo lectura desde el admin → alcanza con dbToChatLog.
 */

export function dbToChatLog(row) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    message: row.message,
    reply: row.reply,
    createdAt: row.created_at,
  };
}
