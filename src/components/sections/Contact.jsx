import { useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
// react-hook-form maneja el estado del formulario; zodResolver conecta
// el schema de validación de zod con react-hook-form.
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Turnstile — widget anti-bot de Cloudflare. Genera un token cuando
// confirma que el visitante es humano; ese token lo verifica el backend.
import { Turnstile } from '@marsidev/react-turnstile';

import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Input from '../ui/Input.jsx';
import Textarea from '../ui/Textarea.jsx';
import Button from '../ui/Button.jsx';
import { decodeEmail } from '../../lib/obfuscate-email.js';
import { socials } from '../../data/socials.js';

/**
 * Contact — sección 07 del portfolio. Dos columnas: formulario de
 * contacto a la izquierda, links de contacto directo a la derecha.
 *
 * Estado del formulario:
 *   Validación real (react-hook-form + zod) y envío real: `onSubmit`
 *   hace un POST a /api/contact (serverless function con Resend). El
 *   estado `status` ('idle' | 'success' | 'error') controla el mensaje
 *   de resultado debajo del botón.
 *
 * Email obfuscation (anti-scraping):
 *   El email NO está en texto plano en el código. Se guarda codificado
 *   en base64 (`ENCODED_EMAIL`) y se decodifica recién cuando el usuario
 *   hace click en la card de email. Hasta entonces la card muestra
 *   "Click para ver email" y es un `<button>`; tras el click pasa a ser
 *   un `<a href="mailto:...">`. Ver src/lib/obfuscate-email.js.
 *
 * Honeypot anti-bots (campo `website`):
 *   Hay un input extra escondido fuera de la pantalla. Un humano nunca
 *   lo ve ni lo puede tabular, así que lo deja vacío. Los bots que
 *   completan automáticamente TODOS los campos del form lo llenan — y
 *   eso los delata. El backend (Task 7.4) descarta cualquier envío que
 *   traiga `website` con contenido. El nombre "website" es a propósito
 *   genérico: un bot ve un campo así y lo autocompleta sin sospechar.
 */

/**
 * SpriteIcon — helper para renderizar un símbolo del sprite SVG global.
 * Mismo patrón que en Navbar/Footer (duplicado a propósito; si se repite
 * una vez más, conviene extraerlo a src/components/ui/Icon.jsx).
 */
function SpriteIcon({ id, size = 18 }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

/**
 * ContactRow — contenido interno compartido de cada card de contacto:
 * cuadrado verde con ícono + bloque de label/valor. El CONTENEDOR
 * (un `<a>` o un `<button>`) lo decide el caller; esto es solo el relleno.
 */
function ContactRow({ icon, label, value }) {
  return (
    <>
      {/* Cuadrado 40x40 con bg accent-bg. text-accent hace que tanto los
          íconos lucide (currentColor) como los del sprite hereden verde. */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent-bg text-accent">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </>
  );
}

// Email codificado en base64 — el email plano (ggiuliano526@gmail.com)
// NUNCA aparece en el código fuente ni en el HTML servido.
const ENCODED_EMAIL = 'Z2dpdWxpYW5vNTI2QGdtYWlsLmNvbQ==';

// SITE KEY de Cloudflare Turnstile. Es PÚBLICA (va en el frontend), por
// eso lleva prefijo VITE_ — Vite la inyecta en el bundle desde el .env.
// La SECRET KEY (verificación) vive solo en el backend, nunca acá.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// Clases compartidas de cada card de contacto. Se aplican igual sea
// `<a>` o `<button>`. text-left porque <button> centra el texto por
// default y queremos alineado a la izquierda como las cards <a>.
const cardClass =
  'flex w-full items-center gap-4 rounded-lg border border-border bg-bg-elevated p-4 text-left transition-colors hover:border-accent';

// Schema de validación del formulario (zod). Cada campo define sus
// reglas y el mensaje que se muestra si no se cumplen. zod corre estas
// reglas en cada submit; react-hook-form pinta los errores por campo.
const contactSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Ingresá tu nombre (mínimo 2 caracteres).'),
  // z.email valida formato Y exige que no esté vacío — un string vacío
  // también falla esta regla con el mismo mensaje.
  email: z.email('Ingresá un email válido.'),
  mensaje: z
    .string()
    .trim()
    .min(10, 'Contame un poco más (mínimo 10 caracteres).'),
  // Honeypot — campo trampa. optional() porque un humano lo deja
  // vacío (no lo ve). Lo incluimos en el schema para que su valor
  // NO sea descartado por zod y llegue al backend, que es quien
  // decide rechazar el envío si viene con contenido.
  website: z.string().optional(),
});

export default function Contact() {
  // Estado del email: false = oculto ("Click para ver email"),
  // true = revelado (se muestra la dirección y la card es mailto).
  const [revealed, setRevealed] = useState(false);

  // Token de Turnstile. null = el visitante todavía no pasó el chequeo
  // anti-bot → el botón Enviar queda deshabilitado. Cuando el widget
  // confirma que es humano (onSuccess), guardamos el token acá.
  const [turnstileToken, setTurnstileToken] = useState(null);

  // "Llave" del widget de Turnstile. En React, cambiar el `key` de un
  // componente lo desmonta y lo vuelve a montar desde cero. Lo usamos
  // para resetear el widget tras enviar: un token sirve una sola vez,
  // así que incrementamos esta llave para forzar un widget nuevo.
  const [turnstileKey, setTurnstileKey] = useState(0);

  // Estado del resultado del envío al backend:
  //   'idle'    → todavía no se envió (o se está enviando).
  //   'success' → el backend confirmó el envío del email.
  //   'error'   → algo falló; el detalle queda en `errorMsg`.
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // react-hook-form:
  //  - register  → conecta cada input al form (name, onChange, ref...).
  //  - handleSubmit → valida con el schema y, si pasa, llama onSubmit.
  //  - errors    → mensajes de error por campo (los pinta cada Input).
  //  - isSubmitting / isSubmitSuccessful → estados para el botón y el
  //    mensaje de éxito.
  //  - reset     → limpia el form después de enviar.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema) });

  // onSubmit — solo corre si la validación de zod pasó. Es `async`
  // porque hace un fetch al backend; react-hook-form mantiene
  // `isSubmitting` en true mientras la promesa esté pendiente, así el
  // botón queda deshabilitado y muestra "Enviando...".
  async function onSubmit(data) {
    setStatus('idle');
    try {
      // POST al serverless function api/contact.js. El body va como
      // JSON: los 3 campos + el honeypot + el token de Turnstile (que
      // NO está en `data` porque no es un input registrado del form).
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          mensaje: data.mensaje,
          website: data.website ?? '',
          turnstileToken,
        }),
      });

      // res.ok es true para status 2xx. Si el backend respondió un
      // error, leemos el mensaje que mandó y lo tiramos como excepción.
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'No se pudo enviar el mensaje.');
      }

      setStatus('success');
      reset();
      // El token de Turnstile es de un solo uso: lo limpiamos y
      // cambiamos la llave para remontar el widget (genera uno nuevo).
      setTurnstileToken(null);
      setTurnstileKey((k) => k + 1);
    } catch (err) {
      // Cae acá tanto por error del backend como por fallo de red.
      setStatus('error');
      setErrorMsg(err.message || 'Error de conexión. Probá de nuevo.');
    }
  }

  return (
    <section
      id="contact"
      className="px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="// 07 — contact"
          title="Hablemos"
          subtitle="¿Tenés un proyecto en mente o querés contactarme por una posición? Escribime."
        />

        {/* Grid 2 columnas en md+; en mobile se apila (1 col).
            gap-14 (56px) matchea mockup. items-start para que las dos
            columnas arranquen alineadas arriba aunque tengan distinta
            altura. <Reveal> lo hace aparecer con fade-up al scrollear. */}
        <Reveal>
        <div className="grid items-start gap-14 md:grid-cols-2">
          {/* ── Columna 1: formulario ── */}
          {/* handleSubmit(onSubmit) valida primero; onSubmit corre solo
              si pasa. noValidate desactiva la validación nativa del
              browser para que mande zod (mensajes en español + estilo
              propio). */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="rounded-xl border border-border bg-bg-elevated p-8"
          >
            {/* {...register(campo)} aporta name/onChange/onBlur/ref al
                input. error pinta el borde rojo + el mensaje debajo. */}
            <Input
              label="Nombre"
              type="text"
              placeholder="Tu nombre"
              error={errors.nombre?.message}
              {...register('nombre')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Textarea
              label="Mensaje"
              placeholder="Contame en qué estás trabajando..."
              error={errors.mensaje?.message}
              {...register('mensaje')}
            />

            {/* Honeypot — input trampa para bots. NO usa el primitive
                <Input> a propósito: no queremos label visible. Se saca
                de la pantalla con position:absolute + left:-9999px (no
                con display:none ni hidden, porque algunos bots ignoran
                campos display:none). tabIndex={-1} lo saltea con Tab,
                autoComplete="off" evita que el browser lo autocomplete,
                aria-hidden lo oculta del lector de pantalla. Un humano
                nunca interactúa con esto; un bot que llena todo, sí. */}
            <div
              style={{
                position: 'absolute',
                left: '-9999px',
                opacity: 0,
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <label htmlFor="website">No completar este campo</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register('website')}
              />
            </div>

            {/* Widget de Turnstile. onSuccess entrega el token cuando
                Cloudflare confirma que es humano; onExpire/onError lo
                invalidan (el token caduca o falla la verificación).
                Mientras turnstileToken sea null, el botón Enviar queda
                deshabilitado. mb-5 lo separa del botón de abajo;
                flex+justify-center centra la cajita (ancho fijo ~300px)
                dentro de la columna del form. */}
            <div className="mb-5 flex justify-center">
              <Turnstile
                key={turnstileKey}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: 'auto' }}
              />
            </div>

            {/* type="submit" pisa el type="button" default del primitive.
                disabled si está enviando (evita doble submit) o si todavía
                no hay token de Turnstile (el visitante no pasó el anti-bot). */}
            <Button
              type="submit"
              disabled={isSubmitting || !turnstileToken}
              className="w-full justify-center"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
              <Send size={16} aria-hidden="true" />
            </Button>

            {/* Mensaje de éxito tras un envío confirmado por el backend.
                role="status" hace que el lector de pantalla lo anuncie. */}
            {status === 'success' && (
              <p role="status" className="mt-3 text-sm text-accent">
                ¡Mensaje enviado! Te voy a responder pronto.
              </p>
            )}

            {/* Mensaje de error si el envío falló. role="alert" hace que
                el lector de pantalla lo anuncie con prioridad. */}
            {status === 'error' && (
              <p role="alert" className="mt-3 text-sm text-red-500">
                {errorMsg}
              </p>
            )}
          </form>

          {/* ── Columna 2: links de contacto directo ── */}
          <div className="flex flex-col gap-3">
            {/* Email — card especial con obfuscation. Sin revelar es un
                <button> que dispara setRevealed; revelado es un <a mailto>. */}
            {revealed ? (
              <a
                href={`mailto:${decodeEmail(ENCODED_EMAIL)}`}
                className={cardClass}
              >
                <ContactRow
                  icon={<Mail size={18} aria-hidden="true" />}
                  label="Email"
                  value={decodeEmail(ENCODED_EMAIL)}
                />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className={cardClass}
              >
                <ContactRow
                  icon={<Mail size={18} aria-hidden="true" />}
                  label="Email"
                  value="Click para ver email"
                />
              </button>
            )}

            {/* WhatsApp — wa.me abre el chat directo. socials.whatsapp ya
                está en formato internacional sin "+". El número NO se
                muestra como texto (anti-scraping + preferencia del
                dueño): la card solo dice "Enviar mensaje" y el número
                vive únicamente dentro del href. MessageCircle de lucide:
                ícono genérico de mensajería (no trae el logo de marca). */}
            <a
              href={`https://wa.me/${socials.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cardClass}
            >
              <ContactRow
                icon={<MessageCircle size={18} aria-hidden="true" />}
                label="WhatsApp"
                value="Enviar mensaje"
              />
            </a>

            {/* LinkedIn — ícono del sprite (lucide v1 sacó brand icons). */}
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={cardClass}
            >
              <ContactRow
                icon={<SpriteIcon id="linkedin-icon" />}
                label="LinkedIn"
                value="/in/giuliano-gerlo"
              />
            </a>

            {/* GitHub — ícono del sprite. */}
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className={cardClass}
            >
              <ContactRow
                icon={<SpriteIcon id="github-icon" />}
                label="GitHub"
                value="@GiuGerlo"
              />
            </a>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
