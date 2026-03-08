import React, { useEffect, useRef } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface ExperienceSectionProps {
  content: any; // Using any for simplicity with the complex translation object
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position on mount (whenever the user navigates to this section)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-black overflow-y-auto overflow-x-hidden custom-scrollbar px-6 py-12 md:p-12 xl:p-16">
      <div className="max-w-[1800px] mx-auto space-y-12 xl:space-y-16">
        
        {/* ================= LEVEL 1: TOP DUAL-COLUMN SECTION ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-24">
            
            {/* COLUMN A (LEFT): CORE METHODOLOGY */}
            <div className="space-y-12 md:space-y-16">
                
                {/* BLOCK 1: STRATEGY & LEADERSHIP */}
                <section>
                  <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">{content.headers[0]}</span>
                     {content.headers[1]}
                  </h3>
                  {/* Internal 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 xl:gap-y-10">
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-emerald-400">{content.strategy.h1}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                        {content.strategy.p1}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-emerald-400">{content.strategy.h2}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                        {content.strategy.p2}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-emerald-400">{content.strategy.h3}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                        {content.strategy.p3}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-emerald-400">{content.strategy.h4}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                        {content.strategy.p4}
                      </p>
                    </div>
                  </div>
                </section>

                {/* BLOCK 2: PRACTICE & TECHNICAL VIABILITY */}
                <section>
                  <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">{content.headers[2]}</span>
                     {content.headers[3]}
                  </h3>
                  {/* Internal 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 xl:gap-y-10">
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-blue-400">{content.practice.h1}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                        {content.practice.p1}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-blue-400">{content.practice.h2}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                        <span className="text-white font-medium">{content.practice.p2_strong}</span> {content.practice.p2}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-blue-400">{content.practice.h3}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                         <span className="text-white font-medium">{content.practice.p3_strong}</span> {content.practice.p3}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-blue-400">{content.practice.h4}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                         <span className="text-white font-medium">{content.practice.p4_strong}</span> {content.practice.p4}
                      </p>
                    </div>
                  </div>
                </section>

            </div>

            {/* COLUMN B (RIGHT): PROJECT VALIDATION */}
            <div className="space-y-12 md:space-y-16">

                {/* BLOCK 3: KEY PROJECT HIGHLIGHTS */}
                <section>
                  <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">{content.headers[4]}</span>
                     {content.headers[5]}
                  </h3>
                  <div className="space-y-4 xl:space-y-5">
                     {/* Cronos */}
                     <a 
                        href="https://www.linkedin.com/company/cronos-cloud-sa/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-zinc-900/20 border-l-2 border-purple-500 pl-5 py-4 hover:bg-zinc-900/40 transition-colors group"
                     >
                        <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider group-hover:text-purple-400 transition-colors">{content.projects.cronos_title}</h4>
                            <OpenInNewIcon className="w-3 h-3 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {content.projects.cronos_desc}
                        </p>
                     </a>
                     {/* Contablix */}
                     <a 
                        href="https://contablix.ar/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-zinc-900/20 border-l-2 border-zinc-600 pl-5 py-4 hover:bg-zinc-900/40 transition-colors group"
                     >
                         <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider group-hover:text-zinc-400 transition-colors">{content.projects.contablix_title}</h4>
                             <OpenInNewIcon className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {content.projects.contablix_desc}
                        </p>
                     </a>
                     {/* AuroraBook */}
                     <a 
                        href={content.projects.aurorabook_url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-zinc-900/20 border-l-2 border-amber-500/70 pl-5 py-4 hover:bg-zinc-900/40 transition-colors group"
                     >
                         <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider group-hover:text-amber-400 transition-colors">{content.projects.aurorabook_title}</h4>
                             <OpenInNewIcon className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {content.projects.aurorabook_desc}
                        </p>
                     </a>
                  </div>
                </section>

                {/* BLOCK 4: LEADERSHIP & OPERATIONAL COMMAND */}
                <section>
                   <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">{content.headers[6]}</span>
                     {content.headers[7]}
                  </h3>
                  <div className="grid grid-cols-1 gap-6 xl:gap-8">
                     <div>
                        <h4 className="text-white text-xs font-bold mb-2 uppercase tracking-wider text-purple-400">{content.leadership.h1}</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          <span className="text-white font-medium">{content.leadership.p1_strong}</span> {content.leadership.p1}
                        </p>
                     </div>
                     <div>
                        <h4 className="text-white text-xs font-bold mb-2 uppercase tracking-wider text-purple-400">{content.leadership.h2}</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          {content.leadership.p2}
                        </p>
                     </div>
                  </div>
                </section>

            </div>
        </div>

        {/* ================= LEVEL 2: BOTTOM FULL-WIDTH SECTION ================= */}
        {/* BLOCK 5: AI BUILDER & DIGITAL TOOLKIT */}
        <section className="w-full">
           <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
             <span className="text-zinc-600 text-sm font-mono tracking-widest uppercase">{content.headers[8]}</span>
             {content.headers[9]}
          </h3>
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 lg:p-10 xl:p-12 rounded-sm space-y-8 lg:space-y-10">
             
             {/* Intro */}
             <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
               {content.ai_builder.p_intro}
             </p>

             <div className="h-px w-full bg-zinc-800/50" />

             {/* Certifications + Tools Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
               
               {/* Certifications */}
               <div>
                 <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-5">{content.ai_builder.certs_title}</h4>
                 <div className="space-y-3">
                   {/* Cert 1 — Microsoft */}
                   <a href={content.ai_builder.cert1_url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70 transition-all group"
                   >
                     <div>
                       <div className="text-white text-sm font-medium group-hover:text-amber-300 transition-colors">{content.ai_builder.cert1_name}</div>
                       <div className="text-zinc-600 text-xs mt-0.5 font-mono">{content.ai_builder.cert1_issuer}</div>
                     </div>
                     <OpenInNewIcon className="w-3 h-3 text-zinc-700 group-hover:text-amber-400 transition-colors shrink-0" />
                   </a>
                   {/* Cert 2 — Google */}
                   <a href={content.ai_builder.cert2_url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70 transition-all group"
                   >
                     <div>
                       <div className="text-white text-sm font-medium group-hover:text-amber-300 transition-colors">{content.ai_builder.cert2_name}</div>
                       <div className="text-zinc-600 text-xs mt-0.5 font-mono">{content.ai_builder.cert2_issuer}</div>
                     </div>
                     <OpenInNewIcon className="w-3 h-3 text-zinc-700 group-hover:text-amber-400 transition-colors shrink-0" />
                   </a>
                   {/* Cert 3 — Anthropic */}
                   <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
                     <div>
                       <div className="text-white text-sm font-medium">{content.ai_builder.cert3_name}</div>
                       <div className="text-zinc-600 text-xs mt-0.5 font-mono">{content.ai_builder.cert3_issuer}</div>
                     </div>
                   </div>
                   {/* Cert 4 — Anthropic */}
                   <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
                     <div>
                       <div className="text-white text-sm font-medium">{content.ai_builder.cert4_name}</div>
                       <div className="text-zinc-600 text-xs mt-0.5 font-mono">{content.ai_builder.cert4_issuer}</div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Stack + PM Method */}
               <div className="space-y-8">
                 <div>
                   <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">{content.ai_builder.tools_title}</h4>
                   <p className="text-zinc-400 text-sm font-mono leading-loose tracking-wide">
                     {content.ai_builder.tools_list}
                   </p>
                 </div>
                 <div>
                   <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">{content.ai_builder.pm_title}</h4>
                   <p className="text-zinc-400 text-sm leading-relaxed border-l border-zinc-800 pl-4">
                     {content.ai_builder.pm_text}
                   </p>
                 </div>
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