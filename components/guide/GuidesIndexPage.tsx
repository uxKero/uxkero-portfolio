import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronLeft, Terminal } from 'lucide-react';
import './guia.css';

// ─── GUIDE REGISTRY ──────────────────────────────────────────────────────────

interface GuideInfo {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  modules: number;
  topics: number;
  level: string;
  badge?: string;
  storageKey?: string;
  moduleList?: string[];
  icon?: React.ReactNode;
}

const GUIDES: GuideInfo[] = [
  {
    slug: 'openclaw',
    title: 'OpenClaw',
    tagline: 'Build AI agents that run on WhatsApp',
    description:
      'From installing the system to shipping it to production. Every JSON field explained. Every file in the workspace mapped. The full 12-layer identity stack, skills, plugins, multi-agent routing — nothing skipped.',
    modules: 10,
    topics: 42,
    level: 'Beginner → Advanced',
    badge: 'Complete',
    storageKey: 'openclaw-guide-v2',
    moduleList: ['00 Setting Up', '01 Config File', '02 Workspace', '03 Identity Stack', '04 Conversation Flow', '05 Plugins', '06 Multi-Agent', '07 Memory', '08 Production', '09 Skills'],
    icon: <Terminal size={18} />,
  },
  {
    slug: 'openclaw-avanzado',
    title: 'Openclaw Avanzado',
    tagline: 'Security, testing, systems, pricing, and optimization',
    description:
      'Advanced OpenClaw operations built from the real source PDFs: security and privacy, orchestration, APIs, prompt engineering, skills, team workflows, testing, commercial framing, and cost control.',
    modules: 9,
    topics: 71,
    level: 'Advanced',
    badge: 'New',
    storageKey: 'openclaw-guide-2-v1',
    moduleList: ['01 Security', '02 Multi-agent', '03 APIs', '04 Prompt Engineering', '05 Skills', '06 Teams', '07 Commercial', '08 Testing', '09 Optimization'],
    icon: <BookOpen size={18} />,
  },
];

// ─── PROGRESS ────────────────────────────────────────────────────────────────

function readProgress(key?: string, total = 0): { completed: number; total: number } | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (Array.isArray(d.completedModules)) return { completed: d.completedModules.length, total: total || d.completedModules.length || 1 };
  } catch {}
  return null;
}

// ─── FICHA DE GUÍA ────────────────────────────────────────────────────────────

const GuideCard: React.FC<{ guide: GuideInfo; n: number; onOpen: () => void }> = ({ guide, n, onOpen }) => {
  const progress = readProgress(guide.storageKey, guide.modules);
  const pct = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
  const hasProgress = !!progress && progress.completed > 0;
  const modulos = guide.moduleList || [];

  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * n, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="gu-ficha"
      onClick={onOpen}
    >
      <div>
        <div className="gu-ficha__meta">
          {guide.badge && (
            <span className="gu-ficha__badge"><i />{guide.badge}</span>
          )}
          <span className="gu-eyebrow">{guide.level}</span>
        </div>

        <h2>{guide.title}</h2>
        <p className="gu-ficha__tagline">{guide.tagline}</p>
        <p className="gu-ficha__desc">{guide.description}</p>

        {modulos.length > 0 && (
          <div className="gu-ficha__modulos">
            {modulos.map((mod, i) => <span key={i}>{mod}</span>)}
          </div>
        )}

        <span className="gu-btn">
          {hasProgress ? 'Continue guide' : 'Start guide'}
          <ArrowRight size={14} />
        </span>
      </div>

      <div className="gu-ficha__der">
        <div className="gu-ficha__dato"><span>Modules</span><b>{guide.modules}</b></div>
        <div className="gu-ficha__dato"><span>Topics</span><b>{guide.topics}</b></div>
        <div className="gu-ficha__dato"><span>Quizzes</span><b>{guide.modules}</b></div>

        <div className="gu-ficha__progreso">
          <div className="gu-progreso__fila">
            <span>{hasProgress ? 'In progress' : 'Progress'}</span>
            <span>{hasProgress && progress ? `${progress.completed} / ${progress.total}` : `0 / ${guide.modules}`}</span>
          </div>
          <div className="gu-progreso__barra"><i style={{ width: `${pct}%` }} /></div>
        </div>
      </div>
    </motion.button>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const GuidesIndexPage: React.FC = () => {
  const navigate = useNavigate();

  // La página es clara: el tema oscuro del sitio no aplica.
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.background = '#f4ebdd';
    return () => { document.body.style.background = ''; };
  }, []);

  const cifras = [
    { label: 'Published', value: GUIDES.length.toString() },
    { label: 'Modules', value: GUIDES.reduce((s, g) => s + g.modules, 0).toString() },
    { label: 'Topics', value: GUIDES.reduce((s, g) => s + (g.topics || 0), 0).toString() },
  ];

  return (
    <div className="gu gu-indice">
      <div className="gu-indice__caja">
        <div className="gu-indice__top">
          <button onClick={() => navigate('/')} className="gu-link">
            <ChevronLeft size={12} /> uxkero.com
          </button>
          <span className="gu-eyebrow">Guides</span>
        </div>

        <section className="gu-indice__hero">
          <p className="gu-eyebrow">Interactive · Hands-on · Technical</p>
          <h1>Guías</h1>
          <p>Technical deep dives into the systems I build and use. Step by step, with real examples and no filler.</p>
        </section>

        <div className="gu-indice__cifras">
          {cifras.map((c) => (
            <div className="gu-indice__cifra" key={c.label}>
              <b>{c.value}</b>
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        <div className="gu-seccion">
          <span className="gu-eyebrow">01 · Published</span>
          <span className="gu-seccion__linea" />
        </div>

        {GUIDES.map((guide, i) => (
          <GuideCard key={guide.slug} guide={guide} n={i} onOpen={() => navigate(`/guides/${guide.slug}`)} />
        ))}

        <div className="gu-proximo">
          <span className="gu-eyebrow">Next guide</span>
          <span className="gu-eyebrow">Coming soon</span>
        </div>

        <footer className="gu-indice__pie">
          <button onClick={() => navigate('/')} className="gu-link">uxkero.com</button>
          <span>Alan Ponce</span>
        </footer>
      </div>
    </div>
  );
};

export default GuidesIndexPage;
