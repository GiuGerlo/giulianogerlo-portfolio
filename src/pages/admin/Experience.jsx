import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

import { useAdminList } from '../../hooks/useAdminList.js';
import { useAdminProjects } from '../../hooks/useAdminProjects.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { dbToExperience, experienceToDb } from '../../lib/experience-mapper.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

/**
 * Experience (admin) — CRUD inline del timeline (experience). Mismo patrón
 * que Skills/AI admin. Campos: dateLabel, dateStart/dateEnd, role, company,
 * description, current (checkbox), projectSlug (select de proyectos
 * existentes, para linkear el item al detalle).
 */

const EMPTY = {
  dateLabel: '',
  dateStart: '',
  dateEnd: '',
  role: '',
  company: '',
  description: '',
  current: false,
  projectSlug: '',
};

export default function Experience() {
  useDocumentTitle('Experiencia — Admin');

  const { data, loading, error, busy, create, update, remove, move } = useAdminList(
    'experience',
    { dbTo: dbToExperience, toDb: experienceToDb },
  );

  // Proyectos para el dropdown de projectSlug (linkear el item al detalle).
  const { data: projects } = useAdminProjects();

  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { register, handleSubmit, reset } = useForm({ defaultValues: EMPTY });

  function openCreate() {
    reset(EMPTY);
    setEditingId('new');
  }
  function openEdit(item) {
    reset({
      dateLabel: item.dateLabel,
      dateStart: item.dateStart ?? '',
      dateEnd: item.dateEnd ?? '',
      role: item.role,
      company: item.company,
      description: item.description,
      current: item.current,
      projectSlug: item.projectSlug ?? '',
    });
    setEditingId(item.id);
  }

  async function onSubmit(values) {
    const res = editingId === 'new' ? await create(values) : await update(editingId, values);
    if (!res.error) setEditingId(null);
  }

  async function confirmDelete() {
    const target = pendingDelete;
    setPendingDelete(null);
    if (target) await remove(target.id);
  }

  if (loading) {
    return (
      <article aria-busy="true" aria-label="Cargando experiencia" className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 h-10 w-3/4 rounded bg-border/60" />
        <div className="h-40 rounded bg-border/40" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="font-medium text-text-primary">No pude cargar la experiencia.</p>
        </div>
      </article>
    );
  }

  const items = data ?? [];
  const projectOptions = projects ?? [];

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading eyebrow="// experiencia" title="Experiencia" subtitle="Timeline laboral. Los cambios impactan al guardar." />

      {editingId === null && (
        <Button type="button" variant="secondary" onClick={openCreate} className="mb-6">
          <Plus size={16} aria-hidden="true" />
          Agregar experiencia
        </Button>
      )}

      {editingId !== null && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-6 rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            {editingId === 'new' ? 'Nueva experiencia' : 'Editar experiencia'}
          </h2>

          <Input label="Rol" placeholder="Asistente de Desarrollo" {...register('role')} />
          <Input label="Empresa" placeholder="RAMCC" {...register('company')} />
          <Input label="Etiqueta de fecha" placeholder="NOV 2024 — ACTUALIDAD" {...register('dateLabel')} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Inicio (YYYY-MM)" placeholder="2024-11" {...register('dateStart')} />
            <Input label="Fin (YYYY-MM, vacío = en curso)" placeholder="2025-03" {...register('dateEnd')} />
          </div>

          <Textarea label="Descripción" rows={3} {...register('description')} />

          {/* projectSlug: select de proyectos existentes (o ninguno). */}
          <div className="mb-4">
            <label htmlFor="exp-project" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Proyecto vinculado (opcional)
            </label>
            <select
              id="exp-project"
              {...register('projectSlug')}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none"
            >
              <option value="">— Sin proyecto —</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <label className="mb-4 flex cursor-pointer items-center gap-3">
            <input type="checkbox" {...register('current')} className="h-4 w-4 rounded border-border accent-accent" />
            <span className="text-sm">Trabajo actual (punto sólido + halo)</span>
          </label>

          <div className="mt-2 flex gap-3">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditingId(null)} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-start gap-4 rounded-xl border border-border bg-bg-elevated p-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-accent">{item.dateLabel}</p>
              <p className="font-semibold">
                {item.role}
                {item.current && (
                  <span className="ml-2 rounded bg-accent-bg px-1.5 py-0.5 font-mono text-[10px] uppercase text-accent">
                    actual
                  </span>
                )}
              </p>
              <p className="text-sm text-text-muted">{item.company}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <IconButton label="Subir" onClick={() => move(item.id, -1)} disabled={busy || i === 0}>
                <ChevronUp size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Bajar" onClick={() => move(item.id, 1)} disabled={busy || i === items.length - 1}>
                <ChevronDown size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Editar" onClick={() => openEdit(item)} disabled={busy}>
                <Pencil size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Borrar" onClick={() => setPendingDelete(item)} disabled={busy} danger>
                <Trash2 size={16} aria-hidden="true" />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Borrar experiencia"
        message={`¿Borrar "${pendingDelete?.role}"? Esta acción no se puede deshacer.`}
        confirmLabel="Borrar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </article>
  );
}

function IconButton({ label, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        'flex size-8 items-center justify-center rounded-md border border-border text-text-muted transition-colors disabled:opacity-40 ' +
        (danger ? 'hover:border-red-500 hover:text-red-500' : 'hover:border-accent hover:text-accent')
      }
    >
      {children}
    </button>
  );
}
