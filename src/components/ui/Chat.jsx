// useState  → estado del chat (abierto, mensajes, input, etc.).
// useEffect → auto-scroll al último mensaje.
// useRef    → referencia al fondo de la lista para scrollear ahí.
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
// react-markdown renderiza el texto del bot: Gemini puede devolver
// **negrita**, listas, links — esto los convierte a HTML seguro.
import ReactMarkdown from 'react-markdown';
// Turnstile — widget anti-bot de Cloudflare. Mismo patrón que el form
// de contacto: genera un token que el backend (api/chat.js) verifica.
import { Turnstile } from '@marsidev/react-turnstile';

/**
 * Chat — chatbot flotante "Preguntale a Giuliano".
 *
 * Botón flotante abajo-derecha; al abrirlo despliega un panel con la
 * conversación. Cada mensaje se manda a POST /api/chat, que llama a
 * Gemini con toda la data del portfolio como contexto (context-stuffing).
 *
 * Estado de la conversación:
 *  - messages → array de turnos { role: 'user' | 'model', text }.
 *    NO incluye el saludo inicial (ese es JSX estático): el historial
 *    que se manda al backend debe arrancar con un turno 'user'.
 *
 * Turnstile (token de un solo uso):
 *  - El token sirve UNA vez. Tras cada envío reseteamos el widget
 *    cambiando su `key` (React lo remonta y genera un token nuevo).
 *  - Mientras no haya token, el botón de enviar queda deshabilitado.
 */

// SITE KEY pública de Turnstile (la misma del form de contacto).
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// Preguntas sugeridas — se muestran como chips al abrir el chat, para
// que el visitante no arranque de cero.
const SUGERENCIAS = [
  '¿Qué experiencia tiene?',
  '¿Sabe React?',
  '¿En qué proyectos trabajó?',
];

export default function Chat() {
  // Panel abierto/cerrado.
  const [isOpen, setIsOpen] = useState(false);
  // Turnos de la conversación (sin el saludo inicial).
  const [messages, setMessages] = useState([]);
  // Texto que está escribiendo el visitante.
  const [input, setInput] = useState('');
  // true mientras esperamos la respuesta del backend.
  const [loading, setLoading] = useState(false);
  // Mensaje de error visible si algo falla.
  const [error, setError] = useState('');
  // Honeypot anti-bots: un humano nunca lo completa (no lo ve).
  const [website, setWebsite] = useState('');
  // Token de Turnstile + "llave" para remontar el widget tras usarlo.
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  // Referencia al div vacío del fondo de la lista de mensajes.
  const bottomRef = useRef(null);

  // Cada vez que cambian los mensajes o el estado de carga, scrolleamos
  // al fondo para que se vea siempre el último mensaje.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // sendMessage — envía un texto al backend y agrega la respuesta.
  // Recibe el texto por parámetro para poder usarlo tanto desde el form
  // como desde los chips de sugerencias.
  async function sendMessage(text) {
    const pregunta = text.trim();
    // No enviar si está vacío, si ya hay una request en curso, o si
    // todavía no tenemos el token anti-bot.
    if (!pregunta || loading || !turnstileToken) return;

    // El historial que mandamos es lo que había ANTES de esta pregunta.
    const history = messages;

    // Pintamos el mensaje del usuario al instante (UI optimista).
    setMessages([...messages, { role: 'user', text: pregunta }]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: pregunta,
          history,
          website,
          turnstileToken,
        }),
      });

      // res.ok = status 2xx. Si no, leemos el error que mandó el backend.
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? 'No se pudo obtener la respuesta.');
      }

      setMessages((prev) => [...prev, { role: 'model', text: body.reply }]);
    } catch (err) {
      setError(err.message || 'Error de conexión. Probá de nuevo.');
    } finally {
      setLoading(false);
      // El token de Turnstile es de un solo uso: lo limpiamos y
      // remontamos el widget para generar uno nuevo.
      setTurnstileToken(null);
      setTurnstileKey((k) => k + 1);
    }
  }

  // Submit del form de input (tecla Enter o botón).
  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* ── Botón flotante ── */}
      {/* Abajo-derecha, fijo. Cambia de ícono según esté abierto o no. */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat con asistente'}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* ── Panel del chat ── */}
      {/* Solo se renderiza si está abierto. En mobile ocupa casi todo el
          ancho; en sm+ es una cajita fija de 380px. */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Asistente virtual de Giuliano Gerlo"
          className="fixed bottom-24 right-5 z-40 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border bg-bg px-4 py-3">
            <MessageCircle size={18} className="text-accent" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                Preguntale a Giuliano
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                asistente IA · responde sobre su perfil
              </span>
            </div>
          </div>

          {/* Lista de mensajes — scrolleable. `scroll-slim` (index.css)
              reemplaza el scrollbar nativo por uno fino acorde al tema. */}
          <div className="scroll-slim flex-1 space-y-3 overflow-y-auto p-4">
            {/* Saludo inicial estático (no es parte de `messages`). */}
            <div className="max-w-[85%] rounded-lg rounded-tl-none bg-bg px-3 py-2 text-sm text-text-muted">
              ¡Hola! Soy el asistente de Giuliano. Preguntame sobre su
              experiencia, skills o proyectos.
            </div>

            {/* Chips de sugerencias — solo antes del primer mensaje. */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    disabled={!turnstileToken || loading}
                    className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Turnos de la conversación. */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-accent px-3 py-2 text-sm text-white'
                    : 'max-w-[85%] rounded-lg rounded-tl-none bg-bg px-3 py-2 text-sm'
                }
              >
                {msg.role === 'model' ? (
                  // El texto del bot puede traer markdown → lo renderiza
                  // react-markdown. prose-sm chico para que entre en la
                  // burbuja.
                  <div className="space-y-2 [&_a]:text-accent [&_a]:underline [&_li]:ml-4 [&_li]:list-disc">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}

            {/* Indicador "escribiendo..." mientras esperamos al backend. */}
            {loading && (
              <div className="max-w-[85%] rounded-lg rounded-tl-none bg-bg px-3 py-2 text-sm text-text-muted">
                escribiendo...
              </div>
            )}

            {/* Mensaje de error. */}
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500"
              >
                {error}
              </div>
            )}

            {/* Ancla invisible: scrolleamos hasta acá en cada mensaje. */}
            <div ref={bottomRef} />
          </div>

          {/* Footer: Turnstile + input. */}
          <div className="border-t border-border p-3">
            {/* Widget de Turnstile en modo `interaction-only`: queda
                INVISIBLE y valida en segundo plano. El recuadro grande
                "Verify you are human" solo aparece si Cloudflare necesita
                un challenge real (caso raro). El token se genera igual y,
                mientras no exista, el envío queda deshabilitado. */}
            <Turnstile
              key={turnstileKey}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{
                theme: 'auto',
                size: 'flexible',
                appearance: 'interaction-only',
              }}
            />

            <form onSubmit={handleSubmit} className="flex gap-2">
              {/* Honeypot — input trampa, oculto fuera de pantalla. Un
                  humano nunca lo completa; un bot que llena todo, sí. */}
              <div
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              >
                <label htmlFor="chat-website">No completar</label>
                <input
                  id="chat-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu pregunta..."
                maxLength={1000}
                aria-label="Mensaje"
                className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {/* disabled mientras carga, sin token, o sin texto. */}
              <button
                type="submit"
                disabled={loading || !turnstileToken || !input.trim()}
                aria-label="Enviar"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
