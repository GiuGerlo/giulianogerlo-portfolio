/**
 * skills.js — skills técnicas y de IA agrupadas por categoría.
 *
 * Dos exports:
 *  - `skillGroups`: 5 grupos (frontend, backend, etc.) con items planos.
 *    Se renderizan como cards en la sección Skills (Phase 4.3).
 *  - `aiSkills`: skills de IA destacadas en sección aparte con descripción
 *    individual (Phase 4.4). Tienen `status` para diferenciar las que
 *    ya uso activamente (`active`) de las que estoy explorando (`exploring`).
 *
 * El campo `icon` es el nombre del componente lucide-react. Se resuelve
 * con un lookup en el render (no se importa el ícono acá para mantener
 * los datos serializables).
 */

export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: 'Layout',
    items: ['HTML', 'CSS', 'JavaScript', 'React', 'Bootstrap', 'jQuery'],
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: 'Server',
    items: ['PHP', 'Laravel', 'API REST', 'Node.js'],
  },
  {
    id: 'database',
    title: 'Base de datos',
    icon: 'Database',
    items: ['MySQL', 'Modelado', 'Optimización'],
  },
  {
    id: 'devops',
    title: 'DevOps / Tools',
    icon: 'Wrench',
    items: ['Git', 'GitHub', 'Docker', 'Postman', 'Figma', 'VS Code'],
  },
  {
    id: 'soft',
    title: 'Soft Skills',
    icon: 'Heart',
    items: [
      'Trabajo en equipo',
      'Comunicación',
      'Autonomía',
      'Aprendizaje rápido',
    ],
  },
];

// AI skills — sección destacada. `status` define el badge visual:
//   'active'    → verde, "✓ activo"
//   'exploring' → amarillo, "🌱 explorando" (Grupo 2, legitimadas en Phase 11)
export const aiSkills = [
  // Grupo 1 — activas (ya las uso en day-to-day dev).
  {
    id: 'claude-code',
    title: 'claude_code',
    status: 'active',
    desc: 'CLI agéntico para desarrollo asistido. Refactors, generación de features, debugging.',
  },
  {
    id: 'mcp',
    title: 'mcp_servers',
    status: 'active',
    desc: 'Model Context Protocol — conexión de Claude con herramientas propias y APIs externas.',
  },
  {
    id: 'api',
    title: 'anthropic_api',
    status: 'active',
    desc: 'Integración del SDK de Anthropic en apps: tool use, prompt caching, streaming.',
  },
  {
    id: 'agent',
    title: 'agent_sdk',
    status: 'active',
    desc: 'Construcción de agentes custom con loops, tool use y manejo de contexto.',
  },
  {
    id: 'prompt',
    title: 'prompt_engineering',
    status: 'active',
    desc: 'Diseño de prompts efectivos: few-shot, chain-of-thought, structured output.',
  },
  {
    id: 'workflows',
    title: 'ai_workflows',
    status: 'active',
    desc: 'Automatización de procesos dev con IA: code review, docs, testing asistido.',
  },
];
