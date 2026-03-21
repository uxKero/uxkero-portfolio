import React from 'react';
import GuiaPage, {
  C,
  CL,
  H,
  LI,
  T,
  TBL,
  type CalloutKind,
  type GuidePageConfig,
  type Module,
  type Quiz,
} from './GuiaPage';
import guide2RawModules from './guia2-data';

interface RawGuide2Block {
  type: 'text' | 'code' | 'table' | 'callout' | 'list';
  content?: string;
  variant?: CalloutKind;
  lang?: string;
  code?: string;
  headers?: string[];
  rows?: string[][];
  items?: string[];
}

interface RawGuide2Step {
  title: string;
  blocks: RawGuide2Block[];
}

interface RawGuide2Section {
  title: string;
  steps: RawGuide2Step[];
}

interface RawGuide2Module {
  id: string;
  num: string;
  name: string;
  desc: string;
  sections: RawGuide2Section[];
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-');
}

function normalizeInlineHtml(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<[^>]+>/g, ''),
  ).replace(/\u00a0/g, ' ').trim();
}

function getModuleNumber(rawNum: string): string {
  const match = rawNum.match(/(\d+)/);
  return match ? match[1].padStart(2, '0') : '00';
}

function getGroup(rawId: string, lang: 'en' | 'es'): string {
  if (rawId === 'm1') return lang === 'en' ? 'Security' : 'Seguridad';
  if (['m2', 'm3', 'm4', 'm5'].includes(rawId)) return lang === 'en' ? 'Architecture' : 'Arquitectura';
  if (['m6', 'm7', 'm8'].includes(rawId)) return lang === 'en' ? 'Scale' : 'Escala';
  return lang === 'en' ? 'Optimization' : 'Optimizacion';
}

function getQuiz(rawId: string, lang: 'en' | 'es'): Quiz {
  const en = lang === 'en';
  const quizzes: Record<string, Quiz> = {
    m1: {
      question: en
        ? 'Which file should you define first so OpenClaw can follow the project security rules?'
        : 'Que archivo deberias definir primero para que OpenClaw siga las reglas de seguridad del proyecto?',
      options: [
        { id: 'a', label: 'SECURITY.md' },
        { id: 'b', label: 'TOOLS.md' },
        { id: 'c', label: '.gitconfig' },
        { id: 'd', label: 'docker-compose.yml' },
      ],
      answer: 'a',
      explanation: en
        ? 'Openclaw Avanzado starts by treating SECURITY.md as the contract that governs secrets, sensitive files, and incident handling.'
        : 'La Guia 2 arranca tratando a SECURITY.md como el contrato que gobierna secretos, archivos sensibles y manejo de incidentes.',
    },
    m2: {
      question: en
        ? 'Which pattern is explicitly listed as one of the core multi-agent architectures?'
        : 'Que patron aparece explicitamente como una de las arquitecturas base de multi-agente?',
      options: [
        { id: 'a', label: en ? 'Orchestrator with sub-agents' : 'Orquestador con subagentes' },
        { id: 'b', label: en ? 'Heartbeat with cron' : 'Heartbeat con cron' },
        { id: 'c', label: en ? 'OAuth with bearer tokens' : 'OAuth con bearer tokens' },
        { id: 'd', label: en ? 'Prompt caching with retries' : 'Prompt caching con retries' },
      ],
      answer: 'a',
      explanation: en
        ? 'The module frames orchestration plus specialized sub-agents as one of the two central patterns for collaborative agent systems.'
        : 'El modulo presenta al orquestador con subagentes especializados como uno de los dos patrones centrales para sistemas colaborativos.',
    },
    m3: {
      question: en
        ? 'What mechanism should you use when an external service must send real-time events into OpenClaw?'
        : 'Que mecanismo conviene usar cuando un servicio externo tiene que enviar eventos en tiempo real hacia OpenClaw?',
      options: [
        { id: 'a', label: 'Webhooks' },
        { id: 'b', label: 'Prompt caching' },
        { id: 'c', label: 'MEMORY.md' },
        { id: 'd', label: 'Allowlists' },
      ],
      answer: 'a',
      explanation: en
        ? 'The APIs module dedicates a full section to webhooks because they are the standard path for receiving real-time events from third-party systems.'
        : 'El modulo de APIs dedica una seccion completa a webhooks porque es la via estandar para recibir eventos en tiempo real desde sistemas externos.',
    },
    m4: {
      question: en
        ? 'Which file defines the personality and tone criteria of the agent?'
        : 'Que archivo define los criterios de personalidad y tono del agente?',
      options: [
        { id: 'a', label: 'SOUL.md' },
        { id: 'b', label: 'HEARTBEAT.md' },
        { id: 'c', label: 'PRIVACY.md' },
        { id: 'd', label: 'vercel.json' },
      ],
      answer: 'a',
      explanation: en
        ? 'This module treats SOUL.md as the place where the agent voice is intentionally designed instead of left to chance.'
        : 'Este modulo trabaja SOUL.md como el lugar donde la voz del agente se diseña a conciencia en vez de dejarla al azar.',
    },
    m5: {
      question: en
        ? 'What is the only mandatory file inside a skill folder?'
        : 'Cual es el unico archivo obligatorio dentro de una carpeta de skill?',
      options: [
        { id: 'a', label: 'SKILL.md' },
        { id: 'b', label: 'README.txt' },
        { id: 'c', label: 'package-lock.json' },
        { id: 'd', label: 'oauth.json' },
      ],
      answer: 'a',
      explanation: en
        ? 'The advanced skills module makes SKILL.md mandatory. Scripts, references, and install hooks are optional support files.'
        : 'El modulo de skills avanzados deja claro que SKILL.md es obligatorio. Scripts, referencias e instaladores son soporte opcional.',
    },
    m6: {
      question: en
        ? 'What keeps a team from stepping on each other when sharing OpenClaw?'
        : 'Que evita que un equipo se pise cuando comparte OpenClaw?',
      options: [
        { id: 'a', label: en ? 'Isolated sessions per user' : 'Sesiones aisladas por usuario' },
        { id: 'b', label: en ? 'One shared MEMORY.md for everyone' : 'Un MEMORY.md unico para todos' },
        { id: 'c', label: en ? 'Open access with no roles' : 'Acceso abierto sin roles' },
        { id: 'd', label: en ? 'Skipping onboarding' : 'Saltar el onboarding' },
      ],
      answer: 'a',
      explanation: en
        ? 'The team module centers on isolated sessions, differentiated permissions, and clean onboarding so work stays separated and secure.'
        : 'El modulo para equipos gira alrededor de sesiones aisladas, permisos diferenciados y onboarding claro para que el trabajo quede separado y seguro.',
    },
    m7: {
      question: en
        ? 'What commercial transition does the guide propose?'
        : 'Que transicion comercial propone la guia?',
      options: [
        { id: 'a', label: en ? 'From user to AI operator' : 'De usuario a operador de IA' },
        { id: 'b', label: en ? 'From designer to DBA' : 'De diseñador a DBA' },
        { id: 'c', label: en ? 'From prompts to spreadsheets only' : 'De prompts a solo planillas' },
        { id: 'd', label: en ? 'From WhatsApp to desktop only' : 'De WhatsApp a solo desktop' },
      ],
      answer: 'a',
      explanation: en
        ? 'The business module is about becoming the person who operates AI systems for real clients, not only the person who consumes them.'
        : 'El modulo de vision comercial empuja el cambio de ser usuario de herramientas a ser quien opera sistemas de IA para clientes reales.',
    },
    m8: {
      question: en
        ? 'Which native command is meant to flag risky DM policies, mixed sessions, and unsafe elevated tools?'
        : 'Que comando nativo sirve para detectar politicas de DM riesgosas, sesiones mezcladas y tools elevated inseguras?',
      options: [
        { id: 'a', label: 'openclaw doctor' },
        { id: 'b', label: 'openclaw sessions clear' },
        { id: 'c', label: 'openclaw gateway restart' },
        { id: 'd', label: 'openclaw heartbeat run' },
      ],
      answer: 'a',
      explanation: en
        ? 'The testing module uses `openclaw doctor` as the first diagnostic pass because it surfaces risky access, session, and tool configuration issues.'
        : 'El modulo de testing usa `openclaw doctor` como primera pasada de diagnostico porque expone riesgos de acceso, sesiones y configuracion de tools.',
    },
    m9: {
      question: en
        ? 'Which technique from the optimization module lowers spend when context is reused repeatedly?'
        : 'Que tecnica del modulo de optimizacion baja el gasto cuando el contexto se reutiliza muchas veces?',
      options: [
        { id: 'a', label: 'Prompt caching' },
        { id: 'b', label: 'Allowlist de numeros' },
        { id: 'c', label: 'Mas subagentes' },
        { id: 'd', label: 'HEARTBEAT_OK' },
      ],
      answer: 'a',
      explanation: en
        ? 'The final module explicitly highlights prompt caching as one of the practical levers for reducing repeated token costs.'
        : 'El modulo final destaca prompt caching como una de las palancas practicas para bajar el costo repetido de tokens.',
    },
  };

  return quizzes[rawId];
}

const rawModules = guide2RawModules as unknown as RawGuide2Module[];

const guide2Config: GuidePageConfig = {
  storageKey: 'openclaw-guide-2-v1',
  initialModuleId: `mod-${getModuleNumber(rawModules[0]?.num || '1')}`,
  getModules: (lang) => rawModules.map((rawModule): Module => ({
    id: `mod-${getModuleNumber(rawModule.num)}`,
    num: getModuleNumber(rawModule.num),
    title: rawModule.name,
    subtitle: normalizeInlineHtml(rawModule.desc),
    group: getGroup(rawModule.id, lang),
    steps: rawModule.sections.flatMap(section => section.steps.map(step => ({
      title: section.title,
      blocks: [
        ...(step.title.trim() !== section.title.trim() ? [H(step.title.trim(), 3)] : []),
        ...step.blocks.map(block => {
          switch (block.type) {
            case 'text':
              return T(normalizeInlineHtml(block.content || ''));
            case 'code':
              return C(decodeHtmlEntities(block.code || '').replace(/\r\n/g, '\n'), block.lang || 'text');
            case 'table':
              return TBL(
                (block.headers || []).map(normalizeInlineHtml),
                (block.rows || []).map(row => row.map(normalizeInlineHtml)),
              );
            case 'callout':
              return CL(block.variant || 'note', normalizeInlineHtml(block.content || ''));
            case 'list':
              return LI((block.items || []).map(normalizeInlineHtml));
            default:
              return T('');
          }
        }),
      ],
    }))),
    quiz: getQuiz(rawModule.id, lang),
  })),
  copy: {
    brandLabel: 'Openclaw Avanzado',
    guideName: {
      en: 'Openclaw Avanzado',
      es: 'Openclaw Avanzado',
    },
    welcomeBadge: {
      en: 'Advanced guide · v2',
      es: 'Guia avanzada · v2',
    },
    welcomeTitle: {
      en: 'Openclaw Avanzado',
      es: 'Openclaw Avanzado',
    },
    welcomeSubtitle: {
      en: 'Testing, systems, pricing, and real operational tradeoffs.',
      es: 'Testing, sistemas, pricing y decisiones operativas reales.',
    },
    welcomeDescription: {
      en: 'Security, multi-agent, APIs, prompt engineering, advanced skills, teams, testing, commercial framing, and cost control based on the actual source PDFs.',
      es: 'Seguridad, multi-agente, APIs, prompt engineering, skills avanzados, equipos, testing, vision comercial y control de costos basados en los PDFs reales de la Guia 2.',
    },
    completionTitle: {
      en: 'You finished Openclaw Avanzado!',
      es: 'Completaste Openclaw Avanzado!',
    },
    completionDescription: {
      en: 'You now have the full advanced layer: security, orchestration, integrations, team workflows, testing, pricing, and cost optimization.',
      es: 'Ya recorriste la capa avanzada completa: seguridad, orquestacion, integraciones, trabajo en equipo, testing, pricing y optimizacion de costos.',
    },
    supportTitle: {
      en: 'Support this advanced guide',
      es: 'Apoya esta guia avanzada',
    },
    supportDescription: {
      en: 'If this second guide helped you, a coffee helps keep the next iterations practical and current.',
      es: 'Si esta segunda guia te fue util, un cafecito ayuda a mantener las proximas iteraciones practicas y al dia.',
    },
  },
  showLanguageToggle: false,
};

const Guia2Page: React.FC = () => <GuiaPage config={guide2Config} initialLanguage="es" />;

export default Guia2Page;
