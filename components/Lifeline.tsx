import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Languages } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { lifeline, labels, categoryDot, type Language, type EventItem } from '../utils/lifeline-data';
import { useSEO } from '../utils/useSEO';
import { TargetingUI } from './ui/animated-hud-targeting-ui';
import SiteHeader from './SiteHeader';

// ── Theme helpers ─────────────────────────────────────────────────────────────
const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return 'dark';
};

// height (px) of the age+year block that sits above the rail line
const RAIL_OFFSET = 80;

// ── Render an event: category dot + a sentence made of segments (+ inline links) ─
const renderEvent = (item: EventItem, key: React.Key) => (
  <div key={key} className="flex gap-2">
    <span
      className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
        item.kind === 'life' ? 'bg-transparent' : categoryDot[item.kind]
      }`}
      aria-hidden
    />
    <p className="max-w-[17rem] text-left text-[14px] leading-[1.55] tracking-[-0.01em]">
      {item.parts.map((seg, i) =>
        seg.href ? (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="underline underline-offset-2 decoration-zinc-400/60 transition-colors hover:text-black dark:hover:text-white"
          >
            {seg.t}
          </a>
        ) : (
          <span key={i}>{seg.t}</span>
        )
      )}
    </p>
  </div>
);

const Lifeline: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);
  const [railTop, setRailTop] = useState(320); // vertical center of the scroll area
  const [focusedYear, setFocusedYear] = useState<number | null>(null);
  const [edges, setEdges] = useState({ left: false, right: true });
  const focusRaf = useRef(0);
  const focusTimer = useRef<number | null>(null);

  const L = labels[language];
  // HUD reticle color — same in both theme keys so it ignores next-themes context
  const reticleColor = theme === 'dark' ? '#38bdf8' : '#0e7490';

  // Soft, opaque-to-clear edge fades (theme-aware, eased with several stops)
  const edge = theme === 'dark' ? '0,0,0' : '255,255,255';
  const fadeLeft = `linear-gradient(to right, rgba(${edge},1) 0%, rgba(${edge},0.98) 28%, rgba(${edge},0.82) 50%, rgba(${edge},0.45) 72%, rgba(${edge},0) 100%)`;
  const fadeRight = `linear-gradient(to left, rgba(${edge},1) 0%, rgba(${edge},0.98) 28%, rgba(${edge},0.82) 50%, rgba(${edge},0.45) 72%, rgba(${edge},0) 100%)`;

  useSEO({
    title: 'Alan Ponce | AI Experience Designer & Product Lead | UXKERO',
    description:
      'A lifeline of Alan Ponce — AI Experience Designer & Product Lead. Career timeline across EdTech, real estate, and digital consultancy, designing agentic AI and shipping products end-to-end.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    type: 'website',
  });

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { window.localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);

  // Keep the rail vertically centered in the scroll area (responsive).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const compute = () => setRailTop(Math.max(RAIL_OFFSET + 24, el.clientHeight / 2));
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Track scroll position so the edge fades hide at the very start / end
  // (no fade when the first/last years are the real content on screen).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ left: el.scrollLeft > 12, right: el.scrollLeft < max - 12 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, []);

  // Reversed wheel + inertial (momentum) horizontal scroll. Scroll DOWN → back in
  // time (left); scroll UP → forward (right). Velocity decays smoothly at ~60fps,
  // so the timeline keeps gliding a moment after you stop.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let velocity = 0;
    let raf = 0;

    const tick = () => {
      velocity *= 0.975; // gentle decay → glides longer, settles softly
      el.scrollLeft += velocity;
      if (Math.abs(velocity) > 0.04) {
        raf = requestAnimationFrame(tick);
      } else {
        velocity = 0;
        raf = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      if (focusTimer.current) clearTimeout(focusTimer.current);
      setFocusedYear(null); // navigating away clears the targeting focus
      velocity += -delta * 0.26; // reversed + subtle
      velocity = Math.max(-22, Math.min(22, velocity));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const toggleLanguage = () => setLanguage((l) => (l === 'en' ? 'es' : 'en'));

  // Smoothly bring the clicked year NUMBER to the horizontal center (so it sits
  // dead-center inside the targeting reticle).
  const scrollColumnToCenter = (colEl: HTMLElement) => {
    const el = scrollRef.current;
    if (!el) return;
    const colRect = colEl.getBoundingClientRect();
    const secRect = el.getBoundingClientRect();
    const yearCenter = (colRect.left - secRect.left) + el.scrollLeft + 22; // ~center of the left-aligned year
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(max, yearCenter - el.clientWidth / 2));
    const start = el.scrollLeft;
    const dist = target - start;
    if (Math.abs(dist) < 1) return;
    const dur = 600;
    let t0: number | null = null;
    cancelAnimationFrame(focusRaf.current);
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      el.scrollLeft = start + dist * ease(p);
      if (p < 1) focusRaf.current = requestAnimationFrame(step);
    };
    focusRaf.current = requestAnimationFrame(step);
  };

  const handleYearClick = (year: number, colEl: HTMLElement) => {
    if (focusTimer.current) clearTimeout(focusTimer.current);
    if (focusedYear === year) {
      setFocusedYear(null);
      return;
    }
    setFocusedYear(year);
    scrollColumnToCenter(colEl);
    // The reticle plays its lock-on, then leaves on its own (reverse exit).
    focusTimer.current = window.setTimeout(() => setFocusedYear(null), 2800);
  };

  // Esc clears the targeting focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusedYear(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const railStyle = {
    paddingTop: railTop - RAIL_OFFSET,
    ['--lifeline-rail' as string]: `${railTop}px`,
  } as React.CSSProperties;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white text-black dark:bg-black dark:text-white font-sans">
      {/* ── NAV (shared header) ─────────────────────────────────────────── */}
      <SiteHeader language={language} theme={theme} />

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="relative flex-1 min-h-0 pt-20">
        {/* Edge fade gradients (desktop) — hidden at the very start / end so they
            never cover the first/last years, shown while there's off-screen content */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden w-[18vw] max-w-[340px] transition-opacity duration-500 md:block"
          style={{ background: fadeLeft, opacity: edges.left ? 1 : 0 }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden w-[18vw] max-w-[340px] transition-opacity duration-500 md:block"
          style={{ background: fadeRight, opacity: edges.right ? 1 : 0 }}
        />

        {/* HUD targeting reticle on the focused year */}
        <AnimatePresence>
          {focusedYear !== null && (
            <motion.div
              key="reticle"
              className="pointer-events-none absolute left-1/2 z-40 hidden md:block"
              style={{ top: railTop + 80, width: 460, height: 430, x: '-50%', y: '-50%' }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <TargetingUI
                className="h-full w-full"
                pathColors={{ light: reticleColor, dark: reticleColor }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* DESKTOP: horizontal lifeline */}
        <section
          ref={scrollRef}
          className="hidden h-full select-none overflow-x-auto overflow-y-hidden md:block [&_a]:cursor-pointer no-scrollbar"
        >
          <div className="relative flex w-max items-start pl-12 pr-6" style={railStyle}>
            {/* Dashed rail */}
            <div className="pointer-events-none absolute inset-x-0 top-[var(--lifeline-rail)] h-px overflow-hidden">
              <div className="h-px w-full border-t border-dashed border-zinc-300 dark:border-zinc-800" />
            </div>

            {/* Pinned labels column (inset from the left edge) */}
            <div className="sticky left-10 z-40 shrink-0 bg-white pr-6 dark:bg-black" style={{ width: 72 }}>
              <div className="flex flex-col items-start text-left">
                <p className="mb-5 h-4 text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-zinc-500 dark:text-zinc-600">
                  {L.age}
                </p>
                <p className="mb-6 h-5 text-[11px] font-medium uppercase leading-5 tracking-[0.08em] text-zinc-500 dark:text-zinc-600">
                  {L.years}
                </p>
              </div>
            </div>

            {/* Year columns */}
            {lifeline.map((col) => {
              const events = col.events[language];
              const hasEvents = events.length > 0;
              const focused = focusedYear === col.year;
              const dimmed = focusedYear !== null && !focused;
              return (
                <div
                  key={col.year}
                  onClick={(e) => handleYearClick(col.year, e.currentTarget)}
                  className={`group relative shrink-0 cursor-pointer pr-8 transition-opacity duration-500 ease-out ${
                    dimmed ? 'opacity-30' : 'opacity-100'
                  }`}
                  style={{ width: hasEvents ? 290 : 80 }}
                >
                  {/* Tick on the rail (80px below the column top = after age+year) */}
                  <span className="absolute left-0 top-20 z-10 h-[10px] w-px -translate-y-1/2 bg-zinc-400 transition-colors duration-300 group-hover:bg-zinc-600 dark:bg-zinc-700 dark:group-hover:bg-zinc-400" />

                  <div
                    className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: focused ? 'scale(1.12)' : 'scale(1)', transformOrigin: '50% 80px' }}
                  >
                    <div className="flex w-full flex-col items-start text-left">
                      <p className={`mb-5 h-4 text-[11px] font-medium leading-4 tabular-nums transition-colors duration-300 ${focused ? 'text-black dark:text-zinc-200' : 'text-zinc-500 group-hover:text-black dark:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                        {col.age}
                      </p>
                      <p className={`mb-6 h-5 text-[15px] font-medium leading-5 tabular-nums transition-colors duration-300 ${focused ? 'text-black dark:text-white' : 'text-zinc-500 group-hover:text-black dark:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                        {col.year}
                      </p>
                    </div>

                    <div className={`relative w-full pb-10 transition-colors duration-300 ${focused ? 'text-black dark:text-zinc-200' : 'text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-300'}`}>
                      <div className="flex w-full flex-col items-start pt-6">
                        <div className="min-h-[3.25rem] space-y-4">
                          {events.map((ev, i) => renderEvent(ev, i))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* trailing breathing room */}
            <div className="w-32 shrink-0" aria-hidden />
          </div>
        </section>

        {/* MOBILE: vertical lifeline (years with events only) */}
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-24 pt-6 md:hidden custom-scrollbar">
          {lifeline
            .filter((c) => c.events[language].length > 0)
            .map((col) => (
              <div
                key={col.year}
                className="group relative border-l border-dashed border-zinc-300 pb-10 pl-6 dark:border-zinc-800"
              >
                <span className="absolute -left-[3.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <div className="flex items-baseline gap-3">
                  <span className="text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-600">
                    {L.age} {col.age}
                  </span>
                  <span className="text-[17px] font-medium tabular-nums text-black dark:text-zinc-200">
                    {col.year}
                  </span>
                </div>
                <div className="mt-3 space-y-3 text-zinc-500 dark:text-zinc-400">
                  {col.events[language].map((ev, i) => renderEvent(ev, i))}
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-50 flex h-20 shrink-0 items-center justify-between gap-4 border-t border-black/10 bg-white px-6 dark:border-white/10 dark:bg-black">
        {/* Left controls: theme · language · proficiency */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-zinc-500 transition-colors hover:text-black dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-black dark:hover:text-white"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            <span className="text-[12px] font-medium">{language === 'en' ? 'ESP' : 'ENG'}</span>
          </button>
          <span className="hidden text-[11px] text-zinc-500 md:inline">·</span>
          <span className="hidden text-[11px] text-zinc-500 md:inline">{L.proficiency}</span>
        </div>

        {/* Category legend (absolutely centered in the footer) */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 text-[11px] text-zinc-500 sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> {L.work}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> {L.study}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {L.project}
          </span>
        </div>

        <span className="text-[13px] text-zinc-500">© 2026</span>
      </footer>
    </div>
  );
};

export default Lifeline;
