// React hooks:
//  - useEffect → popula el form cuando llega la fila del fetch.
//  - useState  → status del submit (idle/saving/saved) + error de servidor.
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, CheckCircle2 } from 'lucide-react';

import { supabase } from '../../lib/supabase.js';
import { profileToDb } from '../../lib/profile-mapper.js';
import { useProfile } from '../../hooks/useProfile.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import ImageUpload from '../../components/admin/ImageUpload.jsx';
import RichTextEditor from '../../components/admin/RichTextEditor.jsx';

/**
 * Profile — edita la sección "Sobre mí" (tabla `profile`, fila única id=1).
 *
 * No hay modo crear/borrar (la fila siempre existe, la seedeó la migration
 * 0004): el form solo HACE UPDATE. Reusa `useProfile` para traer la fila
 * inicial — la misma data que ve el sitio público (no hay drafts).
 *
 * Todos los campos son opcionales: un párrafo o chip vacío se guarda vacío
 * y el About lo oculta (degradación elegante en About.jsx).
 *
 * La foto la maneja `ImageUpload` (single, slug 'about'): al reemplazarla
 * ya borra la anterior del bucket (removeImage interno). El bucket es el
 * mismo `project-images` de los proyectos — cero Storage nuevo.
 */

// Schema: todo string opcional con default ''. No validamos contenido —
// markdown libre en los párrafos, texto libre en los chips.
const schema = z.object({
  aboutImage: z.string().optional().default(''),
  aboutP1: z.string().optional().default(''),
  aboutP2: z.string().optional().default(''),
  chipAvailable: z.string().optional().default(''),
  chipLocation: z.string().optional().default(''),
  chipLanguage: z.string().optional().default(''),
  chipEducation: z.string().optional().default(''),
});

const EMPTY_DEFAULTS = {
  aboutImage: '',
  aboutP1: '',
  aboutP2: '',
  chipAvailable: '',
  chipLocation: '',
  chipLanguage: '',
  chipEducation: '',
};

export default function Profile() {
  useDocumentTitle('Perfil — Admin');

  // Fila inicial. La fila siempre existe → data llega salvo error de red.
  const { data: profile, loading, error } = useProfile();

  // status: 'idle' | 'saving' | 'saved'. serverError: mensaje si el UPDATE falla.
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_DEFAULTS,
  });

  // Cuando llega la fila, populamos el form. reset() reemplaza todos los
  // valores y limpia el dirty state.
  useEffect(() => {
    if (!profile) return;
    reset({
      aboutImage: profile.aboutImage ?? '',
      aboutP1: profile.aboutP1 ?? '',
      aboutP2: profile.aboutP2 ?? '',
      chipAvailable: profile.chipAvailable ?? '',
      chipLocation: profile.chipLocation ?? '',
      chipLanguage: profile.chipLanguage ?? '',
      chipEducation: profile.chipEducation ?? '',
    });
  }, [profile, reset]);

  // ── Submit: UPDATE de la fila id=1 ────────────────────────────────────
  async function onSubmit(values) {
    setStatus('saving');
    setServerError(null);

    const { error: err } = await supabase
      .from('profile')
      .update(profileToDb(values))
      .eq('id', 1);

    if (err) {
      console.error('[Profile] UPDATE falló:', err);
      setServerError('No pude guardar los cambios. Probá de nuevo.');
      setStatus('idle');
      return;
    }

    setStatus('saved');
    // El indicador "Guardado" desaparece a los 2s.
    setTimeout(() => setStatus('idle'), 2000);
  }

  // ── Renders por estado ────────────────────────────────────────────────
  if (loading) {
    return (
      <article
        aria-busy="true"
        aria-label="Cargando perfil"
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
          <p className="mb-2 font-medium text-text-primary">No pude cargar el perfil.</p>
          <p className="text-sm">Recargá la página.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        eyebrow="// perfil"
        title="Sobre mí"
        subtitle="Editás la sección About del sitio. Los cambios impactan al guardar, sin redeploy."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* ── Bloque: foto ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Foto
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Si no subís ninguna, el sitio usa la foto por defecto de /public.
          </p>

          {/* ImageUpload single. Controller traduce value+onChange porque no
              es un <input> nativo. slug 'about' → nombra el archivo en el
              bucket como about-<timestamp>-<random>.ext. */}
          <Controller
            name="aboutImage"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                slug="about"
                label="Imagen del perfil"
                // Preview 1:1 = igual al aspect-square del About público.
                previewAspect="square"
                // La foto se muestra a ~280px → 800px de ancho cubre retina.
                uploadOpts={{ maxWidth: 800 }}
              />
            )}
          />
        </section>

        {/* ── Bloque: bio ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Bio
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Usá la barra de formato para negrita, itálica y links.
          </p>

          {/* RichTextEditor no es un <input> nativo → Controller lo conecta
              al form con value+onChange (en markdown). */}
          <Controller
            name="aboutP1"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="Párrafo 1"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="aboutP2"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="Párrafo 2"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </section>

        {/* ── Bloque: chips ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Chips de estado
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Cada chip se muestra solo si tiene texto. Dejá vacío para ocultarlo.
          </p>

          <Input
            label="Disponibilidad (punto verde)"
            placeholder="Disponible para proyectos"
            {...register('chipAvailable')}
          />
          <Input
            label="Ubicación"
            placeholder="Rosario, AR"
            {...register('chipLocation')}
          />
          <Input
            label="Idioma"
            placeholder="Español"
            {...register('chipLanguage')}
          />
          <Input
            label="Educación"
            placeholder="Cursando React Cert · DigitalHouse"
            {...register('chipEducation')}
          />
        </section>

        {/* ── Server error ── */}
        {serverError && (
          <div
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500"
          >
            {serverError}
          </div>
        )}

        {/* ── Indicador "Guardado" ── */}
        {status === 'saved' && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <CheckCircle2 size={16} aria-hidden="true" />
            Cambios guardados.
          </div>
        )}

        {/* ── Footer: guardar ── */}
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
