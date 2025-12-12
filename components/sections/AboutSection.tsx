import React, { useRef, useEffect } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LanguageIcon from '@mui/icons-material/Language';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { BlogPreviewList } from '../ui/blog-preview';

interface AboutSectionProps {
  onNavigate: (panel: 'experience' | 'contact') => void;
  content: any; // Using any for simplicity given the large translation object
  language: 'en' | 'es';
  onToggleLanguage: () => void;
  onBlogClick?: (slug: string) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate, content, language, onToggleLanguage, onBlogClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

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
                <OpenInNewIcon className="w-[18px] h-[18px]" />
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
             <LanguageIcon className="w-3 h-3 md:w-4 md:h-4" />
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

      {/* RIGHT COLUMN: BLOG PREVIEW */}
      <div className="flex-1 bg-black flex flex-col items-center justify-center p-6 md:p-8 lg:p-16 relative overflow-y-auto min-h-[500px] lg:min-h-auto border-t lg:border-t-0 border-zinc-900">
         {/* Subtle Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

         <div className="max-w-2xl w-full flex flex-col z-10 py-8">
            
            {/* BLOG PREVIEW LIST */}
            <BlogPreviewList
              blogs={content.blogs}
              className="mb-8"
              onBlogClick={onBlogClick}
            />

            {/* CTA */}
             <button 
               onClick={(e) => { e.stopPropagation(); onNavigate('experience'); }}
               className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors mt-4 self-center"
             >
                <span className="text-xs font-bold tracking-[0.2em] uppercase border-b border-zinc-800 group-hover:border-white pb-1 transition-all">
                  {content.btn_case_studies}
                </span>
                <ArrowForwardIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
             </button>
         </div>
      </div>
    </div>
  );
};

export default AboutSection;