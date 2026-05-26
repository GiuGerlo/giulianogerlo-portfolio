// useReducer para manejar los 4 estados del form (idle/sending/sent/error)
// con un solo objeto en vez de 4 useState separados — mismo patrón que
// usamos en Contact.jsx (Phase 11).
import { useReducer } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle2 } from 'lucide-react';

import { supabase } from '../../lib/supabase.js';
import { ADMIN_EMAIL } from '../../lib/admin-config.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';

/**
 * Login — página /admin/login. Form de magic link para el admin.
 *
 * Flujo:
 *  1. Usuario ingresa email.
 *  2. Validación zod: debe ser email válido Y debe ser ADMIN_EMAIL.
 *     Por qué chequeamos el email en client: feedback instantáneo si
 *     alguien se equivocó. La seguridad real está server-side (Supabase
 *     rechaza con shouldCreateUser:false los emails no registrados).
 *  3. Submit llama supabase.auth.signInWithOtp con redirect a
 *     /admin/auth/callback.
 *  4. Supabase manda email; mostramos pantalla de "revisá tu mail".
 *  5. Usuario clickea el link → cae en AuthCallback → exchange code →
 *     /admin (Dashboard).
 *
 * Sobre shouldCreateUser: false:
 *  - El default es true: cualquier email no registrado se autocrea.
 *    Eso es lo que queremos EVITAR en un admin con allowlist.
 *  - Con false, solo emails ya invitados (vos hiciste Add user a
 *    ggiuliano526@gmail.com en Auth dashboard) reciben magic link.
 *    El resto: Supabase responde 400 (intencional silencioso — no
 *    confirma ni niega existencia del email a terceros).
 */

// Schema zod: email válido + email exacto al admin allowlisteado.
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Email inválido')
    .refine(
      (val) => val === ADMIN_EMAIL,
      'Este email no tiene acceso al panel.',
    ),
});

// Reducer del estado del form: una sola "máquina" en vez de 4 useState.
//  - idle: estado inicial.
//  - sending: usuario clickeó submit, esperando respuesta de Supabase.
//  - sent: magic link enviado; pantalla "revisá tu mail".
//  - error: algo falló (red, Supabase, etc).
function statusReducer(_state, action) {
  switch (action.type) {
    case 'SUBMIT':
      return { status: 'sending', errorMsg: null };
    case 'SUCCESS':
      return { status: 'sent', errorMsg: null };
    case 'ERROR':
      return { status: 'error', errorMsg: action.error };
    case 'RESET':
      return { status: 'idle', errorMsg: null };
    default:
      return { status: 'idle', errorMsg: null };
  }
}

const INITIAL_STATUS = { status: 'idle', errorMsg: null };

export default function Login() {
  useDocumentTitle('Acceso admin — Giuliano Gerlo');

  const [{ status, errorMsg }, dispatch] = useReducer(
    statusReducer,
    INITIAL_STATUS,
  );

  // react-hook-form + zodResolver: validación declarativa, sin reglas
  // imperativas dentro del onSubmit.
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit({ email }) {
    dispatch({ type: 'SUBMIT' });

    // emailRedirectTo: a dónde manda Supabase al usuario cuando clickea
    // el link del mail. Tiene que estar en la allowlist de Redirect URLs
    // del dashboard de Auth, sino Supabase rechaza el flujo.
    const redirectTo = `${window.location.origin}/admin/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        // No autocrear usuarios: solo emails ya invitados desde el dashboard.
        shouldCreateUser: false,
      },
    });

    if (error) {
      // Mensaje genérico para no filtrar info: "no pude enviar el link,
      // probá de nuevo". El detalle real va a la consola para debug.
      console.error('[Login] Error al pedir magic link:', error);
      dispatch({
        type: 'ERROR',
        error: 'No pude enviar el link. Intentá de nuevo en un momento.',
      });
      return;
    }

    dispatch({ type: 'SUCCESS' });
  }

  // ── Estado "sent": confirmación visual, no muestra el form de nuevo. ──
  if (status === 'sent') {
    return (
      <article className="mx-auto max-w-md px-4 py-16 md:px-8">
        <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center">
          <CheckCircle2
            size={48}
            aria-hidden="true"
            className="mx-auto mb-4 text-accent"
          />
          <h1 className="mb-2 text-2xl font-semibold">Revisá tu mail</h1>
          <p className="mb-1 text-sm text-text-muted">
            Te mandé un link a <strong>{getValues('email')}</strong>.
          </p>
          <p className="text-sm text-text-muted">
            Clickeá el link para entrar al panel. Si no llega en 1-2 min,
            revisá spam.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="mt-6 font-mono text-xs text-accent hover:underline"
          >
            Usar otro email
          </button>
        </div>
      </article>
    );
  }

  // ── Estado idle/sending/error: form de login. ──
  return (
    <article className="mx-auto max-w-md px-4 py-16 md:px-8">
      <SectionHeading
        eyebrow="// admin"
        title="Acceso al panel"
        subtitle="Te mando un link mágico al email. Click y entrás."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        // noValidate desactiva la validación HTML5 del browser para que
        // los mensajes vengan TODOS de zod (consistencia visual).
        noValidate
        className="rounded-xl border border-border bg-bg-elevated p-6"
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="vos@ejemplo.com"
          // register conecta el input al estado de react-hook-form.
          {...register('email')}
          // Error del schema zod, si existe.
          error={errors.email?.message}
          disabled={status === 'sending'}
        />

        {/* Error de red / Supabase. Distinto a errores de validación
            (esos viven debajo del input via Input.error). */}
        {status === 'error' && errorMsg && (
          <p
            role="alert"
            className="mb-4 text-sm text-red-500"
          >
            {errorMsg}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={status === 'sending'}
          className="w-full justify-center"
        >
          <Mail size={16} aria-hidden="true" />
          {status === 'sending' ? 'Enviando…' : 'Mandar link mágico'}
        </Button>
      </form>
    </article>
  );
}
