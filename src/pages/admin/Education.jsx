import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

import { useAdminList } from '../../hooks/useAdminList.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { dbToEducation, educationToDb } from '../../lib/education-mapper.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DocumentUpload from '../../components/admin/DocumentUpload.jsx';

/**
 * Education (admin) — CRUD inline de educación + certificaciones (education).
 * Mismo patrón que las otras listas. Campos: dateLabel, title, org, status
 * (completed/in-progress), certUrl (DocumentUpload — PDF/imagen al bucket
 * `documents`). Si status es in-progress no se sube cert (se obtiene al
 * finalizar), pero no lo bloqueamos: el form lo permite igual.
 */

const EMPTY = { dateLabel: '', title: '', org: '', status: 'completed', certUrl: '' };

export default function Education() {
  useDocumentTitle('Educación — Admin');

  const { data, loading, error, busy, create, update, remove, move } = useAdminList(
    'education',
    { dbTo: dbToEducation, toDb: educationToDb },
  );

  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { register, handleSubmit, reset, control } = useForm({ defaultValues: EMPTY });

  function openCreate() {
    reset(EMPTY);
    setEditingId('new');
  }
  function openEdit(item) {
    reset({
      dateLabel: item.dateLabel,
      title: item.title,
      org: item.org,
      status: item.status,
      certUrl: item.certUrl ?? '',
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
      <article aria-busy="true" aria-label="Cargando educación" className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 h-10 w-3/4 rounded bg-border/60" />
        <div className="h-40 rounded bg-border/40" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="font-medium text-text-primary">No pude cargar la educación.</p>
        </div>
      </article>
    );
  }

  const items = data ?? [];

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading eyebrow="// educación" title="Educación y certificaciones" subtitle="Títulos y cursos. Los cambios impactan al guardar." />

      {editingId === null && (
        <Button type="button" variant="secondary" onClick={openCreate} className="mb-6">
          <Plus size={16} aria-hidden="true" />
          Agregar
        </Button>
      )}

      {editingId !== null && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-6 rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            {editingId === 'new' ? 'Nuevo' : 'Editar'}
          </h2>

          <Input label="Título" placeholder="Técnico Superior en Desarrollo de Software" {...register('title')} />
          <Input label="Institución" placeholder="Terciario Brigadier López" {...register('org')} />
          <Input label="Etiqueta de fecha" placeholder="2022 — 2024" {...register('dateLabel')} />

          <div className="mb-4">
            <label htmlFor="edu-status" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Estado
            </label>
            <select
              id="edu-status"
              {...register('status')}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none"
            >
              <option value="completed">Completado</option>
              <option value="in-progress">En curso</option>
            </select>
          </div>

          <Controller
            name="certUrl"
            control={control}
            render={({ field }) => (
              <DocumentUpload
                value={field.value}
                onChange={field.onChange}
                slug="cert"
                label="Certificado (PDF/imagen, opcional)"
              />
            )}
          />

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
                {item.title}
                {item.status === 'in-progress' && (
                  <span className="ml-2 rounded bg-accent-bg px-1.5 py-0.5 font-mono text-[10px] uppercase text-accent">
                    en curso
                  </span>
                )}
              </p>
              <p className="text-sm text-text-muted">{item.org}</p>
              {item.certUrl && (
                <a
                  href={item.certUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline"
                >
                  Ver certificado
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              )}
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
        title="Borrar"
        message={`¿Borrar "${pendingDelete?.title}"? Esta acción no se puede deshacer.`}
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
