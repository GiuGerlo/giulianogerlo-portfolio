import { useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
// react-hook-form maneja el estado del formulario; zodResolver conecta
// el schema de validación de zod con react-hook-form.
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
 *   La VALIDACIÓN ya es real — react-hook-form + zod chequean los
 *   campos y muestran errores por campo. Lo que todavía NO está es el
 *   ENVÍO: `onSubmit` solo loguea los datos (placeholder). Conectar el
 *   form a un servicio de email es una task posterior de esta Phase.
 *
 * Email obfuscation (anti-scraping):
 *   El email NO está en texto plano en el código. Se guarda codificado
 *   en base64 (`ENCODED_EMAIL`) y se decodifica recién cuando el usuario
 *   hace click en la card de email. Hasta entonces la card muestra
 *   "Click para ver email" y es un `<button>`; tras el click pasa a ser
 *   un `<a href="mailto:...">`. Ver src/lib/obfuscate-email.js.
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
});

export default function Contact() {
  // Estado del email: false = oculto ("Click para ver email"),
  // true = revelado (se muestra la dirección y la card es mailto).
  const [revealed, setRevealed] = useState(false);

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
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({ resolver: zodResolver(contactSchema) });

  // onSubmit — solo corre si la validación pasó. Por ahora es
  // placeholder: loguea los datos. El envío real a un servicio de
  // email se conecta en una task posterior de esta Phase.
  function onSubmit(data) {
    console.log('Formulario de contacto (placeholder, sin envío):', data);
    reset();
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

            {/* type="submit" pisa el type="button" default del primitive.
                disabled mientras envía evita doble submit. */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center"
            >
              Enviar mensaje
              <Send size={16} aria-hidden="true" />
            </Button>

            {/* Mensaje de éxito tras un submit válido. role="status"
                hace que el lector de pantalla lo anuncie. */}
            {isSubmitSuccessful && (
              <p role="status" className="mt-3 text-sm text-accent">
                ¡Mensaje recibido! (Por ahora es un placeholder — el
                envío real se conecta en la próxima task.)
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
