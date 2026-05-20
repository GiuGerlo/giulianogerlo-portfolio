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
    desc: "Trabajo full-stack en el ecosistema digital de RAMCC: sitios institucionales, aula virtual con Mercado Pago, sistema Mi-Huella (app Flutter + API PHP) y censo de arbolado CenArb (Flutter + Laravel).",
    current: true,
    projectSlug: "ramcc",
  },
  {
    id: "gym-tracker",
    dateLabel: "FEB 2026 — MAR 2026",
    dateStart: "2026-02",
    dateEnd: "2026-03",
    role: "Desarrollo Full-Stack · App Personal",
    company: "Proyecto personal",
    desc: "App de seguimiento de entrenamiento de hipertrofia con React, PHP y pipeline de CI/CD propio a Hostinger.",
    current: false,
    projectSlug: "gym-tracker",
  },
  {
    id: "gestor-finanzas",
    dateLabel: "AGO 2025 — SEP 2025",
    dateStart: "2025-08",
    dateEnd: "2025-09",
    role: "Desarrollo Full-Stack · Finanzas Personales",
    company: "Proyecto personal",
    desc: "Gestor de finanzas multi-usuario con control de acceso por roles (RBAC), registro de ingresos, gastos y gastos fijos.",
    current: false,
    projectSlug: "gestor-finanzas",
  },
  {
    id: "next-tienda",
    dateLabel: "JUL 2025 — SEP 2025",
    dateStart: "2025-07",
    dateEnd: "2025-09",
    role: "Desarrollo Full-Stack · Sistema para Tienda de Ropa",
    company: "Next (Chañar Ladeado)",
    desc: "Sistema integral de gestión para una tienda de ropa: ventas, pagos parciales, préstamos de prendas, reportes en Excel y dashboard con métricas.",
    current: false,
    projectSlug: "next-tienda",
  },
  {
    id: "inmobiliaria-nz",
    dateLabel: "JUN 2025 — AGO 2025",
    dateStart: "2025-06",
    dateEnd: "2025-08",
    role: "Desarrollo Full-Stack · Sitio Web Inmobiliario",
    company: "Inmobiliaria NZ",
    desc: "Catálogo público de propiedades con buscador instantáneo, mapa dinámico con clusters y panel de administración.",
    current: false,
    projectSlug: "inmobiliaria-nz",
  },
  {
    id: "clovertecno",
    dateLabel: "MAR 2025 — AGO 2025",
    dateStart: "2025-03",
    dateEnd: "2025-08",
    role: "Colaborador Full-Stack · E-commerce",
    company: "CloverTecno",
    desc: "Tienda online con checkout integrado a Mercado Pago, gestión de stock vía Excel y panel administrativo con DataTables.",
    current: false,
    projectSlug: "clovertecno",
  },
];
