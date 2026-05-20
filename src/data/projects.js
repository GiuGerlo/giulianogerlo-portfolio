/**
 * projects.js — fuente única de verdad de los proyectos del portfolio.
 *
 * Cada proyecto sigue el mismo shape para que los componentes que los
 * renderizan (ProjectCard en Home, página /proyectos/:slug) puedan
 * hacer .map() sin lógica condicional rara.
 *
 * Convenciones:
 *  - `slug` es ÚNICO. Se usa en la URL: /proyectos/<slug>.
 *  - URLs reales (`liveUrl`, `repoUrl`) y assets (`image`, `gallery`)
 *    están en `null` hasta que Giuliano los pase (ver TODO-USUARIO.md).
 *  - `challenges[]` se completa en Phase 4/5 con desafíos técnicos
 *    reales de cada proyecto.
 *  - Fechas en formato 'YYYY-MM' para poder ordenar lexicográficamente.
 *  - Si `dateEnd` es `null`, el proyecto está en curso.
 */

export const projects = [
  {
    slug: 'gym-tracker',
    title: 'Personal Gym Tracker',
    category: 'Full-Stack · Fitness',
    role: 'Full-Stack Developer',
    myRole: 'Full-Stack Developer',
    summary:
      'App de seguimiento de entrenamiento de hipertrofia. Multi-usuario, rutinas personalizables, panel de estadísticas y deploy automatizado con CI/CD a Hostinger.',
    description:
      'Aplicación web para seguimiento de entrenamiento de hipertrofia, de uso personal y para conocidos. Multi-usuario con login propio: cada persona arma su rutina a partir de un catálogo de ejercicios gestionado por un administrador, registra cada sesión (series, repeticiones, calentamiento) y consulta su progreso. Frontend en React 19 (SPA con Vite) y backend en PHP 8.2 puro con API REST y sesiones, sobre MariaDB. Incluye un panel de estadísticas — timeline de entrenamientos, récords personales y heatmap de consistencia — y un pipeline de integración continua que compila, reporta los cambios, deploya por SSH a Hostinger y corre un smoke test.',
    stack: ['React', 'PHP', 'MariaDB', 'Tailwind CSS', 'GitHub Actions'],
    image: '/projects/gym-tracker-1.webp',
    gallery: [
      '/projects/gym-tracker-1.webp',
      '/projects/gym-tracker-2.webp',
      '/projects/gym-tracker-3.webp',
    ],
    liveUrl: 'https://gym-tracker.nz-estudiojuridicoinmobiliario.com',
    repoUrl: null,
    dateStart: '2026-02',
    dateEnd: '2026-03',
    challenges: [
      'Pipeline de CI/CD propio: GitHub Actions en 4 etapas (build del frontend, reporte de diff contra el servidor, deploy por rsync/SSH y smoke test) que se dispara al pushear a la rama production, con instrucciones de rollback si algo falla.',
      'Sistema multi-usuario con catálogo compartido: cada usuario arma su rutina personalizada a partir de un catálogo de ejercicios que gestiona un administrador, con sesiones de usuario y de admin separadas.',
      'Panel de estadísticas de progreso: timeline de entrenamientos, récords personales y heatmap de consistencia, con gráficos renderizados en Recharts.',
      'Registro de la rutina del día: el sistema determina qué ejercicios tocan según el día y guarda cada sesión con sus series y calentamiento para alimentar el historial.',
    ],
  },
  {
    slug: 'gestor-finanzas',
    title: 'Gestor de Finanzas',
    category: 'Web App · Finanzas',
    role: 'Full-Stack Developer',
    myRole: 'Full-Stack Developer',
    summary:
      'Gestor de finanzas personales multi-usuario: registro de ingresos, gastos y gastos fijos, categorías, métodos de pago y control de acceso por roles.',
    description:
      'Sistema de gestión de finanzas personales, de uso personal y para conocidos, desarrollado en PHP vanilla con MySQL y Bootstrap. Permite registrar ingresos, gastos y gastos fijos recurrentes, organizarlos por categorías y métodos de pago, y consultar reportes financieros. Multi-usuario con control de acceso por roles: un superadmin gestiona usuarios y la configuración global, mientras que cada usuario accede únicamente a sus propios datos. Incluye un registro de auditoría de seguridad que guarda automáticamente los eventos sensibles del sistema.',
    stack: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
    image: null,
    gallery: [],
    liveUrl: null,
    repoUrl: null,
    dateStart: '2025-08',
    dateEnd: '2025-09',
    challenges: [
      'Control de acceso por roles (RBAC): dos roles (superadmin y usuario) con middleware de autenticación — el superadmin gestiona usuarios, categorías y métodos de pago globales; el usuario solo opera sobre sus propios datos.',
      'Aislamiento de datos por usuario: cada ingreso, gasto y gasto fijo se filtra por usuario, de modo que cada persona accede únicamente a sus propias finanzas.',
      'Gestión de gastos fijos recurrentes separados de los gastos comunes, para proyectar los costos mensuales que se repiten.',
    ],
  },
  {
    slug: 'next-tienda',
    title: 'Next — Tienda de Ropa',
    category: 'Sistema de gestión · Indumentaria',
    role: 'Full-Stack Developer',
    myRole: 'Full-Stack Developer',
    summary:
      'Sistema integral de gestión para una tienda de ropa de Chañar Ladeado: ventas, pagos parciales, préstamos de prendas, clientes y reportes. Reemplaza la libreta de papel por un panel digital ordenado.',
    description:
      'Sistema web de administración para una tienda de ropa, pensado para digitalizar los procesos que antes se llevaban a mano en papel: ventas con pagos totales o en cuotas, préstamos de prendas a clientes habituales, deudas pendientes, contactos y reportes. Desarrollado en PHP 8 vanilla con MySQL 8 (triggers + vistas), Bootstrap 5.3, DataTables y SweetAlert2. Incluye un dashboard con estadísticas comparativas mes a mes (ventas del mes, ingresos, productos más vendidos, mejores clientes, préstamos vencidos), un módulo de ventas con búsqueda, filtros y exportación a Excel profesional vía PhpSpreadsheet, un sistema de préstamos con seguimiento por estados (pendiente, devuelto, comprado) y un log de actividades para auditoría. Es un panel privado de uso interno: las capturas usan datos ficticios para preservar la privacidad comercial.',
    stack: [
      'PHP',
      'MySQL',
      'Bootstrap',
      'JavaScript',
      'DataTables',
      'PhpSpreadsheet',
      'SweetAlert2',
    ],
    image: '/projects/next-tienda-1.webp',
    gallery: [
      '/projects/next-tienda-1.webp',
      '/projects/next-tienda-2.webp',
      '/projects/next-tienda-3.webp',
      '/projects/next-tienda-4.webp',
    ],
    liveUrl: null,
    repoUrl: 'https://github.com/GiuGerlo/Next-Tienda',
    dateStart: '2025-07',
    dateEnd: '2025-09',
    challenges: [
      'Migración del control en papel a un sistema digital: ventas, pagos, préstamos, contactos y deudas que se llevaban manualmente quedaron centralizados, con búsqueda, filtros y trazabilidad de cada movimiento.',
      'Sistema de pagos parciales y cuenta corriente: cada venta admite uno o varios pagos con distintos métodos (efectivo, transferencia, débito, crédito, cuenta corriente). Un trigger MySQL recalcula automáticamente el monto pagado, el saldo adeudado y el estado de la venta (completo, parcial, pendiente) en cada pago, evitando inconsistencias.',
      'Módulo de préstamos de prendas: las prendas que se prestan al cliente se registran como detalle con estado (pendiente, devuelto, comprado). Cuando todas vuelven el préstamo se cierra solo; si el cliente termina comprando alguna, se enlaza con la venta correspondiente. Los contadores del préstamo los mantienen triggers en la base.',
      'Dashboard con métricas comparativas: ventas del mes vs mes anterior con cálculo de variación, ingresos, productos más vendidos del mes, ranking histórico de mejores clientes, préstamos pendientes y vencidos, monto por cobrar. Todo recalculado en tiempo real con queries optimizadas.',
      'Exportación a Excel profesional con PhpSpreadsheet: respeta los filtros aplicados en pantalla, agrega un resumen ejecutivo con tarjetas de métricas y formatea cada fila según el estado de pago (verde completo, amarillo parcial, rojo pendiente) — pensado para presentar a contabilidad o gerencia.',
    ],
  },
  {
    slug: 'inmobiliaria-nz',
    title: 'Inmobiliaria NZ',
    category: 'Full-Stack · Inmobiliaria',
    role: 'Full-Stack Developer',
    myRole: 'Full-Stack Developer',
    summary:
      'Sitio web para estudio jurídico-inmobiliario con catálogo de propiedades, buscador instantáneo, mapa dinámico y panel de gestión.',
    description:
      'Plataforma web para un estudio jurídico-inmobiliario. Catálogo público de propiedades organizado por categoría (casas, departamentos, terrenos, locales), con buscador instantáneo en tiempo real y mapa dinámico con clusters. Panel de administración con CRUD de propiedades y categorías, ordenamiento drag-and-drop y sección de propiedades vendidas. Desarrollado en PHP vanilla sobre arquitectura propia, con autenticación por sesiones y medición de tráfico con Google Analytics 4.',
    stack: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript', 'Google Maps API'],
    image: '/projects/inmobiliaria-nz-1.webp',
    gallery: [
      '/projects/inmobiliaria-nz-1.webp',
      '/projects/inmobiliaria-nz-2.webp',
      '/projects/inmobiliaria-nz-3.webp',
      '/projects/inmobiliaria-nz-4.webp',
    ],
    liveUrl: 'https://nz-estudiojuridicoinmobiliario.com/',
    repoUrl: null,
    dateStart: '2025-06',
    dateEnd: '2025-08',
    challenges: [
      'Mostrar todo el catálogo de propiedades en venta de la inmobiliaria: cada propiedad con sus características, ubicación, galería de imágenes y datos de contacto, para que cualquier interesado pueda consultar lo disponible sin intermediarios.',
      'Buscador de propiedades instantáneo: filtra por título, localidad o categoría en tiempo real, normalizando el texto para ignorar acentos.',
      'Mapa dinámico de propiedades con clusters personalizados (Google Maps + MarkerClusterer), adaptado a mobile sin romper el responsive.',
      'Ordenamiento drag-and-drop de propiedades en el panel admin, persistiendo el orden por categoría en la base de datos.',
    ],
  },
  {
    slug: 'clovertecno',
    title: 'CloverTecno',
    category: 'E-commerce · Tecnología',
    role: 'Colaborador Full-Stack',
    myRole: 'Colaborador Full-Stack',
    summary:
      'E-commerce de productos tecnológicos con checkout integrado a Mercado Pago, gestión de stock vía Excel y panel de administración completo.',
    description:
      'Tienda online de productos tecnológicos desarrollada en PHP vanilla (8.2+) sobre una arquitectura propia tipo MVC. Catálogo público con categorías, productos destacados y ofertas, detalle de producto con modelos/variantes, carrito y checkout integrado con Mercado Pago (creación de preferencias, webhook de confirmación y páginas de retorno). Panel de administración con DataTables para gestionar productos, categorías, stock, órdenes, ventas, usuarios y envíos, con importación/exportación de inventario en Excel, generación de PDF y notificaciones por email en cada cambio de estado.',
    stack: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript', 'jQuery', 'Mercado Pago'],
    image: '/projects/clovertecno-1.webp',
    gallery: [
      '/projects/clovertecno-1.webp',
      '/projects/clovertecno-2.webp',
      '/projects/clovertecno-3.webp',
      '/projects/clovertecno-4.webp',
    ],
    liveUrl: 'https://clovertecno.com/',
    repoUrl: null,
    dateStart: '2025-03',
    dateEnd: '2025-08',
    challenges: [
      'Integración de pagos con Mercado Pago: creación de preferencias de pago, manejo del webhook para confirmar transacciones y páginas de retorno para los estados éxito, pendiente y rechazado.',
      'Gestión de stock masiva vía Excel: descarga de plantilla, importación y exportación de inventario con PhpSpreadsheet, validando los datos antes de impactar la base.',
      'Productos con modelos/variantes: cada producto puede tener varios modelos (capacidad, color, etc.) con su propio stock, gestionados de forma independiente desde el admin.',
      'Flujo de órdenes a ventas: conversión y seguimiento de estados con notificaciones automáticas por email (PHPMailer) en cada cambio y registro de actividad del staff.',
    ],
  },
  {
    slug: 'ramcc',
    title: 'Ecosistema RAMCC',
    category: 'Web + Mobile · APIs · Pagos',
    role: 'Asistente de Desarrollo',
    myRole: 'Asistente de Desarrollo',
    summary:
      'Trabajo full-stack para la Red Argentina de Municipios frente al Cambio Climático: sitios institucionales, aula virtual con Mercado Pago, sistema de huella de carbono con app Flutter, y censo de arbolado web + mobile con API Laravel.',
    description:
      'Como Asistente de Desarrollo de RAMCC participo en todo el ecosistema digital de la red y de sus servicios asociados. Mantengo y evoluciono sitios institucionales (RAMCC, ALPA Servicios Ambientales), construyo sistemas internos (backoffice de RAMCC, sistema Mi-Huella de ALPA con app móvil Flutter y API en PHP puro, censo del arbolado CenArb con app Flutter offline-first y API Laravel) y mantengo el Aula Virtual con pasarela de pagos Mercado Pago. Las tareas van desde features nuevas en frontend, APIs, generación de PDFs e informes, integraciones con pasarelas de pago, hasta mantenimiento, optimización y soporte de los sistemas en producción.',
    stack: [
      'PHP',
      'Laravel',
      'MySQL',
      'Flutter',
      'API REST',
      'Mercado Pago',
      'JavaScript',
      'Bootstrap',
      'Playwright',
      'Postman',
      'Docker',
    ],
    image: '/projects/ramcc-1.webp',
    gallery: [
      '/projects/ramcc-1.webp',
      '/projects/ramcc-2.webp',
      '/projects/ramcc-3.webp',
      '/projects/ramcc-4.webp',
    ],
    liveUrl: 'https://ramcc.net/',
    repoUrl: null,
    dateStart: '2024-11',
    dateEnd: null,
    challenges: [
      'Sitio institucional RAMCC (ramcc.net): mantenimiento del sitio principal de la Red Argentina de Municipios frente al Cambio Climático, con secciones dinámicas, contenido editable y soporte continuo.',
      'Sitio ALPA Servicios Ambientales (alpaserviciosambientales.com): desarrollo y mantenimiento del sitio corporativo de ALPA, servicio dependiente de RAMCC.',
      'Sistema Mi-Huella (ALPA): plataforma para cálculo de huella de carbono empresarial. Frontend de gestión + aplicación móvil Flutter para Android e iOS conectada por una API en PHP puro. Incluye recordatorios automáticos por mail, envío de PDFs, generación de informes profesionales y panel administrativo. Trabajado con entorno reproducible en Docker (contenedores PHP + MySQL para levantar el sistema completo con un solo comando), testing end-to-end automatizado con Playwright sobre los flujos críticos y diseño y validación de la API con colecciones de Postman.',
      'Censo de Arbolado Urbano (CenArb, cenarb.net): aplicación Flutter para iOS y Android con funcionamiento online y offline (sincronización al recuperar conexión), conectada a una API REST en Laravel. Acompañado por un panel web de gestión para municipios.',
      'Aula Virtual RAMCC (aula.ramcc.net): plataforma de cursos con pasarela de pago Mercado Pago integrada (creación de preferencias, webhooks de confirmación), avisos automáticos por mail al concretar cada pago, gestión de alumnos, cursos, certificados y exámenes.',
      'Backoffice de RAMCC: sistema interno de administración usado por el equipo para gestionar municipios, contenidos y procesos internos.',
    ],
  },
];
