// React hooks:
//  - useEffect → resetear el form cuando llega data del fetch en modo edit.
//  - useState  → estados locales: slug touched flag + status del submit.
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Trash2, CheckCircle2 } from 'lucide-react';

import { supabase } from '../../lib/supabase.js';
import { projectToDb } from '../../lib/projects-mapper.js';
import { slugify } from '../../lib/slugify.js';
import { useAdminProject } from '../../hooks/useAdminProject.js';
import { useProjectSuggestions } from '../../hooks/useProjectSuggestions.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import ChipsEditor from '../../components/admin/ChipsEditor.jsx';
import ParagraphsEditor from '../../components/admin/ParagraphsEditor.jsx';
import MonthPicker from '../../components/admin/MonthPicker.jsx';
import ProjectPreview from '../../components/admin/ProjectPreview.jsx';
import ImageUpload from '../../components/admin/ImageUpload.jsx';

/**
 * ProjectForm — crear o editar un proyecto.
 *
 * Rutas:
 *  - /admin/projects/new      → modo crear (sin :id en la URL).
 *  - /admin/projects/:id      → modo editar (carga el proyecto por id).
 *
 * Modo se detecta por `useParams().id`. Si existe → edit; sino → create.
 *
 * Flujo edit:
 *  1. Fetch via useAdminProject(id). Mientras carga: skeleton.
 *  2. Si data === null + loading false → "no existe", link a volver.
 *  3. Form populado con la data inicial via form.reset() en un effect.
 *  4. Submit → UPDATE. Borrar → DELETE con confirm.
 *
 * Flujo create:
 *  1. Form arranca con defaults vacíos.
 *  2. Query MAX(order_index) para que el nuevo proyecto vaya al final.
 *  3. Submit → INSERT. Después del INSERT, redirige a /admin/projects/:id
 *     (modo edit del recién creado) para permitir seguir editando o
 *     subir imágenes en Task 12.9.
 *
 * Auto-slug:
 *  - Mientras el usuario NO haya tocado el campo slug, slug se rellena
 *    automáticamente con slugify(title). Una vez que el usuario edita
 *    el slug a mano, dejamos de auto-rellenar (tracked en `slugTouched`).
 *  - En modo edit, slug NUNCA se auto-rellena (el slug existente es
 *    el contrato público de URLs y no debería cambiar solo).
 */

// Schema de validación.
// Campos requeridos: los que la DB tiene como NOT NULL en migration 0001.
// Campos opcionales (image, liveUrl, repoUrl, dateEnd): aceptan string vacío
// y se convierten a null antes de mandar a DB (ver projectToDb).
const schema = z.object({
  slug: z
    .string()
    .min(1, 'Slug requerido')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  title: z.string().min(1, 'Título requerido'),
  category: z.string().min(1, 'Categoría requerida'),
  role: z.string().min(1, 'Rol requerido'),
  myRole: z.string().min(1, 'Mi rol requerido'),
  summary: z.string().min(1, 'Resumen requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  stack: z.array(z.string().min(1)).min(1, 'Sumá al menos una tecnología'),
  image: z.string().optional().default(''),
  gallery: z.array(z.string()).default([]),
  liveUrl: z.string().optional().default(''),
  repoUrl: z.string().optional().default(''),
  dateStart: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM (ej. 2025-08)'),
  dateEnd: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM o vacío')
    .or(z.literal(''))
    .optional()
    .default(''),
  challenges: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

// Defaults para modo "crear nuevo".
const EMPTY_DEFAULTS = {
  slug: '',
  title: '',
  category: '',
  role: 'Full-Stack Developer',
  myRole: 'Full-Stack Developer',
  summary: '',
  description: '',
  stack: [],
  image: '',
  gallery: [],
  liveUrl: '',
  repoUrl: '',
  dateStart: '',
  dateEnd: '',
  challenges: [],
  published: false,
};

export default function ProjectForm() {
  // id de la URL. undefined en modo crear nuevo.
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  // Fetch del proyecto si estamos editando.
  const { data: project, loading, error } = useAdminProject(id);

  // Sugerencias para autocompletar Categoría y Stack desde proyectos
  // existentes. Fetch liviano (solo 2 columnas). No bloquea el form: si
  // todavía no llegó, los datalists están vacíos y listo.
  const { categories: categorySuggestions, techs: techSuggestions } =
    useProjectSuggestions();

  useDocumentTitle(
    isEdit
      ? `Editar ${project?.title ?? '...'} — Admin`
      : 'Nuevo proyecto — Admin',
  );

  // Estados locales:
  //  - slugTouched: marcamos true cuando el usuario edita el slug a mano,
  //    para dejar de auto-rellenar. En edit mode arranca true.
  //  - status: 'idle' | 'saving' | 'saved' | 'deleting' — para feedback.
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_DEFAULTS,
  });

  // useWatch en vez de watch(): la primera es la API que react-hook-form
  // recomienda para suscribirse a campos desde efectos / preview
  // (memoizable, estable entre renders). watch() pinta warning de hooks.
  const watchedTitle = useWatch({ control, name: 'title' });

  // Slug actual — lo pasamos a ImageUpload para nombrar los archivos que
  // suben al bucket (`${slug}-${timestamp}-${random}.ext`).
  const watchedSlug = useWatch({ control, name: 'slug' });

  // Snapshot completo del form para el preview en tiempo real.
  // Sin `name`, useWatch suscribe al form entero — re-renderea cuando
  // CUALQUIER campo cambia. Es lo que queremos para el preview.
  const watchedAll = useWatch({ control });

  // Cuando llega la data en modo edit, populamos el form.
  // `reset(data)` reemplaza todos los valores y limpia el dirty state.
  useEffect(() => {
    if (!project) return;
    reset({
      slug: project.slug ?? '',
      title: project.title ?? '',
      category: project.category ?? '',
      role: project.role ?? '',
      myRole: project.myRole ?? '',
      summary: project.summary ?? '',
      description: project.description ?? '',
      stack: project.stack ?? [],
      image: project.image ?? '',
      gallery: project.gallery ?? [],
      liveUrl: project.liveUrl ?? '',
      repoUrl: project.repoUrl ?? '',
      dateStart: project.dateStart ?? '',
      dateEnd: project.dateEnd ?? '',
      challenges: project.challenges ?? [],
      published: project.published ?? false,
    });
  }, [project, reset]);

  // Auto-slug en modo crear: cuando cambia title, si slug no fue tocado
  // a mano, lo regeneramos.
  useEffect(() => {
    if (isEdit || slugTouched) return;
    setValue('slug', slugify(watchedTitle), { shouldValidate: false });
  }, [watchedTitle, slugTouched, isEdit, setValue]);

  // ── Submit ───────────────────────────────────────────────────────────
  // Helper que arma el payload base con normalización de strings vacíos
  // a null. Recibe `orderIndex` por param para que la función no
  // referencie `project` (evita que React Compiler precompute lecturas
  // de project.* cuando project puede ser null en create mode).
  function buildPayload(values, orderIndex) {
    return projectToDb({
      ...values,
      image: values.image || null,
      liveUrl: values.liveUrl || null,
      repoUrl: values.repoUrl || null,
      dateEnd: values.dateEnd || null,
      orderIndex,
    });
  }

  async function onSubmit(values) {
    setStatus('saving');
    setServerError(null);

    if (isEdit) {
      // UPDATE por id. Mantiene order_index existente (lo borramos del
      // payload para no pisarlo). `project` está garantizado no-null
      // acá: los early returns de arriba (loading/error/!project) ya
      // descartaron los otros casos.
      const payload = buildPayload(values, project.orderIndex);
      delete payload.order_index;

      const { error: err } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', id);

      if (err) {
        console.error('[ProjectForm] UPDATE falló:', err);
        setServerError(
          err.code === '23505'
            ? 'Ya existe un proyecto con ese slug.'
            : 'No pude guardar los cambios. Probá de nuevo.',
        );
        setStatus('idle');
        return;
      }

      setStatus('saved');
      // El indicador "Guardado" desaparece a los 2s.
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    // CREATE: order_index = max + 1 para que aparezca al final.
    const { data: maxRow } = await supabase
      .from('projects')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
    const newOrderIndex = (maxRow?.order_index ?? -1) + 1;

    const payload = buildPayload(values, newOrderIndex);

    const { data: inserted, error: err } = await supabase
      .from('projects')
      .insert(payload)
      .select('id')
      .single();

    if (err) {
      console.error('[ProjectForm] INSERT falló:', err);
      setServerError(
        err.code === '23505'
          ? 'Ya existe un proyecto con ese slug.'
          : 'No pude crear el proyecto. Probá de nuevo.',
      );
      setStatus('idle');
      return;
    }

    // Después del INSERT, mostramos "Guardado" Y navegamos a
    // /admin/projects/:nuevoId (modo edit). El componente NO se desmonta
    // entre rutas (es el mismo ProjectForm en ambas), así que tenemos
    // que resetear el status manualmente. Sin esto, "Guardando…" se
    // queda pegado en el botón después de navegar.
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
    navigate(`/admin/projects/${inserted.id}`, { replace: true });
  }

  // ── Delete ───────────────────────────────────────────────────────────
  async function handleDelete() {
    // Guard explícito: handleDelete solo se invoca desde un botón que
    // solo se renderiza si isEdit, pero React Compiler puede precomputar
    // referencias a `project.X` y romper en create mode. Salida temprana.
    if (!project) return;

    // Confirm nativo: simple y suficiente para v1. Si después hay tiempo,
    // se reemplaza por un modal custom.
    const ok = window.confirm(
      `¿Borrar "${project.title}"? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;

    setStatus('deleting');
    const { error: err } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (err) {
      console.error('[ProjectForm] DELETE falló:', err);
      setServerError('No pude borrar el proyecto. Probá de nuevo.');
      setStatus('idle');
      return;
    }

    navigate('/admin', { replace: true });
  }

  // ── Renders por estado ───────────────────────────────────────────────
  if (isEdit && loading) {
    return (
      <article
        aria-busy="true"
        aria-label="Cargando proyecto"
        className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16"
      >
        <div className="mb-4 h-6 w-40 rounded bg-border/60" />
        <div className="mb-8 h-10 w-3/4 rounded bg-border/60" />
        <div className="h-64 rounded bg-border/40" />
      </article>
    );
  }

  if (isEdit && !loading && error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <BackLink />
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="mb-2 font-medium text-text-primary">No pude cargar el proyecto.</p>
          <p className="text-sm">Recargá la página.</p>
        </div>
      </article>
    );
  }

  if (isEdit && !loading && !project) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <BackLink />
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="mb-2 font-medium text-text-primary">Ese proyecto no existe.</p>
          <Link to="/admin" className="font-mono text-sm text-accent hover:underline">
            Volver al panel →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
      <BackLink />

      {/* Guard explícito `isEdit && project`: React Compiler a veces
          precomputa ambas ramas de un ternary y rompe si project es
          null (caso create), aunque isEdit ya descarte ese caso. */}
      <SectionHeading
        eyebrow={isEdit ? '// editar' : '// crear nuevo'}
        title={isEdit && project ? project.title : 'Nuevo proyecto'}
        subtitle={
          isEdit
            ? 'Editás un proyecto existente. Los cambios impactan en el sitio público al guardar.'
            : 'Completá los campos. Slug se autogenera del título; podés editarlo a mano.'
        }
      />

      {/* Grid 2 columnas en desktop: form a la izquierda, preview sticky
          a la derecha. En mobile (< lg) las columnas colapsan a 1 sola
          y el preview se renderiza ARRIBA del form (preview-first en
          mobile sería raro; lo escondemos en mobile y mostramos un
          link "ver preview" sería ideal pero para v1 mostramos al final). */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        {/* ── Bloque: datos básicos ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Datos básicos
          </h2>

          <Input
            label="Título"
            placeholder="Personal Gym Tracker"
            {...register('title')}
            error={errors.title?.message}
          />

          <Input
            label="Slug (URL)"
            placeholder="personal-gym-tracker"
            {...register('slug', {
              // Cuando el usuario edita slug a mano, frenamos el auto.
              onChange: () => setSlugTouched(true),
            })}
            error={errors.slug?.message}
          />

          <Input
            label="Categoría"
            placeholder="Full-Stack · Fitness"
            // list = id del datalist que aparece más abajo.
            list="categories-suggestions"
            {...register('category')}
            error={errors.category?.message}
          />
          {/* Datalist con categorías ya usadas en otros proyectos. El
              browser muestra las que matchean lo tipeado. */}
          {categorySuggestions.length > 0 && (
            <datalist id="categories-suggestions">
              {categorySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}

          <Input
            label="Rol"
            placeholder="Full-Stack Developer"
            {...register('role')}
            error={errors.role?.message}
          />

          <Input
            label="Mi rol (para detalle)"
            placeholder="Full-Stack Developer"
            {...register('myRole')}
            error={errors.myRole?.message}
          />
        </section>

        {/* ── Bloque: descripción ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Texto
          </h2>

          <Textarea
            label="Resumen (card del home)"
            placeholder="App de seguimiento de entrenamiento de hipertrofia…"
            rows={3}
            {...register('summary')}
            error={errors.summary?.message}
          />

          <Textarea
            label="Descripción (página de detalle)"
            placeholder="Aplicación web para seguimiento de entrenamiento…"
            rows={6}
            {...register('description')}
            error={errors.description?.message}
          />
        </section>

        {/* ── Bloque: stack técnico ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Stack técnico
          </h2>

          {/* Controller: para fields no-nativos (no son <input>), conectamos
              a react-hook-form via render prop con value + onChange. */}
          <Controller
            name="stack"
            control={control}
            render={({ field }) => (
              <ChipsEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="React, PHP, MySQL…"
                error={errors.stack?.message}
                // Suggestions: techs ya usadas en otros proyectos.
                // El browser autocompleta mientras el usuario tipea.
                suggestions={techSuggestions}
              />
            )}
          />
        </section>

        {/* ── Bloque: fechas ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Fechas
          </h2>

          {/* MonthPicker via react-datepicker. NO usamos register() porque
              no es un <input> nativo — Controller traduce value+onChange.
              El componente mantiene el formato 'YYYY-MM' en string. */}
          <Controller
            name="dateStart"
            control={control}
            render={({ field }) => (
              <MonthPicker
                value={field.value}
                onChange={field.onChange}
                label="Fecha de inicio"
                placeholder="Elegí mes y año"
                error={errors.dateStart?.message}
              />
            )}
          />

          <Controller
            name="dateEnd"
            control={control}
            render={({ field }) => (
              <MonthPicker
                value={field.value}
                onChange={field.onChange}
                label="Fecha de fin (vacío = en curso)"
                placeholder="Elegí mes y año"
                error={errors.dateEnd?.message}
                // dateEnd puede ser '' (proyecto en curso). El botón X
                // permite limpiar lo elegido.
                allowClear
              />
            )}
          />
        </section>

        {/* ── Bloque: media ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Media
          </h2>
          <p className="mb-3 text-xs text-text-muted">
            Arrastrá imágenes o hacé click para subirlas a Supabase Storage.
            Las URLs se guardan solas.
          </p>

          {/* Portada (single). Controller traduce value+onChange porque
              ImageUpload no es un <input> nativo. Pasamos `slug` para
              nombrar el archivo en el bucket; en create mode puede estar
              vacío todavía (storage.js usa 'project' como fallback). */}
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                slug={watchedSlug}
                label="Imagen de portada"
                error={errors.image?.message}
              />
            )}
          />

          {/* Galería (multiple). Mismo componente con multiple → value
              es un string[] de URLs. */}
          <Controller
            name="gallery"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                multiple
                slug={watchedSlug}
                label="Galería"
                error={errors.gallery?.message}
              />
            )}
          />
        </section>

        {/* ── Bloque: links externos ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Links externos
          </h2>

          <Input
            label="Sitio live (URL)"
            placeholder="https://giulianogerlo.vercel.app"
            {...register('liveUrl')}
            error={errors.liveUrl?.message}
          />

          <Input
            label="Repositorio (URL)"
            placeholder="https://github.com/GiuGerlo/proyecto"
            {...register('repoUrl')}
            error={errors.repoUrl?.message}
          />
        </section>

        {/* ── Bloque: desafíos ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Desafíos resueltos
          </h2>

          <Controller
            name="challenges"
            control={control}
            render={({ field }) => (
              <ParagraphsEditor
                value={field.value}
                onChange={field.onChange}
                error={errors.challenges?.message}
              />
            )}
          />
        </section>

        {/* ── Bloque: publicación ── */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Publicación
          </h2>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register('published')}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            <span className="text-sm">
              Publicado (visible en el sitio público)
            </span>
          </label>
        </section>

        {/* ── Server error (si lo hay) ── */}
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

        {/* ── Footer del form: cancelar + guardar (+ borrar si edit) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isEdit && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleDelete}
              disabled={status === 'saving' || status === 'deleting'}
              className="text-red-500 hover:border-red-500 hover:text-red-500"
            >
              <Trash2 size={16} aria-hidden="true" />
              {status === 'deleting' ? 'Borrando…' : 'Borrar proyecto'}
            </Button>
          )}

          {/* Spacer para empujar los botones de la derecha cuando no hay
              "Borrar". `ml-auto` en el primer botón de la derecha hace eso. */}
          <div className="ml-auto flex gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
            >
              Cancelar
            </Link>

            <Button
              type="submit"
              variant="primary"
              disabled={status === 'saving' || status === 'deleting'}
            >
              <Save size={16} aria-hidden="true" />
              {status === 'saving' ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>

        {/* ── Columna derecha: preview ──
            sticky top-20 = pega al tope del viewport mientras hacés
            scroll, dejando 80px de espacio para la AdminLayout topbar.
            self-start: en grid, hace que el contenido sticky funcione
            (sino el grid item ocupa todo el alto y sticky no tiene
            margen de scroll). */}
        <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <ProjectPreview values={watchedAll} />
        </div>
      </div>
    </article>
  );
}

/**
 * BackLink — link "Volver al panel" arriba del form.
 * Componente local porque solo se usa acá.
 */
function BackLink() {
  return (
    <Link
      to="/admin"
      className="mb-8 inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-text-muted transition-colors hover:text-accent"
    >
      <ArrowLeft size={14} aria-hidden="true" />
      Volver al panel
    </Link>
  );
}
