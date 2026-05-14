import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      title="Cambiar tema"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-primary transition-colors hover:border-accent hover:text-accent"
    >
      <Icon size={16} />
    </button>
  );
}
