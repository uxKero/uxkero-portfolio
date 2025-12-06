import React, { useRef, useEffect } from 'react';
import { ArrowRight, Terminal, Cpu, TrendingUp, Globe, ArrowUpRight } from 'lucide-react';
import { CodeComparison } from '../ui/code-comparison';

interface AboutSectionProps {
  onNavigate: (panel: 'experience' | 'contact') => void;
  content: any; // Using any for simplicity given the large translation object
  language: 'en' | 'es';
  onToggleLanguage: () => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate, content, language, onToggleLanguage }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);
  
  // -- LEFT SIDE CONTENT: THE CODE --
  const CodeSnippet = (
    <div className="font-mono text-xs md:text-sm leading-relaxed text-zinc-300 w-full h-full overflow-y-auto custom-scrollbar pr-2 md:pr-4">
        <div className="text-zinc-500 italic mb-4">{content.code.comment_arch}</div>

        <div>
            <span className="text-purple-400">class</span> <span className="text-yellow-300">ProductArchitect</span> <span className="text-white">{'{'}</span>
        </div>
        
        <div className="pl-4 mt-2">
            <span className="text-purple-400">constructor</span>() <span className="text-white">{'{'}</span>
        </div>
        <div className="pl-8">
            <span className="text-purple-400">this</span>.<span className="text-blue-300">stack</span> = [<span className="text-green-400">'NextJS'</span>, <span className="text-green-400">'Figma'</span>, <span className="text-green-400">'Data'</span>];
        </div>
        <div className="pl-4 text-white">{'}'}</div>

        <div className="pl-4 mt-4">
            <span className="text-yellow-300">optimizeJourney</span>(<span className="text-orange-300">userFlow</span>) <span className="text-white">{'{'}</span>
        </div>
        <div className="pl-8 text-zinc-500 italic">{content.code.comment_analysis}</div>
        <div className="pl-8">
            <span className="text-purple-400">const</span> friction = <span className="text-purple-400">this</span>.<span className="text-blue-300">detectDropoff</span>(userFlow);
        </div>
        
        <div className="pl-8 mt-2">
            <span className="text-purple-400">if</span> (friction.<span className="text-blue-300">severity</span> &gt; <span className="text-blue-400">0.8</span>) <span className="text-white">{'{'}</span>
        </div>
        <div className="pl-12 text-zinc-500 italic">{content.code.comment_deploy}</div>
        <div className="pl-12">
            <span className="text-purple-400">return</span> <span className="text-purple-400">this</span>.<span className="text-yellow-300">deployPattern</span>(<span className="text-green-400">{content.code.string_pattern}</span>);
        </div>
        <div className="pl-8 text-white">{'}'}</div>
        
        <div className="pl-8 mt-2">
             <span className="text-purple-400">return</span> <span className="text-green-400">{content.code.string_baseline}</span>;
        </div>

        <div className="pl-4 text-white">{'}'}</div>
        
        <div className="text-white">{'}'}</div>
    </div>
  );

  // -- RIGHT SIDE CONTENT: THE VISUAL RESULT --
  const VisualResult = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden font-mono select-none">
        {/* Sharp Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>
        
        {/* Main Interface Container - Sharp, Industrial */}
        <div className="relative w-[280px] md:w-[320px] bg-zinc-900 border border-zinc-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10">
            
            {/* Header Status Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 animate-[pulse_2s_infinite]"></div>
                    <span className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase">{content.visual.protocol}</span>
                </div>
                <div className="flex gap-1">
                   <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                   <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                   <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 space-y-6 md:space-y-8 relative">
                {/* Decorative line */}
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-800 to-transparent"></div>
                
                {/* Metric 1: System Check */}
                <div className="group">
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                           <Cpu className="w-3 h-3 text-emerald-500" />
                           {content.visual.cpu_label}
                        </div>
                        <span className="text-emerald-400 text-xs font-bold tracking-widest">{content.visual.cpu_value}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-emerald-500 w-full shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-[growRight_1s_ease-out]"></div>
                    </div>
                </div>

                {/* Metric 2: Business Impact */}
                <div className="flex flex-col gap-2 group">
                     <div className="flex items-center justify-between">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                           <TrendingUp className="w-3 h-3 text-blue-500" />
                           {content.visual.trend_label}
                        </div>
                        <div className="inline-block px-2 py-0.5 border border-blue-500/30 text-blue-400 text-[8px] font-bold uppercase tracking-[0.1em] bg-blue-500/5">
                            {content.visual.trend_tag}
                        </div>
                     </div>
                     
                     <div className="flex items-end gap-3 mt-1">
                        <div className="text-3xl font-light text-white tracking-tighter leading-none">
                            +24.8<span className="text-sm text-blue-400 font-normal">%</span>
                        </div>
                        <div className="h-6 flex items-end gap-1 mb-1 opacity-60">
                            {/* Simple Bar Chart Visualization */}
                            <div className="w-1.5 h-2 bg-zinc-700"></div>
                            <div className="w-1.5 h-3 bg-zinc-600"></div>
                            <div className="w-1.5 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </div>
                     </div>
                </div>

                {/* Identity Section */}
                 <div className="pt-6 border-t border-zinc-800/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-mono font-bold text-xs relative overflow-hidden group-hover:border-zinc-600 transition-colors">
                        <span className="relative z-10">AP</span>
                        <div className="absolute inset-0 bg-white/5 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </div>
                    <div>
                        <div className="text-xs text-white font-bold uppercase tracking-widest mb-0.5">Alan Ponce</div>
                        <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em]">{content.visual.identity_role}</div>
                    </div>
                 </div>
            </div>

            {/* Footer CTA - Sharp Terminal Button */}
            <a 
                href="https://www.linkedin.com/in/ab-alanponce/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-white hover:bg-zinc-200 transition-all duration-300 group relative overflow-hidden"
            >
                <div className="px-6 py-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                         <Terminal className="w-3 h-3 text-black" />
                         <span className="text-black text-[10px] font-bold uppercase tracking-[0.25em] group-hover:tracking-[0.35em] transition-all">
                             {content.visual.cta_linkedin}
                         </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-black transform group-hover:translate-x-1 transition-transform" />
                </div>
            </a>
        </div>
        
        {/* Cyberpunk Decor Lines */}
        <div className="absolute top-0 right-10 w-[1px] h-[100px] bg-gradient-to-b from-zinc-800 to-transparent"></div>
        <div className="absolute bottom-0 left-10 w-[1px] h-[100px] bg-gradient-to-t from-zinc-800 to-transparent"></div>
    </div>
  );

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row w-full h-full bg-black overflow-y-auto lg:overflow-hidden">
      
      {/* LEFT COLUMN: STATIC HERO */}
      <div className="w-full lg:w-[40%] p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-900 relative z-10 shrink-0 min-h-min">
        <div className="space-y-6 lg:space-y-8 py-8 lg:py-0">
          
          {/* Header 1: ALAN PONCE (Prominent) */}
          <div className="flex items-center gap-3 mb-0">
            <div className="text-white text-3xl md:text-4xl font-bold tracking-tighter uppercase leading-none">
              {content.name}
            </div>
            {/* Subtle LinkedIn Icon */}
            <a 
                href="https://www.linkedin.com/in/ab-alanponce/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-800 hover:text-blue-400 transition-all duration-300 transform hover:scale-110 translate-y-1"
                aria-label="LinkedIn"
            >
                <ArrowUpRight size={18} strokeWidth={3} />
            </a>
          </div>
          
          {/* Header 2: Location (Subtle) */}
          <div className="text-zinc-500 text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-4 leading-relaxed">
            {content.location}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[0.9]">
            {content.title}
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl text-zinc-400 tracking-wide font-light max-w-lg">
            {content.subheader}
          </h2>
          <div className="h-[1px] w-12 bg-zinc-800 my-8"></div>
          <p className="text-zinc-500 text-base md:text-lg leading-relaxed max-w-md">
            {content.summary}
          </p>
        </div>

        {/* BOTTOM ROW: LANGUAGE & NAVIGATION */}
        <div className="mt-12 lg:mt-auto flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-8 md:gap-0">
          
          {/* LEFT: Language Toggle */}
          <button 
             onClick={(e) => { e.stopPropagation(); onToggleLanguage(); }}
             className="group flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.2em] text-zinc-600 hover:text-white transition-colors uppercase"
          >
             <Globe className="w-3 h-3 md:w-4 md:h-4" />
             <span className="border-b border-transparent group-hover:border-white transition-all pb-1">
               {language === 'en' ? 'Español' : 'English'}
             </span>
          </button>

          {/* RIGHT: Navigation Buttons */}
          <div className="flex gap-8 md:gap-12 w-full md:w-auto justify-start md:justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); onNavigate('experience'); }}
              className="text-xs font-bold tracking-[0.2em] text-white border-b border-zinc-800 hover:border-white transition-all pb-2 uppercase"
            >
              {content.btn_experience}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onNavigate('contact'); }}
              className="text-xs font-bold tracking-[0.2em] text-white border-b border-zinc-800 hover:border-white transition-all pb-2 uppercase"
            >
              {content.btn_contact}
            </button>
          </div>

        </div>
      </div>

      {/* MIDDLE STRIP: VERTICAL MENU (Desktop Only) */}
      <div className="hidden lg:flex w-14 border-r border-zinc-900 flex-col justify-between py-12 items-center bg-zinc-950/30 shrink-0">
        <div style={{ writingMode: 'vertical-rl' }} className="rotate-180 text-[10px] tracking-[0.3em] text-zinc-700 hover:text-white transition-colors duration-300 font-mono uppercase whitespace-nowrap cursor-default">
          Practice & Tech Viability
        </div>
        <div style={{ writingMode: 'vertical-rl' }} className="rotate-180 text-[10px] tracking-[0.3em] text-zinc-700 hover:text-white transition-colors duration-300 font-mono uppercase whitespace-nowrap cursor-default">
          Strategy & Leadership
        </div>
      </div>

      {/* RIGHT COLUMN: CODE COMPARISON VISUALIZATION */}
      <div className="flex-1 bg-black flex flex-col items-center justify-center p-6 md:p-8 lg:p-16 relative overflow-hidden min-h-[500px] lg:min-h-auto border-t lg:border-t-0 border-zinc-900">
         {/* Subtle Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

         <div className="max-w-3xl w-full flex flex-col items-center z-10">
            
            {/* COMPONENT: Code vs Visual */}
            <CodeComparison 
                beforeContent={CodeSnippet}
                afterContent={VisualResult}
                className="shadow-2xl h-[350px] md:h-[450px]"
            />

            {/* CTA */}
             <button 
               onClick={(e) => { e.stopPropagation(); onNavigate('experience'); }}
               className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors mt-8 lg:mt-12"
             >
                <span className="text-xs font-bold tracking-[0.2em] uppercase border-b border-zinc-800 group-hover:border-white pb-1 transition-all">
                  {content.btn_case_studies}
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
             </button>
         </div>
      </div>
    </div>
  );
};

export default AboutSection;