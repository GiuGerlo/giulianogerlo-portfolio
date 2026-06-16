import { cn } from '../../lib/cn.js';
import { SKILL_ICONS, SKILL_ICON_NAMES } from '../../lib/skill-icons.js';

/**
 * IconPicker — selector visual de ícono lucide para un grupo de skills.
 * Controlado: `value` (nombre del ícono) / `onChange(name)`. Grilla de
 * botones con el ícono renderizado; el activo se resalta en accent.
 *
 * Set de íconos = `skill-icons.js` (mismo que usa el render público), así
 * lo que se elige acá siempre tiene cómo renderizarse en Skills.jsx.
 */
export default function IconPicker({ value, onChange, label }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-1.5">
        {SKILL_ICON_NAMES.map((name) => {
          const Icon = SKILL_ICONS[name];
          const active = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              aria-label={name}
              aria-pressed={active}
              className={cn(
                'flex size-9 items-center justify-center rounded-md border transition-colors',
                active
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-text-muted hover:border-accent/60 hover:text-text-primary',
              )}
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
