/**
 * experience.js — timeline de experiencia laboral.
 *
 * Orden: del más reciente al más antiguo (lo lee el componente Timeline
 * en Phase 4.6 sin re-ordenar).
 *
 * Shape de cada item:
 *  - id          → string único, usado como key en React
 *  - dateLabel   → texto mostrado en la card ("NOV 2025 — ACTUALIDAD")
 *  - dateStart   → 'YYYY-MM' para ordenar/filtrar programáticamente
 *  - dateEnd     → 'YYYY-MM' o null si sigue activo
 *  - role        → puesto / título del rol
 *  - company     → empresa o cliente
 *  - desc        → 1-2 oraciones describiendo el trabajo
 *  - current     → boolean. Si true, la card recibe estilo destacado
 *                  (punto sólido + halo verde en el timeline).
 *  - projectSlug → string opcional. Si existe, el item del timeline es
 *                  clickeable y linkea a /proyectos/<projectSlug>. Si
 *                  no, el item se muestra sin link (ej. roles que
 *                  agrupan varios proyectos).
 */

export const experience = [
  {
    id: "ramcc-dev",
    dateLabel: "NOV 2024 — ACTUALIDAD",
    dateStart: "2024-11",
    dateEnd: null,
    role: "Asistente de Desarrollo",
    company: "RAMCC",
    desc: "Desarrollo de software a medida, mantenimiento de sistemas y creación de nuevas funcionalidades en front-end y back-end.",
    current: true,
    projectSlug: "ramcc",
  },
  {
    id: "clovertecno",
    dateLabel: "MAR 2025 — AGO 2025",
    dateStart: "2025-03",
    dateEnd: "2025-08",
    role: "Desarrollo E-commerce",
    company: "Clovertecno",
    desc: "Sistema de compras, integración Mercado Pago, módulo de productos.",
    current: false,
    projectSlug: "clovertecno",
  },
  {
    id: "inmobiliaria-nz",
    dateLabel: "JUN 2025 — AGO 2025",
    dateStart: "2025-06",
    dateEnd: "2025-08",
    role: "Desarrollo Full-Stack · Sitio Web Inmobiliario",
    company: "Inmobiliaria NZ",
    desc: "Catálogo de propiedades y panel de gestión.",
    current: false,
    projectSlug: "inmobiliaria-nz",
  },
];
