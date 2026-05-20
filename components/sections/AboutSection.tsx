import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LanguageIcon from '@mui/icons-material/Language';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import { BlogPreviewList } from '../ui/blog-preview';
import { api } from '../../utils/api';

interface AboutSectionProps {
  onNavigate: (panel: 'experience' | 'contact') => void;
  content: any; // Using any for simplicity given the large translation object
  language: 'en' | 'es';
  onToggleLanguage: () => void;
  onBlogClick?: (slug: string) => void;
  onBlogOpenInNewTab?: (slug: string) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate, content, language, onToggleLanguage, onBlogClick, onBlogOpenInNewTab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigateToGuides = useNavigate();
  const [showListView, setShowListView] = useState(false);
  const [realBlogs, setRealBlogs] = useState<Array<{
    title: string;
    date: string;
    category: string;
    excerpt: string;
    readTime: string;
    slug?: string;
  }>>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const featuredGuides = [
    {
      slug: '/guides/openclaw',
      badge: 'Complete',
      badgeClass: 'bg-emerald-950/70 border-emerald-900/60 text-emerald-400',
      title: 'OpenClaw',
      subtitle: language === 'es' ? 'Agentes de IA en WhatsApp' : 'AI agents on WhatsApp',
      description: language === 'es'
        ? 'Instalación, config, workspace, identidad, memoria y skills. 10 módulos paso a paso con comandos reales.'
        : 'Installation, config, workspace, identity, memory and skills. 10 step-by-step modules with real commands.',
      stats: [
        { v: '10', l: language === 'es' ? 'módulos' : 'modules' },
        { v: '42+', l: 'topics' },
        { v: '10', l: 'quizzes' },
      ],
    },
    {
      slug: '/guides/openclaw-avanzado',
      badge: language === 'es' ? 'Avanzada' : 'Advanced',
      badgeClass: 'bg-sky-950/70 border-sky-900/60 text-sky-300',
      title: 'Openclaw Avanzado',
      subtitle: language === 'es' ? 'Testing, seguridad y operación real' : 'Testing, security, and real operations',
      description: language === 'es'
        ? 'Seguridad, multi-agente, APIs, prompt engineering, skills, equipos, testing, visión comercial y optimización.'
        : 'Security, multi-agent, APIs, prompt engineering, skills, teams, testing, commercial framing, and optimization.',
      stats: [
        { v: '9', l: language === 'es' ? 'módulos' : 'modules' },
        { v: '71+', l: 'topics' },
        { v: '9', l: 'quizzes' },
      ],
    },
  ];

  // Reset scroll position on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Obtener blogs reales desde la API
  useEffect(() => {
    const loadRealBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const blogs = await api.getBlogs();
        
        // Formatear blogs de la API al formato esperado
        const formattedBlogs = blogs
          .filter((blog: any) => blog.published_at) // Solo blogs publicados
          .map((blog: any) => {
            // Formatear fecha
            const publishedDate = new Date(blog.published_at);
            const dateOptions: Intl.DateTimeFormatOptions = { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            };
            const formattedDate = publishedDate.toLocaleDateString(
              language === 'es' ? 'es-ES' : 'en-US',
              dateOptions
            );

            // Obtener excerpt del subtitle o truncar contenido
            let excerpt = '';
            if (language === 'es' && blog.subtitle_es) {
              excerpt = blog.subtitle_es;
            } else if (language === 'en' && blog.subtitle_en) {
              excerpt = blog.subtitle_en;
            } else {
              // Truncar contenido si no hay subtitle
              const content = language === 'es' ? blog.content_es : blog.content_en;
              excerpt = content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
            }

            return {
              title: language === 'es' ? blog.title_es : blog.title_en,
              date: formattedDate,
              category: language === 'es' ? (blog.category_es || 'Blog') : (blog.category_en || 'Blog'),
              excerpt: excerpt,
              readTime: language === 'es' ? (blog.read_time_es || '5 min lectura') : (blog.read_time_en || '5 min read'),
              slug: blog.slug,
            };
          });

        setRealBlogs(formattedBlogs);
      } catch (error: any) {
        console.error('Error cargando blogs:', error);
        // Si hay error, usar array vacío (no mostrar blogs estáticos)
        setRealBlogs([]);
      } finally {
        setLoadingBlogs(false);
      }
    };

    loadRealBlogs();
  }, [language]);

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row w-full h-full bg-black overflow-y-auto lg:overflow-hidden">
      
      {/* LEFT COLUMN: STATIC HERO */}
      <div className="w-full lg:w-[40%] p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-900 relative z-10 shrink-0 min-h-min">
        <div className="space-y-4 lg:space-y-5 py-8 lg:py-0">

          {/* Header 1: ALAN PONCE (Prominent) */}
          <div className="flex items-center gap-3 mb-0">
            <div className="text-white text-2xl md:text-3xl font-bold tracking-tighter uppercase leading-none">
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
          <div className="text-zinc-500 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-1 leading-relaxed">
            {content.location}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white leading-[0.95]">
            {content.title}
          </h1>
          <h2 className="text-sm md:text-base lg:text-lg text-zinc-400 tracking-wide font-light max-w-lg leading-snug">
            {content.subheader}
          </h2>
          <div className="h-[1px] w-12 bg-zinc-800 my-4"></div>
          <p className="text-zinc-500 text-sm md:text-[15px] leading-relaxed max-w-md">
            {content.summary}
          </p>
        </div>

        {/* BOTTOM ROW: LANGUAGE & NAVIGATION */}
        <div className="mt-8 lg:mt-auto flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-8 md:gap-0">
          
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
          Own Products & Education
        </div>
        <div style={{ writingMode: 'vertical-rl' }} className="rotate-180 text-[10px] tracking-[0.3em] text-zinc-700 hover:text-white transition-colors duration-300 font-mono uppercase whitespace-nowrap cursor-default">
          Roles & AI Enablement
        </div>
      </div>

      {/* RIGHT COLUMN: BLOG PREVIEW */}
      <div className="flex-1 bg-black flex flex-col items-center justify-start p-6 md:p-8 lg:p-16 relative overflow-y-auto min-h-[500px] lg:min-h-auto border-t lg:border-t-0 border-zinc-900">
         {/* Subtle Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

         {!showListView ? (
           <div className="max-w-2xl w-full flex flex-col z-10 py-12 sm:py-16 md:py-20">
              
              {/* BLOG PREVIEW LIST */}
              {loadingBlogs ? (
                <div className="text-center text-zinc-500 py-8">
                  {language === 'es' ? 'Cargando blogs...' : 'Loading blogs...'}
                </div>
              ) : realBlogs.length > 0 ? (
                <BlogPreviewList
                  blogs={realBlogs}
                  className="mb-8"
                  onBlogClick={onBlogClick}
                  language={language}
                />
              ) : null}

              {!loadingBlogs && (
                <div className="w-full flex flex-col gap-4 py-2 mb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-semibold text-zinc-700 uppercase tracking-[0.22em]">
                      {language === 'es' ? 'Guías destacadas' : 'Featured guides'}
                    </span>
                    <div className="flex-1 h-px bg-zinc-900" />
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateToGuides('/guides'); }}
                      className="flex items-center gap-0.5 text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                    >
                      <span className="text-[9px] font-semibold uppercase tracking-[0.22em]">
                        {language === 'es' ? 'Ver todas' : 'View all'}
                      </span>
                      <ArrowForwardIcon sx={{ fontSize: 10 }} />
                    </button>
                  </div>

                  {featuredGuides.map((guide) => (
                    <button
                      key={guide.slug}
                      onClick={(e) => { e.stopPropagation(); navigateToGuides(guide.slug); }}
                      className="w-full text-left group rounded-xl border border-zinc-800/70 bg-zinc-950/60 hover:border-zinc-700/70 hover:bg-zinc-900/50 transition-all duration-300 p-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-mono mb-2.5 ${guide.badgeClass}`}>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            {guide.badge}
                          </div>
                          <div className="text-xl font-bold text-white tracking-tight leading-none">{guide.title}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                            {guide.subtitle}
                          </div>
                        </div>
                        <ArrowForwardIcon className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-300 shrink-0 mt-1" />
                      </div>

                      <p className="text-[11px] text-zinc-600 leading-relaxed mb-4">
                        {guide.description}
                      </p>

                      <div className="flex items-center gap-5">
                        {guide.stats.map(({ v, l }) => (
                          <div key={l}>
                            <div className="text-sm font-semibold text-zinc-300">{v}</div>
                            <div className="text-[9px] text-zinc-600">{l}</div>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loadingBlogs && realBlogs.length === 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate('experience'); }}
                  className="group flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors self-start mt-1"
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase border-b border-transparent group-hover:border-zinc-600 pb-0.5 transition-all">
                    {content.btn_case_studies}
                  </span>
                  <ArrowForwardIcon className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Ver más button - solo mostrar si hay blogs */}
              {realBlogs.length > 0 && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowListView(true);
                  }}
                  className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors mt-4 self-center mb-6"
                >
                  <ListIcon className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase border-b border-zinc-800 group-hover:border-white pb-1 transition-all">
                    {content.btn_view_all || (language === 'es' ? 'Ver todos los blogs' : 'View all blogs')}
                  </span>
                  <ArrowForwardIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* CTAs - only show when blogs exist */}
              {realBlogs.length > 0 && (
                <div className="flex flex-col gap-3 mt-4 self-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateToGuides('/guides'); }}
                    className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors self-center"
                  >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase border-b border-zinc-800 group-hover:border-white pb-1 transition-all">
                      {language === 'es' ? 'Ver guías' : 'Guides'}
                    </span>
                    <ArrowForwardIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigate('experience'); }}
                    className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors self-center"
                  >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase border-b border-zinc-800 group-hover:border-white pb-1 transition-all">
                      {content.btn_case_studies}
                    </span>
                    <ArrowForwardIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
           </div>
         ) : (
           <div className="max-w-4xl w-full flex flex-col z-10 py-12 sm:py-16 md:py-20">
             {/* Header de la vista de lista */}
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl md:text-3xl font-bold text-white">
                 {content.blog_list_title || (language === 'es' ? 'Todos los blogs' : 'All blogs')}
               </h2>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   setShowListView(false);
                 }}
                 className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-zinc-900/50"
                 aria-label={language === 'es' ? 'Cerrar vista de lista' : 'Close list view'}
               >
                 <CloseIcon className="w-5 h-5" />
                 <span className="text-sm font-medium">
                   {language === 'es' ? 'Cerrar' : 'Close'}
                 </span>
               </button>
             </div>

             {/* Lista de blogs en estilo lista */}
             {loadingBlogs ? (
               <div className="text-center text-zinc-500 py-8">
                 {language === 'es' ? 'Cargando blogs...' : 'Loading blogs...'}
               </div>
             ) : realBlogs.length > 0 ? (
               <div className="space-y-3">
                 {realBlogs.map((blog, index) => (
                   <article
                     key={blog.slug || index}
                     onClick={() => onBlogClick?.(blog.slug || `blog-${index}`)}
                     className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 transition-all duration-300 overflow-hidden hover:border-zinc-700/50 cursor-pointer p-4 sm:p-6"
                   >
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-wide uppercase">
                             {blog.category}
                           </span>
                           <span className="text-[10px] sm:text-xs text-zinc-600">•</span>
                           <span className="text-[10px] sm:text-xs text-zinc-500">
                             {blog.date}
                           </span>
                           <span className="text-[10px] sm:text-xs text-zinc-600">•</span>
                           <span className="text-[10px] sm:text-xs text-zinc-500">
                             {blog.readTime}
                           </span>
                         </div>
                       <h3 className={`${language === 'es' ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-lg md:text-xl'} font-semibold text-white leading-snug tracking-tight group-hover:text-zinc-100 transition-colors duration-300 mb-2`}>
                         {blog.title}
                       </h3>
                         <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light line-clamp-2">
                           {blog.excerpt}
                         </p>
                       </div>
                       <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300 flex-shrink-0">
                         <span className="text-xs font-medium">
                           {language === 'es' ? 'Leer' : 'Read'}
                         </span>
                         <ArrowForwardIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                       </div>
                     </div>
                   </article>
                 ))}
               </div>
             ) : (
               <div className="text-center text-zinc-500 py-8">
                 {language === 'es' ? 'No hay blogs disponibles' : 'No blogs available'}
               </div>
             )}

             {/* Botón para volver */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowListView(false);
               }}
               className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors mt-8 self-center"
             >
               <span className="text-xs font-bold tracking-[0.2em] uppercase border-b border-zinc-800 group-hover:border-white pb-1 transition-all">
                 {language === 'es' ? 'Volver' : 'Back'}
               </span>
               <ArrowForwardIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default AboutSection;
