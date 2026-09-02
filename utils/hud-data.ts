// ─────────────────────────────────────────────────────────────────────────────
// HUD DATA — single source of content for the gaming-minimal home.
// All copy lives here (EN/ES); components render it, never hardcode it.
// Facts mirror utils/translations.ts but the structure is native to the
// new screens: dossier / mission log / uplink.
// ─────────────────────────────────────────────────────────────────────────────

export type Language = 'en' | 'es';

type Bi = Record<Language, string>;

export const identity = {
  name: 'ALAN PONCE',
  role: 'AI Experience Designer & Product Lead',
  base: 'Mar del Plata, AR',
  tz: 'UTC-3',
  langs: 'ES · EN',
  status: {
    en: 'available for remote/global roles',
    es: 'disponible para roles remotos/globales',
  } as Bi,
};

// ── Dossier ──────────────────────────────────────────────────────────────────

export const dossier = {
  brief: {
    en: [
      'Senior product professional with a multidisciplinary background since 2013 — UX/UI design, product management, commercial management, and AI agent development across EdTech, real estate, and digital consultancy.',
      'Specialized in agentic AI: from internal operations and AI enablement to original products — turning complex agentic technology into measurable value.',
    ],
    es: [
      'Profesional senior de producto con base multidisciplinaria desde 2013 — diseño UX/UI, product management, gestión comercial y desarrollo de agentes de IA en EdTech, real estate y consultoría digital.',
      'Especializado en IA agéntica: de operaciones internas y AI enablement a productos propios — convirtiendo tecnología agéntica compleja en valor medible.',
    ],
  },
  currentOp: {
    en: 'Bringing "Pequeños Creadores con IA" to life — an AI workshop for kids in Mar del Plata, sponsored by v0.',
    es: 'Dando vida a "Pequeños Creadores con IA" — un taller de IA para chicos en Mar del Plata, sponsoreado por v0.',
  } as Bi,
  loadout: [
    {
      title: { en: 'Product & Design', es: 'Producto y Diseño' } as Bi,
      items: ['Product strategy', 'UX/UI', 'AI experience design', 'Discovery research', 'Service design', 'Information architecture'],
    },
    {
      title: { en: 'AI & Agentic Systems', es: 'IA y Sistemas Agénticos' } as Bi,
      items: ['Prompt engineering', 'Agent behavior design', 'Multi-agent architectures', 'MCP', 'Conversational UX', 'Local AI stacks'],
    },
    {
      title: { en: 'Development', es: 'Desarrollo' } as Bi,
      items: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Python / FastAPI', 'Supabase', 'Vercel', 'Playwright'],
    },
    {
      title: { en: 'Ops & Enablement', es: 'Operaciones y Enablement' } as Bi,
      items: ['AI workflow mapping', 'Internal tooling', 'Process automation', 'Team enablement', 'WhatsApp Business'],
    },
  ],
};

// ── Mission log ──────────────────────────────────────────────────────────────

export interface Mission {
  kind: 'role' | 'product';
  status: Bi;
  active: boolean;
  name: string;
  org: Bi;
  desc: Bi;
  meta?: string;
  url?: string;
}

export const missions: Mission[] = [
  {
    kind: 'role',
    status: { en: 'active', es: 'activa' },
    active: true,
    name: 'AI Experience Designer',
    org: { en: 'Educabot · EdTech · Argentina', es: 'Educabot · EdTech · Argentina' },
    desc: {
      en: 'Experience layer of TUNI/Ada, an AI tutoring platform. Prompt engineering for tutor behavior, agent behavior design, conversational UX between AI tutor and learner.',
      es: 'Capa de experiencia de TUNI/Ada, plataforma de tutoría con IA. Prompt engineering del comportamiento del tutor, diseño de comportamiento de agentes y UX conversacional.',
    },
    url: 'https://educabot.com',
  },
  {
    kind: 'role',
    status: { en: 'active', es: 'activa' },
    active: true,
    name: 'Internal Ops & AI Enablement',
    org: { en: 'Cultura Interactiva · 20+ LATAM countries', es: 'Cultura Interactiva · +20 países LATAM' },
    desc: {
      en: 'Mapping workflows company-wide and introducing AI improvements iteratively. Built a React internal discovery tool; AI integrations matched to real operational pain, not hype.',
      es: 'Mapeo de flujos de toda la empresa e IA introducida iterativamente. Herramienta interna de discovery en React; integraciones de IA atadas a dolores reales, no al hype.',
    },
    url: 'https://culturainteractiva.com',
  },
  {
    kind: 'role',
    status: { en: 'ongoing', es: 'en curso' },
    active: true,
    name: 'Product Lead & Builder',
    org: { en: 'Independent · KeroClow', es: 'Independiente · KeroClow' },
    desc: {
      en: 'Solo product work, AI consulting and original products. Clients across EdTech, real estate and digital communication.',
      es: 'Producto en solitario, consultoría de IA y productos originales. Clientes en EdTech, real estate y comunicación digital.',
    },
  },
  {
    kind: 'product',
    status: { en: 'live', es: 'en vivo' },
    active: true,
    name: 'PRODEGAME',
    org: { en: 'Founder · Product · UX · AI-assisted dev', es: 'Founder · Producto · UX · Dev asistido por IA' },
    desc: {
      en: 'Free World Cup 2026 prediction game — 104 matches, private groups, global ranking. B2B layer runs tournaments inside company Slack workspaces. 200+ users.',
      es: 'Juego gratuito de pronósticos del Mundial 2026 — 104 partidos, grupos privados, ranking global. Capa B2B para torneos en el Slack de empresas. +200 usuarios.',
    },
    meta: 'Next.js · Vercel · Supabase',
    url: 'https://prodegame.fun',
  },
  {
    kind: 'product',
    status: { en: 'live', es: 'en vivo' },
    active: true,
    name: 'VOYBIEN',
    org: { en: 'Founder · Product · UX · Development', es: 'Founder · Producto · UX · Desarrollo' },
    desc: {
      en: 'Collaborative neighborhood safety map of Mar del Plata. Residents rate each block; route planning suggests the safest path from community input.',
      es: 'Mapa colaborativo de seguridad barrial de Mar del Plata. Los vecinos puntúan cada cuadra; el planificador sugiere el camino más seguro.',
    },
    meta: 'Next.js · MapLibre · Open data',
    url: 'https://voybien.com.ar',
  },
];

export const commendations = [
  { name: 'Enterprise Project Management', issuer: 'Microsoft · 2025', url: 'https://coursera.org/share/bedc68d91f72feae50a15a84f97b15d6' },
  { name: 'UX Design Professional', issuer: 'Google · 2025', url: 'https://coursera.org/share/98d640f2ee992c79f926de124cb17af0' },
  { name: 'AI Fluency Framework & Foundations', issuer: 'Anthropic · 2025' },
  { name: 'Claude Code in Action', issuer: 'Anthropic · 2025' },
];

// ── Uplink ───────────────────────────────────────────────────────────────────

export interface Channel {
  ch: string;
  label: Bi;
  value: string;
  href: string;
  external: boolean;
}

export const channels: Channel[] = [
  {
    ch: '01',
    label: { en: 'email', es: 'email' },
    value: 'uxkero@gmail.com',
    href: 'mailto:uxkero@gmail.com',
    external: false,
  },
  {
    ch: '02',
    label: { en: 'linkedin', es: 'linkedin' },
    value: '/in/ab-alanponce',
    href: 'https://www.linkedin.com/in/ab-alanponce/',
    external: true,
  },
  {
    ch: '03',
    label: { en: 'x / twitter', es: 'x / twitter' },
    value: '@uxKero',
    href: 'https://twitter.com/uxKero',
    external: true,
  },
  {
    ch: '04',
    label: { en: 'cv / resume', es: 'cv' },
    value: 'alan-ponce-cv.pdf',
    href: '/alan-ponce-cv%20(may-2026).pdf',
    external: false,
  },
];
