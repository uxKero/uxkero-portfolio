// ─────────────────────────────────────────────────────────────────────────────
// Contenido de la home editorial. Acá vive todo el texto, en ES y EN.
// Los hechos salen de utils/hud-data.ts.
//
// Registro del copy: español neutro, sin voseo y sin coloquialismos. Alan
// define, dirige y supervisa: la construcción es asistida por agentes, así que
// el texto nunca dice que escribe código.
// ─────────────────────────────────────────────────────────────────────────────

export type Idioma = 'es' | 'en';

export type Bi = Record<Idioma, string>;

export const IDENTIDAD = {
  nombre: 'ALAN PONCE',
  marca: 'UXKERO',
  rol: {
    es: 'AI Experience Designer y Product Lead',
    en: 'AI Experience Designer & Product Lead',
  } as Bi,
  lugar: {
    es: 'Mar del Plata, Argentina',
    en: 'Mar del Plata, Argentina',
  } as Bi,
  estado: {
    es: 'Disponible para roles remotos',
    en: 'Available for remote roles',
  } as Bi,
};

// ── Secciones ────────────────────────────────────────────────────────────────
// El orden manda: numera las secciones y arma la navegación vertical.

export interface Seccion {
  id: string;
  n: string;
  label: Bi;
}

export const SECCIONES: Seccion[] = [
  { id: 'top', n: '00', label: { es: 'Portada', en: 'Cover' } },
  { id: 'perfil', n: '01', label: { es: 'Perfil', en: 'Profile' } },
  { id: 'trabajo', n: '02', label: { es: 'Trabajo', en: 'Work' } },
  { id: 'productos', n: '03', label: { es: 'Productos', en: 'Products' } },
  { id: 'oficio', n: '04', label: { es: 'Oficio', en: 'Craft' } },
  { id: 'estudios', n: '05', label: { es: 'Estudios', en: 'Studies' } },
  { id: 'guias', n: '06', label: { es: 'Guías', en: 'Guides' } },
  { id: 'contacto', n: '07', label: { es: 'Contacto', en: 'Contact' } },
];

// ── Hero ─────────────────────────────────────────────────────────────────────

export const HERO = {
  eyebrow: {
    es: 'AI Experience Designer y Product Lead',
    en: 'AI Experience Designer & Product Lead',
  } as Bi,
  // Cada línea es una línea del titular. La marcada va en naranja.
  titular: {
    es: [
      { texto: 'DISEÑO DE PRODUCTO' },
      { texto: 'PARA SISTEMAS' },
      { texto: 'QUE DECIDEN', acento: true },
    ],
    en: [
      { texto: 'PRODUCT DESIGN' },
      { texto: 'FOR SYSTEMS' },
      { texto: 'THAT DECIDE', acento: true },
    ],
  } as Record<Idioma, { texto: string; acento?: boolean }[]>,
  bajada: {
    es: 'Producto, experiencia y construcción asistida por agentes.',
    en: 'Product, experience and agent assisted development.',
  } as Bi,
  cta: { es: 'Ver el trabajo', en: 'See the work' } as Bi,
  ctaSecundaria: { es: 'Contacto', en: 'Contact' } as Bi,
};

// ── Datos duros ──────────────────────────────────────────────────────────────

export const DATOS: { cifra: string; titulo: Bi; contexto: Bi }[] = [
  {
    cifra: '2013',
    titulo: { es: 'Diseñando producto', en: 'Designing product' },
    contexto: {
      es: 'UX, product management y gestión comercial antes de la IA.',
      en: 'UX, product management and commercial work before AI.',
    },
  },
  {
    cifra: '+20',
    titulo: { es: 'Países de Latinoamérica', en: 'Countries across Latin America' },
    contexto: {
      es: 'Alcance de la operación que acompaño hoy con IA.',
      en: 'Reach of the operation I support with AI today.',
    },
  },
  {
    cifra: '12',
    titulo: { es: 'Productos propios', en: 'Products of my own' },
    contexto: {
      es: 'Publicados y en uso, no prototipos de portfolio.',
      en: 'Shipped and in use, not portfolio prototypes.',
    },
  },
];

// ── Manifiesto ───────────────────────────────────────────────────────────────

export const MANIFIESTO = {
  titular: {
    es: ['CREAR.', 'DE LA NECESIDAD', 'AL PRODUCTO.'],
    en: ['CREATING.', 'FROM THE NEED', 'TO THE PRODUCT.'],
  } as Record<Idioma, string[]>,
  parrafos: {
    es: [
      'Hago producto. Encuentro una necesidad concreta, la entiendo hasta el fondo y la convierto en algo que existe, se usa y resuelve.',
      'Trabajo con IA porque es lo que hoy me permite llegar más lejos y más rápido, pero el oficio es el mismo de siempre: entender el problema, decidir qué se construye y sostener la calidad hasta el final.',
      'Dirijo la construcción de lo que diseño y acompaño el producto hasta producción. Lo que muestro en esta página está publicado y en uso.',
    ],
    en: [
      'I make product. I find a concrete need, understand it all the way down and turn it into something that exists, gets used and solves it.',
      'I work with AI because it is what lets me go further and faster today, but the craft is the same one as always: understand the problem, decide what gets built and hold the quality to the end.',
      'I lead the construction of what I design and take the product through to production. What I show here is published and in use.',
    ],
  } as Record<Idioma, string[]>,
  pieDeFoto: {
    es: 'Mar del Plata, Argentina. Trabajo remoto, huso UTC-3.',
    en: 'Mar del Plata, Argentina. Remote, UTC-3.',
  } as Bi,
};

// ── Trabajo ──────────────────────────────────────────────────────────────────

export interface Puesto {
  n: string;
  rol: Bi;
  org: string;
  contexto: Bi;
  estado: Bi;
  activo: boolean;
  url?: string;
}

// La sección es un listado de puestos, no un relato: rol, casa y estado.
// Lo que hago en cada uno se lee en los productos y en el perfil.
export const TRABAJO: Puesto[] = [
  {
    n: '01',
    rol: { es: 'AI Experience Designer', en: 'AI Experience Designer' },
    org: 'Educabot',
    contexto: { es: 'EdTech · Argentina', en: 'EdTech · Argentina' },
    estado: { es: 'Activo', en: 'Active' },
    activo: true,
    url: 'https://educabot.com',
  },
  {
    n: '02',
    rol: { es: 'Internal Ops y AI Enablement', en: 'Internal Ops & AI Enablement' },
    org: 'Cultura Interactiva',
    contexto: { es: 'Consultoría digital · +20 países', en: 'Digital consultancy · 20+ countries' },
    estado: { es: 'Activo', en: 'Active' },
    activo: true,
    url: 'https://culturainteractiva.com',
  },
  {
    n: '03',
    rol: { es: 'Product Lead y Diseño de Producto', en: 'Product Lead & Product Design' },
    org: 'Cronos Cloud S.A.',
    contexto: { es: 'Software para inmobiliarias', en: 'Software for real estate agencies' },
    estado: { es: 'Activo', en: 'Active' },
    activo: true,
  },
  {
    n: '04',
    rol: { es: 'Product Lead y Builder', en: 'Product Lead & Builder' },
    org: 'KeroClow',
    contexto: { es: 'Independiente', en: 'Independent' },
    estado: { es: 'En curso', en: 'Ongoing' },
    activo: true,
  },
];

// ── Productos ────────────────────────────────────────────────────────────────

export interface Producto {
  n: string;
  /** Archivo de la lámina en /editorial/proyectos. */
  slug: string;
  nombre: string;
  rol: Bi;
  estado: Bi;
  activo: boolean;
  texto: Bi;
  stack?: string;
  /** Sitio del producto. */
  url?: string;
  /** Repositorio, cuando el código es abierto. */
  gh?: string;
  /** Dato que se sostiene solo, como las estrellas de GitHub. */
  meta?: Bi;
  destacado?: 'naranja' | 'tinta';
  /** Ocupa la fila entera de la grilla. */
  ancho?: boolean;
}

export const PRODUCTOS: Producto[] = [
  {
    n: '01',
    slug: 'kerocraft',
    nombre: 'KeroCraft',
    rol: { es: 'Fundador · Producto, UX y desarrollo', en: 'Founder · Product, UX and development' },
    estado: { es: 'En vivo', en: 'Live' },
    activo: true,
    destacado: 'naranja',
    texto: {
      es: 'Un mod para Minecraft 1.21.1 que convierte una descripción escrita en una construcción de bloques. Motor de vóxeles propio: el costo se ve antes de gastar y la obra se coloca cuando convence.',
      en: 'A mod for Minecraft 1.21.1 that turns a written description into a block build. My own voxel engine: you see the cost before spending and place the build once it convinces you.',
    },
    stack: 'NeoForge · Java · Next.js',
    url: 'https://kerocraft.builders',
  },
  {
    n: '02',
    slug: 'voybien',
    nombre: 'VoyBien',
    rol: { es: 'Fundador · Producto, UX y desarrollo', en: 'Founder · Product, UX and development' },
    estado: { es: 'En vivo', en: 'Live' },
    activo: true,
    destacado: 'tinta',
    texto: {
      es: 'Seguridad urbana construida con lo que reportan los vecinos: calificación por cuadra, alertas de hechos y varias capas de mapa que se cruzan para sugerir el camino más seguro. Cubre Mar del Plata y otras localidades de la provincia.',
      en: 'Urban safety built from what neighbours report: block ratings, incident alerts and several map layers that combine into the safest route. It covers Mar del Plata and other towns in the province.',
    },
    stack: 'Next.js · MapLibre · Datos abiertos',
    url: 'https://voybien.com.ar',
  },
  {
    n: '03',
    slug: 'clow',
    nombre: 'Clow',
    rol: { es: 'Librería de componentes y sistema de diseño', en: 'Component library and design system' },
    estado: { es: 'Abierto', en: 'Open source' },
    activo: true,
    texto: {
      es: 'Más de ciento veinte componentes de React con una identidad propia de papel, tinta y sakura. Se instalan como código real con la CLI de shadcn, sobre Tailwind v4 y Base UI.',
      en: 'More than a hundred and twenty React components with an identity of their own: paper, ink and sakura. Installed as real source through the shadcn CLI, on Tailwind v4 and Base UI.',
    },
    url: 'https://clow.cards',
    gh: 'https://github.com/uxKero/clow',
  },
  {
    n: '04',
    slug: 'anydesign',
    nombre: 'anydesign',
    rol: { es: 'Skill de sistema de diseño', en: 'Design system skill' },
    estado: { es: 'Abierto', en: 'Open source' },
    activo: true,
    meta: { es: '167 estrellas en GitHub', en: '167 stars on GitHub' },
    texto: {
      es: 'Analiza una imagen, un sitio o un archivo de Figma y devuelve un design.md con el sistema de tokens, el inventario de componentes y las notas para reconstruirlo.',
      en: 'Analyses an image, a website or a Figma file and returns a design.md with the token system, the component inventory and the notes needed to rebuild it.',
    },
    gh: 'https://github.com/uxKero/anydesign',
  },
  {
    n: '05',
    slug: 'lastmemory',
    nombre: 'lastmemory',
    rol: { es: 'Memoria para agentes de código', en: 'Memory for coding agents' },
    estado: { es: 'Abierto', en: 'Open source' },
    activo: true,
    texto: {
      es: 'Memoria persistente y económica en tokens: una red de archivos markdown anclada a zonas del repositorio, con carga progresiva, olvido activo y un grafo que funciona sin conexión.',
      en: 'Persistent, token efficient memory: a network of markdown files anchored to repo zones, with progressive loading, active forgetting and a graph that works offline.',
    },
    gh: 'https://github.com/uxKero/lastmemory',
  },
  {
    n: '06',
    slug: 'elcubil',
    nombre: 'El Cubil',
    rol: { es: 'Producto, UX y desarrollo', en: 'Product, UX and development' },
    estado: { es: 'En vivo', en: 'Live' },
    activo: true,
    texto: {
      es: 'El gremio de aventureros de un club real, hecho aplicación. Se crea un personaje, se juegan aventuras de rol con combate por turnos, se sube de nivel y los logros se canjean por premios reales del club.',
      en: 'The adventurers guild of a real club, turned into an app. You create a character, play role playing adventures with turn based combat, level up, and trade achievements for real prizes at the club.',
    },
    url: 'https://elcubil.fun',
  },
  {
    n: '07',
    slug: 'saga',
    nombre: 'SAGA',
    rol: { es: 'Skill de descubribilidad', en: 'Discoverability skill' },
    estado: { es: 'Abierto', en: 'Open source' },
    activo: true,
    texto: {
      es: 'Hace que cualquier entidad sea encontrable en las búsquedas, descrita con precisión por una IA y segura de usar. Funciona en Claude, ChatGPT, Gemini y cualquier asistente.',
      en: 'Makes any entity findable in search, described accurately by AI and safe to act on. Works in Claude, ChatGPT, Gemini and any assistant.',
    },
    gh: 'https://github.com/uxKero/optimize-search-answers-agents',
  },
  {
    n: '08',
    slug: 'clawdows',
    nombre: 'clawdows',
    rol: { es: 'Aplicación de escritorio', en: 'Desktop app' },
    estado: { es: 'Abierto', en: 'Open source' },
    activo: true,
    texto: {
      es: 'Indicador de estado en la bandeja de Windows para Claude Code. Clawd, el cangrejo, camina mientras el agente trabaja. Nativo en C# con .NET AOT.',
      en: 'A system tray status indicator for Claude Code on Windows. Clawd the crab walks while the agent works. Native C# with .NET AOT.',
    },
    gh: 'https://github.com/uxKero/clawdows',
  },
  {
    n: '09',
    slug: 'pokialert',
    nombre: 'PokiAlert',
    rol: { es: 'Producto y UX', en: 'Product and UX' },
    estado: { es: 'Prototipo', en: 'Prototype' },
    activo: true,
    texto: {
      es: 'Plataforma escolar para reportar, prevenir y acompañar situaciones de bullying, pensada con escuelas de Mar del Plata.',
      en: 'A school platform to report, prevent and follow up on bullying, designed with schools in Mar del Plata.',
    },
  },
  {
    n: '10',
    slug: 'afondo',
    nombre: 'A Fondo',
    rol: { es: 'Simulador de carrera deportiva', en: 'Career simulator' },
    estado: { es: 'En desarrollo', en: 'In progress' },
    activo: true,
    texto: {
      es: 'Una carrera completa de piloto, del karting a la Fórmula 1, con el techo que imponga cada butaca.',
      en: 'A full driver career, from karting to Formula 1, with the ceiling each seat imposes.',
    },
    url: 'https://afondo.run',
  },
  {
    n: '11',
    slug: 'kanau',
    nombre: 'Kanau',
    rol: { es: 'Citas y vida nocturna', en: 'Dating and nightlife' },
    estado: { es: 'En desarrollo', en: 'In progress' },
    activo: true,
    texto: {
      es: 'Qué fiesta hay esta noche, quién confirmó que va y con quién hay coincidencia. Las citas quedan atadas a lo que efectivamente abre hoy.',
      en: 'What is on tonight, who said they are going and who you match with. Dating tied to what is actually open today.',
    },
  },
  {
    n: '12',
    slug: 'prodegame',
    nombre: 'PRODEGAME',
    rol: { es: 'Fundador · Producto, UX y desarrollo', en: 'Founder · Product, UX and development' },
    estado: { es: 'Finalizado', en: 'Finished' },
    activo: false,
    ancho: true,
    meta: { es: '565 jugadores hasta la final', en: '565 players through to the final' },
    texto: {
      es: 'Juego de pronósticos del Mundial 2026: 104 partidos, grupos privados, ranking global y una capa B2B para torneos internos de empresas. Cerró junto con el torneo y la tabla final quedó publicada. Un producto con fecha de vencimiento desde el día uno, que es una forma distinta de diseñar.',
      en: 'A World Cup 2026 prediction game: 104 matches, private groups, a global ranking and a B2B layer for company tournaments. It closed with the tournament and the final table stayed online. A product with an expiry date from day one, which is a different way to design.',
    },
    url: 'https://prodegame.fun',
  },
];


// ── Oficio ───────────────────────────────────────────────────────────────────

export const OFICIO: { titulo: Bi; items: Bi[] }[] = [
  {
    titulo: { es: 'Producto y diseño', en: 'Product and design' },
    items: [
      { es: 'Estrategia de producto', en: 'Product strategy' },
      { es: 'UX / UI', en: 'UX / UI' },
      { es: 'AI experience design', en: 'AI experience design' },
      { es: 'Discovery', en: 'Discovery' },
      { es: 'Service design', en: 'Service design' },
      { es: 'Arquitectura de información', en: 'Information architecture' },
    ],
  },
  {
    titulo: { es: 'IA y sistemas agénticos', en: 'AI and agentic systems' },
    items: [
      { es: 'Prompt engineering', en: 'Prompt engineering' },
      { es: 'Comportamiento de agentes', en: 'Agent behaviour design' },
      { es: 'Arquitecturas multi agente', en: 'Multi agent architectures' },
      { es: 'MCP', en: 'MCP' },
      { es: 'UX conversacional', en: 'Conversational UX' },
      { es: 'Stacks de IA locales', en: 'Local AI stacks' },
    ],
  },
  {
    titulo: { es: 'Construcción', en: 'Delivery' },
    items: [
      { es: 'Next.js', en: 'Next.js' },
      { es: 'React', en: 'React' },
      { es: 'TypeScript', en: 'TypeScript' },
      { es: 'Tailwind', en: 'Tailwind' },
      { es: 'Python / FastAPI', en: 'Python / FastAPI' },
      { es: 'Supabase', en: 'Supabase' },
      { es: 'Vercel', en: 'Vercel' },
      { es: 'Playwright', en: 'Playwright' },
    ],
  },
  {
    titulo: { es: 'Operaciones y enablement', en: 'Ops and enablement' },
    items: [
      { es: 'Mapeo de flujos con IA', en: 'AI workflow mapping' },
      { es: 'Herramientas internas', en: 'Internal tooling' },
      { es: 'Automatización de procesos', en: 'Process automation' },
      { es: 'Habilitación de equipos', en: 'Team enablement' },
      { es: 'WhatsApp Business', en: 'WhatsApp Business' },
    ],
  },
];

export const CERTIFICACIONES: { nombre: string; casa: string; anio: string; url?: string }[] = [
  {
    nombre: 'Enterprise Project Management',
    casa: 'Microsoft',
    anio: '2025',
    url: 'https://coursera.org/share/bedc68d91f72feae50a15a84f97b15d6',
  },
  {
    nombre: 'UX Design Professional',
    casa: 'Google',
    anio: '2025',
    url: 'https://coursera.org/share/98d640f2ee992c79f926de124cb17af0',
  },
  { nombre: 'AI Fluency Framework & Foundations', casa: 'Anthropic', anio: '2025' },
  { nombre: 'Claude Code in Action', casa: 'Anthropic', anio: '2025' },
];

// ── Guías ────────────────────────────────────────────────────────────────────

export const GUIAS: { href: string; titulo: string; texto: Bi; meta: Bi }[] = [
  {
    href: '/guides/openclaw',
    titulo: 'OpenClaw',
    texto: {
      es: 'Agentes de IA en WhatsApp: instalación, workspace, identidad, memoria y skills.',
      en: 'AI agents on WhatsApp: install, workspace, identity, memory and skills.',
    },
    meta: { es: '10 módulos', en: '10 modules' },
  },
  {
    href: '/guides/openclaw-avanzado',
    titulo: 'OpenClaw Avanzado',
    texto: {
      es: 'Seguridad, arquitecturas multi agente, APIs, prompt engineering, testing y operación real.',
      en: 'Security, multi agent architectures, APIs, prompt engineering, testing and real operation.',
    },
    meta: { es: '9 módulos', en: '9 modules' },
  },
];

// ── Contacto ─────────────────────────────────────────────────────────────────

export const CONTACTO = {
  titular: {
    es: ['¿EMPEZAMOS EL', 'PRÓXIMO PRODUCTO?'],
    en: ['SHALL WE START', 'THE NEXT PRODUCT?'],
  } as Record<Idioma, string[]>,
  bajada: {
    es: 'Si hay una necesidad sin un producto que la resuelva, ese es el punto de partida. Respondo todos los mensajes.',
    en: 'If there is a need with no product solving it, that is the starting point. I answer every message.',
  } as Bi,
  email: 'uxkero@gmail.com',
  enlaces: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ab-alanponce/', externo: true },
    { label: 'X / @uxKero', href: 'https://twitter.com/uxKero', externo: true },
    { label: 'GitHub', href: 'https://github.com/uxKero', externo: true },
    { label: 'CV', href: '/alan-ponce-cv%20(may-2026).pdf', externo: false },
  ],
};
