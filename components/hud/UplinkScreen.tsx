import React from 'react';
import ScrambleText from '../ui/scramble-text';
import { channels, identity, type Language } from '../../utils/hud-data';

/** 03 // UPLINK — contact channels as a comms panel. */
const UplinkScreen: React.FC<{ language: Language }> = ({ language }) => {
  const L = language;

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-8 py-10">
      <div className="w-full max-w-2xl">
        <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-600">
          <ScrambleText
            text={L === 'en' ? '> establishing uplink ... ok' : '> estableciendo enlace ... ok'}
            speed={18}
          />
        </p>
        <h2 className="mb-12 text-3xl font-bold tracking-tighter md:text-4xl">
          {L === 'en' ? "Let's talk." : 'Hablemos.'}
        </h2>

        <ul className="divide-y divide-white/10 border-y border-white/10">
          {channels.map((c) => (
            <li key={c.ch}>
              <a
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...(c.ch === '04' ? { download: true } : {})}
                className="group flex items-center justify-between gap-6 py-5 transition-colors hover:bg-white/[0.03]"
              >
                <span className="flex min-w-0 items-baseline gap-5">
                  <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-700 transition-colors group-hover:text-hud">
                    ch.{c.ch}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 sm:inline">
                    {c.label[L]}
                  </span>
                  <span className="truncate font-mono text-sm tracking-[0.04em] text-zinc-300 transition-colors group-hover:text-white md:text-base">
                    {c.value}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-700 transition-colors group-hover:text-hud">
                  [{c.external ? (L === 'en' ? 'open' : 'abrir') : c.ch === '04' ? (L === 'en' ? 'save' : 'guardar') : (L === 'en' ? 'send' : 'enviar')}]
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          {identity.status[L]} · {identity.base} · {identity.tz}
        </p>
      </div>
    </div>
  );
};

export default UplinkScreen;
