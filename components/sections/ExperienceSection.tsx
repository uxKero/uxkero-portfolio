import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';

interface ExperienceSectionProps {
  content: any; // Using any for simplicity with the complex translation object
}

// Served from /public — filename kept as-is, space URL-encoded.
const CV_URL = '/alan-ponce-cv%20(may-2026).pdf';

// Section heading: mono number + title, matching the panel's editorial style.
const SectionHeader: React.FC<{ num: string; title: string }> = ({ num, title }) => (
  <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
    <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">{num}</span>
    {title}
  </h3>
);

// A single role/product entry. Renders as a link when a url is provided.
const EntryCard: React.FC<{
  href?: string;
  accent: string; // border color class, e.g. 'border-purple-500'
  hover: string; // hover text color class, e.g. 'group-hover:text-purple-400'
  title: string;
  children: React.ReactNode;
}> = ({ href, accent, hover, title, children }) => {
  const inner = (
    <>
      <div className="flex items-center gap-2 mb-1.5">
        <h4 className={`text-white text-sm font-bold uppercase tracking-wider transition-colors ${href ? hover : ''}`}>
          {title}
        </h4>
        {href && <OpenInNewIcon className={`w-3 h-3 text-zinc-600 transition-colors ${hover}`} />}
      </div>
      {children}
    </>
  );
  const cls = `block bg-zinc-900/20 border-l-2 ${accent} pl-5 py-4 transition-colors group`;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:bg-zinc-900/40`}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Reset scroll position on mount (whenever the user navigates to this section)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  const { roles, products, what_i_do, background, certs } = content;

  const whatIDo = [
    { title: what_i_do.cat1_title, tags: what_i_do.cat1_tags, color: 'text-zinc-200' },
    { title: what_i_do.cat2_title, tags: what_i_do.cat2_tags, color: 'text-zinc-200' },
    { title: what_i_do.cat3_title, tags: what_i_do.cat3_tags, color: 'text-zinc-200' },
    { title: what_i_do.cat4_title, tags: what_i_do.cat4_tags, color: 'text-zinc-200' },
  ];

  return (
    <div ref={containerRef} className="w-full h-full bg-black overflow-y-auto overflow-x-hidden custom-scrollbar px-6 py-12 md:p-12 xl:p-16">
      <div className="max-w-[1800px] mx-auto space-y-12 xl:space-y-16">

        {/* Deep-link to the full career lifeline */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/lifeline'); }}
          className="group flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:text-white"
        >
          <span className="text-zinc-800 transition-colors group-hover:text-hud">{'//'}</span>
          Timeline · 1995 → 2026
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>

        {/* ================= LEVEL 1: 2×2 GRID =================
            Flat grid so row 2 (What I Do / Background) aligns regardless
            of how tall row 1 (Roles / Own Products) is. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 xl:gap-x-24 gap-y-12 md:gap-y-16">

          {/* BLOCK 01: ROLES */}
          <section>
            <SectionHeader num={roles.num} title={roles.title} />
            <div className="space-y-4 xl:space-y-5">
              <EntryCard
                href={roles.educabot.url}
                accent="border-hud/60"
                hover="group-hover:text-hud"
                title={roles.educabot.name}
              >
                <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-2">{roles.educabot.tag}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{roles.educabot.desc}</p>
              </EntryCard>
              <EntryCard
                href={roles.cultura.url}
                accent="border-hud/60"
                hover="group-hover:text-hud"
                title={roles.cultura.name}
              >
                <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-2">{roles.cultura.tag}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{roles.cultura.desc}</p>
              </EntryCard>
              <EntryCard
                href={roles.independent.url}
                accent="border-hud/60"
                hover="group-hover:text-hud"
                title={roles.independent.name}
              >
                <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-2">{roles.independent.tag}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{roles.independent.desc}</p>
              </EntryCard>
            </div>
          </section>

          {/* BLOCK 02: OWN PRODUCTS */}
          <section>
            <SectionHeader num={products.num} title={products.title} />
            <div className="space-y-4 xl:space-y-5">
              {[products.prodegame, products.voybien].map((p) => (
                <EntryCard
                  key={p.name}
                  href={p.url || undefined}
                  accent="border-hud/60"
                  hover="group-hover:text-hud"
                  title={p.name}
                >
                  <p className="text-zinc-400 text-sm leading-relaxed mb-3">{p.desc}</p>
                  <dl className="space-y-1 text-xs">
                    <div className="flex gap-2">
                      <dt className="text-zinc-600 font-mono uppercase tracking-wider shrink-0 w-14">Status</dt>
                      <dd className="text-zinc-400">{p.status}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-zinc-600 font-mono uppercase tracking-wider shrink-0 w-14">Role</dt>
                      <dd className="text-zinc-400">{p.role}</dd>
                    </div>
                    {p.stack && (
                      <div className="flex gap-2">
                        <dt className="text-zinc-600 font-mono uppercase tracking-wider shrink-0 w-14">Stack</dt>
                        <dd className="text-zinc-400 font-mono">{p.stack}</dd>
                      </div>
                    )}
                  </dl>
                </EntryCard>
              ))}
            </div>
          </section>

          {/* BLOCK 03: WHAT I DO */}
          <section>
            <SectionHeader num={what_i_do.num} title={what_i_do.title} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 xl:gap-y-10">
              {whatIDo.map((cat) => (
                <div key={cat.title}>
                  <h4 className={`text-xs font-bold mb-3 uppercase tracking-wider ${cat.color}`}>{cat.title}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">{cat.tags}</p>
                </div>
              ))}
            </div>
          </section>

          {/* BLOCK 04: BACKGROUND */}
          <section>
            <SectionHeader num={background.num} title={background.title} />
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm leading-relaxed">{background.p1}</p>
              <p className="text-zinc-300 text-sm leading-relaxed border-l-2 border-hud/60 pl-4">{background.highlight}</p>
              <a
                href={CV_URL}
                download
                className="inline-flex items-center gap-2 mt-1 px-4 py-2.5 rounded-none border border-zinc-800 bg-zinc-900/40 text-sm font-medium text-white hover:border-zinc-600 hover:bg-zinc-900/70 transition-all group"
              >
                <DownloadIcon className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                {background.cv_label}
              </a>
            </div>
          </section>

        </div>

        {/* ================= LEVEL 2: CERTIFICATIONS & STACK ================= */}
        <section className="w-full">
          <SectionHeader num={certs.num} title={certs.title} />
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 lg:p-10 xl:p-12 rounded-none space-y-8 lg:space-y-10">

            <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">{certs.intro}</p>

            <div className="h-px w-full bg-zinc-800/50" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

              {/* Certifications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-5">{certs.certs_title}</h4>
                <div className="space-y-3">
                  {/* Cert 1 — Microsoft */}
                  <a href={certs.cert1_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-none border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70 transition-all group"
                  >
                    <div>
                      <div className="text-white text-sm font-medium group-hover:text-white transition-colors">{certs.cert1_name}</div>
                      <div className="text-zinc-600 text-xs mt-0.5 font-mono">{certs.cert1_issuer}</div>
                    </div>
                    <OpenInNewIcon className="w-3 h-3 text-zinc-700 group-hover:text-white transition-colors shrink-0" />
                  </a>
                  {/* Cert 2 — Google */}
                  <a href={certs.cert2_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-none border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70 transition-all group"
                  >
                    <div>
                      <div className="text-white text-sm font-medium group-hover:text-white transition-colors">{certs.cert2_name}</div>
                      <div className="text-zinc-600 text-xs mt-0.5 font-mono">{certs.cert2_issuer}</div>
                    </div>
                    <OpenInNewIcon className="w-3 h-3 text-zinc-700 group-hover:text-white transition-colors shrink-0" />
                  </a>
                  {/* Cert 3 — Anthropic */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-none border border-zinc-800 bg-zinc-900/40">
                    <div>
                      <div className="text-white text-sm font-medium">{certs.cert3_name}</div>
                      <div className="text-zinc-600 text-xs mt-0.5 font-mono">{certs.cert3_issuer}</div>
                    </div>
                  </div>
                  {/* Cert 4 — Anthropic */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-none border border-zinc-800 bg-zinc-900/40">
                    <div>
                      <div className="text-white text-sm font-medium">{certs.cert4_name}</div>
                      <div className="text-zinc-600 text-xs mt-0.5 font-mono">{certs.cert4_issuer}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Stack */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-3">{certs.stack_title}</h4>
                <p className="text-zinc-400 text-sm font-mono leading-loose tracking-wide">{certs.stack_list}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Spacer */}
        <div className="h-12 md:h-0"></div>

      </div>
    </div>
  );
};

export default ExperienceSection;
