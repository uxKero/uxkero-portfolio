import React, { useRef, useEffect } from 'react';
import { Mail, Linkedin, Twitter, Building2, ArrowUpRight } from 'lucide-react';

interface ContactSectionProps {
  content: any; // Using dynamic content prop
}

const ContactSection: React.FC<ContactSectionProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col justify-center items-center px-6 pt-32 pb-24 md:p-16 overflow-y-auto custom-scrollbar bg-black">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-6 md:space-y-8 mb-16 md:mb-24 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <p className="text-emerald-400 text-xs md:text-sm font-bold tracking-[0.3em] uppercase">
          {content.confidential}
        </p>
        
        <h2 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[0.9] whitespace-pre-line">
          {content.header}
        </h2>
        
        <div className="w-16 md:w-24 h-[1px] bg-zinc-800 mx-auto my-6 md:my-8"></div>
        
        <p className="text-zinc-400 text-base md:text-xl font-light leading-relaxed max-w-2xl mx-auto px-4">
          {content.sub}
        </p>
      </div>

      {/* LINKS SECTION (PROFESSIONAL NETWORK) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        
        {/* Email */}
        <a 
          href="mailto:alan@aurorabookapp.com" 
          className="group flex items-center justify-between p-4 md:p-6 border border-zinc-800 bg-zinc-950/30 hover:bg-zinc-900/80 hover:border-emerald-500/50 transition-all duration-300"
        >
          <div className="flex items-center gap-4 md:gap-5">
            <div className="p-2 md:p-3 rounded-sm bg-zinc-900 group-hover:bg-emerald-500/10 text-zinc-500 group-hover:text-emerald-400 transition-colors">
               <Mail size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-emerald-500/70 transition-colors">{content.labels.email_sub}</div>
              <div className="text-white text-sm md:text-lg font-medium tracking-tight break-all">alan@aurorabookapp.com</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-emerald-400 group-hover:rotate-45 transition-all duration-300 md:w-[18px] md:h-[18px]" />
        </a>

        {/* LinkedIn */}
        <a 
          href="https://www.linkedin.com/in/ab-alanponce/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-4 md:p-6 border border-zinc-800 bg-zinc-950/30 hover:bg-zinc-900/80 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-center gap-4 md:gap-5">
             <div className="p-2 md:p-3 rounded-sm bg-zinc-900 group-hover:bg-blue-500/10 text-zinc-500 group-hover:text-blue-400 transition-colors">
               <Linkedin size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-blue-500/70 transition-colors">{content.labels.linkedin_sub}</div>
              <div className="text-white text-sm md:text-lg font-medium tracking-tight">/in/ab-alanponce</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-blue-400 group-hover:rotate-45 transition-all duration-300 md:w-[18px] md:h-[18px]" />
        </a>

        {/* X / Twitter */}
        <a 
          href="https://twitter.com/uxKero" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-4 md:p-6 border border-zinc-800 bg-zinc-950/30 hover:bg-zinc-900/80 hover:border-white/50 transition-all duration-300"
        >
          <div className="flex items-center gap-4 md:gap-5">
             <div className="p-2 md:p-3 rounded-sm bg-zinc-900 group-hover:bg-zinc-800 text-zinc-500 group-hover:text-white transition-colors">
               <Twitter size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">{content.labels.x_sub}</div>
              <div className="text-white text-sm md:text-lg font-medium tracking-tight">@uxKero</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-white group-hover:rotate-45 transition-all duration-300 md:w-[18px] md:h-[18px]" />
        </a>

        {/* Company Ref */}
        <a 
          href="https://www.linkedin.com/company/aurorabook/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-4 md:p-6 border border-zinc-800 bg-zinc-950/30 hover:bg-zinc-900/80 hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="flex items-center gap-4 md:gap-5">
             <div className="p-2 md:p-3 rounded-sm bg-zinc-900 group-hover:bg-purple-500/10 text-zinc-500 group-hover:text-purple-400 transition-colors">
               <Building2 size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-purple-500/70 transition-colors">{content.labels.company_sub}</div>
              <div className="text-white text-sm md:text-lg font-medium tracking-tight">Company Reference</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-purple-400 group-hover:rotate-45 transition-all duration-300 md:w-[18px] md:h-[18px]" />
        </a>

      </div>
    </div>
  );
};

export default ContactSection;