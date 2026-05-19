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
    stack: ['React 19', 'PHP', 'MariaDB', 'Tailwind CSS', 'GitHub Actions'],
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
    slug: 'inmobiliaria-nz',
    title: 'Inmobiliaria NZ',
    category: 'Full-Stack · Inmobiliaria',
    role: 'Full-Stack Developer',
    myRole: 'Full-Stack Developer',
    summary:
      'Sitio web para estudio jurídico-inmobiliario con catálogo de propiedades, buscador instantáneo, mapa dinámico y panel de gestión.',
    description:
      'Plataforma web para un estudio jurídico-inmobiliario. Catálogo público de propiedades organizado por categoría (casas, departamentos, terrenos, locales), con buscador instantáneo en tiempo real y mapa dinámico con clusters. Panel de administración con CRUD de propiedades y categorías, ordenamiento drag-and-drop y sección de propiedades vendidas. Desarrollado en PHP vanilla sobre arquitectura propia, con autenticación por sesiones y medición de tráfico con Google Analytics 4.',
    stack: ['PHP', 'MySQL', 'Bootstrap 5', 'JavaScript', 'Google Maps API'],
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
    stack: ['PHP', 'MySQL', 'Bootstrap 5', 'jQuery', 'MercadoPago SDK'],
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
    title: 'Sitio RAMCC',
    category: 'Corporativo · Aula virtual',
    role: 'Colaborador front + back',
    myRole: 'Colaborador front + back',
    summary:
      'Sitio corporativo con sistema de gestión y aula virtual integrada.',
    description:
      'Sitio institucional de RAMCC con gestor de contenidos, sección de novedades y aula virtual integrada para cursos.',
    stack: ['Laravel', 'MySQL', 'jQuery', 'Bootstrap'],
    image: null,
    gallery: [],
    liveUrl: null,
    repoUrl: null,
    dateStart: '2024-11',
    dateEnd: null,
    challenges: [],
  },
  {
    slug: 'alpa',
    title: 'ALPA',
    category: 'Corporativo · CMS',
    role: 'Colaborador front + back',
    myRole: 'Colaborador front + back',
    summary:
      'Sitio corporativo con panel de gestión y carga dinámica de noticias.',
    description:
      'Sitio institucional para ALPA con CMS propio. Panel de gestión para carga de noticias, eventos y secciones dinámicas.',
    stack: ['Laravel', 'MySQL', 'Bootstrap'],
    image: null,
    gallery: [],
    liveUrl: null,
    repoUrl: null,
    dateStart: '2024-11',
    dateEnd: null,
    challenges: [],
  },
  {
    slug: 'cenarb',
    title: 'CENARB',
    category: 'Web + Mobile · API',
    role: 'Colaborador full-stack',
    myRole: 'Colaborador full-stack',
    summary:
      'App móvil y web para censo del arbolado urbano. Panel de gestión y API REST en Laravel.',
    description:
      'Sistema integral para censo del arbolado urbano. App móvil para registro en campo, panel web de gestión y API REST que sincroniza los datos entre ambos.',
    stack: ['Laravel', 'API REST', 'MySQL', 'Mobile'],
    image: null,
    gallery: [],
    liveUrl: null,
    repoUrl: null,
    dateStart: '2024-11',
    dateEnd: null,
    challenges: [],
  },
];
