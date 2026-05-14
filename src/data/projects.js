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
      'Sitio web para inmobiliaria con catálogo de propiedades y panel de gestión para publicar inmuebles.',
    description:
      'Plataforma web completa para inmobiliaria. Catálogo público de propiedades con filtros por tipo, zona y precio. Panel de administración con CRUD de propiedades, gestión de imágenes y publicación al sitio público.',
    stack: ['PHP', 'Laravel', 'MySQL', 'jQuery', 'Bootstrap'],
    image: null,
    gallery: [],
    liveUrl: null,
    repoUrl: null,
    dateStart: '2025-06',
    dateEnd: '2025-08',
    challenges: [],
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
