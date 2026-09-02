import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { identity, dossier, missions, commendations, channels, type Language } from '../utils/hud-data';
import { useSEO } from '../utils/useSEO';

// ─────────────────────────────────────────────────────────────────────────────
// Minimal light home — warm paper, Instrument Serif display, Inter body,
// one centered column, hairline rules, no dark mode, no ornament.
// Content comes from utils/hud-data.ts; guides are the only featured pages.
// ─────────────────────────────────────────────────────────────────────────────

const PAPER = 'bg-[#FAF9F6]';
const INK = 'text-[#1C1B1A]';
const MUTED = 'text-[#8A8782]';
const RULE = 'border-[#E7E4DE]';
const ACCENT_HOVER = 'hover:text-[#B4540A]';

const guides = (l: Language) => [
  {
    href: '/guides/openclaw',
    title: 'OpenClaw',
    desc:
      l === 'en'
        ? 'AI agents on WhatsApp — installation, workspace, identity, memory and skills. 10 modules.'
        : 'Agentes de IA en WhatsApp — instalación, workspace, identidad, memoria y skills. 10 módulos.',
  },
  {
    href: '/guides/openclaw-avanzado',
    title: 'OpenClaw Avanzado',
    desc:
      l === 'en'
        ? 'Security, multi-agent, APIs, prompt engineering, testing and real operations. 9 modules.'
        : 'Seguridad, multi-agente, APIs, prompt engineering, testing y operación real. 9 módulos.',
  },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className={`mb-8 text-[11px] font-medium uppercase tracking-[0.18em] ${MUTED}`}>{children}</h2>
);

const MinimalHome: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const L = language;

  useSEO({
    title: 'Alan Ponce | AI Experience Designer & Product Lead | UXKERO',
    description:
      'AI Experience Designer & Product Lead specializing in agentic AI. Designing intelligent systems, driving AI enablement, and shipping products end-to-end across EdTech, real estate, and digital consultancy.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    type: 'website',
  });

  const roles = missions.filter((m) => m.kind === 'role');
  const products = missions.filter((m) => m.kind === 'product');
  const email = channels.find((c) => c.ch === '01');
  const linkedin = channels.find((c) => c.ch === '02');
  const x = channels.find((c) => c.ch === '03');
  const cv = channels.find((c) => c.ch === '04');

  const linkCls = `underline decoration-[#D8D4CC] decoration-1 underline-offset-4 transition-colors ${ACCENT_HOVER}`;

  return (
    <div className={`min-h-screen w-full ${PAPER} ${INK} font-sans antialiased`}>
      <div className="mx-auto max-w-[660px] px-6 py-10 md:py-14">
        {/* ── Header ── */}
        <header className="mb-24 flex items-baseline justify-between md:mb-32">
          <span className="text-[15px] font-medium tracking-tight">Alan Ponce</span>
          <nav className={`flex items-baseline gap-6 text-[13px] ${MUTED}`}>
            <button onClick={() => navigate('/guides')} className={`transition-colors ${ACCENT_HOVER}`}>
              {L === 'en' ? 'Guides' : 'Guías'}
            </button>
            <button
              onClick={() => setLanguage(L === 'en' ? 'es' : 'en')}
              className={`transition-colors ${ACCENT_HOVER}`}
              aria-label="Switch language"
            >
              {L === 'en' ? 'ES' : 'EN'}
            </button>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section className="mb-24 md:mb-32">
          <h1 className="font-serif text-[44px] leading-[1.08] md:text-[58px]">
            {L === 'en' ? (
              <>
                AI experience designer
                <br />& product lead<span className="text-[#B4540A]">.</span>
              </>
            ) : (
              <>
                Diseñador de experiencias de IA
                <br />y líder de producto<span className="text-[#B4540A]">.</span>
              </>
            )}
          </h1>
          <p className={`mt-8 max-w-[52ch] text-[16px] leading-[1.7] ${MUTED}`}>
            {dossier.brief[L][1]}
          </p>
          <p className={`mt-4 text-[14px] leading-[1.7] ${MUTED}`}>
            {identity.base} · {identity.status[L]}
          </p>
        </section>

        {/* ── Now ── */}
        <section className={`mb-24 border-t ${RULE} pt-10 md:mb-32`}>
          <Label>{L === 'en' ? 'Now' : 'Ahora'}</Label>
          <p className="font-serif text-[22px] leading-[1.45] md:text-[24px]">{dossier.currentOp[L]}</p>
        </section>

        {/* ── Products ── */}
        <section className={`mb-24 border-t ${RULE} pt-10 md:mb-32`}>
          <Label>{L === 'en' ? 'Products' : 'Productos'}</Label>
          <div className="space-y-12">
            {products.map((p) => (
              <article key={p.name}>
                <div className="flex flex-wrap items-baseline gap-x-4">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className={`font-serif text-[24px] ${linkCls}`}>
                      {p.name.charAt(0) + p.name.slice(1).toLowerCase()}
                    </a>
                  ) : (
                    <span className="font-serif text-[24px]">{p.name}</span>
                  )}
                  <span className={`text-[12px] ${MUTED}`}>{p.status[L]}</span>
                </div>
                <p className={`mt-3 max-w-[56ch] text-[15px] leading-[1.7] ${MUTED}`}>{p.desc[L]}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Experience ── */}
        <section className={`mb-24 border-t ${RULE} pt-10 md:mb-32`}>
          <Label>{L === 'en' ? 'Experience' : 'Experiencia'}</Label>
          <div className="space-y-12">
            {roles.map((r) => (
              <article key={r.name}>
                <h3 className="font-serif text-[22px] leading-snug">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      {r.name}
                    </a>
                  ) : (
                    r.name
                  )}
                </h3>
                <p className={`mt-1 text-[13px] ${MUTED}`}>{r.org[L]}</p>
                <p className={`mt-3 max-w-[56ch] text-[15px] leading-[1.7] ${MUTED}`}>{r.desc[L]}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Guides ── */}
        <section className={`mb-24 border-t ${RULE} pt-10 md:mb-32`}>
          <Label>{L === 'en' ? 'Guides' : 'Guías'}</Label>
          <div className="space-y-10">
            {guides(L).map((g) => (
              <article key={g.href}>
                <h3 className="font-serif text-[22px]">
                  <button onClick={() => navigate(g.href)} className={linkCls}>
                    {g.title}
                  </button>
                </h3>
                <p className={`mt-2 max-w-[56ch] text-[15px] leading-[1.7] ${MUTED}`}>{g.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Recognition ── */}
        <section className={`mb-24 border-t ${RULE} pt-10 md:mb-32`}>
          <Label>{L === 'en' ? 'Certifications' : 'Certificaciones'}</Label>
          <ul className="space-y-3">
            {commendations.map((c) => (
              <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-6 text-[15px]">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {c.name}
                  </a>
                ) : (
                  <span>{c.name}</span>
                )}
                <span className={`text-[13px] ${MUTED}`}>{c.issuer}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Contact ── */}
        <section className={`border-t ${RULE} pt-10`}>
          <Label>{L === 'en' ? 'Contact' : 'Contacto'}</Label>
          <p className="font-serif text-[28px] leading-snug md:text-[34px]">
            {email && (
              <a href={email.href} className={linkCls}>
                {email.value}
              </a>
            )}
          </p>
          <p className={`mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[14px] ${MUTED}`}>
            {linkedin && (
              <a href={linkedin.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                LinkedIn
              </a>
            )}
            {x && (
              <a href={x.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                X
              </a>
            )}
            {cv && (
              <a href={cv.href} download className={linkCls}>
                CV
              </a>
            )}
          </p>
        </section>

        {/* ── Footer ── */}
        <footer className={`mt-24 flex items-baseline justify-between pb-4 text-[12px] ${MUTED} md:mt-32`}>
          <span>© 2026 Alan Ponce</span>
          <span>{identity.base}</span>
        </footer>
      </div>
    </div>
  );
};

export default MinimalHome;
