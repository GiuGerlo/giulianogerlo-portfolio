import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, CheckCircle2 } from 'lucide-react';

import { supabase } from '../../lib/supabase.js';
import { siteSettingsToDb } from '../../lib/site-settings-mapper.js';
import { useSiteSettings } from '../../hooks/useSiteSettings.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import DocumentUpload from '../../components/admin/DocumentUpload.jsx';

/**
 * Site — edita los datos únicos del sitio (tabla singleton `site_settings`):
 * Hero (nombre/tagline/ubicación), Footer (tagline), CV y redes. Solo UPDATE
 * (la fila id=1 siempre existe, la seedeó la migration 0005). Mismo patrón
 * que Profile.jsx.
 */

const schema = z.object({
  heroName: z.string().optional().default(''),
  heroTagline: z.string().optional().default(''),
  heroLocation: z.string().optional().default(''),
  footerTagline: z.string().optional().default(''),
  cvUrl: z.string().optional().default(''),
  socialGithub: z.string().optional().default(''),
  socialLinkedin: z.string().optional().default(''),
  socialEmail: z.string().optional().default(''),
  socialWhatsapp: z.string().optional().default(''),
  socialLocation: z.string().optional().default(''),
  chatbotContext: z.string().optional().default(''),
});

const EMPTY_DEFAULTS = {
  heroName: '',
  heroTagline: '',
  heroLocation: '',
  footerTagline: '',
  cvUrl: '',
  socialGithub: '',
  socialLinkedin: '',
  socialEmail: '',
  socialWhatsapp: '',
  socialLocation: '',
  chatbotContext: '',
};

export default function Site() {
  useDocumentTitle('Sitio — Admin');

  const { data: site, loading, error } = useSiteSettings();

  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);

  const { register, handleSubmit, reset, control } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!site) return;
    reset({
      heroName: site.heroName ?? '',
      heroTagline: site.heroTagline ?? '',
      heroLocation: site.heroLocation ?? '',
      footerTagline: site.footerTagline ?? '',
      cvUrl: site.cvUrl ?? '',
      socialGithub: site.socialGithub ?? '',
      socialLinkedin: site.socialLinkedin ?? '',
      socialEmail: site.socialEmail ?? '',
      socialWhatsapp: site.socialWhatsapp ?? '',
      socialLocation: site.socialLocation ?? '',
      chatbotContext: site.chatbotContext ?? '',
    });
  }, [site, reset]);

  async function onSubmit(values) {
    setStatus('saving');
    setServerError(null);

    const { error: err } = await supabase
      .from('site_settings')
      .update(siteSettingsToDb(values))
      .eq('id', 1);

    if (err) {
      console.error('[Site] UPDATE falló:', err);
      setServerError('No pude guardar los cambios. Probá de nuevo.');
      setStatus('idle');
      return;
    }

    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  }

  if (loading) {
    return (
      <article
        aria-busy="true"
        aria-label="Cargando ajustes del sitio"
        className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16"
      >
        <div className="mb-4 h-6 w-40 rounded bg-border/60" />
        <div className="mb-8 h-10 w-3/4 rounded bg-border/60" />
        <div className="h-64 rounded bg-border/40" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="mb-2 font-medium text-text-primary">No pude cargar los ajustes del sitio.</p>
          <p className="text-sm">Recargá la página.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        eyebrow="// sitio"
        title="Ajustes del sitio"
        subtitle="Hero, footer, CV y redes. Los cambios impactan al guardar, sin redeploy."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* ── Hero ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Hero
          </h2>
          <Input label="Nombre" placeholder="Giuliano Gerlo" {...register('heroName')} />
          <Input label="Tagline" placeholder="Full-Stack Developer · React · PHP · MySQL" {...register('heroTagline')} />
          <Input label="Ubicación" placeholder="Rosario, Santa Fe, Argentina" {...register('heroLocation')} />
        </section>

        {/* ── Footer ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Footer
          </h2>
          <Input label="Tagline del footer" {...register('footerTagline')} />
        </section>

        {/* ── CV ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Curriculum Vitae
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Si no subís ninguno, el sitio usa el CV por defecto de /public.
          </p>
          <Controller
            name="cvUrl"
            control={control}
            render={({ field }) => (
              <DocumentUpload
                value={field.value}
                onChange={field.onChange}
                slug="cv"
                label="Archivo del CV (PDF)"
              />
            )}
          />
        </section>

        {/* ── Redes ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Redes y contacto
          </h2>
          <Input label="GitHub (URL)" placeholder="https://github.com/usuario" {...register('socialGithub')} />
          <Input label="LinkedIn (URL)" placeholder="https://www.linkedin.com/in/usuario" {...register('socialLinkedin')} />
          <Input label="Email" placeholder="mail@ejemplo.com" {...register('socialEmail')} />
          <Input label="WhatsApp (internacional sin +)" placeholder="5493468536422" {...register('socialWhatsapp')} />
          <Input label="Ubicación (footer/contacto)" placeholder="Rosario, Santa Fe — Argentina" {...register('socialLocation')} />
        </section>

        {/* ── Contexto del chatbot ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Contexto del chatbot
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Datos extra que el asistente IA puede usar para responder (edad,
            disponibilidad, idiomas, modalidad…). No se muestra en ninguna
            sección pública, pero el chatbot lo puede decir a cualquier
            visitante: no pongas nada privado.
          </p>
          <label
            htmlFor="chatbotContext"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            Contexto (texto libre)
          </label>
          {/* textarea nativo: el bot consume texto plano, no necesita el editor
              WYSIWYG (TipTap) que usa el About. Mismas clases que <Input>. */}
          <textarea
            id="chatbotContext"
            rows={5}
            placeholder="Edad: 22 años. Disponibilidad: abierto a propuestas. Modalidad: remoto o presencial en Rosario…"
            {...register('chatbotContext')}
            className="w-full resize-y rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none"
          />
        </section>

        {serverError && (
          <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500">
            {serverError}
          </div>
        )}

        {status === 'saved' && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <CheckCircle2 size={16} aria-hidden="true" />
            Cambios guardados.
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={status === 'saving'}>
            <Save size={16} aria-hidden="true" />
            {status === 'saving' ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </article>
  );
}
