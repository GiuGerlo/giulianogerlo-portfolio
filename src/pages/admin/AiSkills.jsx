import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

import { useAdminList } from '../../hooks/useAdminList.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { dbToAiSkill, aiSkillToDb } from '../../lib/ai-skills-mapper.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ChipsEditor from '../../components/admin/ChipsEditor.jsx';

/**
 * AiSkills (admin) — CRUD inline de las skills de IA (ai_skills). Mismo
 * patrón que Skills admin: useAdminList + form único + filas con ↑↓/editar/
 * borrar (ConfirmDialog). Campos: title, status (active/exploring),
 * description, items[] (ChipsEditor).
 */

const EMPTY = { title: '', status: 'active', description: '', items: [] };

export default function AiSkills() {
  useDocumentTitle('AI — Admin');

  const { data, loading, error, busy, create, update, remove, move } = useAdminList(
    'ai_skills',
    { dbTo: dbToAiSkill, toDb: aiSkillToDb },
  );

  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { register, handleSubmit, reset, control } = useForm({ defaultValues: EMPTY });

  function openCreate() {
    reset(EMPTY);
    setEditingId('new');
  }
  function openEdit(skill) {
    reset({
      title: skill.title,
      status: skill.status,
      description: skill.description,
      items: skill.items,
    });
    setEditingId(skill.id);
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
      <article aria-busy="true" aria-label="Cargando AI skills" className="mx-auto max-w-[900px] animate-pulse px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 h-10 w-3/4 rounded bg-border/60" />
        <div className="h-40 rounded bg-border/40" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
        <div role="alert" className="rounded-xl border border-border bg-bg-elevated p-6 text-text-muted">
          <p className="font-medium text-text-primary">No pude cargar las AI skills.</p>
        </div>
      </article>
    );
  }

  const skills = data ?? [];

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading eyebrow="// ai integration" title="AI Integration" subtitle="Skills de IA destacadas. Los cambios impactan al guardar." />

      {editingId === null && (
        <Button type="button" variant="secondary" onClick={openCreate} className="mb-6">
          <Plus size={16} aria-hidden="true" />
          Agregar skill
        </Button>
      )}

      {editingId !== null && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-6 rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            {editingId === 'new' ? 'Nueva skill' : 'Editar skill'}
          </h2>

          <Input label="Título" placeholder="mcp_servers" {...register('title')} />

          {/* status: native select estilado (no hay primitive Select). */}
          <div className="mb-4">
            <label htmlFor="ai-status" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Estado
            </label>
            <select
              id="ai-status"
              {...register('status')}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none"
            >
              <option value="active">Activo</option>
              <option value="exploring">Explorando</option>
            </select>
          </div>

          <Textarea label="Descripción" rows={3} {...register('description')} />

          <Controller
            name="items"
            control={control}
            render={({ field }) => (
              <ChipsEditor
                label="Herramientas (opcional)"
                value={field.value}
                onChange={field.onChange}
                placeholder="Claude Code, Codex…"
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
        {skills.map((skill, i) => (
          <li key={skill.id} className="flex items-start gap-4 rounded-xl border border-border bg-bg-elevated p-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm text-accent">
                {skill.title}
                <span className="ml-2 rounded bg-accent-bg px-1.5 py-0.5 text-[10px] uppercase text-accent">
                  {skill.status}
                </span>
              </p>
              <p className="mt-1 text-sm text-text-muted">{skill.description}</p>
              {skill.items.length > 0 && (
                <p className="mt-1 truncate font-mono text-xs text-text-muted">{skill.items.join(' · ')}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <IconButton label="Subir" onClick={() => move(skill.id, -1)} disabled={busy || i === 0}>
                <ChevronUp size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Bajar" onClick={() => move(skill.id, 1)} disabled={busy || i === skills.length - 1}>
                <ChevronDown size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Editar" onClick={() => openEdit(skill)} disabled={busy}>
                <Pencil size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Borrar" onClick={() => setPendingDelete(skill)} disabled={busy} danger>
                <Trash2 size={16} aria-hidden="true" />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Borrar skill"
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
