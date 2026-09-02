import React from 'react';
import { missions, commendations, type Language } from '../../utils/hud-data';

/** 02 // MISSION LOG — roles and own products as a quest log. */
const MissionLogScreen: React.FC<{ language: Language; onTimeline: () => void }> = ({
  language,
  onTimeline,
}) => {
  const L = language;

  return (
    <div className="h-full overflow-y-auto px-8 py-10 md:px-14 md:py-14">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={onTimeline}
          className="group mb-10 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:text-white"
        >
          <span className="text-zinc-800 transition-colors group-hover:text-hud">{'//'}</span>
          {L === 'en' ? 'full timeline · 1995 → 2026' : 'línea de vida · 1995 → 2026'}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>

        {/* Mission entries down a single rail */}
        <ol className="relative space-y-10 border-l border-white/10 pl-8">
          {missions.map((m) => (
            <li key={m.name} className="relative">
              {/* Node on the rail */}
              <span
                className={`absolute -left-[37px] top-1.5 h-2 w-2 ${
                  m.active ? 'bg-hud' : 'bg-zinc-700'
                } ${m.active ? 'motion-safe:animate-hud-pulse' : ''}`}
                aria-hidden
              />
              <div className="mb-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-zinc-700">
                  [{m.kind === 'role' ? (L === 'en' ? 'role' : 'rol') : (L === 'en' ? 'product' : 'producto')}]
                </span>
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-hud/80">
                  {m.status[L]}
                </span>
              </div>

              {m.url ? (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-baseline gap-2"
                >
                  <h3 className="font-mono text-base font-semibold uppercase tracking-[0.14em] text-white transition-colors group-hover:text-hud md:text-lg">
                    {m.name}
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-700 transition-colors group-hover:text-hud">
                    ↗
                  </span>
                </a>
              ) : (
                <h3 className="font-mono text-base font-semibold uppercase tracking-[0.14em] text-white md:text-lg">
                  {m.name}
                </h3>
              )}

              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                {m.org[L]}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{m.desc[L]}</p>
              {m.meta && (
                <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-zinc-600">{m.meta}</p>
              )}
            </li>
          ))}
        </ol>

        {/* Commendations */}
        <div className="mt-16">
          <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-600">
            <span className="text-hud">■</span> {L === 'en' ? 'commendations' : 'condecoraciones'}
          </p>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {commendations.map((c) => {
              const inner = (
                <span className="flex items-baseline justify-between gap-6 py-3">
                  <span className="text-sm text-zinc-300">{c.name}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                    {c.issuer} {c.url && <span className="text-zinc-700">↗</span>}
                  </span>
                </span>
              );
              return (
                <li key={c.name}>
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block transition-colors hover:bg-white/[0.03]"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MissionLogScreen;
