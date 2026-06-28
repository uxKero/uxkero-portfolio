// ─────────────────────────────────────────────────────────────────────────────
// LIFELINE DATA — life + career timeline for Alan Ponce, modeled on
// lifeline.evilrabbit.com. Sourced from his LinkedIn profile + direct input.
//
// Birth year confirmed by Alan: 1995 (exact day/month pending if wanted).
// Each event has a category — 'work' | 'study' | 'project' | 'life' — rendered
// with a colored dot + footer legend. Sparse empty years are intentional.
// Edit freely: this is the single source of truth for the timeline.
// ─────────────────────────────────────────────────────────────────────────────

export type Language = 'en' | 'es';
export type Category = 'life' | 'work' | 'study' | 'project';

/** A segment of an event sentence. `href` turns it into an inline link. */
export interface Segment {
  t: string;
  href?: string;
}

/** One event = a category + the segments that compose its sentence. */
export interface EventItem {
  kind: Category;
  parts: Segment[];
}

export interface YearEntry {
  year: number;
  /** Age at this year (derived from BIRTH_YEAR). */
  age: number;
  events: {
    en: EventItem[];
    es: EventItem[];
  };
}

const BIRTH_YEAR = 1995;
const END_YEAR = 2026;

// tiny authoring helpers
const t = (s: string, href?: string): Segment => (href ? { t: s, href } : { t: s });
const ev = (kind: Category, parts: Segment[]): EventItem => ({ kind, parts });

/** Events keyed by year. Years without an entry render as empty columns. */
const eventsByYear: Record<number, { en: EventItem[]; es: EventItem[] }> = {
  [BIRTH_YEAR]: {
    en: [ev('life', [t('I was born in Mar del Plata, Argentina.')])],
    es: [ev('life', [t('Nací en Mar del Plata, Argentina.')])],
  },
  2000: {
    en: [ev('study', [t('Started primary school.')])],
    es: [ev('study', [t('Empecé la escuela primaria.')])],
  },
  2006: {
    en: [ev('study', [t('Started secondary school.')])],
    es: [ev('study', [t('Empecé la escuela secundaria.')])],
  },
  2013: {
    en: [
      ev('work', [t('Started producing events as a freelancer — 100+ to date.')]),
      ev('work', [t('Manager at '), t('Sobremonte Matinee', 'https://www.instagram.com/complejosobremonte/'), t(' (former nightclub).')]),
    ],
    es: [
      ev('work', [t('Empecé a producir eventos como freelance — +100 hasta hoy.')]),
      ev('work', [t('Encargado de '), t('Sobremonte Matinee', 'https://www.instagram.com/complejosobremonte/'), t(' (ex discoteca).')]),
    ],
  },
  2017: {
    en: [ev('study', [t('Graduated in Strategic Marketing — '), t('EAE Barcelona', 'https://www.eaebarcelona.com/es/'), t('.')])],
    es: [ev('study', [t('Me recibí de Marketing Estratégico — '), t('EAE Barcelona', 'https://www.eaebarcelona.com/es/'), t('.')])],
  },
  2018: {
    en: [
      ev('study', [t('Graduated as a Professional Event Organizer — '), t('HILET', 'https://hilet.com/'), t('.')]),
      ev('work', [t('Started as a commercial advisor.')]),
    ],
    es: [
      ev('study', [t('Me recibí de Organizador de Eventos Profesional — '), t('HILET', 'https://hilet.com/'), t('.')]),
      ev('work', [t('Empecé como asesor comercial.')]),
    ],
  },
  2022: {
    en: [ev('work', [t('Lead Manager at MUMU Shopping — ran 3 stores in the city.')])],
    es: [ev('work', [t('Gerente Principal en MUMU Shopping — manejé 3 locales en la ciudad.')])],
  },
  2024: {
    en: [
      ev('work', [t('Pivoted into UX/UI & product design.')]),
      ev('work', [t('Went all-in on agentic AI.')]),
    ],
    es: [
      ev('work', [t('Pivoteé a diseño UX/UI y de producto.')]),
      ev('work', [t('Fui de lleno a la IA agéntica.')]),
    ],
  },
  2025: {
    en: [
      ev('work', [t('Project Manager & Product Designer at Cronos Cloud — CronosBroker, Nubeprop. (current)')]),
      ev('study', [t('Certified in UX (Google), PM (Microsoft), and AI (Anthropic).')]),
      ev('project', [t('Launched '), t('VoyBien', 'https://voybien.com.ar'), t(', a neighborhood-safety map.')]),
    ],
    es: [
      ev('work', [t('Project Manager y Product Designer en Cronos Cloud — CronosBroker, Nubeprop. (actual)')]),
      ev('study', [t('Certificado en UX (Google), PM (Microsoft) e IA (Anthropic).')]),
      ev('project', [t('Lancé '), t('VoyBien', 'https://voybien.com.ar'), t(', un mapa de seguridad barrial.')]),
    ],
  },
  2026: {
    en: [
      ev('work', [t('AI Experience Designer at '), t('Educabot', 'https://educabot.com'), t('. (current)')]),
      ev('work', [t('Internal Ops & AI Enablement at '), t('Cultura Interactiva', 'https://culturainteractiva.com'), t(' — part-time. (current)')]),
      ev('project', [t('Launched '), t('PRODEGAME', 'https://prodegame.fun'), t(' — 500+ users and paying companies.')]),
      ev('project', [t('Built '), t('Eden', 'https://eden-eve.vercel.app'), t(', a hub for Eve agents.')]),
      ev('project', [t('Released '), t('anydesign', 'https://github.com/uxKero/anydesign'), t(' — 100+ stars, in awesome-claude-skills.')]),
      ev('project', [t('Built Journeyden, an Adventure Guild app for game clubs.')]),
      ev('project', [t('Pequeños Creadores con IA — AI workshop for kids, sponsored by v0.')]),
    ],
    es: [
      ev('work', [t('AI Experience Designer en '), t('Educabot', 'https://educabot.com'), t('. (actual)')]),
      ev('work', [t('Operaciones Internas y AI Enablement en '), t('Cultura Interactiva', 'https://culturainteractiva.com'), t(' — part-time. (actual)')]),
      ev('project', [t('Lancé '), t('PRODEGAME', 'https://prodegame.fun'), t(' — +500 usuarios y empresas que contrataron.')]),
      ev('project', [t('Creé '), t('Eden', 'https://eden-eve.vercel.app'), t(', un hub de agentes Eve.')]),
      ev('project', [t('Publiqué '), t('anydesign', 'https://github.com/uxKero/anydesign'), t(' — +100 estrellas, en awesome-claude-skills.')]),
      ev('project', [t('Creé Journeyden, una app de Gremio de Aventuras para clubes de juegos.')]),
      ev('project', [t('Pequeños Creadores con IA — taller de IA para chicos, auspiciado por v0.')]),
    ],
  },
};

export const lifeline: YearEntry[] = Array.from(
  { length: END_YEAR - BIRTH_YEAR + 1 },
  (_, i) => {
    const year = BIRTH_YEAR + i;
    const e = eventsByYear[year];
    return {
      year,
      age: year - BIRTH_YEAR,
      events: { en: e?.en ?? [], es: e?.es ?? [] },
    };
  }
);

/** Dot color per category (Tailwind classes). 'life' has no dot. */
export const categoryDot: Record<Category, string> = {
  life: '',
  work: 'bg-blue-500',
  study: 'bg-pink-500',
  project: 'bg-emerald-500',
};

export const labels = {
  en: {
    age: 'AGE', years: 'YEARS', work: 'Work', study: 'Studies', project: 'Projects',
    tagline: 'DESIGNING INTELLIGENT SYSTEMS, DRIVING AI ENABLEMENT, AND SHIPPING PRODUCTS END-TO-END.',
    proficiency: 'Spanish native · English conversational',
  },
  es: {
    age: 'EDAD', years: 'AÑOS', work: 'Trabajo', study: 'Estudios', project: 'Proyectos',
    tagline: 'DISEÑO SISTEMAS INTELIGENTES, IMPULSO LA ADOPCIÓN DE IA Y ENVÍO PRODUCTOS DE PUNTA A PUNTA.',
    proficiency: 'Español nativo · Inglés conversacional',
  },
};
