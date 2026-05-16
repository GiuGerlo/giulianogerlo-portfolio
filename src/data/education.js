/**
 * education.js — educación formal y certificaciones.
 *
 * Shape de cada item:
 *  - id          → string único
 *  - dateLabel   → texto mostrado en la card ("2022 — 2024")
 *  - title       → nombre del título / curso
 *  - org         → institución
 *  - status      → 'completed' | 'in-progress'
 *  - certUrl     → URL pública del certificado, o null si no se cargó aún
 *
 * Render visual (Phase 4.7):
 *  - Si status === 'in-progress' → badge "EN CURSO" + texto
 *    "Certificado al finalizar".
 *  - Si certUrl existe → link "Ver certificado ↗".
 *  - Si no hay certUrl y status === 'completed' → texto plano sin link.
 */

export const education = [
  {
    id: "brigadier-lopez",
    dateLabel: "2022 — 2024",
    title: "Técnico Superior en Desarrollo de Software",
    org: "Terciario Brigadier López, Rosario",
    status: "completed",
    certUrl: null,
  },
  {
    id: "coderhouse-web",
    dateLabel: "ENE 2024 — MAR 2024",
    title: "Curso de Desarrollo Web",
    org: "CoderHouse",
    status: "completed",
    certUrl: null,
  },
  {
    id: "coderhouse-js",
    dateLabel: "AGO 2024 — OCT 2024",
    title: "Curso de JavaScript",
    org: "CoderHouse",
    status: "completed",
    certUrl: null,
  },
  {
    id: "digitalhouse-react",
    dateLabel: "JUN 2025 — JUN 2026",
    title: "Certificación React Developer",
    org: "DigitalHouse",
    status: "in-progress",
    certUrl: null,
  },
];
