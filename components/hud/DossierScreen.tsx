import React from 'react';
import ScrambleText from '../ui/scramble-text';
import { identity, dossier, channels, type Language } from '../../utils/hud-data';

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-600">
    <span className="text-hud">■</span> {children}
  </p>
);

/** 01 // DOSSIER — operator profile as a two-column intelligence file. */
const DossierScreen: React.FC<{ language: Language }> = ({ language }) => {
  const L = language;
  const cv = channels.find((c) => c.ch === '04');
  const linkedin = channels.find((c) => c.ch === '02');

  return (
    <div className="h-full overflow-y-auto px-8 py-10 md:px-14 md:py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        {/* ── Operator ── */}
        <section>
          <SectionLabel>{L === 'en' ? 'operator' : 'operador'}</SectionLabel>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            <ScrambleText text={identity.name} speed={40} />
          </h2>
          <p className="mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
            {identity.role}
          </p>

          <dl className="mt-8 space-y-2 border-l border-white/10 pl-5 font-mono text-[11px] uppercase tracking-[0.16em]">
            {[
              ['base', identity.base],
              ['tz', identity.tz],
              ['lang', identity.langs],
              [L === 'en' ? 'status' : 'estado', identity.status[L]],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-16 shrink-0 text-zinc-700">{k}</dt>
                <dd className="text-zinc-400">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em]">
            {linkedin && (
              <a
                href={linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                linkedin <span className="text-zinc-700">↗</span>
              </a>
            )}
            {cv && (
              <a href={cv.href} download className="text-zinc-500 transition-colors hover:text-white">
                {L === 'en' ? 'download cv' : 'descargar cv'} <span className="text-zinc-700">↓</span>
              </a>
            )}
          </div>
        </section>

        {/* ── Brief + loadout ── */}
        <section>
          <SectionLabel>{L === 'en' ? 'brief' : 'informe'}</SectionLabel>
          <div className="space-y-4">
            {dossier.brief[L].map((p) => (
              <p key={p.slice(0, 24)} className="max-w-xl text-sm leading-relaxed text-zinc-400">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-8 border border-hud/30 p-4">
            <p className="mb-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-hud/80">
              {L === 'en' ? 'current op' : 'operación actual'}
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">{dossier.currentOp[L]}</p>
          </div>

          <div className="mt-12">
            <SectionLabel>loadout</SectionLabel>
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              {dossier.loadout.map((cat) => (
                <div key={cat.title.en}>
                  <h3 className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300">
                    {cat.title[L]}
                  </h3>
                  <ul className="space-y-1 border-l border-white/10 pl-4">
                    {cat.items.map((item) => (
                      <li key={item} className="font-mono text-[11px] tracking-[0.06em] text-zinc-500">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DossierScreen;
