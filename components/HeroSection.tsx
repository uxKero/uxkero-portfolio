import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HudBrackets from './ui/hud-brackets';
import ScrambleText from './ui/scramble-text';
import LockOn from './hud/LockOn';
import DossierScreen from './hud/DossierScreen';
import MissionLogScreen from './hud/MissionLogScreen';
import UplinkScreen from './hud/UplinkScreen';
import { identity, type Language } from '../utils/hud-data';
import { useSEO } from '../utils/useSEO';

type ScreenId = 'dossier' | 'missions' | 'uplink';

interface MenuItem {
  num: string;
  label: (lang: Language) => string;
  desc: (lang: Language) => string;
  screen?: ScreenId;
  route?: string;
}

const MENU: MenuItem[] = [
  {
    num: '01',
    label: (l) => (l === 'en' ? 'Dossier' : 'Dossier'),
    desc: (l) =>
      l === 'en'
        ? 'Operator profile: brief, loadout, current op.'
        : 'Perfil del operador: informe, loadout, operación actual.',
    screen: 'dossier',
  },
  {
    num: '02',
    label: (l) => (l === 'en' ? 'Mission log' : 'Bitácora'),
    desc: (l) =>
      l === 'en'
        ? 'Roles, own products and commendations.'
        : 'Roles, productos propios y condecoraciones.',
    screen: 'missions',
  },
  {
    num: '03',
    label: (l) => (l === 'en' ? 'Uplink' : 'Enlace'),
    desc: (l) => (l === 'en' ? 'Open channels — email, LinkedIn, X, CV.' : 'Canales abiertos — email, LinkedIn, X, CV.'),
    screen: 'uplink',
  },
  {
    num: '04',
    label: (l) => (l === 'en' ? 'Writing' : 'Escritos'),
    desc: (l) => (l === 'en' ? 'Essays and notes on AI, UX and product.' : 'Ensayos y notas sobre IA, UX y producto.'),
    route: '/writing',
  },
  {
    num: '05',
    label: (l) => (l === 'en' ? 'Guides' : 'Guías'),
    desc: (l) => (l === 'en' ? 'Interactive courses — OpenClaw I & II.' : 'Cursos interactivos — OpenClaw I y II.'),
    route: '/guides',
  },
  {
    num: '06',
    label: (l) => (l === 'en' ? 'Lifeline' : 'Línea de vida'),
    desc: (l) => (l === 'en' ? '1995 → 2026, year by year.' : '1995 → 2026, año por año.'),
    route: '/lifeline',
  },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bootLines = (lang: Language) => [
  'sys.uxkero // boot v2.0',
  lang === 'en' ? 'profile: alan ponce ... ok' : 'perfil: alan ponce ... ok',
  `loc: ${identity.base.toLowerCase()} · ${identity.tz.toLowerCase()}`,
  `status: ${identity.status[lang]}`,
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const [selected, setSelected] = useState(0);
  const [openScreen, setOpenScreen] = useState<ScreenId | null>(null);
  const [lockOn, setLockOn] = useState(false);
  const [booted, setBooted] = useState(false);
  const lockTimer = useRef<number | null>(null);

  useSEO({
    title: 'Alan Ponce | AI Experience Designer & Product Lead | UXKERO',
    description:
      'AI Experience Designer & Product Lead specializing in agentic AI. Designing intelligent systems, driving AI enablement, and shipping products end-to-end across EdTech, real estate, and digital consultancy.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    type: 'website',
  });

  useEffect(() => {
    const id = window.setTimeout(() => setBooted(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  const activate = useCallback(
    (index: number) => {
      const item = MENU[index];
      setSelected(index);
      if (item.route) {
        navigate(item.route);
        return;
      }
      if (item.screen) {
        setOpenScreen(item.screen);
        if (!prefersReducedMotion()) {
          if (lockTimer.current) window.clearTimeout(lockTimer.current);
          setLockOn(true);
          lockTimer.current = window.setTimeout(() => setLockOn(false), 900);
        }
      }
    },
    [navigate]
  );

  // Game-menu keys: ↑/↓ move, Enter select, Esc close screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openScreen) {
        if (e.key === 'Escape') setOpenScreen(null);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => (s + (e.key === 'ArrowDown' ? 1 : MENU.length - 1)) % MENU.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        activate(selected);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openScreen, selected, activate]);

  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  const current = MENU[selected];
  const openItem = openScreen ? MENU.find((m) => m.screen === openScreen) : null;

  const bootLine = (i: number) => ({
    opacity: booted ? 1 : 0,
    transform: booted ? 'translateY(0)' : 'translateY(4px)',
    transition: `opacity 400ms ease-out ${200 + i * 180}ms, transform 400ms ease-out ${200 + i * 180}ms`,
  });

  return (
    <div className="dark relative h-screen w-full overflow-hidden bg-black font-sans text-white">
      {/* Faint grid field */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_60%,transparent_100%)]"
        aria-hidden
      />

      {/* Viewport HUD frame */}
      <HudBrackets inset="inset-4 md:inset-6" size="w-5 h-5" className="z-10 text-zinc-700" />

      {/* Top-left: logo + boot readout */}
      <div className="absolute left-8 top-8 z-20 md:left-12 md:top-10">
        <img src="/logouxk.png" alt="UXKERO" className="mb-4 h-5 w-auto opacity-90" />
        <div className="space-y-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
          {bootLines(language).map((line, i) => (
            <p key={line} style={bootLine(i)}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Top-right: coordinates */}
      <div
        className="absolute right-8 top-8 z-20 hidden text-right font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-700 md:right-12 md:top-10 md:block"
        style={bootLine(2)}
      >
        <p>38.0055° S</p>
        <p>57.5426° W</p>
        <p className="mt-2 text-zinc-800">mdq // ar</p>
      </div>

      {/* ===== Main menu ===== */}
      <main className="relative z-20 mx-auto flex h-full w-full max-w-6xl items-center px-8 pb-16 pt-24 md:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_minmax(280px,360px)] lg:gap-20">
          <div>
            <h1 className="mb-1 text-4xl font-bold leading-none tracking-tighter md:text-6xl xl:text-7xl">
              <ScrambleText text={identity.name} delay={250} speed={55} />
            </h1>
            <p className="mb-10 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500 md:mb-14 md:text-xs">
              <ScrambleText text={identity.role} delay={800} speed={12} />
            </p>

            <nav aria-label="Main menu">
              <ul className="space-y-1">
                {MENU.map((item, i) => {
                  const isSel = i === selected;
                  return (
                    <li key={item.num}>
                      <button
                        onMouseEnter={() => setSelected(i)}
                        onClick={() => activate(i)}
                        className={`group flex w-full cursor-crosshair items-center gap-4 py-2 text-left font-mono text-sm uppercase tracking-[0.25em] transition-colors duration-200 md:text-base ${
                          isSel ? 'text-white' : 'text-zinc-600'
                        }`}
                        style={bootLine(3 + i * 0.4)}
                      >
                        <span
                          className={`w-3 shrink-0 text-hud transition-opacity duration-150 ${
                            isSel ? 'opacity-100 motion-safe:animate-hud-pulse' : 'opacity-0'
                          }`}
                          aria-hidden
                        >
                          &gt;
                        </span>
                        <span
                          className={`text-[10px] tracking-[0.2em] transition-colors ${
                            isSel ? 'text-hud' : 'text-zinc-700'
                          }`}
                        >
                          {item.num}
                        </span>
                        {item.label(language)}
                        {item.route && (
                          <span className="text-[10px] text-zinc-700 transition-colors group-hover:text-zinc-500">
                            ↗
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <p
              className="mt-10 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700 md:block"
              style={bootLine(6)}
            >
              ↑↓ {language === 'en' ? 'navigate' : 'navegar'} · ↵ {language === 'en' ? 'select' : 'elegir'} · esc{' '}
              {language === 'en' ? 'back' : 'volver'}
            </p>
          </div>

          {/* Target preview */}
          <aside className="relative hidden border border-white/10 p-6 lg:block" style={bootLine(5)}>
            <HudBrackets inset="inset-1.5" size="w-2.5 h-2.5" className="text-hud/60" />
            <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
              {language === 'en' ? 'target' : 'objetivo'} <span className="text-zinc-800">{'//'}</span>{' '}
              <span className="text-zinc-400">{current.num}</span>
            </p>
            <p className="mb-3 font-mono text-lg uppercase tracking-[0.2em] text-white">
              <ScrambleText key={`${selected}-${language}`} text={current.label(language)} speed={28} />
            </p>
            <p className="min-h-[3.2rem] text-sm leading-relaxed text-zinc-500">{current.desc(language)}</p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
              {current.route
                ? language === 'en'
                  ? 'external screen'
                  : 'pantalla externa'
                : language === 'en'
                  ? 'press enter'
                  : 'presioná enter'}{' '}
              <span className="text-hud">↵</span>
            </p>
          </aside>
        </div>
      </main>

      {/* ===== Screen overlay ===== */}
      {openScreen && openItem && (
        <div className="absolute inset-x-0 bottom-9 top-0 z-40 flex flex-col bg-black">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
            <p>
              {openItem.num} <span className="text-zinc-800">{'//'}</span> {openItem.label(language)}
            </p>
            <button onClick={() => setOpenScreen(null)} className="uppercase transition-colors hover:text-white">
              [esc] {language === 'en' ? 'close' : 'cerrar'}
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <HudBrackets className="pointer-events-none z-40 text-hud/50" />
            {lockOn && (
              <div
                className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center motion-reduce:hidden"
                aria-hidden
              >
                <LockOn />
              </div>
            )}

            {openScreen === 'dossier' && <DossierScreen language={language} />}
            {openScreen === 'missions' && (
              <MissionLogScreen language={language} onTimeline={() => navigate('/lifeline')} />
            )}
            {openScreen === 'uplink' && <UplinkScreen language={language} />}
          </div>
        </div>
      )}

      {/* ===== Status strip ===== */}
      <footer className="absolute inset-x-0 bottom-0 z-50 flex h-9 items-center justify-between border-t border-white/10 bg-black/80 px-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-hud motion-safe:animate-hud-pulse" aria-hidden />
          <span className="hidden sm:inline">sys.uxkero</span>
          <span className="hidden sm:inline text-zinc-800">{'//'}</span>
          <span>status: online</span>
        </div>
        <div className="flex items-center gap-5 md:gap-8">
          <button onClick={toggleLanguage} className="uppercase transition-colors hover:text-white">
            {language === 'en' ? 'ES' : 'EN'}
          </button>
          <a
            href="https://twitter.com/uxKero"
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase transition-colors hover:text-white"
          >
            @uxkero
          </a>
          <span className="hidden sm:inline">© 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default HeroSection;
