import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

import { useAdminList } from '../../hooks/useAdminList.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { dbToSkillGroup, skillGroupToDb } from '../../lib/skill-groups-mapper.js';
import { SKILL_ICONS } from '../../lib/skill-icons.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import IconPicker from '../../components/admin/IconPicker.jsx';
import ChipsEditor from '../../components/admin/ChipsEditor.jsx';

/**
 * Skills (admin) — CRUD inline de los grupos del Stack Técnico (skill_groups).
 *
 * Patrón inline (compartido con las otras listas de Phase 13 cont.):
 *  - useAdminList provee data + create/update/remove/move.
 *  - `editingId`: null (form cerrado) | 'new' | <id> (editando esa fila).
 *  - Un solo form react-hook-form que se resetea según lo que se edita.
 *  - Filas con botones ↑/↓ (reorder) + editar + borrar.
 */

const EMPTY = { title: '', icon: 'Code', items: [] };

export default function Skills() {
  useDocumentTitle('Skills — Admin');

  const { data, loading, error, busy, create, update, remove, move } = useAdminList(
    'skill_groups',
    { dbTo: dbToSkillGroup, toDb: skillGroupToDb },
  );

  // null = sin form; 'new' = creando; <id> = editando esa fila.
  const [editingId, setEditingId] = useState(null);
  // Grupo pendiente de borrar (abre el ConfirmDialog) o null.
  const [pendingDelete, setPendingDelete] = useState(null);

  const { register, handleSubmit, reset, control } = useForm({ defaultValues: EMPTY });

  // Al abrir el form (new/edit) reseteamos con los valores correspondientes.
  function openCreate() {
    reset(EMPTY);
    setEditingId('new');
  }
  function openEdit(group) {
    reset({ title: group.title, icon: group.icon, items: group.items });
    setEditingId(group.id);
  }

  async function onSubmit(values) {
    const res = editingId === 'new'
      ? await create(values)
      : await update(editingId, values);
    if (!res.error) setEditingId(null);
  }

  async function confirmDelete() {
    const target = pendingDelete;
    setPendingDelete(null);
    if (target) await remove(target.id);
  }

  if (loading) {
    return (
      <article aria-busy="true" aria-label="Cargando skills" className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 h-10 w-3/4 rounded bg-border/60" />
        <div className="h-40 rounded bg-border/40" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="font-medium text-text-primary">No pude cargar los skills.</p>
        </div>
      </article>
    );
  }

  const groups = data ?? [];

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading eyebrow="// stack técnico" title="Skills" subtitle="Grupos de tecnologías. Los cambios impactan al guardar." />

      {/* Botón agregar (oculto mientras el form está abierto). */}
      {editingId === null && (
        <Button type="button" variant="secondary" onClick={openCreate} className="mb-6">
          <Plus size={16} aria-hidden="true" />
          Agregar grupo
        </Button>
      )}

      {/* Form de alta/edición. */}
      {editingId !== null && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mb-6 rounded-xl border border-border bg-bg-elevated p-6"
        >
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            {editingId === 'new' ? 'Nuevo grupo' : 'Editar grupo'}
          </h2>

          <Input label="Título" placeholder="Frontend" {...register('title')} />

          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <IconPicker label="Ícono" value={field.value} onChange={field.onChange} />
            )}
          />

          <Controller
            name="items"
            control={control}
            render={({ field }) => (
              <ChipsEditor
                label="Tecnologías"
                value={field.value}
                onChange={field.onChange}
                placeholder="React, PHP, MySQL…"
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

      {/* Lista de grupos. */}
      <ul className="space-y-3">
        {groups.map((group, i) => {
          const Icon = SKILL_ICONS[group.icon] ?? null;
          return (
            <li
              key={group.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-bg-elevated p-4"
            >
              {Icon && (
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{group.title}</p>
                <p className="truncate font-mono text-xs text-text-muted">
                  {group.items.join(' · ')}
                </p>
              </div>

              {/* Acciones: reorder ↑↓ + editar + borrar. */}
              <div className="flex shrink-0 items-center gap-1">
                <IconButton label="Subir" onClick={() => move(group.id, -1)} disabled={busy || i === 0}>
                  <ChevronUp size={16} aria-hidden="true" />
                </IconButton>
                <IconButton label="Bajar" onClick={() => move(group.id, 1)} disabled={busy || i === groups.length - 1}>
                  <ChevronDown size={16} aria-hidden="true" />
                </IconButton>
                <IconButton label="Editar" onClick={() => openEdit(group)} disabled={busy}>
                  <Pencil size={16} aria-hidden="true" />
                </IconButton>
                <IconButton label="Borrar" onClick={() => setPendingDelete(group)} disabled={busy} danger>
                  <Trash2 size={16} aria-hidden="true" />
                </IconButton>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Borrar grupo"
        message={`¿Borrar el grupo "${pendingDelete?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Borrar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </article>
  );
}

/**
 * IconButton — botón cuadrado de acción de fila (reorder/editar/borrar).
 * Local porque solo se usa acá; `danger` lo pinta rojo en hover.
 */
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
