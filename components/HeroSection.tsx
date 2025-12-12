
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AboutSection from './sections/AboutSection';
import ExperienceSection from './sections/ExperienceSection';
import ContactSection from './sections/ContactSection';
import BlogPost from './blog/BlogPost';
import BlogModal from './blog/BlogModal';
import { translations } from '../utils/translations';
import { getUrlSlug } from '../utils/blog-slugs';

type PanelId = 'about' | 'experience' | 'contact';
type Language = 'en' | 'es';

interface PanelConfig {
  id: PanelId;
  label: (lang: Language) => string;
  bgImage?: string;
  overlayColor: string;
}

const panels: PanelConfig[] = [
  {
    id: 'about',
    label: (lang) => lang === 'en' ? 'ABOUT' : 'PERFIL',
    bgImage: "/yo2.png", 
    // Lighter overlay to ensure the face is visible
    overlayColor: 'from-black/40 via-black/20 to-black/90', 
  },
  {
    id: 'experience',
    label: (lang) => lang === 'en' ? 'EXPERIENCE' : 'EXPERIENCIA',
    // Code / Tech / Execution
    bgImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    overlayColor: 'from-blue-950/30 via-black/50 to-black/90',
  },
  {
    id: 'contact',
    label: (lang) => lang === 'en' ? 'CONTACT' : 'CONTACTO',
    // Network / Connections
    bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    overlayColor: 'from-emerald-950/30 via-black/50 to-black/90',
  }
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<PanelId>('about');
  const [language, setLanguage] = useState<Language>('en');
  const [activeBlog, setActiveBlog] = useState<string | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isBlogExpanded, setIsBlogExpanded] = useState(false);

  const handlePanelClick = (id: PanelId) => {
    if (activePanel !== id) {
      setActivePanel(id);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  // Get current translations based on state
  const t = translations[language];

  // Si el blog está expandido, navegar a la ruta del blog
  if (isBlogExpanded && activeBlog) {
    const urlSlug = getUrlSlug(activeBlog);
    navigate(`/${urlSlug}`, { replace: true });
    return null;
  }

  return (
    <>
      {/* Modal del Blog */}
      <BlogModal
        isOpen={isBlogModalOpen}
        onClose={() => {
          setIsBlogModalOpen(false);
          setActiveBlog(null);
        }}
        slug={activeBlog || undefined}
        language={language}
        onToggleLanguage={toggleLanguage}
        onExpand={() => {
          setIsBlogExpanded(true);
          setIsBlogModalOpen(false);
        }}
      />
    <section className="flex flex-col md:flex-row w-full h-screen bg-black text-white overflow-hidden font-sans">
      
      {panels.map((panel) => {
        const isActive = activePanel === panel.id;
        
        return (
          <article
            key={panel.id}
            onClick={() => handlePanelClick(panel.id)}
            className={`
              relative transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden
              border-b border-zinc-900 md:border-b-0 md:border-r last:border-b-0 md:last:border-r-0
              ${isActive 
                ? 'flex-[10] cursor-default' 
                : 'flex-[1] min-h-[60px] md:min-h-full md:min-w-[60px] lg:min-w-[12rem] cursor-pointer hover:bg-zinc-900 group'}
            `}
          >
            {/* ================= BACKGROUNDS ================= */}
            
            {/* Image Background (only for panels with images) */}
            {panel.bgImage && (
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out z-0
                  ${isActive 
                    ? 'opacity-0 scale-110' // Hide when active
                    : 'opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105' // High visibility (80%) when inactive
                  }
                `}
                style={{ backgroundImage: `url(${panel.bgImage})` }}
              />
            )}

            {/* Overlay / Solid Color */}
            <div className={`absolute inset-0 bg-gradient-to-b ${panel.overlayColor} transition-opacity duration-500 z-10 pointer-events-none`} />
            
            {/* Deep Black Background Layer (Prevents transparent gaps if image loads slow) */}
            <div className="absolute inset-0 bg-black -z-10" />

            {/* ================= COLLAPSED STATE (Text Label) ================= */}
            <div 
              className={`
                absolute inset-0 flex items-center justify-center transition-all duration-500 z-30
                ${isActive ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 delay-100 translate-y-0'}
              `}
            >
               <h2 className="md:rotate-90 text-zinc-200 group-hover:text-white tracking-[0.3em] text-sm md:text-lg uppercase font-semibold whitespace-nowrap transition-colors duration-300 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                  {panel.label(language)}
               </h2>
            </div>

            {/* ================= EXPANDED CONTENT ================= */}
            
            {/* Content Container - Only visible when active */}
            <div 
              className={`
                absolute inset-0 flex flex-col z-20 w-full h-full
                transition-all duration-700
                ${isActive ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-8 pointer-events-none'}
              `}
            >
              
              {/* Render specific component based on panel ID */}
              {panel.id === 'about' && (
                <AboutSection 
                  onNavigate={setActivePanel} 
                  content={t.about} 
                  language={language}
                  onToggleLanguage={toggleLanguage}
                  onBlogClick={(slug) => {
                    setActiveBlog(slug);
                    setIsBlogModalOpen(true);
                  }}
                  onBlogOpenInNewTab={(slug) => {
                    const urlSlug = getUrlSlug(slug);
                    window.open(`/${urlSlug}`, '_blank');
                  }}
                />
              )}
              {panel.id === 'experience' && (
                <ExperienceSection content={t.experience} />
              )}
              {panel.id === 'contact' && (
                <ContactSection content={t.contact} />
              )}

            </div>
          </article>
        );
      })}
    </section>
    </>
  );
};

export default HeroSection;
