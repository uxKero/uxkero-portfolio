import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, BookOpen, CheckCircle2, Layers, Zap, Terminal } from 'lucide-react';

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
    title: 'OpenClaw Guide 2',
    tagline: 'Security, systems, pricing, and optimization',
    description:
      'Advanced OpenClaw operations built from the real Guide 2 modules: security and privacy, orchestration, APIs, prompt engineering, skills, team workflows, commercial framing, and cost control.',
    modules: 8,
    topics: 64,
    level: 'Advanced',
    badge: 'New',
    storageKey: 'openclaw-guide-2-v1',
    moduleList: ['01 Security', '02 Multi-agent', '03 APIs', '04 Prompt Engineering', '05 Skills', '06 Teams', '07 Commercial', '09 Optimization'],
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

// ─── FEATURED CARD ────────────────────────────────────────────────────────────

const FeaturedCard: React.FC<{ guide: GuideInfo; onOpen: () => void }> = ({ guide, onOpen }) => {
  const progress = readProgress(guide.storageKey, guide.modules);
  const pct = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
  const hasProgress = !!progress && progress.completed > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="relative group cursor-pointer"
      onClick={onOpen}
    >
      {/* Glow ring on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative rounded-2xl border border-white/[0.09] bg-[#0f0f0f] overflow-hidden">

        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Left: Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-6">
                {guide.badge && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/[0.12] text-[11px] font-medium text-zinc-200 tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {guide.badge}
                  </span>
                )}
                <span className="text-[11px] text-zinc-600 font-mono">{guide.level}</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2 leading-none">
                {guide.title}
              </h2>
              <p className="text-base text-zinc-400 font-light mb-5">{guide.tagline}</p>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mb-8">{guide.description}</p>

              {/* Module preview chips */}
              <div className="flex flex-wrap gap-2 mb-8">
                {(guide.moduleList || []).slice(0, 6).map((mod, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[11px] text-zinc-500 font-mono hover:text-zinc-300 transition-colors">
                    {mod}
                  </span>
                ))}
                {(guide.moduleList || []).length > 6 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px] text-zinc-600 font-mono">
                    +{(guide.moduleList || []).length - 6} more
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={onOpen}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors group/btn"
              >
                {hasProgress ? 'Continue guide' : 'Start guide'}
                <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Right: Stats + Progress */}
            <div className="lg:w-[200px] shrink-0 flex flex-row lg:flex-col gap-4 lg:gap-5">

              {/* Stats */}
              <div className="flex-1 lg:flex-none space-y-4">
                {[
                  { icon: <Layers size={13} />, label: 'Modules', value: guide.modules },
                  { icon: <BookOpen size={13} />, label: 'Topics', value: `${guide.topics}+` },
                  { icon: <Zap size={13} />, label: 'Quizzes', value: guide.modules },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between lg:flex-col lg:items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-zinc-500">
                      {stat.icon}
                      <span className="text-[11px]">{stat.label}</span>
                    </div>
                    <span className="text-xl font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {hasProgress && progress ? (
                <div className="flex-1 lg:flex-none p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span className="text-[11px] text-emerald-400 font-medium">In progress</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{pct}%</div>
                  <div className="text-[11px] text-zinc-500 mb-3">{progress.completed} / {progress.total} modules</div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 lg:flex-none p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[11px] text-zinc-600 mb-2">Progress</div>
                  <div className="h-1 bg-zinc-800 rounded-full mb-2" />
                  <div className="text-[11px] text-zinc-700">Not started yet</div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>
    </motion.div>
  );
};

// ─── COMING SOON CARD ─────────────────────────────────────────────────────────

const ComingSoonCard: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35 + index * 0.05 }}
    className="rounded-xl border border-white/[0.05] bg-[#0c0c0c] p-6 flex items-center gap-4"
  >
    <div className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center shrink-0">
      <div className="w-3 h-px bg-zinc-700 rounded" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="h-2.5 w-24 rounded bg-zinc-800 mb-2" />
      <div className="h-2 w-40 rounded bg-zinc-900" />
    </div>
    <span className="text-[10px] text-zinc-700 font-mono shrink-0">Coming soon</span>
  </motion.div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const GuidesIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const featured = GUIDES[0];
  const moreGuides = GUIDES.slice(1);

  return (
    <div
      className="min-h-screen bg-[#080808] text-white relative overflow-x-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-6 mb-2"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors text-xs"
          >
            <ChevronLeft size={13} />
            uxkero.com
          </button>
          <span className="text-[11px] font-mono text-zinc-700 tracking-widest uppercase">Guides</span>
        </motion.nav>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="pt-10 pb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-500 mb-8 font-mono tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            Interactive · Hands-on · Technical
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-none mb-6">
            Guides.
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-lg leading-relaxed font-light">
            Technical deep-dives into the systems I build and use.
            Step-by-step, with real examples — no fluff.
          </p>
        </motion.section>

        {/* Divider with stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-6 py-5 border-t border-b border-white/[0.06] mb-10"
        >
          {[
            { label: 'Published', value: GUIDES.length.toString() },
            { label: 'Modules', value: GUIDES.reduce((s, g) => s + g.modules, 0).toString() },
            { label: 'Topics', value: `${GUIDES.reduce((s, g) => s + (g.topics || 0), 0)}+` },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              <div className="text-center">
                <div className="text-2xl font-semibold text-white">{item.value}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">{item.label}</div>
              </div>
              {i < 2 && <div className="h-8 w-px bg-white/[0.07]" />}
            </React.Fragment>
          ))}
          <div className="ml-auto text-[11px] text-zinc-700 font-mono">More on the way</div>
        </motion.div>

        {/* Featured guide */}
        {featured && (
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Featured</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </motion.div>
            <FeaturedCard guide={featured} onOpen={() => navigate(`/guides/${featured.slug}`)} />
          </div>
        )}

        {/* More guides */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-widest">More guides</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </motion.div>
          <div className="space-y-3">
            {moreGuides.map((guide) => (
              <FeaturedCard key={guide.slug} guide={guide} onOpen={() => navigate(`/guides/${guide.slug}`)} />
            ))}
            <ComingSoonCard index={moreGuides.length} />
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t border-white/[0.05] py-8 flex items-center justify-between"
        >
          <button onClick={() => navigate('/')} className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">
            ← uxkero.com
          </button>
          <span className="text-[11px] text-zinc-800 font-mono">Alan Ponce</span>
        </motion.footer>

      </div>
    </div>
  );
};

export default GuidesIndexPage;
