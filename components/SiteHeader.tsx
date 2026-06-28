import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { labels, type Language } from '../utils/lifeline-data';
import ParticleText from './ui/particle-text-canvas';

const PANEL_W = 360;
const PANEL_H = 150;

const XGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SiteHeaderProps {
  language: Language;
  theme: 'dark' | 'light';
}

/**
 * Shared top nav. Hovering the logo/name reveals a panel that BUILDS from
 * particles (frame assembles) and then rests as a complete, solid block with
 * the name + tagline. Used by the lifeline and the writing pages.
 */
const SiteHeader: React.FC<SiteHeaderProps> = ({ language, theme }) => {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<'hidden' | 'in' | 'out'>('hidden');
  const timer = useRef<number | null>(null);

  const L = labels[language];
  const particleColor = theme === 'dark' ? '#fafafa' : '#111827';

  const openPanel = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setPanel('in');
  };
  const closePanel = () => {
    if (timer.current) clearTimeout(timer.current);
    setPanel('out');
    timer.current = window.setTimeout(() => setPanel('hidden'), 460);
  };

  const navLinkCls =
    'text-[13px] text-zinc-500 transition-colors hover:text-black dark:hover:text-white';

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
        {/* Logo + hover reveal */}
        <div className="relative" onMouseEnter={openPanel} onMouseLeave={closePanel}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-black transition-opacity hover:opacity-80 dark:text-white"
            aria-label="Home"
          >
            <img src="/logouxk.png" alt="Alan Ponce — UXKERO" className="h-5 w-auto invert dark:invert-0" />
            <span className="text-[13px] font-medium tracking-tight">Alan Ponce</span>
          </button>

          {panel !== 'hidden' && (
            <div
              className="absolute left-0 top-full z-50"
              style={{ width: PANEL_W, height: PANEL_H }}
            >
              {/* Solid block (clean border — no particle dots) */}
              <div
                className="absolute inset-0 origin-top-left rounded-xl border border-black/10 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-black/85"
                style={{
                  opacity: panel === 'in' ? 1 : 0,
                  transform: panel === 'in' ? 'scale(1)' : 'scale(0.97)',
                  transition: 'opacity 320ms ease-out, transform 320ms cubic-bezier(0.22,1,0.36,1)',
                }}
              />

              {/* Content — the name builds from particles inside the solid block */}
              <div className="relative z-10 p-4 pt-3">
                <ParticleText
                  text="ALAN PONCE"
                  color={particleColor}
                  width={324}
                  height={78}
                  fontSize={42}
                  mode={panel === 'out' ? 'disperse' : 'assemble'}
                />
                <p
                  className="mt-1 max-w-[20rem] text-[9px] font-medium uppercase leading-[1.7] tracking-[0.12em] text-zinc-500"
                  style={{
                    opacity: panel === 'in' ? 1 : 0,
                    transition: 'opacity 320ms ease-out',
                    transitionDelay: panel === 'in' ? '0.18s' : '0s',
                  }}
                >
                  {L.tagline}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <button onClick={() => navigate('/writing')} className={navLinkCls}>
            {language === 'es' ? 'Escritos' : 'Writing'}
          </button>
          <button onClick={() => navigate('/guides')} className={navLinkCls}>
            {language === 'es' ? 'Guías' : 'Guides'}
          </button>
          <a
            href="https://twitter.com/uxKero"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-black dark:hover:text-white"
            aria-label="X / Twitter"
          >
            <XGlyph className="h-4 w-4" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;
