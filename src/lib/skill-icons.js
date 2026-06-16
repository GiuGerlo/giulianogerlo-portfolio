/**
 * skill-icons.js — set CURADO de íconos lucide para los grupos de skills.
 *
 * Fuente única compartida entre:
 *  - el render público (`Skills.jsx`) que resuelve `icon` (string) → componente.
 *  - el `IconPicker` del admin (dropdown visual para elegir).
 *
 * Por qué un set curado y no todos los íconos de lucide: importar los ~1000
 * íconos rompe el tree-shaking e infla el bundle. Listamos solo los
 * dev-relevant. Para sumar uno: importarlo arriba + agregar la entry.
 */

import {
  Layout,
  Server,
  Database,
  Wrench,
  Heart,
  Code,
  Code2,
  Terminal,
  Cloud,
  Cpu,
  GitBranch,
  Boxes,
  Layers,
  Palette,
  Smartphone,
  Globe,
  Braces,
  FileCode,
  Settings,
  Zap,
  Rocket,
  Brain,
  Bot,
  Network,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

// Lookup nombre → componente lucide. La KEY (string) es lo que se guarda en
// la columna `icon` de skill_groups.
export const SKILL_ICONS = {
  Layout,
  Server,
  Database,
  Wrench,
  Heart,
  Code,
  Code2,
  Terminal,
  Cloud,
  Cpu,
  GitBranch,
  Boxes,
  Layers,
  Palette,
  Smartphone,
  Globe,
  Braces,
  FileCode,
  Settings,
  Zap,
  Rocket,
  Brain,
  Bot,
  Network,
  ShieldCheck,
  Workflow,
};

// Lista de nombres para iterar en el picker.
export const SKILL_ICON_NAMES = Object.keys(SKILL_ICONS);
