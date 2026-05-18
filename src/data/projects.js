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
    liveUrl: null,
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
    title: 'Clovertecno',
    category: 'E-commerce · Tecnología',
    role: 'Colaborador front + back',
    myRole: 'Colaborador front + back',
    summary:
      'E-commerce con sistema de compras, integración a Mercado Pago y módulo de gestión de productos.',
    description:
      'Tienda online de productos tecnológicos. Carrito persistente, checkout integrado con Mercado Pago, panel de gestión de productos, categorías y órdenes.',
    stack: ['Laravel', 'MercadoPago', 'MySQL', 'Bootstrap', 'jQuery'],
    image: null,
    gallery: [],
    liveUrl: null,
    repoUrl: null,
    dateStart: '2025-03',
    dateEnd: '2025-08',
    challenges: [],
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
