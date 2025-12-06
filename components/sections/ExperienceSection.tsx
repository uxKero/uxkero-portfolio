import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

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
                <section className="group">
                  <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 group-hover:text-white transition-colors duration-300 text-sm font-mono tracking-widest uppercase">{content.headers[0]}</span>
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
                <section className="group">
                  <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 group-hover:text-white transition-colors duration-300 text-sm font-mono tracking-widest uppercase">{content.headers[2]}</span>
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
                <section className="group">
                  <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 group-hover:text-white transition-colors duration-300 text-sm font-mono tracking-widest uppercase">{content.headers[4]}</span>
                     {content.headers[5]}
                  </h3>
                  <div className="space-y-6 xl:space-y-8">
                     {/* Cronos */}
                     <a 
                        href="https://www.linkedin.com/company/cronos-cloud-sa/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-zinc-900/20 border-l-2 border-purple-500 pl-6 py-4 hover:bg-zinc-900/40 transition-colors group"
                     >
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider group-hover:text-purple-400 transition-colors">{content.projects.cronos_title}</h4>
                            <ExternalLink size={12} className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
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
                        className="block bg-zinc-900/20 border-l-2 border-purple-500 pl-6 py-4 hover:bg-zinc-900/40 transition-colors group"
                     >
                         <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider group-hover:text-purple-400 transition-colors">{content.projects.contablix_title}</h4>
                             <ExternalLink size={12} className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {content.projects.contablix_desc}
                        </p>
                     </a>
                  </div>
                </section>

                {/* BLOCK 4: LEADERSHIP & OPERATIONAL COMMAND */}
                <section className="group">
                   <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
                     <span className="text-zinc-600 group-hover:text-white transition-colors duration-300 text-sm font-mono tracking-widest uppercase">{content.headers[6]}</span>
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
        {/* BLOCK 5: AURORABOOK & EXECUTIVE ACUMEN */}
        <section className="w-full group">
           <h3 className="text-xl font-bold text-white mb-6 xl:mb-8 tracking-tight border-b border-zinc-800 pb-4 flex items-center gap-4">
             <span className="text-zinc-600 group-hover:text-white transition-colors duration-300 text-sm font-mono tracking-widest uppercase">{content.headers[8]}</span>
             {content.headers[9]}
          </h3>
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 lg:p-10 xl:p-12 rounded-sm space-y-8 lg:space-y-12">
             
             {/* Aurora Ecosystem Content */}
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-white text-base font-bold uppercase tracking-wider text-purple-400 group-hover:text-purple-300 hover:text-purple-300 transition-colors duration-300">{content.aurora.ecosystem_title}</h4>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-relaxed">
                           {content.aurora.ecosystem_sub}
                        </div>
                        <a href="https://aurorabookapp.com" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 font-mono hover:text-white transition-colors mt-2 flex items-center gap-1 w-fit">
                            aurorabookapp.com <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
                
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h5 className="text-white text-xs font-bold mb-2 uppercase tracking-wide">{content.aurora.h1}</h5>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {content.aurora.p1} <span className="text-white font-medium group-hover:text-purple-300 hover:text-purple-300 transition-colors duration-300 cursor-default">{content.aurora.p1_strong}</span>.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-white text-xs font-bold mb-2 uppercase tracking-wide">{content.aurora.h2}</h5>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {content.aurora.p2} <span className="text-white font-medium group-hover:text-purple-300 hover:text-purple-300 transition-colors duration-300 cursor-default">{content.aurora.p2_strong1}</span> {content.aurora.p2_text} <span className="text-white font-medium group-hover:text-purple-300 hover:text-purple-300 transition-colors duration-300 cursor-default">{content.aurora.p2_strong2}</span> {content.aurora.p2_end}
                        </p>
                    </div>
                    <div>
                        <h5 className="text-white text-xs font-bold mb-2 uppercase tracking-wide">{content.aurora.h3}</h5>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {content.aurora.p3} <span className="text-white font-medium group-hover:text-purple-300 transition-colors duration-300">{content.aurora.p3_strong}</span>.
                        </p>
                    </div>
                </div>
             </div>

             {/* Divider */}
             <div className="h-[1px] w-full bg-zinc-800/50"></div>

             {/* Holistic Design Content */}
             <div>
                <h4 className="text-white text-sm font-bold mb-3 uppercase tracking-wider text-purple-400">{content.aurora.h4}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-4xl">
                   {content.aurora.p4}
                </p>
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