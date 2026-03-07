import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, Home } from 'lucide-react';

// ─── GUIDE REGISTRY ──────────────────────────────────────────────────────────
// Add new guides here as you publish them

interface GuideInfo {
  slug: string;
  title: string;
  description: string;
  modules: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner–Advanced';
  badge?: string;
  storageKey?: string; // localStorage key for reading progress
}

const GUIDES: GuideInfo[] = [
  {
    slug: 'openclaw',
    title: 'OpenClaw Complete Guide',
    description:
      'Everything you need to build, configure, and deploy AI agents that run on WhatsApp. From installation to production — field-by-field explanations of every config, the full identity stack, skills, plugins, and more.',
    modules: 10,
    level: 'Beginner–Advanced',
    badge: 'Complete',
    storageKey: 'openclaw-guide-v2',
  },
  // Future guides can be added here:
  // {
  //   slug: 'openclaw-advanced-patterns',
  //   title: 'OpenClaw: Advanced Patterns',
  //   description: '...',
  //   modules: 6,
  //   level: 'Advanced',
  //   badge: 'Coming soon',
  // },
];

// ─── LEVEL BADGE ─────────────────────────────────────────────────────────────

const levelColors: Record<string, string> = {
  'Beginner':           'bg-emerald-950/50 text-emerald-400 border-emerald-800/50',
  'Intermediate':       'bg-blue-950/50   text-blue-400   border-blue-800/50',
  'Advanced':           'bg-purple-950/50 text-purple-400 border-purple-800/50',
  'Beginner–Advanced':  'bg-zinc-800/60   text-zinc-300   border-zinc-700/50',
};

// ─── READ PROGRESS FROM LOCALSTORAGE ─────────────────────────────────────────

function readProgress(storageKey?: string): { completed: number; total: number } | null {
  if (!storageKey) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Array.isArray(data.completedModules)) {
      return { completed: data.completedModules.length, total: 10 };
    }
  } catch {}
  return null;
}

// ─── GUIDE CARD ──────────────────────────────────────────────────────────────

const GuideCard: React.FC<{ guide: GuideInfo; index: number; onClick: () => void }> = ({
  guide,
  index,
  onClick,
}) => {
  const progress = readProgress(guide.storageKey);
  const hasProgress = progress && progress.completed > 0;
  const pct = progress ? (progress.completed / progress.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      onClick={onClick}
      className="group cursor-pointer p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {guide.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-[10px] font-medium text-zinc-300 tracking-wide">
              {guide.badge}
            </span>
          )}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${levelColors[guide.level] || levelColors['Beginner–Advanced']}`}>
            {guide.level}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-white transition-all duration-200">
          <ArrowRight size={13} className="text-zinc-400 group-hover:text-black transition-colors" />
        </div>
      </div>

      {/* Title & description */}
      <h3 className="text-white font-semibold text-base mb-2 leading-snug group-hover:text-white transition-colors">
        {guide.title}
      </h3>
      <p className="text-zinc-500 text-xs leading-relaxed mb-5 line-clamp-3">
        {guide.description}
      </p>

      {/* Footer */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <BookOpen size={11} />
            {guide.modules} modules
          </span>
          {hasProgress && progress && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={11} />
              {progress.completed}/{progress.total} completed
            </span>
          )}
        </div>

        {/* Progress bar */}
        {hasProgress ? (
          <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : (
          <div className="h-0.5 bg-zinc-800/60 rounded-full" />
        )}
      </div>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const GuidesIndexPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen bg-[#0a0a0a] text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Back to portfolio */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors text-xs mb-12"
        >
          <Home size={12} />
          Back to portfolio
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.09] text-xs text-zinc-400 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            Interactive Guides
          </div>
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">Guides</h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
            In-depth, hands-on guides covering the systems I build and use.
            Each guide includes step-by-step content, real config examples, and module checks.
          </p>
        </motion.div>

        {/* Grid */}
        {GUIDES.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GUIDES.map((guide, i) => (
              <GuideCard
                key={guide.slug}
                guide={guide}
                index={i}
                onClick={() => navigate(`/guides/${guide.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-600 text-sm">
            No guides published yet. Check back soon.
          </div>
        )}

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-xs text-zinc-700 text-center"
        >
          More guides coming as I document the systems I work with.
        </motion.p>
      </div>
    </div>
  );
};

export default GuidesIndexPage;
